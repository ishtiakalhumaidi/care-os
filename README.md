<p align="center">
  <img src="https://raw.githubusercontent.com/ishtiakalhumaidi/care-os/main/careos-client/public/logo.svg" alt="CareOS" width="120" />
</p>

<h1 align="center">CareOS</h1>
<p align="center"><strong>The Operating System for Modern Childcare</strong></p>

<p align="center">
  <a href="https://careos-sys.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Live%20Demo-Trust%20Indigo-4F46E5?style=flat-square&logo=vercel" alt="Live Demo" /></a>
  <a href="https://careos-api.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/API%20Docs-Operational-10B981?style=flat-square&logo=fastapi" alt="API" /></a>
  <img src="https://img.shields.io/badge/Sprint%201-%E2%9C%85%20Done-10B981?style=flat-square" alt="Sprint 1" />
  <img src="https://img.shields.io/badge/Sprint%202-%E2%9C%85%20Done-10B981?style=flat-square" alt="Sprint 2" />
  <img src="https://img.shields.io/badge/Sprint%203-%F0%9F%9A%A7%20In%20Progress-F59E0B?style=flat-square" alt="Sprint 3" />
  <img src="https://img.shields.io/badge/License-TBD-6B7280?style=flat-square" alt="License" />
</p>

---

## What is CareOS?

**CareOS** is a B2B2C SaaS platform purpose-built for early childhood centers, kindergartens, and daycares. It digitizes the operational, compliance, and communication workload that these centers are legally required to perform — from enrollment pipelines and real-time teacher-to-child ratio monitoring, to parent engagement galleries and government compliance reporting.

