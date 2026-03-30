package safeguardindustries.in.cms.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import safeguardindustries.in.cms.dto.request.ComplaintRequest;
import safeguardindustries.in.cms.dto.response.*;
import safeguardindustries.in.cms.entity.*;
import safeguardindustries.in.cms.entity.enums.LogAction;
import safeguardindustries.in.cms.entity.enums.Priority;
import safeguardindustries.in.cms.entity.enums.Role;
import safeguardindustries.in.cms.exception.BadRequestException;
import safeguardindustries.in.cms.exception.ResourceNotFoundException;
import safeguardindustries.in.cms.repository.ComplaintRepository;
import safeguardindustries.in.cms.repository.CustomerRepository;
import safeguardindustries.in.cms.util.ComplaintCatalog;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintLogService complaintLogService;

    public CustomerService(CustomerRepository customerRepository,
                           ComplaintRepository complaintRepository,
                           ComplaintLogService complaintLogService) {
        this.customerRepository = customerRepository;
        this.complaintRepository = complaintRepository;
        this.complaintLogService = complaintLogService;
    }

    public ComplaintResponse createComplaint(ComplaintRequest request, String customerEmail) {
        Customer customer = getCustomerByEmail(customerEmail);
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

        complaintLogService.log(complaint, LogAction.COMPLAINT_CREATED, Role.CUSTOMER,
                customer.getId(), customer.getContactPersonName(), null, null,
                "Complaint created by " + customer.getCompanyName());

        return toComplaintResponse(complaint);
    }

    public List<ComplaintResponse> getMyComplaints(String customerEmail) {
        Customer customer = getCustomerByEmail(customerEmail);
        return complaintRepository.findByCustomerId(customer.getId())
                .stream().map(this::toComplaintResponse).toList();
    }

    public ComplaintResponse getComplaintById(Long id, String customerEmail) {
        Customer customer = getCustomerByEmail(customerEmail);
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        if (!complaint.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("This complaint does not belong to you");
        }

        return toComplaintResponse(complaint);
    }

    public CustomerResponse getProfile(String customerEmail) {
        Customer customer = getCustomerByEmail(customerEmail);
        return toCustomerResponse(customer);
    }

    // ==================== Helpers ====================

    private String generateComplaintNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "CMP-" + dateStr + "-";
        long count = complaintRepository.countByComplaintNumberStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    // ==================== Mappers ====================

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

        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintNumber(c.getComplaintNumber())
                .title(c.getTitle())
                .description(c.getDescription())
                .priority(null)
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
                .logs(List.of())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .closedAt(c.getClosedAt())
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
}
