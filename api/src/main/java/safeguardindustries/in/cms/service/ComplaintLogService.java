package safeguardindustries.in.cms.service;

import org.springframework.stereotype.Service;
import safeguardindustries.in.cms.dto.response.LogResponse;
import safeguardindustries.in.cms.entity.Complaint;
import safeguardindustries.in.cms.entity.ComplaintLog;
import safeguardindustries.in.cms.entity.enums.LogAction;
import safeguardindustries.in.cms.entity.enums.Role;
import safeguardindustries.in.cms.repository.ComplaintLogRepository;

import java.util.List;

@Service
public class ComplaintLogService {

    private final ComplaintLogRepository complaintLogRepository;

    public ComplaintLogService(ComplaintLogRepository complaintLogRepository) {
        this.complaintLogRepository = complaintLogRepository;
    }

    public void log(Complaint complaint, LogAction action, Role performedByRole,
                    Long performedById, String performedByName,
                    String oldValue, String newValue, String remarks) {
        ComplaintLog log = ComplaintLog.builder()
                .complaint(complaint)
                .action(action)
                .performedByRole(performedByRole)
                .performedById(performedById)
                .performedByName(performedByName)
                .oldValue(oldValue)
                .newValue(newValue)
                .remarks(remarks)
                .build();
        complaintLogRepository.save(log);
    }

    public List<LogResponse> getLogsForComplaint(Long complaintId) {
        return complaintLogRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId)
                .stream()
                .map(this::toLogResponse)
                .toList();
    }

    private LogResponse toLogResponse(ComplaintLog log) {
        return LogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .performedByRole(log.getPerformedByRole())
                .performedByName(log.getPerformedByName())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .remarks(log.getRemarks())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
