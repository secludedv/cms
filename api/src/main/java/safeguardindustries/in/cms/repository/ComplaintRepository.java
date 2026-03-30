package safeguardindustries.in.cms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import safeguardindustries.in.cms.entity.Complaint;
import safeguardindustries.in.cms.entity.enums.ComplaintStatus;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCustomerId(Long customerId);
    List<Complaint> findByCustomerManagerId(Long managerId);
    List<Complaint> findByStatus(ComplaintStatus status);
    long countByComplaintNumberStartingWith(String prefix);
}
