package safeguardindustries.in.cms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import safeguardindustries.in.cms.entity.enums.ComplaintStatus;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;
}