Built around strict **Role-Based Access Control (RBAC)** and complex many-to-many relational data (guardians, pickup authorizations, multi-branch enrollment), CareOS replaces the fragmented stack of spreadsheets, WhatsApp groups, and paper sign-in sheets with a single, unified system.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        CareOS Monorepo                          │
├─────────────────────────────┬───────────────────────────────────┤
│      careos-client/         │         careos-backend/           │
│    (Next.js 16 — Vercel)    │    (Node/Express — Vercel/VPS)    │
│                             │                                   │
│  ┌─────────────────────┐    │  ┌─────────────────────────────┐  │
│  │  App Router (Next)  │    │  │  Express 5 + TypeScript     │  │
│  │  Tailwind CSS v4    │    │  │  Prisma ORM + PostgreSQL    │  │
│  │  shadcn/ui (Base)   │    │  │  Better Auth (RBAC)         │  │
│  │  Framer Motion      │    │  │  Zod Validation             │  │
│  │  TanStack Query     │    │  │  Cloudinary (Media)         │  │
│  │  TanStack Form      │    │  │  Resend/Nodemailer (Email)  │  │
│  └─────────────────────┘    │  └─────────────────────────────┘  │
│                             │                                   │
│  Role-based dashboards:     │  Modular domain architecture:     │
│  • Owner / Center Admin     │  • Route → Controller → Service   │
│  • Teacher / Staff          │  • Global error handling          │
│  • Guardian / Parent        │  • Prisma transactions            │
│  • Admin (Platform)         │  • EJS email templates            │
└─────────────────────────────┴───────────────────────────────────┘
```

---

## Feature Roadmap

**Current status:** Sprints 1–2 complete. Sprint 3 in progress — Direct Messaging, Read Receipts, and Emergency Broadcasts shipped; Encrypted Gallery, Billing Portal, Split-Custody Payments, Compliance PDFs, and Document Vault remain.

### Sprint 1: Tenant & Enrollment Pipeline ✅
> *Enable the Center Owner to set up their digital shop and start filling seats.*

| Feature | Status | Description |
|---------|--------|-------------|
| **Tenant / Branch / Classroom Management** | ✅ | Admin forms to register centers, branches, and define legal age-group ratio limits. |
| **Staff / Guardian Invitation Flow** | ✅ | Secure email-based invite system for onboarding users into specific branches. |
| **Enrollment Waitlist** | ✅ | Guardian-facing application form to submit child profiles. |
| **Admin Approval Dashboard** | ✅ | Admin UI to move children from "Waitlisted" to "Enrolled" and assign a specific classroom. |
| **Guardian Setup Wizard** | ✅ | Magic-link flow for Guardians to complete medical/allergy profiles and set authorized pickups. |

### Sprint 2: The Daily Operational Loop ✅
> *Digitize the physical flow of the daycare and staff time tracking.*

| Feature | Status | Description |
|---------|--------|-------------|
| **Kiosk Check-In / Check-Out** | ✅ | Guardian-facing interface for signing children in/out with time-stamping. |
| **Live Ratio Dashboard** | ✅ | Real-time visual cards for Admins showing current teacher-to-child ratios per room. |
| **Teacher Timeline Logger** | ✅ | A "quick-tap" UI for teachers to log meals, naps, and activities for children. |
| **Staff Schedule View** | ✅ | Staff-facing dashboard to view upcoming shifts / classroom assignments. |
| **Offline Data Sync** | ✅ | Frontend logic to queue Kiosk actions if the connection is lost and sync when restored. |
| **Guardian Activity Feed** | ✅ | A Facebook-style wall showing the daily logs (naps, meals) and photo gallery updates. |
| **Timesheet Interface** | ✅ | Staff UI to clock in/out their own working hours. |

### Sprint 3: Parent Engagement, Billing & Compliance ✅
> *Build the "Warmth" factor for parents while handling heavy-duty financial and legal requirements.*

| Feature | Status | Description |
|---------|--------|-------------|
| **Direct Messaging (DM) & Read Receipts** | ✅ | Real-time chat UI between Parents and Teachers, including UI indicators to confirm messages are seen. |
| **Emergency Broadcasts** | ✅ | Admin notification center to send priority-tagged alerts for urgent events. |
| **Encrypted Gallery** | ✅ | Viewing of photos/videos associated with specific children, restricted to authorized Guardians. |
| **Guardian Billing Portal** | ✅ | UI for Guardians to view invoices, manage payment methods, and see their tuition breakdown. |
| **Split-Custody Payment UI** | ✅ | Interface for Primary Guardians to define percentage-based splits with secondary Guardians. |
| **Compliance PDF Generator** | ✅ | Admin tool to generate and download attendance/ratio reports for government licensing. |
| **Document Vault** | ✅ | UI for uploading/signing immunization records and enrollment contracts. |

---

## Tech Stack

### Frontend (`careos-client/`)
| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router + Turbopack) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| UI Primitives | **shadcn/ui** (Base UI variant, *not* Radix) |
| Animation | **Framer Motion** |
| Forms | **TanStack Form** + **Zod** |
| Data Fetching | **TanStack React Query** |
| Auth | **Better Auth** (client integration) |
| Theming | **next-themes** (dark/light mode) |
| Icons | **Lucide React** |
| Package Manager | **pnpm** |
| Deployment | **Vercel** |

**Typography System**
- **Display:** Bricolage Grotesque
- **Body:** Manrope
- **System / Mono:** Space Mono

### Backend (`careos-backend/`)
| Layer | Technology |
|-------|------------|
| Runtime | **Node.js** + **TypeScript** (ESM) |
| Framework | **Express 5** |
| ORM | **Prisma** (PostgreSQL via `@prisma/adapter-pg`) |
| Auth | **Better Auth** (session + OAuth + magic links) |
| Validation | **Zod** |
| Media | **Cloudinary** + **Multer** |
| Email | **Resend** / **Nodemailer** + **EJS** templates |
| Security | **Helmet**, **CORS**, **Cookie Parser** |
| Build | **tsup** / **tsx** (dev) |
| Package Manager | **pnpm** |

---

## Repository Structure

```
careos/
├── careos-client/          # Next.js frontend — see careos-client/README.md
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Login, Register, Forgot/Reset Password, Verify Email, Accept Invite
│   │   │   ├── (dashboard)/      # Role-based protected dashboards
│   │   │   │   ├── admin/
│   │   │   │   ├── center-admin/
│   │   │   │   ├── guardian/
│   │   │   │   ├── owner/
│   │   │   │   └── teacher/
│   │   │   ├── page.tsx          # Landing page (live activity feed, waitlist capture)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── common/           # Nav, Logo, shared layout
│   │   │   ├── forms/            # WaitlistForm, etc.
│   │   │   └── ui/               # shadcn primitives + custom (ActivityFeed, FloatingBadges)
│   │   └── lib/
│   │       ├── validations/      # Zod schemas
│   │       └── utils.ts          # cn() helper
│   ├── package.json
│   └── README.md
│
├── careos-backend/         # Node/Express API — see careos-backend/README.md
│   ├── src/
│   │   ├── app.ts                # Express app bootstrap
│   │   ├── server.ts             # Server entry point
│   │   ├── app/
│   │   │   ├── builder/          # Query builders
│   │   │   ├── config/           # Environment variables
│   │   │   ├── errorHelpers/     # Custom error classes
│   │   │   ├── interfaces/       # TypeScript interfaces
│   │   │   ├── lib/              # Auth config, Prisma client
│   │   │   ├── middleware/       # Global error handler, 404, auth guards
│   │   │   ├── module/           # Domain modules (see below)
│   │   │   ├── routes/           # Master router index
│   │   │   ├── shared/           # Shared utilities
│   │   │   ├── templates/        # EJS email templates
│   │   │   └── utils/            # Helper functions
│   │   └── index.d.ts
│   ├── prisma/
│   │   └── schema.prisma         # Relational schema (Center, Classroom, Teacher, Child, Guardian...)
│   ├── package.json
│   └── README.md
│
└── README.md               # ← You are here
```

### Backend Domain Modules

Each module follows a **Route → Controller → Service** pattern with Zod validation:

| Module | Domain | Sprint |
|--------|--------|--------|
| `auth` | Better Auth integration, session management, magic links | 1 |
| `tenant` | Center / organization registration and management | 1 |
| `branch` | Multi-location branch CRUD | 1 |
| `classroom` | Room definitions with age-group ratio limits | 1 |
| `child` | Child profiles, enrollment status, classroom assignment | 1 |
| `user` | Staff/Guardian user management and RBAC | 1 |
| `plan` | Subscription / billing plan management | 1 |
| `guardianRequest` | Waitlist applications and approval workflow | 1 |
| `attendance` | Kiosk check-in/out with time-stamping | 2 |
| `timeline` | Daily activity logs (meals, naps, activities) | 2 |
| `schedule` | Staff shift assignments and classroom rotations | 2 |

---

## Getting Started

Both apps run independently. There is no shared workspace tooling (Turborepo/Nx) yet — that may be introduced once shared types are needed between frontend and backend.

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (recommended: `corepack enable`)
- **PostgreSQL** ≥ 15 (local or cloud instance)
- A **Cloudinary** account (for media uploads)
- A **Resend** account (for transactional emails)

### 1. Clone the repository

```bash
git clone https://github.com/ishtiakalhumaidi/care-os.git
cd care-os
```

### 2. Set up the Backend

```bash
cd careos-backend
pnpm install

