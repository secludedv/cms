# CMS API Documentation

Base URL: `/api`

All responses follow the standard `ApiResponse` wrapper:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

Authentication uses JWT Bearer tokens. Include `Authorization: Bearer <token>` header on all protected endpoints.

---

## Authentication (`/api/auth`)

### POST `/api/auth/login`

Login with email and password. Works for all roles (Admin, Manager, Engineer, Customer).

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOi...",
  "role": "MANAGER",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### POST `/api/auth/register/admin`

Register a new admin. **Requires: ADMIN role.**

**Request Body:**

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

> **Validation:** Email must be unique across all accounts (admin, manager, engineer, customer). Attempting to register a duplicate email will return a `400 Bad Request`.

---

## Admin Endpoints (`/api/admin`)

**Requires: ADMIN role**

### Managers

| Method | Endpoint                   | Description       |
| ------ | -------------------------- | ----------------- |
| POST   | `/api/admin/managers`      | Create a manager  |
| GET    | `/api/admin/managers`      | List all managers |
| GET    | `/api/admin/managers/{id}` | Get manager by ID |
| PUT    | `/api/admin/managers/{id}` | Update manager    |
| DELETE | `/api/admin/managers/{id}` | Delete manager    |

**ManagerRequest:**

```json
{
  "name": "Manager Name",
  "email": "manager@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

> **Note:** `password` is **required** on create, **optional** on update. If omitted during update, the existing password is preserved.
>
> **Validation:** Email must be unique across all accounts. Attempting to set a duplicate email will return a `400 Bad Request`.

### Engineers

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| POST   | `/api/admin/engineers`      | Create engineer    |
| GET    | `/api/admin/engineers`      | List all engineers |
| GET    | `/api/admin/engineers/{id}` | Get engineer by ID |
| PUT    | `/api/admin/engineers/{id}` | Update engineer    |
| DELETE | `/api/admin/engineers/{id}` | Delete engineer    |

**EngineerRequest:**

```json
{
  "name": "Engineer Name",
  "email": "engineer@example.com",
  "employeeId": "EMP-001",
  "password": "password123",
  "phone": "1234567890",
  "specialization": "Mechanical"
}
```

> **Note:** `password` is **required** on create, **optional** on update. If omitted during update, the existing password is preserved.
>
> **Validation:** `email` must be unique across all accounts, and `employeeId` must be unique across all engineers. Attempting to set a duplicate will return a `400 Bad Request`.

### Customers

| Method | Endpoint                              | Description                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/api/admin/customers`                | List all customers                        |
| GET    | `/api/admin/customers/{id}`           | Get customer by ID                        |
| POST   | `/api/admin/customers?managerId={id}` | Create a customer (assigned to a manager) |

### Complaints

| Method | Endpoint                            | Description             |
| ------ | ----------------------------------- | ----------------------- |
| GET    | `/api/admin/complaints`             | List all complaints     |
| GET    | `/api/admin/complaints/{id}`        | Get complaint by ID     |
| PUT    | `/api/admin/complaints/{id}/status` | Update complaint status |

> **Closing a complaint:** When the status is set to `CLOSED`, all active engineer assignments on that complaint are automatically marked as `COMPLETED`.
>
> **Closed complaints are final:** After a complaint is closed, manager, engineer, and admin mutation endpoints reject further remarks, assignment changes, priority changes, completion updates, and status changes.

