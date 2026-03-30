# CMS — Complaint Management System

A full-stack complaint management system with role-based access for **Admins**, **Managers**, **Engineers**, and **Customers**.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Backend  | Spring Boot 4, Spring Security, JPA/Hibernate   |
| Database | MySQL 8                                         |
| Auth     | JWT (Bearer tokens)                             |
| Infra    | Docker, Docker Compose                          |

## Project Structure

```
api/   → Spring Boot REST API (Java 21, Gradle)
web/   → Next.js frontend
```

## Getting Started

### Prerequisites

- Java 21
- Node.js 20+
- MySQL 8 (or Docker)

### Run with Docker Compose

```bash
cd api
docker compose up -d
```

This starts both the MySQL database and the API server.

### Run Manually

**Backend:**

```bash
cd api
./gradlew bootRun
```

The API runs on `http://localhost:8080`.

**Frontend:**

```bash
cd web
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

### Environment Variables

| Variable            | Default     | Description          |
| ------------------- | ----------- | -------------------- |
| `DB_HOST`           | `localhost` | MySQL host           |
| `DB_PORT`           | `3306`      | MySQL port           |
| `DB_NAME`           | `cms_db`    | Database name        |
| `DB_USERNAME`       | `root`      | Database user        |
| `DB_PASSWORD`       | `root`      | Database password    |
| `JWT_SECRET`        | (built-in)  | JWT signing key for API and frontend proxy verification |
| `JWT_EXPIRATION_MS` | `86400000`  | Token TTL (24 hours) |

## Roles & Features

- **Admin** — Register admins, manage customers/engineers/managers, view all complaints
- **Manager** — Assign complaints to engineers, track progress
- **Engineer** — View assignments, update complaint status, view history
- **Customer** — File complaints, track status, manage profile

## API

REST API docs are available in [api/API_DOCUMENTATION.md](api/API_DOCUMENTATION.md).
