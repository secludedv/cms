package safeguardindustries.in.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import safeguardindustries.in.cms.entity.enums.ComplaintStatus;
import safeguardindustries.in.cms.entity.enums.Priority;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private Long id;
    private String complaintNumber;
    private String title;
    private String description;
    private Priority priority;
    private ComplaintStatus status;
    private String category;
    private String equipmentName;
    private String equipmentSerialNumber;
    private String equipmentModel;
    private String siteAddress;
    private String managerRemarks;

    // Customer info
    private Long customerId;
    private String customerCompanyName;
    private String customerContactPerson;

    private List<AssignmentResponse> assignments;
    private List<LogResponse> logs;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
}
