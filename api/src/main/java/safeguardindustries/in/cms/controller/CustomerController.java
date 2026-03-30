package safeguardindustries.in.cms.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import safeguardindustries.in.cms.dto.request.ComplaintRequest;
import safeguardindustries.in.cms.dto.response.ApiResponse;
import safeguardindustries.in.cms.dto.response.ComplaintResponse;
import safeguardindustries.in.cms.dto.response.CustomerResponse;
import safeguardindustries.in.cms.service.CustomerService;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintRequest request, Authentication authentication) {
        return new ResponseEntity<>(
                ApiResponse.success("Complaint created", customerService.createComplaint(request, authentication.getName())),
                HttpStatus.CREATED);
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getMyComplaints(authentication.getName())));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getComplaintById(id, authentication.getName())));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getProfile(authentication.getName())));
    }
}
