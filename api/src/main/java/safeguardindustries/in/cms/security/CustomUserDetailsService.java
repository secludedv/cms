package safeguardindustries.in.cms.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import safeguardindustries.in.cms.repository.AdminRepository;
import safeguardindustries.in.cms.repository.CustomerRepository;
import safeguardindustries.in.cms.repository.EngineerRepository;
import safeguardindustries.in.cms.repository.ManagerRepository;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final EngineerRepository engineerRepository;
    private final CustomerRepository customerRepository;

    public CustomUserDetailsService(AdminRepository adminRepository,
                                     ManagerRepository managerRepository,
                                     EngineerRepository engineerRepository,
                                     CustomerRepository customerRepository) {
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.engineerRepository = engineerRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Check Admin table
        var admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return new User(admin.get().getEmail(), admin.get().getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        }

        // Check Manager table
        var manager = managerRepository.findByEmail(email);
        if (manager.isPresent()) {
            return new User(manager.get().getEmail(), manager.get().getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_MANAGER")));
        }

        // Check Engineer table
        var engineer = engineerRepository.findByEmail(email);
        if (engineer.isPresent()) {
            return new User(engineer.get().getEmail(), engineer.get().getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ENGINEER")));
        }

        // Check Customer table
        var customer = customerRepository.findByEmail(email);
        if (customer.isPresent()) {
            return new User(customer.get().getEmail(), customer.get().getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
