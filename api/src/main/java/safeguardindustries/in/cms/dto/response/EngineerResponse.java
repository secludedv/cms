package safeguardindustries.in.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EngineerResponse {
    private Long id;
    private String name;
    private String email;
    private String employeeId;
    private String phone;
    private String specialization;
    private Boolean available;
    private LocalDateTime createdAt;
}
