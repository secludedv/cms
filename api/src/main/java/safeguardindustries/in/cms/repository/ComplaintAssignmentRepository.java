package safeguardindustries.in.cms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import safeguardindustries.in.cms.entity.ComplaintAssignment;
import safeguardindustries.in.cms.entity.enums.AssignmentStatus;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintId(Long complaintId);
    List<ComplaintAssignment> findByEngineerId(Long engineerId);
    List<ComplaintAssignment> findByEngineerIdAndStatus(Long engineerId, AssignmentStatus status);
    boolean existsByComplaintIdAndEngineerIdAndStatus(Long complaintId, Long engineerId, AssignmentStatus status);
    long countByEngineerIdAndAssignedDateAndStatus(Long engineerId, LocalDate assignedDate, AssignmentStatus status);
}