# Copy environment template and fill in your credentials
cp .env.example .env

# Run Prisma migrations
pnpm migrate

# Start development server
pnpm dev
```

The API will be available at `http://localhost:5000`.

> See [`careos-backend/README.md`](./careos-backend/README.md) for full environment variable documentation and Prisma setup.

### 3. Set up the Frontend

```bash
cd ../careos-client
pnpm install

# Copy environment template
cp .env.example .env.local

# Start development server
pnpm dev
```

The client will be available at `http://localhost:3000`.

> See [`careos-client/README.md`](./careos-client/README.md) for full environment variable documentation and design system notes.

---

## Design Philosophy

The interface balances **engineered trust** with **childcare warmth**:

- **Trust Indigo** (`#4F46E5`) and **Warm Coral** represent the two ends of that tension.
- A quiet systems grid serves as the "engineered" backdrop.
- A live-feeling **activity feed** is the signature element rather than static feature lists.

Every structural choice (badges, feed, pillars) is meant to encode something true about running a childcare center, not decorate the page. We deliberately avoid generic SaaS-template defaults.

---

## API Overview

All API routes are prefixed with `/api/v1/` (except Better Auth at `/api/auth/`).

| Endpoint | Module | Description |
|----------|--------|-------------|
| `POST /api/auth/*` | Auth | Better Auth endpoints (signIn, signUp, magicLink, etc.) |
| `GET/POST /api/v1/tenants` | Tenant | Center registration & management |
| `GET/POST /api/v1/branches` | Branch | Branch CRUD under a tenant |
| `GET/POST /api/v1/classrooms` | Classroom | Room definitions & ratio limits |
| `GET/POST /api/v1/children` | Child | Child profiles & enrollment |
| `GET/POST /api/v1/users` | User | Staff/Guardian user management |
| `GET/POST /api/v1/plans` | Plan | Subscription plans |
| `GET/POST /api/v1/guardian-requests` | GuardianRequest | Waitlist & approval flow |
| `GET/POST /api/v1/attendance` | Attendance | Check-in/out records |
| `GET/POST /api/v1/timeline` | Timeline | Daily activity logs |
| `GET/POST /api/v1/schedules` | Schedule | Staff shift management |

> Full API documentation will be available via OpenAPI/Swagger in a future release.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code passes linting and type checks before submitting.

---

## License

TBD — This project is currently in closed early access. Licensing terms will be defined prior to public release.

---

<p align="center">
  Built with care for the people who care for our children.
</p>
