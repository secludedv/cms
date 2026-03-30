package safeguardindustries.in.cms.util;

import safeguardindustries.in.cms.exception.BadRequestException;

import java.util.Map;
import java.util.Set;

public final class ComplaintCatalog {

    private static final Map<String, Set<String>> ISSUES_BY_SYSTEM = Map.ofEntries(
            Map.entry("Fire Hydrant System", Set.of("Water Leakage", "Pumps Issue", "Others")),
            Map.entry("Portable Fire Extinguishers", Set.of("Pressure Issue", "Performance Issue", "Others")),
            Map.entry("Sprinkler System", Set.of("Water Leakage", "Pumps/ Pressure Issue", "Sprinkler bursted", "Others")),
            Map.entry("Smoke Detection & Alarm System", Set.of("Control Panel Issue", "Smoke Detector / MCP/ Hooters", "Cable Issue", "Others")),
            Map.entry("Gas based Suppression System", Set.of("Low Pressure", "Others", "Electrical fault")),
            Map.entry("CO2 Flooding System", Set.of("Mechanical Issue", "Gas Pressure Issue", "Others")),
            Map.entry("Medium/ High Velocity water Spray System", Set.of("Leakage", "Performance Issue", "Others")),
            Map.entry("Foam Flooding System", Set.of("Leakage", "Performance Issue", "Others")),
            Map.entry("Others", Set.of("Others"))
    );

    private ComplaintCatalog() {
    }

    public static void validateSystemAndIssue(String system, String issue) {
        if (system == null || system.isBlank()) {
            throw new BadRequestException("System is required");
        }
        if (issue == null || issue.isBlank()) {
            throw new BadRequestException("Issue is required");
        }

        Set<String> validIssues = ISSUES_BY_SYSTEM.get(system);
        if (validIssues == null) {
            throw new BadRequestException("Invalid system: " + system);
        }
        if (!validIssues.contains(issue)) {
            throw new BadRequestException("Invalid issue '" + issue + "' for system '" + system + "'");
        }
    }

    public static String sanitizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.strip();
        return normalized.isEmpty() ? null : normalized;
    }
}
