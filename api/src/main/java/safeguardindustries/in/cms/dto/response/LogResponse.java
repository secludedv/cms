package safeguardindustries.in.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import safeguardindustries.in.cms.entity.enums.LogAction;
import safeguardindustries.in.cms.entity.enums.Role;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogResponse {
    private Long id;
    private LogAction action;
    private Role performedByRole;
    private String performedByName;
    private String oldValue;
    private String newValue;
    private String remarks;
    private LocalDateTime createdAt;
}