### Dashboard

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/api/admin/dashboard/stats` | Get dashboard statistics |

---

## Manager Endpoints (`/api/manager`)

**Requires: MANAGER role**

### Customers (scoped to manager's own customers)

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| POST   | `/api/manager/customers`      | Create a customer  |
| GET    | `/api/manager/customers`      | List own customers |
| GET    | `/api/manager/customers/{id}` | Get customer by ID |
| PUT    | `/api/manager/customers/{id}` | Update customer    |
| DELETE | `/api/manager/customers/{id}` | Delete customer    |

**CustomerRequest:**

```json
{
  "companyName": "Acme Corp",
  "contactPersonName": "Jane Smith",
  "email": "jane@acme.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

> **Note:** `password` is **required** on create, **optional** on update. If omitted during update, the existing password is preserved.
>
> **Validation:** Email must be unique across all accounts. Attempting to set a duplicate email will return a `400 Bad Request`.
>
> **Admin customer creation:** Super admin can also create customers via `POST /api/admin/customers?managerId={id}` using the same request body. The `managerId` query parameter specifies which manager the customer will be linked to.

### Engineers

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| POST   | `/api/manager/engineers` | Create an engineer |
| GET    | `/api/manager/engineers` | List all engineers |

### Complaints

| Method | Endpoint                                | Description                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| POST   | `/api/manager/complaints`               | **Create complaint on behalf of a customer** |
| GET    | `/api/manager/complaints`               | List complaints for own customers            |
| GET    | `/api/manager/complaints/{id}`          | Get complaint by ID                          |
| PUT    | `/api/manager/complaints/{id}/status`   | Update complaint status                      |
| PUT    | `/api/manager/complaints/{id}/priority` | **Update complaint priority**                |
| POST   | `/api/manager/complaints/{id}/remarks`  | **Add remarks to a complaint**               |

#### POST `/api/manager/complaints` — Create complaint on behalf of customer

The manager can file a complaint for any customer they own. New complaints created through this endpoint always start with `LOW` priority. Managers can change the priority later via `PUT /api/manager/complaints/{id}/priority`.

**Complaint field mapping used by the API:**

- `category` = selected **System**
- `title` = selected **Issue**
- `description` = **Detail of Issue**

**Request Body (`ManagerComplaintRequest`):**

```json
{
  "customerId": 1,
  "title": "Water Leakage",
  "description": "Water is leaking near the terrace hydrant landing valve.",
  "category": "Fire Hydrant System",
  "equipmentName": "Hydrant Valve",
  "siteAddress": "Terrace Block A"
}
```

- `customerId` — **required**, must be a customer owned by this manager
- `category` — **required**, selected system
- `title` — **required**, selected issue
- `description` — **required**, detail of issue
- `equipmentName` — optional
- `siteAddress` — optional

> **Validation:** The backend validates that the selected issue belongs to the selected system.
>
> **Behavior:** Priority is initialized to `LOW`. `equipmentSerialNumber` and `equipmentModel` are no longer accepted in complaint creation requests.

**Supported complaint systems and issues:**

- `Fire Hydrant System` → `Water Leakage`, `Pumps Issue`, `Others`
- `Portable Fire Extinguishers` → `Pressure Issue`, `Performance Issue`, `Others`
- `Sprinkler System` → `Water Leakage`, `Pumps/ Pressure Issue`, `Sprinkler bursted`, `Others`
- `Smoke Detection & Alarm System` → `Control Panel Issue`, `Smoke Detector / MCP/ Hooters`, `Cable Issue`, `Others`
- `Gas based Suppression System` → `Low Pressure`, `Others`, `Electrical fault`
- `CO2 Flooding System` → `Mechanical Issue`, `Gas Pressure Issue`, `Others`
- `Medium/ High Velocity water Spray System` → `Leakage`, `Performance Issue`, `Others`
- `Foam Flooding System` → `Leakage`, `Performance Issue`, `Others`
- `Others` → `Others`

#### PUT `/api/manager/complaints/{id}/priority` — Update priority

Only the manager can set or change the priority of a complaint.

**Query Parameter:** `priority` — one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

Example: `PUT /api/manager/complaints/5/priority?priority=CRITICAL`

#### POST `/api/manager/complaints/{id}/remarks` — Add remarks

The manager can add remarks/notes to any complaint belonging to their customers. The remarks are stored on the complaint and also logged in the activity log.

**Request Body (`ManagerRemarkRequest`):**

```json
{
  "remarks": "Escalating this issue due to production downtime"
}
```

### Assignment

| Method | Endpoint                                                      | Description                    |
| ------ | ------------------------------------------------------------- | ------------------------------ |
| POST   | `/api/manager/complaints/{id}/assign`                         | Assign engineer to complaint   |
| DELETE | `/api/manager/complaints/{complaintId}/assign/{assignmentId}` | Remove engineer from complaint |

**AssignEngineerRequest:**

```json
{
  "engineerId": 1,
  "assignedDate": "2026-02-20"
}
```

> **Validation:**
>
> - An engineer cannot be assigned to the same complaint twice (if already active on it).
> - An engineer can have a **maximum of 3 active assignments per day**. Attempting a 4th assignment on the same date returns `400 Bad Request`.

**StatusUpdateRequest:**

```json
{
  "status": "IN_PROGRESS"
}
```

Status values: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

> **Closing a complaint:** When the status is set to `CLOSED`, all active engineer assignments on that complaint are automatically marked as `COMPLETED`.
>
> **Closed complaints are final:** After a complaint is closed, manager, engineer, and admin mutation endpoints reject further remarks, assignment changes, priority changes, completion updates, and status changes.

---

## Customer Endpoints (`/api/customer`)

**Requires: CUSTOMER role**

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/customer/complaints`      | Create a complaint  |
| GET    | `/api/customer/complaints`      | List own complaints |
| GET    | `/api/customer/complaints/{id}` | Get complaint by ID |
| GET    | `/api/customer/profile`         | Get own profile     |

### POST `/api/customer/complaints` — Create complaint

**Important:** Customers cannot set or view complaint priority from customer endpoints. New complaints always start with `LOW` priority, and only a manager can change the priority later.

**Complaint field mapping used by the API:**

- `category` = selected **System**
- `title` = selected **Issue**
- `description` = **Detail of Issue**

**Request Body (`ComplaintRequest`):**

```json
{
  "title": "Smoke Detector / MCP/ Hooters",
  "description": "The third-floor hooter is not sounding during alarm testing.",
  "category": "Smoke Detection & Alarm System",
  "equipmentName": "Hooter",
  "siteAddress": "Third Floor, East Wing"
}
```

> **Validation:** The backend validates that the selected issue belongs to the selected system.
>
> **Behavior:** Priority defaults to `LOW`. `priority`, `equipmentSerialNumber`, and `equipmentModel` are not part of the customer complaint create contract.

### Complaint Response for Customers

**Important:** Activity logs (`logs`) are **not** visible to customers, and `priority` is hidden from customer endpoints. Customer responses always return `logs: []` and `priority: null`. `managerRemarks` is visible to customers.

---

## Engineer Endpoints (`/api/engineer`)

**Requires: ENGINEER role**

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/engineer/assignments`               | List active assignments  |
| GET    | `/api/engineer/assignments/all`           | List all assignments     |
| GET    | `/api/engineer/assignments/{id}`          | Get assignment by ID     |
| PUT    | `/api/engineer/assignments/{id}/remark`   | Add remark to assignment |
| PUT    | `/api/engineer/assignments/{id}/complete` | Complete assignment      |

**RemarkRequest (Engineer):**

```json
{
  "workDone": "Replaced motor bearing and tested",
  "remarks": "Motor running smoothly now",
  "visitDate": "2026-02-15"
}
```

---

## Response Models

### ComplaintResponse

```json
{
  "id": 1,
  "complaintNumber": "CMP-20260215-001",
  "title": "Water Leakage",
  "description": "Water is leaking near the terrace hydrant landing valve.",
  "priority": "HIGH",
  "status": "ASSIGNED",
  "category": "Fire Hydrant System",
  "equipmentName": "Hydrant Valve",
  "equipmentSerialNumber": null,
  "equipmentModel": null,
  "siteAddress": "Terrace Block A",
  "managerRemarks": "Escalating due to production impact",
  "customerId": 1,
  "customerCompanyName": "Acme Corp",
  "customerContactPerson": "Jane Smith",
  "assignments": [],
  "logs": [],
  "createdAt": "2026-02-15T10:30:00",
  "updatedAt": "2026-02-15T11:00:00",
  "closedAt": null
}
```

> `complaintNumber` is auto-generated in the format `CMP-YYYYMMDD-NNN` (e.g., `CMP-20260215-001`). The sequence resets daily.
>
> `title` contains the selected issue, `category` contains the selected system, and `description` contains the detailed issue text.
>
> `priority` is visible to manager/admin endpoints, but customer endpoints return `priority: null`.
>
> `equipmentSerialNumber` and `equipmentModel` remain nullable response fields for existing records, but new complaint creation endpoints no longer accept them.
>
> `logs` is always empty for customer endpoints. `managerRemarks` contains the latest remarks added by the manager.

### AssignmentResponse

```json
{
  "id": 1,
  "complaintId": 1,
  "complaintNumber": "CMP-20260215-001",
  "complaintTitle": "Water Leakage",
  "engineerId": 2,
  "engineerName": "Bob Engineer",
  "assignedByManagerName": "John Manager",
  "assignedDate": "2026-02-20",
  "status": "ACTIVE",
  "remarks": null,
  "visitDate": null,
  "workDone": null,
  "assignedAt": "2026-02-15T10:30:00",
  "completedAt": null
}
```

### LogResponse

```json
{
  "id": 1,
  "action": "COMPLAINT_CREATED",
  "performedByRole": "MANAGER",
  "performedByName": "John Manager",
  "oldValue": null,
  "newValue": null,
  "remarks": "Complaint created by manager on behalf of Acme Corp",
  "createdAt": "2026-02-15T10:30:00"
}
```

### Enums

**Priority:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**ComplaintStatus:** `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

**AssignmentStatus:** `ACTIVE`, `COMPLETED`, `REMOVED`

**LogAction:** `COMPLAINT_CREATED`, `COMPLAINT_UPDATED`, `STATUS_CHANGE`, `ENGINEER_ASSIGNED`, `ENGINEER_REMOVED`, `REMARK_ADDED`, `ASSIGNMENT_COMPLETED`

**Role:** `ADMIN`, `MANAGER`, `ENGINEER`, `CUSTOMER`

### EngineerResponse

```json
{
  "id": 1,
  "name": "Bob Engineer",
  "email": "bob@example.com",
  "employeeId": "EMP-001",
  "phone": "1234567890",
  "specialization": "Mechanical",
  "available": true,
  "createdAt": "2026-02-15T10:30:00"
}
```

> `employeeId` is a unique, manually-assigned identifier for each engineer (e.g., `EMP-001`, `SGI-E-042`).
