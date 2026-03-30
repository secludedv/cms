// ─── Enums ───────────────────────────────────────────────

export type Role = "ADMIN" | "MANAGER" | "ENGINEER" | "CUSTOMER";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ComplaintStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "REMOVED";

export type LogAction =
  | "COMPLAINT_CREATED"
  | "COMPLAINT_UPDATED"
  | "STATUS_CHANGE"
  | "ENGINEER_ASSIGNED"
  | "ENGINEER_REMOVED"
  | "REMARK_ADDED"
  | "ASSIGNMENT_COMPLETED";

// ─── API Response Wrapper ────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Auth ────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  name: string;
  email: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

export interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

// ─── Manager ─────────────────────────────────────────────

export interface ManagerRequest {
  name: string;
  email: string;
  password?: string;
  phone: string;
}

export interface ManagerResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

// ─── Engineer ────────────────────────────────────────────

export interface EngineerRequest {
  name: string;
  email: string;
  employeeId: string;
  password?: string;
  phone: string;
  specialization: string;
}

export interface EngineerResponse {
  id: number;
  name: string;
  email: string;
  employeeId: string;
  phone: string;
  specialization: string;
  available: boolean;
  createdAt: string;
}

// ─── Customer ────────────────────────────────────────────

export interface CustomerRequest {
  companyName: string;
  contactPersonName: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerResponse {
  id: number;
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  managerId: number;
  managerName: string;
  createdAt: string;
}

// ─── Complaint ───────────────────────────────────────────

export interface ComplaintRequest {
  title: string;
  description: string;
  category?: string;
  equipmentName?: string;
  siteAddress?: string;
}

export interface ManagerComplaintRequest {
  customerId: number;
  title: string;
  description: string;
  category?: string;
  equipmentName?: string;
  siteAddress?: string;
}

export interface ManagerRemarkRequest {
  remarks: string;
}

export interface ComplaintResponse {
  id: number;
  complaintNumber: string;
  title: string;
  description: string;
  priority: Priority | null;
  status: ComplaintStatus;
  category: string | null;
  equipmentName: string | null;
  equipmentSerialNumber: string | null;
  equipmentModel: string | null;
  siteAddress: string | null;
  managerRemarks: string | null;
  customerId: number;
  customerCompanyName: string;
  customerContactPerson: string;
  assignments: AssignmentResponse[];
  logs: LogEntry[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

// ─── Assignment ──────────────────────────────────────────

export interface AssignEngineerRequest {
  engineerId: number;
  assignedDate: string;
}

export interface RemarkRequest {
  workDone: string;
  remarks?: string;
  visitDate?: string;
}

export interface AssignmentResponse {
  id: number;
  complaintId: number;
  complaintNumber: string;
  complaintTitle: string;
  engineerId: number;
  engineerName: string;
  assignedByManagerName: string;
  assignedDate: string;
  status: AssignmentStatus;
  remarks: string | null;
  visitDate: string | null;
  workDone: string | null;
  assignedAt: string;
  completedAt: string | null;
  // Extra fields in engineer view
  customerCompanyName?: string | null;
  siteAddress?: string | null;
  complaintDescription?: string | null;
  complaintStatus?: ComplaintStatus | null;
}

// ─── Log ─────────────────────────────────────────────────

export interface LogEntry {
  id: number;
  action: LogAction;
  performedByRole: Role;
  performedByName: string;
  oldValue: string | null;
  newValue: string | null;
  remarks: string | null;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────

export interface DashboardStats {
  totalComplaints: number;
  openComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  totalManagers: number;
  totalEngineers: number;
  totalCustomers: number;
}
