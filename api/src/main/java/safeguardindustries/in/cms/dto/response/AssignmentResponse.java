package safeguardindustries.in.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import safeguardindustries.in.cms.entity.enums.AssignmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponse {
    private Long id;
    private Long complaintId;
    private String complaintNumber;
    private String complaintTitle;
    private Long engineerId;
    private String engineerName;
    private String assignedByManagerName;
    private LocalDate assignedDate;
    private AssignmentStatus status;
    private String remarks;
    private LocalDate visitDate;
    private String workDone;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;

    // Extra complaint details (useful for engineer view)
    private String customerCompanyName;
    private String siteAddress;
    private String complaintDescription;
    private String complaintStatus;
}
