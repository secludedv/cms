package safeguardindustries.in.cms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import safeguardindustries.in.cms.dto.validation.OnCreate;

@Data
public class EngineerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "Password is required", groups = OnCreate.class)
    @Size(min = 6, message = "Password must be at least 6 characters", groups = OnCreate.class)
    private String password;

    private String phone;

    private String specialization;
}
