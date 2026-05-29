# Internal Publishing Workflow Management System

> Developed during internship at **Công ty Cổ phần DVXB Giáo dục Gia Định** (Gia Dinh Education Publishing Co., Ltd.)

---

## Overview

Gia Dinh Education Publishing processes hundreds of book titles each year. Each title goes through multiple stages: concept → approval → editing → correction → review → printing → publishing. Previously, this entire workflow was managed manually via Excel and paper documents, leading to:

- Difficulty tracking overall progress across departments
- Missed tasks and duplicated assignments
- Heavy reliance on the Editorial Secretary as a manual coordinator

This system was built to **digitize and optimize** the entire workflow, enabling departments to collaborate with greater clarity, transparency, and efficiency.

---

## Features

### User Management & Access Control
- Auto-generated accounts (username = full name + date of birth) when adding employees
- Role-based access control (RBAC): Admin, Editorial Secretary, Department Head, Employee, HR, Accountant
- Session-based authentication with CSRF protection and hashed passwords
- Custom middleware-based position check applied per route group

### Book Management
- Add, update, and discontinue book titles
- Track both **estimated pages** and **actual pages** in parallel
- Classify by category and paper size
- Assign departments to each book title

### Operation Tracking (BookTransfer)
- Full history of book transfers across departments with timestamps
- Statistics on processing count per department
- Visual indicator of the department currently handling each book

### Task Allocation
- Department heads assign employees to specific tasks (Editing, Proofreading, Revision, etc.)
- Job coefficients dynamically loaded from configuration tables
- Track page progress per employee
- Employees can self-update completion status or reopen progress

### Reporting
- Aggregated reports by department or individual employee
- Filter by month and year
- Export to **PDF** for internal circulation

### Audit Log
- Automatic logging of all actions: login, create, update, assignment, etc.
- Records IP address, URL, and old/new data (JSON format)
- Logs are read-only; only Admin can access
- Filter by employee, module, action type, and date range
- Audit logging extracted into reusable Trait, applied across all mutating controllers

### System Configuration
- Job type coefficients (Editing, Proofreading, Revision, etc.)
- Paper size coefficients (A4, 17×24, 19×26.5, etc.)
- Annual salary coefficients (versioned — updates do not affect prior years)
- Positions and book categories

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│            React + Vite (SPA)                    │
│       Role-based UI per user type                │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────────┐
│                   Backend                        │
│              Laravel (PHP) – MVC                 │
│  Route → Middleware (Auth/CSRF) → Controller     │
│              → Model (Eloquent ORM)              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                  Database                        │
│                   MySQL                          │
│          Version-controlled migrations           │
└─────────────────────────────────────────────────┘
```

### ERD Overview

<img width="1102" height="630" alt="image" src="https://github.com/user-attachments/assets/81cb3b62-7630-467e-9e30-2c40e2481a37" />

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP / Laravel |
| Frontend | React + Vite |
| Database | MySQL |
| Authentication | Session + CSRF |
| API | RESTful (GET, POST, PUT, PATCH) |
| Dev Environment | XAMPP (localhost) |
| Version Control | Git / GitHub |

---

## Screenshots

### Book Management

**Book processing status and progress overview**
<img width="1119" height="510" alt="image" src="https://github.com/user-attachments/assets/ae2c4963-9d40-40a0-a46d-3c22d3d4711a" />

**Department assignment management**
<img width="772" height="468" alt="image" src="https://github.com/user-attachments/assets/d510cae7-4ea5-493d-af11-c10d48bcf510" />

**Inter-department operation tracking**
<img width="965" height="483" alt="image" src="https://github.com/user-attachments/assets/1348d42c-47ac-40c2-a68e-9bdcd450f11b" />

### System Configuration

**Position management**
<img width="877" height="444" alt="image" src="https://github.com/user-attachments/assets/1a0e61e3-14ea-4753-8c3a-0dce1ec16b16" />

**Coefficient management — updates do not affect previously recorded entries**
<img width="963" height="328" alt="image" src="https://github.com/user-attachments/assets/d09bbef2-eef6-41dd-8b31-ba950a7f7e10" />

*(Additional configuration views: paper size, job type coefficients, etc.)*

### Department Head — Task Allocation

**Assigned task overview**
<img width="1098" height="636" alt="image" src="https://github.com/user-attachments/assets/a0ea1017-b986-404c-b6f8-d98f43bb9006" />

**Individual task and member assignment**
<img width="1098" height="456" alt="image" src="https://github.com/user-attachments/assets/42a62aef-2c4f-4814-a63b-e18b58661ca0" />

### Employee — Personal Tasks

**Main dashboard**
<img width="1098" height="456" alt="image" src="https://github.com/user-attachments/assets/ee54c83c-6ae3-46d8-9807-bd15596bb7e7" />

**Progress and page count update per editing task**
<img width="1102" height="397" alt="image" src="https://github.com/user-attachments/assets/d86e9b9f-ff7e-480a-8c1e-9efb4c5e2349" />

### Reports

> Salary calculation is derived from job coefficients, paper size coefficients, and annual salary coefficients — all linked to task allocation records per employee.

**On-system report view**
<img width="1098" height="682" alt="image" src="https://github.com/user-attachments/assets/331c614a-0b21-4d20-ae58-30c84179cc45" />

**PDF export preview**
<img width="1102" height="604" alt="image" src="https://github.com/user-attachments/assets/0e6c3e42-0afc-4a00-a868-6f1a50c56966" />

### Audit Log

**Activity summary — total operations on system**
<img width="1025" height="471" alt="image" src="https://github.com/user-attachments/assets/5e33c32b-8033-4cee-8fde-736d4f29bc08" />

**Detailed log view**
<img width="533" height="453" alt="image" src="https://github.com/user-attachments/assets/949e2419-f47e-43b4-b5e9-c6fa6f01fcf6" />

---

## Getting Started

### Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL
- XAMPP (or equivalent local web server)

### 1. Clone the repository

```bash
git clone https://github.com/Dibenz204/internal_publishing_system.git
cd internal_publishing_system
```

### 2. Backend setup (Laravel)

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configure your `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=internal_publishing
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations and seed sample data:

