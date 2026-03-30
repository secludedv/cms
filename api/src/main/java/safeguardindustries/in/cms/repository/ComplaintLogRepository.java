package safeguardindustries.in.cms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import safeguardindustries.in.cms.entity.ComplaintLog;

import java.util.List;

@Repository
public interface ComplaintLogRepository extends JpaRepository<ComplaintLog, Long> {
    List<ComplaintLog> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
}
