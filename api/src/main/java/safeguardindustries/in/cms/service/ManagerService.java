package safeguardindustries.in.cms.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import safeguardindustries.in.cms.dto.request.*;
import safeguardindustries.in.cms.dto.response.*;
import safeguardindustries.in.cms.entity.*;
import safeguardindustries.in.cms.entity.enums.*;
import safeguardindustries.in.cms.exception.BadRequestException;
import safeguardindustries.in.cms.exception.ResourceNotFoundException;
import safeguardindustries.in.cms.repository.*;
import safeguardindustries.in.cms.util.ComplaintCatalog;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ManagerService {

    private final ManagerRepository managerRepository;
    private final CustomerRepository customerRepository;
    private final EngineerRepository engineerRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintAssignmentRepository complaintAssignmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final ComplaintLogService complaintLogService;
    private final EmailUniquenessService emailUniquenessService;

    public ManagerService(ManagerRepository managerRepository,
                          CustomerRepository customerRepository,
                          EngineerRepository engineerRepository,
                          ComplaintRepository complaintRepository,
                          ComplaintAssignmentRepository complaintAssignmentRepository,
                          PasswordEncoder passwordEncoder,
                          ComplaintLogService complaintLogService,
                          EmailUniquenessService emailUniquenessService) {
        this.managerRepository = managerRepository;
        this.customerRepository = customerRepository;
        this.engineerRepository = engineerRepository;
        this.complaintRepository = complaintRepository;
        this.complaintAssignmentRepository = complaintAssignmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.complaintLogService = complaintLogService;
        this.emailUniquenessService = emailUniquenessService;
    }

    // ==================== Customers (scoped to this manager) ====================

    public CustomerResponse createCustomer(CustomerRequest request, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);

        emailUniquenessService.ensureEmailAvailable(request.getEmail());

        Customer customer = Customer.builder()
                .companyName(request.getCompanyName())
                .contactPersonName(request.getContactPersonName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .manager(manager)
                .build();

        customer = customerRepository.save(customer);
        return toCustomerResponse(customer);
    }

    public List<CustomerResponse> getMyCustomers(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        return customerRepository.findByManagerId(manager.getId())
                .stream().map(this::toCustomerResponse).toList();
    }

    public CustomerResponse getCustomerById(Long id, String managerEmail) {
        Customer customer = getOwnedCustomer(id, managerEmail);
        return toCustomerResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request, String managerEmail) {
        Customer customer = getOwnedCustomer(id, managerEmail);

        emailUniquenessService.ensureEmailAvailable(request.getEmail(), customer.getEmail());

        customer.setCompanyName(request.getCompanyName());
        customer.setContactPersonName(request.getContactPersonName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        customer = customerRepository.save(customer);
        return toCustomerResponse(customer);
    }

    public void deleteCustomer(Long id, String managerEmail) {
        Customer customer = getOwnedCustomer(id, managerEmail);
        customerRepository.delete(customer);
    }

    // ==================== Engineers ====================

    public EngineerResponse createEngineer(EngineerRequest request) {
        emailUniquenessService.ensureEmailAvailable(request.getEmail());
        if (engineerRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists");
        }
        Engineer engineer = Engineer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .employeeId(request.getEmployeeId())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .specialization(request.getSpecialization())
                .build();
        engineer = engineerRepository.save(engineer);
        return toEngineerResponse(engineer);
    }

    public List<EngineerResponse> getAllEngineers() {
        return engineerRepository.findAll().stream().map(this::toEngineerResponse).toList();
    }

    // ==================== Complaints (scoped to own customers) ====================

    public ComplaintResponse createComplaintForCustomer(ManagerComplaintRequest request, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        if (!customer.getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("You do not own this customer");
        }

        String system = ComplaintCatalog.sanitizeOptional(request.getCategory());
        String issue = request.getTitle().strip();
        String description = request.getDescription().strip();

        ComplaintCatalog.validateSystemAndIssue(system, issue);

        String complaintNumber = generateComplaintNumber();
        Complaint complaint = Complaint.builder()
                .complaintNumber(complaintNumber)
                .title(issue)
                .description(description)
                .priority(Priority.LOW)
                .category(system)
                .equipmentName(ComplaintCatalog.sanitizeOptional(request.getEquipmentName()))
                .siteAddress(ComplaintCatalog.sanitizeOptional(request.getSiteAddress()))
                .customer(customer)
                .build();
        complaint = complaintRepository.save(complaint);
        complaintLogService.log(complaint, LogAction.COMPLAINT_CREATED, Role.MANAGER,
                manager.getId(), manager.getName(), null, null,
                "Complaint created by manager on behalf of " + customer.getCompanyName());
        return toComplaintResponse(complaint);
    }

    public List<ComplaintResponse> getComplaintsForMyCustomers(String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        return complaintRepository.findByCustomerManagerId(manager.getId())
                .stream().map(this::toComplaintResponse).toList();
    }

    public ComplaintResponse getComplaintById(Long id, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        if (!complaint.getCustomer().getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("This complaint does not belong to your customers");
        }

        return toComplaintResponse(complaint);
    }

    // ==================== Assign/Remove Engineers ====================

    public AssignmentResponse assignEngineer(Long complaintId, AssignEngineerRequest request, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        ensureComplaintIsOpenForMutation(complaint);

        if (!complaint.getCustomer().getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("This complaint does not belong to your customers");
        }

        Engineer engineer = engineerRepository.findById(request.getEngineerId())
                .orElseThrow(() -> new ResourceNotFoundException("Engineer not found with id: " + request.getEngineerId()));

        // Check if engineer is already actively assigned to this complaint
        if (complaintAssignmentRepository.existsByComplaintIdAndEngineerIdAndStatus(
                complaintId, engineer.getId(), AssignmentStatus.ACTIVE)) {
            throw new BadRequestException("Engineer is already actively assigned to this complaint");
        }

        // Check if engineer already has 3 active assignments on the assigned date
        long activeOnDate = complaintAssignmentRepository.countByEngineerIdAndAssignedDateAndStatus(
                engineer.getId(), request.getAssignedDate(), AssignmentStatus.ACTIVE);
        if (activeOnDate >= 3) {
            throw new BadRequestException("Engineer already has 3 active assignments on " + request.getAssignedDate());
        }

        ComplaintAssignment assignment = ComplaintAssignment.builder()
                .complaint(complaint)
                .engineer(engineer)
                .assignedByManager(manager)
                .assignedDate(request.getAssignedDate())
                .build();

        assignment = complaintAssignmentRepository.save(assignment);

        // Update complaint status to ASSIGNED if currently OPEN
        if (complaint.getStatus() == ComplaintStatus.OPEN) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            complaintRepository.save(complaint);

            complaintLogService.log(complaint, LogAction.STATUS_CHANGE, Role.MANAGER,
                    manager.getId(), manager.getName(), "OPEN", "ASSIGNED",
                    "Auto status change on engineer assignment");
        }

        complaintLogService.log(complaint, LogAction.ENGINEER_ASSIGNED, Role.MANAGER,
                manager.getId(), manager.getName(), null, engineer.getName(),
                "Engineer " + engineer.getName() + " assigned for " + request.getAssignedDate());

        return toAssignmentResponse(assignment);
    }

    public void removeEngineer(Long complaintId, Long assignmentId, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        ensureComplaintIsOpenForMutation(complaint);

        if (!complaint.getCustomer().getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("This complaint does not belong to your customers");
        }

        ComplaintAssignment assignment = complaintAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        if (!assignment.getComplaint().getId().equals(complaintId)) {
            throw new BadRequestException("Assignment does not belong to this complaint");
        }

        assignment.setStatus(AssignmentStatus.REMOVED);
        assignment.setRemovedAt(LocalDateTime.now());
        complaintAssignmentRepository.save(assignment);

        complaintLogService.log(complaint, LogAction.ENGINEER_REMOVED, Role.MANAGER,
                manager.getId(), manager.getName(), assignment.getEngineer().getName(), null,
                "Engineer " + assignment.getEngineer().getName() + " removed from complaint");
    }

    // ==================== Status Update ====================

    public ComplaintResponse updateComplaintStatus(Long complaintId, StatusUpdateRequest request, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        ensureComplaintIsOpenForMutation(complaint);

        if (!complaint.getCustomer().getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("This complaint does not belong to your customers");
        }

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(request.getStatus());

        if (request.getStatus() == ComplaintStatus.CLOSED) {
            complaint.setClosedAt(LocalDateTime.now());
            // Auto-complete all active assignments
            complaintAssignmentRepository.findByComplaintId(complaintId).stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.ACTIVE)
                    .forEach(a -> {
                        a.setStatus(AssignmentStatus.COMPLETED);
                        a.setCompletedAt(LocalDateTime.now());
                        complaintAssignmentRepository.save(a);
                    });
        }

        complaint = complaintRepository.save(complaint);

        complaintLogService.log(complaint, LogAction.STATUS_CHANGE, Role.MANAGER,
                manager.getId(), manager.getName(), oldStatus, request.getStatus().name(),
                "Status changed by manager");

        return toComplaintResponse(complaint);
    }

    // ==================== Remarks ====================

    public ComplaintResponse addRemarks(Long complaintId, ManagerRemarkRequest request, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        ensureComplaintIsOpenForMutation(complaint);
        if (!complaint.getCustomer().getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("This complaint does not belong to your customers");
        }
        complaint.setManagerRemarks(request.getRemarks());
        complaint = complaintRepository.save(complaint);
        complaintLogService.log(complaint, LogAction.REMARK_ADDED, Role.MANAGER,
                manager.getId(), manager.getName(), null, null,
                request.getRemarks());
        return toComplaintResponse(complaint);
    }

    // ==================== Priority Update ====================

    public ComplaintResponse updateComplaintPriority(Long complaintId, Priority priority, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        ensureComplaintIsOpenForMutation(complaint);
        if (!complaint.getCustomer().getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("This complaint does not belong to your customers");
        }
        String oldPriority = complaint.getPriority().name();
        complaint.setPriority(priority);
        complaint = complaintRepository.save(complaint);
        complaintLogService.log(complaint, LogAction.COMPLAINT_UPDATED, Role.MANAGER,
                manager.getId(), manager.getName(), oldPriority, priority.name(),
                "Priority changed by manager");
        return toComplaintResponse(complaint);
    }

    // ==================== Helpers ====================

    private String generateComplaintNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "CMP-" + dateStr + "-";
        long count = complaintRepository.countByComplaintNumberStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private Manager getManagerByEmail(String email) {
        return managerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
    }

    private Customer getOwnedCustomer(Long customerId, String managerEmail) {
        Manager manager = getManagerByEmail(managerEmail);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        if (!customer.getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("You do not own this customer");
        }
        return customer;
    }

    private void ensureComplaintIsOpenForMutation(Complaint complaint) {
        if (complaint.getStatus() == ComplaintStatus.CLOSED) {
            throw new BadRequestException("Closed complaints cannot be modified");
        }
    }

    // ==================== Mappers ====================

    private CustomerResponse toCustomerResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .companyName(c.getCompanyName())
                .contactPersonName(c.getContactPersonName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .city(c.getCity())
                .state(c.getState())
                .pincode(c.getPincode())
                .managerId(c.getManager().getId())
                .managerName(c.getManager().getName())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private EngineerResponse toEngineerResponse(Engineer e) {
        return EngineerResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .email(e.getEmail())
                .employeeId(e.getEmployeeId())
                .phone(e.getPhone())
                .specialization(e.getSpecialization())
                .available(e.getAvailable())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private ComplaintResponse toComplaintResponse(Complaint c) {
        List<AssignmentResponse> assignments = c.getAssignments().stream()
                .map(this::toAssignmentResponse)
                .toList();

        List<LogResponse> logs = c.getLogs().stream()
                .map(l -> LogResponse.builder()
                        .id(l.getId())
                        .action(l.getAction())
                        .performedByRole(l.getPerformedByRole())
                        .performedByName(l.getPerformedByName())
                        .oldValue(l.getOldValue())
                        .newValue(l.getNewValue())
                        .remarks(l.getRemarks())
                        .createdAt(l.getCreatedAt())
                        .build())
                .toList();

        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintNumber(c.getComplaintNumber())
                .title(c.getTitle())
                .description(c.getDescription())
                .priority(c.getPriority())
                .status(c.getStatus())
                .category(c.getCategory())
                .equipmentName(c.getEquipmentName())
                .equipmentSerialNumber(c.getEquipmentSerialNumber())
                .equipmentModel(c.getEquipmentModel())
                .siteAddress(c.getSiteAddress())
                .managerRemarks(c.getManagerRemarks())
                .customerId(c.getCustomer().getId())
                .customerCompanyName(c.getCustomer().getCompanyName())
                .customerContactPerson(c.getCustomer().getContactPersonName())
                .assignments(assignments)
                .logs(logs)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .closedAt(c.getClosedAt())
                .build();
    }

    private AssignmentResponse toAssignmentResponse(ComplaintAssignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .complaintId(a.getComplaint().getId())
                .complaintNumber(a.getComplaint().getComplaintNumber())
                .complaintTitle(a.getComplaint().getTitle())
                .engineerId(a.getEngineer().getId())
                .engineerName(a.getEngineer().getName())
                .assignedByManagerName(a.getAssignedByManager() != null ? a.getAssignedByManager().getName() : null)
                .assignedDate(a.getAssignedDate())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .visitDate(a.getVisitDate())
                .workDone(a.getWorkDone())
                .assignedAt(a.getAssignedAt())
                .completedAt(a.getCompletedAt())
                .build();
    }
}
