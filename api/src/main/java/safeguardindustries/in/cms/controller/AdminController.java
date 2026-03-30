package safeguardindustries.in.cms.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import safeguardindustries.in.cms.dto.request.CustomerRequest;
import safeguardindustries.in.cms.dto.request.EngineerRequest;
import safeguardindustries.in.cms.dto.request.ManagerRequest;
import safeguardindustries.in.cms.dto.request.StatusUpdateRequest;
import safeguardindustries.in.cms.dto.response.*;
import safeguardindustries.in.cms.dto.validation.OnCreate;
import safeguardindustries.in.cms.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ==================== Managers ====================

    @PostMapping("/managers")
    public ResponseEntity<ApiResponse<ManagerResponse>> createManager(@Validated({jakarta.validation.groups.Default.class, OnCreate.class}) @RequestBody ManagerRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Manager created", adminService.createManager(request)), HttpStatus.CREATED);
    }

    @GetMapping("/managers")
    public ResponseEntity<ApiResponse<List<ManagerResponse>>> getAllManagers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllManagers()));
    }

    @GetMapping("/managers/{id}")
    public ResponseEntity<ApiResponse<ManagerResponse>> getManagerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getManagerById(id)));
    }

    @PutMapping("/managers/{id}")
    public ResponseEntity<ApiResponse<ManagerResponse>> updateManager(@PathVariable Long id, @Valid @RequestBody ManagerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Manager updated", adminService.updateManager(id, request)));
    }

    @DeleteMapping("/managers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteManager(@PathVariable Long id) {
        adminService.deleteManager(id);
        return ResponseEntity.ok(ApiResponse.success("Manager deleted", null));
    }

    // ==================== Engineers ====================

    @PostMapping("/engineers")
    public ResponseEntity<ApiResponse<EngineerResponse>> createEngineer(@Validated({jakarta.validation.groups.Default.class, OnCreate.class}) @RequestBody EngineerRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Engineer created", adminService.createEngineer(request)), HttpStatus.CREATED);
    }

    @GetMapping("/engineers")
    public ResponseEntity<ApiResponse<List<EngineerResponse>>> getAllEngineers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllEngineers()));
    }

    @GetMapping("/engineers/{id}")
    public ResponseEntity<ApiResponse<EngineerResponse>> getEngineerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getEngineerById(id)));
    }

    @PutMapping("/engineers/{id}")
    public ResponseEntity<ApiResponse<EngineerResponse>> updateEngineer(@PathVariable Long id, @Valid @RequestBody EngineerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Engineer updated", adminService.updateEngineer(id, request)));
    }

    @DeleteMapping("/engineers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEngineer(@PathVariable Long id) {
        adminService.deleteEngineer(id);
        return ResponseEntity.ok(ApiResponse.success("Engineer deleted", null));
    }

    // ==================== Customers ====================

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCustomers()));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCustomerById(id)));
    }

    @PostMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Validated({jakarta.validation.groups.Default.class, OnCreate.class}) @RequestBody CustomerRequest request,
            @RequestParam Long managerId) {
        return new ResponseEntity<>(
                ApiResponse.success("Customer created", adminService.createCustomer(request, managerId)),
                HttpStatus.CREATED);
    }

    // ==================== Complaints ====================

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllComplaints()));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getComplaintById(id)));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated",
                adminService.updateComplaintStatus(id, request, authentication.getName())));
    }

    // ==================== Dashboard ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminService.DashboardStats>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }
}
