export const COMPLAINT_ISSUES_BY_SYSTEM = {
  "Fire Hydrant System": ["Water Leakage", "Pumps Issue", "Others"],
  "Portable Fire Extinguishers": [
    "Pressure Issue",
    "Performance Issue",
    "Others",
  ],
  "Sprinkler System": [
    "Water Leakage",
    "Pumps/ Pressure Issue",
    "Sprinkler bursted",
    "Others",
  ],
  "Smoke Detection & Alarm System": [
    "Control Panel Issue",
    "Smoke Detector / MCP/ Hooters",
    "Cable Issue",
    "Others",
  ],
  "Gas based Suppression System": [
    "Low Pressure",
    "Others",
    "Electrical fault",
  ],
  "CO2 Flooding System": ["Mechanical Issue", "Gas Pressure Issue", "Others"],
  "Medium/ High Velocity water Spray System": [
    "Leakage",
    "Performance Issue",
    "Others",
  ],
  "Foam Flooding System": ["Leakage", "Performance Issue", "Others"],
  Others: ["Others"],
} as const satisfies Record<string, readonly string[]>;

export const COMPLAINT_SYSTEM_OPTIONS = Object.keys(COMPLAINT_ISSUES_BY_SYSTEM);

export function getComplaintIssues(system?: string) {
  if (!system) return [];

  if (!(system in COMPLAINT_ISSUES_BY_SYSTEM)) {
    return [];
  }

  return [
    ...COMPLAINT_ISSUES_BY_SYSTEM[
      system as keyof typeof COMPLAINT_ISSUES_BY_SYSTEM
    ],
  ];
}
