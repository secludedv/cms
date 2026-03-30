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
public class CustomerResponse {
    private Long id;
    private String companyName;
    private String contactPersonName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Long managerId;
    private String managerName;
    private LocalDateTime createdAt;
}
