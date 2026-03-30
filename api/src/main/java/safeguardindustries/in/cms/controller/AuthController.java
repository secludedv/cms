package safeguardindustries.in.cms.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import safeguardindustries.in.cms.dto.request.LoginRequest;
import safeguardindustries.in.cms.dto.request.RegisterAdminRequest;
import safeguardindustries.in.cms.dto.response.ApiResponse;
import safeguardindustries.in.cms.dto.response.LoginResponse;
import safeguardindustries.in.cms.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> registerAdmin(@Valid @RequestBody RegisterAdminRequest request) {
        authService.registerAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Admin registered successfully", null));
    }
}
