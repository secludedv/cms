package safeguardindustries.in.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import safeguardindustries.in.cms.entity.enums.LogAction;
import safeguardindustries.in.cms.entity.enums.Role;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role performedByRole;

    @Column(nullable = false)
    private Long performedById;

    @Column(nullable = false)
    private String performedByName;

    private String oldValue;

    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
