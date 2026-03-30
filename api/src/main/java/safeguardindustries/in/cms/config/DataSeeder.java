package safeguardindustries.in.cms.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import safeguardindustries.in.cms.entity.Admin;
import safeguardindustries.in.cms.repository.AdminRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            Admin admin = Admin.builder()
                    .name("Super Admin")
                    .email("admin@cms.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9999999999")
                    .build();
            adminRepository.save(admin);
            System.out.println("==> Default admin created: admin@cms.com / admin123");
        }
    }
}
