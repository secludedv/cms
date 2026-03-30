package safeguardindustries.in.cms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RemarkRequest {

    @NotBlank(message = "Work done description is required")
    private String workDone;

    private String remarks;

    private LocalDate visitDate;
}
