package safeguardindustries.in.cms.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import safeguardindustries.in.cms.dto.request.*;
import safeguardindustries.in.cms.dto.response.*;
import safeguardindustries.in.cms.entity.*;
import safeguardindustries.in.cms.entity.enums.AssignmentStatus;
import safeguardindustries.in.cms.entity.enums.ComplaintStatus;
import safeguardindustries.in.cms.entity.enums.LogAction;
import safeguardindustries.in.cms.entity.enums.Role;
import safeguardindustries.in.cms.exception.BadRequestException;
import safeguardindustries.in.cms.exception.ResourceNotFoundException;
import safeguardindustries.in.cms.repository.*;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AdminService {

    private final ManagerRepository managerRepository;
    private final EngineerRepository engineerRepository;
    private final CustomerRepository customerRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintAssignmentRepository complaintAssignmentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final ComplaintLogService complaintLogService;
    private final EmailUniquenessService emailUniquenessService;

    public AdminService(ManagerRepository managerRepository,
                        EngineerRepository engineerRepository,
                        CustomerRepository customerRepository,
                        ComplaintRepository complaintRepository,
                        ComplaintAssignmentRepository complaintAssignmentRepository,
                        AdminRepository adminRepository,
                        PasswordEncoder passwordEncoder,
                        ComplaintLogService complaintLogService,
                        EmailUniquenessService emailUniquenessService) {
        this.managerRepository = managerRepository;
        this.engineerRepository = engineerRepository;
        this.customerRepository = customerRepository;
        this.complaintRepository = complaintRepository;
        this.complaintAssignmentRepository = complaintAssignmentRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.complaintLogService = complaintLogService;
        this.emailUniquenessService = emailUniquenessService;
    }

    // ==================== Manager CRUD ====================

    public ManagerResponse createManager(ManagerRequest request) {
        emailUniquenessService.ensureEmailAvailable(request.getEmail());
        Manager manager = Manager.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .build();
        manager = managerRepository.save(manager);
        return toManagerResponse(manager);
    }

    public List<ManagerResponse> getAllManagers() {
        return managerRepository.findAll().stream().map(this::toManagerResponse).toList();
    }

    public ManagerResponse getManagerById(Long id) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));
        return toManagerResponse(manager);
    }

    public ManagerResponse updateManager(Long id, ManagerRequest request) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));
        emailUniquenessService.ensureEmailAvailable(request.getEmail(), manager.getEmail());
        manager.setName(request.getName());
        manager.setEmail(request.getEmail());
        manager.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            manager.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        manager = managerRepository.save(manager);
        return toManagerResponse(manager);
    }

    public void deleteManager(Long id) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));
        managerRepository.delete(manager);
    }

    // ==================== Engineer CRUD ====================

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

    public EngineerResponse getEngineerById(Long id) {
        Engineer engineer = engineerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Engineer not found with id: " + id));
        return toEngineerResponse(engineer);
    }

    public EngineerResponse updateEngineer(Long id, EngineerRequest request) {
        Engineer engineer = engineerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Engineer not found with id: " + id));
        emailUniquenessService.ensureEmailAvailable(request.getEmail(), engineer.getEmail());
        if (!engineer.getEmployeeId().equals(request.getEmployeeId()) && engineerRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists");
        }
        engineer.setName(request.getName());
        engineer.setEmail(request.getEmail());
        engineer.setEmployeeId(request.getEmployeeId());
        engineer.setPhone(request.getPhone());
        engineer.setSpecialization(request.getSpecialization());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            engineer.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        engineer = engineerRepository.save(engineer);
        return toEngineerResponse(engineer);
    }

    public void deleteEngineer(Long id) {
        Engineer engineer = engineerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Engineer not found with id: " + id));
        engineerRepository.delete(engineer);
    }

    // ==================== Customers ====================

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::toCustomerResponse).toList();
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return toCustomerResponse(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request, Long managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));

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

    // ==================== Complaints ====================

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream().map(this::toComplaintResponse).toList();
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return toComplaintResponse(complaint);
    }

    public ComplaintResponse updateComplaintStatus(Long complaintId, StatusUpdateRequest request, String adminEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        if (complaint.getStatus() == ComplaintStatus.CLOSED) {
            throw new BadRequestException("Closed complaints cannot be modified");
        }

        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

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

        complaintLogService.log(complaint, LogAction.STATUS_CHANGE, Role.ADMIN,
                admin.getId(), admin.getName(), oldStatus, request.getStatus().name(),
                "Status changed by admin");

        return toComplaintResponse(complaint);
    }

    // ==================== Dashboard ====================

    public DashboardStats getDashboardStats() {
        long totalComplaints = complaintRepository.count();
        long openComplaints = complaintRepository.findByStatus(ComplaintStatus.OPEN).size();
        long assignedComplaints = complaintRepository.findByStatus(ComplaintStatus.ASSIGNED).size();
        long inProgressComplaints = complaintRepository.findByStatus(ComplaintStatus.IN_PROGRESS).size();
        long resolvedComplaints = complaintRepository.findByStatus(ComplaintStatus.RESOLVED).size();
        long closedComplaints = complaintRepository.findByStatus(ComplaintStatus.CLOSED).size();
        long totalManagers = managerRepository.count();
        long totalEngineers = engineerRepository.count();
        long totalCustomers = customerRepository.count();

        return DashboardStats.builder()
                .totalComplaints(totalComplaints)
                .openComplaints(openComplaints)
                .assignedComplaints(assignedComplaints)
                .inProgressComplaints(inProgressComplaints)
                .resolvedComplaints(resolvedComplaints)
                .closedComplaints(closedComplaints)
                .totalManagers(totalManagers)
                .totalEngineers(totalEngineers)
                .totalCustomers(totalCustomers)
                .build();
    }

    // ==================== Mappers ====================

    private ManagerResponse toManagerResponse(Manager m) {
        return ManagerResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .email(m.getEmail())
                .phone(m.getPhone())
                .createdAt(m.getCreatedAt())
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

    private ComplaintResponse toComplaintResponse(Complaint c) {
        List<AssignmentResponse> assignments = c.getAssignments().stream()
                .map(a -> AssignmentResponse.builder()
                        .id(a.getId())
                        .complaintId(c.getId())
                        .complaintNumber(c.getComplaintNumber())
                        .complaintTitle(c.getTitle())
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
                        .build())
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

    // Inner class for dashboard stats
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class DashboardStats {
        private long totalComplaints;
        private long openComplaints;
        private long assignedComplaints;
        private long inProgressComplaints;
        private long resolvedComplaints;
        private long closedComplaints;
        private long totalManagers;
        private long totalEngineers;
        private long totalCustomers;
    }
}
