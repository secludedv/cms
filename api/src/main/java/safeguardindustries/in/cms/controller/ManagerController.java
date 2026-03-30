package safeguardindustries.in.cms.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import safeguardindustries.in.cms.dto.request.*;
import safeguardindustries.in.cms.dto.response.*;
import safeguardindustries.in.cms.dto.validation.OnCreate;
import safeguardindustries.in.cms.entity.enums.Priority;
import safeguardindustries.in.cms.service.ManagerService;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    // ==================== Customers ====================

    @PostMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Validated({jakarta.validation.groups.Default.class, OnCreate.class}) @RequestBody CustomerRequest request, Authentication authentication) {
        return new ResponseEntity<>(
                ApiResponse.success("Customer created", managerService.createCustomer(request, authentication.getName())),
                HttpStatus.CREATED);
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getMyCustomers(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(managerService.getMyCustomers(authentication.getName())));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(managerService.getCustomerById(id, authentication.getName())));
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id, @Valid @RequestBody CustomerRequest request, Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success("Customer updated", managerService.updateCustomer(id, request, authentication.getName())));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            @PathVariable Long id, Authentication authentication) {
        managerService.deleteCustomer(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }

    // ==================== Engineers ====================

    @PostMapping("/engineers")
    public ResponseEntity<ApiResponse<EngineerResponse>> createEngineer(@Validated({jakarta.validation.groups.Default.class, OnCreate.class}) @RequestBody EngineerRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success("Engineer created", managerService.createEngineer(request)),
                HttpStatus.CREATED);
    }

    @GetMapping("/engineers")
    public ResponseEntity<ApiResponse<List<EngineerResponse>>> getAllEngineers() {
        return ResponseEntity.ok(ApiResponse.success(managerService.getAllEngineers()));
    }

    // ==================== Complaints ====================

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ManagerComplaintRequest request, Authentication authentication) {
        return new ResponseEntity<>(
                ApiResponse.success("Complaint created on behalf of customer",
                        managerService.createComplaintForCustomer(request, authentication.getName())),
                HttpStatus.CREATED);
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaints(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(managerService.getComplaintsForMyCustomers(authentication.getName())));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(managerService.getComplaintById(id, authentication.getName())));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success("Status updated", managerService.updateComplaintStatus(id, request, authentication.getName())));
    }

    @PutMapping("/complaints/{id}/priority")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintPriority(
            @PathVariable Long id, @RequestParam Priority priority,
            Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success("Priority updated", managerService.updateComplaintPriority(id, priority, authentication.getName())));
    }

    @PostMapping("/complaints/{id}/remarks")
    public ResponseEntity<ApiResponse<ComplaintResponse>> addRemarks(
            @PathVariable Long id, @Valid @RequestBody ManagerRemarkRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success("Remarks added", managerService.addRemarks(id, request, authentication.getName())));
    }

    // ==================== Assignment ====================

    @PostMapping("/complaints/{id}/assign")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignEngineer(
            @PathVariable Long id, @Valid @RequestBody AssignEngineerRequest request, Authentication authentication) {
        return new ResponseEntity<>(
                ApiResponse.success("Engineer assigned", managerService.assignEngineer(id, request, authentication.getName())),
                HttpStatus.CREATED);
    }

    @DeleteMapping("/complaints/{complaintId}/assign/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> removeEngineer(
            @PathVariable Long complaintId, @PathVariable Long assignmentId, Authentication authentication) {
        managerService.removeEngineer(complaintId, assignmentId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Engineer removed from complaint", null));
    }
}
