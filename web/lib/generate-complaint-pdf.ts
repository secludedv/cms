import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ComplaintResponse, LogEntry } from "@/lib/types";
import { formatDateIST, nowIST } from "@/lib/format-date";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

function formatDate(d: string | null) {
  if (!d) return "-";
  return formatDateIST(d);
}

function getLogDescription(log: LogEntry): string {
  switch (log.action) {
    case "COMPLAINT_CREATED":
      return "Complaint created";
    case "COMPLAINT_UPDATED":
      return "Complaint updated";
    case "STATUS_CHANGE":
      return `Status changed: ${STATUS_LABELS[log.oldValue ?? ""] ?? log.oldValue} -> ${STATUS_LABELS[log.newValue ?? ""] ?? log.newValue}`;
    case "ENGINEER_ASSIGNED":
      return "Engineer assigned";
    case "ENGINEER_REMOVED":
      return "Engineer removed";
    case "REMARK_ADDED":
      return "Work remark added";
    case "ASSIGNMENT_COMPLETED":
      return "Assignment completed";
    default:
      return String(log.action).replace(/_/g, " ");
  }
}

export function generateComplaintPdf(complaint: ComplaintResponse) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // ─── Header ─────────────────────────────────────────────
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Complaint Report", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    complaint.complaintNumber ?? `Complaint #${complaint.id}`,
    margin,
    19,
  );
  doc.text(`Generated: ${nowIST()}`, margin, 24);

  y = 36;
  doc.setTextColor(0, 0, 0);

  // ─── Summary Box ────────────────────────────────────────
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "FD");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.title, margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const summaryParts = [
    `Status: ${STATUS_LABELS[complaint.status] ?? complaint.status}`,
    complaint.priority
      ? `Priority: ${PRIORITY_LABELS[complaint.priority] ?? complaint.priority}`
      : null,
    `Created: ${formatDate(complaint.createdAt)}`,
  ].filter(Boolean);
  doc.text(summaryParts.join("  |  "), margin + 4, y + 14);
  if (complaint.closedAt) {
    doc.text(`Closed: ${formatDate(complaint.closedAt)}`, margin + 4, y + 19);
  }

  y += 28;
  doc.setTextColor(0, 0, 0);

  // ─── Helper: section title ──────────────────────────────
  function sectionTitle(title: string) {
    if (y > 265) {
      doc.addPage();
      y = 14;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(title, margin, y);
    y += 2;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
  }

  // ─── Complaint Details ──────────────────────────────────
  sectionTitle("Complaint Details");

  const detailRows: [string, string][] = [
    ["Complaint No.", complaint.complaintNumber ?? `#${complaint.id}`],
    ["Issue", complaint.title],
    ["Detail of Issue", complaint.description],
    ["Status", STATUS_LABELS[complaint.status] ?? complaint.status],
  ];
  if (complaint.priority) {
    detailRows.push([
      "Priority",
      PRIORITY_LABELS[complaint.priority] ?? complaint.priority,
    ]);
  }
  if (complaint.category) detailRows.push(["System", complaint.category]);
  if (complaint.siteAddress)
    detailRows.push(["Site Address", complaint.siteAddress]);
  detailRows.push(["Created", formatDate(complaint.createdAt)]);
  detailRows.push(["Updated", formatDate(complaint.updatedAt)]);
  if (complaint.closedAt)
    detailRows.push(["Closed", formatDate(complaint.closedAt)]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: detailRows,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40, textColor: [100, 116, 139] },
      1: { cellWidth: "auto" },
    },
    didDrawPage: () => {},
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── Customer Information ───────────────────────────────
  sectionTitle("Customer Information");

  const customerRows: [string, string][] = [
    ["Company", complaint.customerCompanyName],
    ["Contact Person", complaint.customerContactPerson],
    ["Customer ID", String(complaint.customerId)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: customerRows,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40, textColor: [100, 116, 139] },
      1: { cellWidth: "auto" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── Equipment Information ──────────────────────────────
  if (
    complaint.equipmentName ||
    complaint.equipmentModel ||
    complaint.equipmentSerialNumber
  ) {
    sectionTitle("Equipment Information");

    const eqRows: [string, string][] = [];
    if (complaint.equipmentName) eqRows.push(["Name", complaint.equipmentName]);
    if (complaint.equipmentModel)
      eqRows.push(["Model", complaint.equipmentModel]);
    if (complaint.equipmentSerialNumber)
      eqRows.push(["Serial Number", complaint.equipmentSerialNumber]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [],
      body: eqRows,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40, textColor: [100, 116, 139] },
        1: { cellWidth: "auto" },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── Assignments ────────────────────────────────────────
  if (complaint.assignments?.length) {
    sectionTitle("Engineer Assignments");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Engineer", "Assigned By", "Date", "Status", "Work Done"]],
      body: complaint.assignments.map((a) => [
        a.engineerName,
        a.assignedByManagerName,
        a.assignedDate,
        a.status,
        a.workDone ?? "-",
      ]),
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── Activity Logs ──────────────────────────────────────
  if (complaint.logs?.length) {
    sectionTitle("Activity Log");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["#", "Action", "Performed By", "Role", "Remarks", "Date"]],
      body: complaint.logs.map((log, i) => [
        String(i + 1),
        getLogDescription(log),
        log.performedByName,
        log.performedByRole,
        log.remarks ?? "-",
        formatDate(log.createdAt),
      ]),
      theme: "striped",
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 40 },
        2: { cellWidth: 28 },
        3: { cellWidth: 18 },
        4: { cellWidth: "auto" },
        5: { cellWidth: 36 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  // ─── Footer on every page ───────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPages = (doc as any).getNumberOfPages() as number;
  for (let i = 1; i <= totalPages; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `CMS Complaint Report - ${complaint.complaintNumber ?? `Complaint #${complaint.id}`} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" },
    );
  }

  doc.save(
    `${complaint.complaintNumber ?? `complaint-${complaint.id}`}-report.pdf`,
  );
}
