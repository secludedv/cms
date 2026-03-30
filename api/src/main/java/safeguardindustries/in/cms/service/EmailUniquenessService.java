package safeguardindustries.in.cms.service;

import org.springframework.stereotype.Service;
import safeguardindustries.in.cms.exception.BadRequestException;
import safeguardindustries.in.cms.repository.AdminRepository;
import safeguardindustries.in.cms.repository.CustomerRepository;
import safeguardindustries.in.cms.repository.EngineerRepository;
import safeguardindustries.in.cms.repository.ManagerRepository;

@Service
public class EmailUniquenessService {

    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final EngineerRepository engineerRepository;
    private final CustomerRepository customerRepository;

    public EmailUniquenessService(AdminRepository adminRepository,
                                  ManagerRepository managerRepository,
                                  EngineerRepository engineerRepository,
                                  CustomerRepository customerRepository) {
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.engineerRepository = engineerRepository;
        this.customerRepository = customerRepository;
    }

    public void ensureEmailAvailable(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        if (adminRepository.existsByEmail(email)
                || managerRepository.existsByEmail(email)
                || engineerRepository.existsByEmail(email)
                || customerRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }
    }

    public void ensureEmailAvailable(String email, String currentEmail) {
        if (currentEmail != null && currentEmail.equalsIgnoreCase(email)) {
            return;
        }

        ensureEmailAvailable(email);
    }
}