```bash
php artisan migrate
php artisan db:seed
```

### 3. Frontend setup (React + Vite)

```bash
npm install
```

### 4. Run the project

Run backend and frontend concurrently:

```bash
# Terminal 1 – Backend
php artisan serve

# Terminal 2 – Frontend
npm run dev
```

Access at: `http://localhost:5173`

---

## Database Schema

| Table | Description |
|---|---|
| `employees` | Employee information |
| `users` | Login accounts (1-to-1 with employee) |
| `positions` | Positions (Department Head, Editorial Secretary, Employee, etc.) |
| `departments` | Department records |
| `books` | Book title information |
| `book_categories` | Book category definitions |
| `book_book_category` | Pivot table (book ↔ category) |
| `papers` | Paper sizes and conversion coefficients |
| `projects` | Projects (book × department) |
| `book_transfers` | Book transfer history across departments |
| `allocations` | Employee task assignments per project |
| `job_categories` | Job types and coefficients (Editing, Proofreading, etc.) |
| `salary_coefficients` | Annual salary coefficients (versioned) |
| `reports` | Aggregated report records |

---

## Role-based Access Control

| Role | Primary Permissions |
|---|---|
| **Admin** | Full system access, Audit Log, system configuration |
| **Editorial Secretary (TKBT)** | Add/manage books, assign departments, approve transfers, confirm completion |
| **Department Head** | Accept/reject projects, assign employees, submit results to Editorial Secretary |
| **Employee** | View assigned tasks, update page progress, mark tasks complete |
| **HR** | Add/update employee records |
| **Accountant** | View and export salary reports by department or individual |

---

## Modules

```
internal_publishing_system/
├── app/
│   ├── Console/                    # Artisan commands
│   ├── Exceptions/                 # Exception handling
│   ├── Http/
│   │   ├── Controllers/            # Request handlers per module
│   │   └── Middleware/
│   │       ├── Authenticate.php            # Auth check
│   │       ├── CheckPosition.php           # Custom role/position verification
│   │       ├── CheckSession.php            # Session validation
│   │       ├── EncryptCookies.php          # Cookie encryption
│   │       ├── PreventRequestsDuringMaintenance.php
│   │       ├── RedirectIfAuthenticated.php
│   │       ├── TrimStrings.php
│   │       ├── TrustHosts.php
│   │       ├── TrustProxies.php
│   │       ├── ValidateSignature.php
│   │       └── VerifyCsrfToken.php         # CSRF protection
│   ├── Models/                     # Eloquent models
│   ├── Providers/                  # Service providers
│   ├── Services/                   # Business logic layer
│   └── Traits/                     # Reusable traits (audit logging)
├── bootstrap/
├── config/                         # App configuration
├── database/                       # Migrations & seeders
├── public/                         # Entry point (index.php, assets)
├── resources/
├── routes/                         # API & web route definitions
└── storage/                        # Logs, cache, uploads
```

---

## Branching Strategy

The project follows **feature branching**: each feature is developed on a dedicated branch and merged into `main` via Pull Request.

| Branch | Description |
|---|---|
| `main` | Main branch — stable release |
| `Autentication_Authorization` | Auth & access control |
| `Lam-book_bookcategory` | Book & category module |
| `Lam-project` | Project module |
| `Lam-Allocation` | Task allocation module |
| `yen-report-service` | Report API |
| `yen-migrationnn` | Database migrations |
| `Frontend` | React UI |
| `feature/deploy` | Deployment configuration |

---

## Team

| Role | Member |
|---|---|
| Backend Lead, Database Architect & Team Leader | Nguyễn Đình Phong |
| Backend Developer | Nguyễn Thị Yến |
| Backend Developer | Nguyễn Huỳnh Lâm |
| Frontend | React + AI-assisted UI, API integration by Nguyễn Đình Phong |
