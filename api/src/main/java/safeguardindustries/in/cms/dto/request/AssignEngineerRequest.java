package safeguardindustries.in.cms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssignEngineerRequest {

    @NotNull(message = "Engineer ID is required")
    private Long engineerId;

    @NotNull(message = "Assigned date is required")
    private LocalDate assignedDate;
}
