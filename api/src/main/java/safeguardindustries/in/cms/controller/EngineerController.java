package safeguardindustries.in.cms.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import safeguardindustries.in.cms.dto.request.RemarkRequest;
import safeguardindustries.in.cms.dto.response.ApiResponse;
import safeguardindustries.in.cms.dto.response.AssignmentResponse;
import safeguardindustries.in.cms.service.EngineerService;

import java.util.List;

@RestController
@RequestMapping("/api/engineer")
@PreAuthorize("hasRole('ENGINEER')")
public class EngineerController {

    private final EngineerService engineerService;

    public EngineerController(EngineerService engineerService) {
        this.engineerService = engineerService;
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getActiveAssignments(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(engineerService.getActiveAssignments(authentication.getName())));
    }

    @GetMapping("/assignments/all")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAllAssignments(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(engineerService.getAllAssignments(authentication.getName())));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(engineerService.getAssignmentById(id, authentication.getName())));
    }

    @PutMapping("/assignments/{id}/remark")
    public ResponseEntity<ApiResponse<AssignmentResponse>> addRemark(
            @PathVariable Long id, @Valid @RequestBody RemarkRequest request, Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success("Remark added", engineerService.addRemark(id, request, authentication.getName())));
    }

    @PutMapping("/assignments/{id}/complete")
    public ResponseEntity<ApiResponse<AssignmentResponse>> completeAssignment(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success("Assignment completed", engineerService.completeAssignment(id, authentication.getName())));
    }
}
