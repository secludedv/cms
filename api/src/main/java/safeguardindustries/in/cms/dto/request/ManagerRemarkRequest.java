package safeguardindustries.in.cms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ManagerRemarkRequest {

    @NotBlank(message = "Remarks are required")
    private String remarks;
}
