package safeguardindustries.in.cms.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import safeguardindustries.in.cms.dto.request.RemarkRequest;
import safeguardindustries.in.cms.dto.response.AssignmentResponse;
import safeguardindustries.in.cms.entity.ComplaintAssignment;
import safeguardindustries.in.cms.entity.Engineer;
import safeguardindustries.in.cms.entity.enums.AssignmentStatus;
import safeguardindustries.in.cms.entity.enums.ComplaintStatus;
import safeguardindustries.in.cms.entity.enums.LogAction;
import safeguardindustries.in.cms.entity.enums.Role;
import safeguardindustries.in.cms.exception.BadRequestException;
import safeguardindustries.in.cms.exception.ResourceNotFoundException;
import safeguardindustries.in.cms.repository.ComplaintAssignmentRepository;
import safeguardindustries.in.cms.repository.ComplaintRepository;
import safeguardindustries.in.cms.repository.EngineerRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EngineerService {

    private final EngineerRepository engineerRepository;
    private final ComplaintAssignmentRepository complaintAssignmentRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintLogService complaintLogService;

    public EngineerService(EngineerRepository engineerRepository,
                           ComplaintAssignmentRepository complaintAssignmentRepository,
                           ComplaintRepository complaintRepository,
                           ComplaintLogService complaintLogService) {
        this.engineerRepository = engineerRepository;
        this.complaintAssignmentRepository = complaintAssignmentRepository;
        this.complaintRepository = complaintRepository;
        this.complaintLogService = complaintLogService;
    }

    public List<AssignmentResponse> getActiveAssignments(String engineerEmail) {
        Engineer engineer = getEngineerByEmail(engineerEmail);
        return complaintAssignmentRepository.findByEngineerIdAndStatus(engineer.getId(), AssignmentStatus.ACTIVE)
                .stream().map(this::toAssignmentResponse).toList();
    }

    public List<AssignmentResponse> getAllAssignments(String engineerEmail) {
        Engineer engineer = getEngineerByEmail(engineerEmail);
        return complaintAssignmentRepository.findByEngineerId(engineer.getId())
                .stream().map(this::toAssignmentResponse).toList();
    }

    public AssignmentResponse getAssignmentById(Long assignmentId, String engineerEmail) {
        ComplaintAssignment assignment = getOwnedAssignment(assignmentId, engineerEmail);
        return toAssignmentResponse(assignment);
    }

    public AssignmentResponse addRemark(Long assignmentId, RemarkRequest request, String engineerEmail) {
        ComplaintAssignment assignment = getOwnedAssignment(assignmentId, engineerEmail);
        Engineer engineer = getEngineerByEmail(engineerEmail);

        if (assignment.getComplaint().getStatus() == ComplaintStatus.CLOSED) {
            throw new BadRequestException("Closed complaints cannot be modified");
        }

        if (assignment.getStatus() != AssignmentStatus.ACTIVE) {
            throw new BadRequestException("Cannot add remarks to a non-active assignment");
        }

        assignment.setWorkDone(request.getWorkDone());
        assignment.setRemarks(request.getRemarks());
        assignment.setVisitDate(request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now());

        assignment = complaintAssignmentRepository.save(assignment);

        // Update complaint status to IN_PROGRESS if currently ASSIGNED
        var complaint = assignment.getComplaint();
        if (complaint.getStatus() == ComplaintStatus.ASSIGNED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            complaintRepository.save(complaint);

            complaintLogService.log(complaint, LogAction.STATUS_CHANGE, Role.ENGINEER,
                    engineer.getId(), engineer.getName(), "ASSIGNED", "IN_PROGRESS",
                    "Auto status change on engineer remark");
        }

        complaintLogService.log(complaint, LogAction.REMARK_ADDED, Role.ENGINEER,
                engineer.getId(), engineer.getName(), null, request.getWorkDone(),
                request.getRemarks());

        return toAssignmentResponse(assignment);
    }

    public AssignmentResponse completeAssignment(Long assignmentId, String engineerEmail) {
        ComplaintAssignment assignment = getOwnedAssignment(assignmentId, engineerEmail);
        Engineer engineer = getEngineerByEmail(engineerEmail);

        if (assignment.getComplaint().getStatus() == ComplaintStatus.CLOSED) {
            throw new BadRequestException("Closed complaints cannot be modified");
        }

        if (assignment.getStatus() != AssignmentStatus.ACTIVE) {
            throw new BadRequestException("Assignment is not active");
        }

        assignment.setStatus(AssignmentStatus.COMPLETED);
        assignment.setCompletedAt(LocalDateTime.now());
        assignment = complaintAssignmentRepository.save(assignment);

        complaintLogService.log(assignment.getComplaint(), LogAction.ASSIGNMENT_COMPLETED, Role.ENGINEER,
                engineer.getId(), engineer.getName(), null, null,
                "Engineer " + engineer.getName() + " completed their assignment");

        // If all active assignments for this complaint are completed, set status to RESOLVED
        var complaint = assignment.getComplaint();
        List<ComplaintAssignment> activeAssignments = complaintAssignmentRepository
                .findByComplaintId(complaint.getId())
                .stream()
                .filter(a -> a.getStatus() == AssignmentStatus.ACTIVE)
                .toList();

        if (activeAssignments.isEmpty() && complaint.getStatus() != ComplaintStatus.RESOLVED
                && complaint.getStatus() != ComplaintStatus.CLOSED) {
            String oldStatus = complaint.getStatus().name();
            complaint.setStatus(ComplaintStatus.RESOLVED);
            complaintRepository.save(complaint);

            complaintLogService.log(complaint, LogAction.STATUS_CHANGE, Role.ENGINEER,
                    engineer.getId(), engineer.getName(), oldStatus, "RESOLVED",
                    "All engineer assignments completed");
        }

        return toAssignmentResponse(assignment);
    }

    // ==================== Helpers ====================

    private Engineer getEngineerByEmail(String email) {
        return engineerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Engineer not found"));
    }

    private ComplaintAssignment getOwnedAssignment(Long assignmentId, String engineerEmail) {
        Engineer engineer = getEngineerByEmail(engineerEmail);
        ComplaintAssignment assignment = complaintAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        if (!assignment.getEngineer().getId().equals(engineer.getId())) {
            throw new BadRequestException("This assignment does not belong to you");
        }
        return assignment;
    }

    // ==================== Mapper ====================

    private AssignmentResponse toAssignmentResponse(ComplaintAssignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .complaintId(a.getComplaint().getId())
                .complaintNumber(a.getComplaint().getComplaintNumber())
                .complaintTitle(a.getComplaint().getTitle())
                .engineerId(a.getEngineer().getId())
                .engineerName(a.getEngineer().getName())
                .assignedByManagerName(a.getAssignedByManager() != null ? a.getAssignedByManager().getName() : null)
                .assignedDate(a.getAssignedDate())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .visitDate(a.getVisitDate())
                .workDone(a.getWorkDone())
                .assignedAt(a.getAssignedAt())
                .completedAt(a.getCompletedAt())
                .customerCompanyName(a.getComplaint().getCustomer().getCompanyName())
                .siteAddress(a.getComplaint().getSiteAddress())
                .complaintDescription(a.getComplaint().getDescription())
                .complaintStatus(a.getComplaint().getStatus().name())
                .build();
    }
}
