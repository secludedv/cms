package safeguardindustries.in.cms.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import safeguardindustries.in.cms.dto.request.LoginRequest;
import safeguardindustries.in.cms.dto.request.RegisterAdminRequest;
import safeguardindustries.in.cms.dto.response.LoginResponse;
import safeguardindustries.in.cms.entity.Admin;
import safeguardindustries.in.cms.exception.BadRequestException;
import safeguardindustries.in.cms.exception.UnauthorizedException;
import safeguardindustries.in.cms.repository.AdminRepository;
import safeguardindustries.in.cms.repository.CustomerRepository;
import safeguardindustries.in.cms.repository.EngineerRepository;
import safeguardindustries.in.cms.repository.ManagerRepository;
import safeguardindustries.in.cms.security.JwtTokenProvider;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final EngineerRepository engineerRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailUniquenessService emailUniquenessService;

    public AuthService(AdminRepository adminRepository,
                       ManagerRepository managerRepository,
                       EngineerRepository engineerRepository,
                       CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       EmailUniquenessService emailUniquenessService) {
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.engineerRepository = engineerRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailUniquenessService = emailUniquenessService;
    }

    public LoginResponse login(LoginRequest request) {
        // Check Admin
        var admin = adminRepository.findByEmail(request.getEmail());
        if (admin.isPresent() && passwordEncoder.matches(request.getPassword(), admin.get().getPassword())) {
            String token = jwtTokenProvider.generateToken(admin.get().getEmail(), "ADMIN");
            return LoginResponse.builder()
                    .token(token)
                    .role("ADMIN")
                    .name(admin.get().getName())
                    .email(admin.get().getEmail())
                    .build();
        }

        // Check Manager
        var manager = managerRepository.findByEmail(request.getEmail());
        if (manager.isPresent() && passwordEncoder.matches(request.getPassword(), manager.get().getPassword())) {
            String token = jwtTokenProvider.generateToken(manager.get().getEmail(), "MANAGER");
            return LoginResponse.builder()
                    .token(token)
                    .role("MANAGER")
                    .name(manager.get().getName())
                    .email(manager.get().getEmail())
                    .build();
        }

        // Check Engineer
        var engineer = engineerRepository.findByEmail(request.getEmail());
        if (engineer.isPresent() && passwordEncoder.matches(request.getPassword(), engineer.get().getPassword())) {
            String token = jwtTokenProvider.generateToken(engineer.get().getEmail(), "ENGINEER");
            return LoginResponse.builder()
                    .token(token)
                    .role("ENGINEER")
                    .name(engineer.get().getName())
                    .email(engineer.get().getEmail())
                    .build();
        }

        // Check Customer
        var customer = customerRepository.findByEmail(request.getEmail());
        if (customer.isPresent() && passwordEncoder.matches(request.getPassword(), customer.get().getPassword())) {
            String token = jwtTokenProvider.generateToken(customer.get().getEmail(), "CUSTOMER");
            return LoginResponse.builder()
                    .token(token)
                    .role("CUSTOMER")
                    .name(customer.get().getContactPersonName())
                    .email(customer.get().getEmail())
                    .build();
        }

        throw new UnauthorizedException("Invalid email or password");
    }

    public Admin registerAdmin(RegisterAdminRequest request) {
        emailUniquenessService.ensureEmailAvailable(request.getEmail());

        Admin admin = Admin.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .build();

        return adminRepository.save(admin);
    }
}
