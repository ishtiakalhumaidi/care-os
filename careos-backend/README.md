<p align="center">
  <img src="https://raw.githubusercontent.com/ishtiakalhumaidi/care-os/main/careos-client/public/logo.svg" alt="CareOS" width="80" />
</p>

<h1 align="center">CareOS — Backend</h1>
<p align="center"><strong>Modular, domain-driven childcare operations API</strong></p>

<p align="center">
  <a href="https://careos-api.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/API%20Live-Operational-10B981?style=flat-square&logo=vercel" alt="API Live" /></a>
  <img src="https://img.shields.io/badge/Runtime-Node%2020+-339933?style=flat-square&logo=nodedotjs" alt="Node" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Auth-Better%20Auth-4F46E5?style=flat-square" alt="Better Auth" />
</p>

---

## Overview

The CareOS backend is a modular, domain-driven Express API built for the complex relational realities of childcare operations. It handles multi-tenant centers, branch hierarchies, classroom ratio compliance, guardian-child many-to-many relationships, attendance time-stamping, and real-time activity timelines.

Built with strict RBAC, Prisma transactions, and Zod validation at every boundary.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 20+ (ESM) | Server runtime |
| Framework | Express 5 | HTTP server & routing |
| Language | TypeScript 5.9 | Type safety across the stack |
| ORM | Prisma 7.8 + @prisma/adapter-pg | Type-safe PostgreSQL queries |
| Auth | Better Auth | Session-based auth, OAuth, magic links, RBAC |
| Validation | Zod | Request/response schema validation |
| Media | Cloudinary + Multer | Photo/video uploads |
| Email | Resend / Nodemailer + EJS | Transactional & invite emails |
| Security | Helmet, CORS, Cookie Parser | Headers, origin control, sessions |
| Build | tsup / tsx | Bundling & hot-reload development |

---

## Architecture

### Modular Domain Pattern

Every feature lives in a self-contained module following Route → Controller → Service separation:

```
src/app/module/
├── [domain]/
│   ├── [domain].route.ts       # Express router definitions
│   ├── [domain].controller.ts  # Request/response handling
│   ├── [domain].service.ts     # Business logic & Prisma queries
│   ├── [domain].validation.ts  # Zod schemas
│   └── [domain].interface.ts   # Domain-specific TypeScript types
```

### Global Middleware Stack

```
Helmet → CORS → Cookie Parser → express.json() → express.urlencoded()
    ↓
/api/auth/*  → Better Auth Node Handler (session, OAuth, magic links)
/api/v1/*    → Domain Routes → Controller → Service → Prisma → PostgreSQL
    ↓
Global Error Handler → 404 Not Found
```

### Error Handling

- Custom error helpers in `src/app/errorHelpers/` for domain-specific exceptions
- Global error handler middleware catches all operational errors and returns standardized JSON responses
- Zod validation runs at the route layer before controllers execute

---

## Project Structure

```
careos-backend/
├── src/
│   ├── app.ts                    # Express app configuration & middleware mounting
│   ├── server.ts                 # Bootstrap: connect to DB, start listening
│   ├── index.d.ts                # Global type declarations
│   └── app/
│       ├── builder/              # Query builders for complex Prisma queries
│       ├── config/               # Environment variables (env.ts)
│       ├── errorHelpers/         # AppError, NotFoundError, etc.
│       ├── interfaces/           # Shared TypeScript interfaces
│       ├── lib/
│       │   ├── auth.ts           # Better Auth configuration
│       │   └── prisma.ts         # Prisma client singleton
│       ├── middleware/
│       │   ├── globalErrorHandler.ts
│       │   └── notFound.ts
│       ├── module/               # Domain modules (see below)
│       ├── routes/
│       │   └── index.ts          # Master router aggregating all modules
│       ├── shared/               # Shared utilities (sendResponse, catchAsync)
│       ├── templates/            # EJS email templates (invites, magic links)
│       └── utils/                # Helper functions (date formatting, etc.)
│
├── prisma/
│   └── schema.prisma             # Relational schema: Center, Branch, Classroom,
│                                  # Teacher, Child, Guardian, Enrollment, etc.
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Domain Modules

| Module | Sprint | Description | Key Entities |
|--------|--------|-------------|--------------|
| auth | 1 | Better Auth integration, session management, email verification, password reset | User, Session, Account |
| tenant | 1 | Center/organization registration and subscription management | Tenant, Plan |
| branch | 1 | Multi-location branch CRUD under a tenant | Branch |
| classroom | 1 | Room definitions with legal age-group ratio limits | Classroom |
| child | 1 | Child profiles, enrollment status, classroom assignment | Child, Enrollment |
| user | 1 | Staff & Guardian user management, role assignment | User |
| plan | 1 | Subscription tier management | Plan |
| guardianRequest | 1 | Waitlist applications → approval → enrollment workflow | GuardianRequest, Enrollment |
| attendance | 2 | Kiosk check-in/out with precise time-stamping | AttendanceRecord |
| timeline | 2 | Daily activity logs: meals, naps, diaper changes, photos | TimelineEvent |
| schedule | 2 | Staff shift assignments and classroom rotations | StaffSchedule |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`corepack enable`)
- PostgreSQL ≥ 15 (local Docker or cloud instance)
- Cloudinary account (for media storage)
- Resend API key (for transactional emails)

### Installation

```bash
cd careos-backend
pnpm install
```

### Environment Variables

Create a `.env` file in `careos-backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/careos?schema=public"

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=noreply@careos.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Database Setup

```bash
# Generate Prisma client
pnpm generate

# Run migrations
pnpm migrate

# (Optional) Open Prisma Studio
pnpm studio
```

### Development

```bash
# Hot-reload dev server
pnpm dev

# The API will be available at http://localhost:5000
```

### Production Build

```bash
# TypeScript compilation + asset copy
pnpm build

# Start production server
pnpm start
```

---

## API Reference

### Authentication (`/api/auth/*`)

Handled entirely by Better Auth. Key endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-in/email` | Email/password sign in |
| POST | `/api/auth/sign-up/email` | Email/password registration |
| POST | `/api/auth/sign-in/social` | OAuth (Google, etc.) |
| POST | `/api/auth/magic-link` | Passwordless magic link |
| GET  | `/api/auth/session` | Get current session |
| POST | `/api/auth/sign-out` | Destroy session |

### Core Resources (`/api/v1/*`)

| Method | Endpoint | Module | Description |
|--------|----------|--------|-------------|
| GET/POST | `/tenants` | Tenant | List / create centers |
| GET/POST | `/branches` | Branch | List / create branches |
| GET/POST | `/classrooms` | Classroom | List / create classrooms |
| GET/POST | `/children` | Child | List / create child profiles |
| GET/POST | `/users` | User | List / manage staff & guardians |
| GET/POST | `/plans` | Plan | List / manage subscription plans |
| GET/POST | `/guardian-requests` | GuardianRequest | Waitlist applications |
| GET/POST | `/attendance` | Attendance | Check-in/out records |
| GET/POST | `/timeline` | Timeline | Daily activity logs |
| GET/POST | `/schedules` | Schedule | Staff shift management |

> Note: All core routes are protected by RBAC middleware. Unauthorized requests receive a `403 Forbidden`.

---

## Database Schema Highlights

The Prisma schema models the complex relationships inherent to childcare:

- Tenant → Branch → Classroom (hierarchical center structure)
- Child ↔ Guardian (many-to-many with GuardianChild junction table)
- Child → Enrollment → Classroom (enrollment history & current assignment)
- User → StaffSchedule → Classroom (staff rotations)
- AttendanceRecord (check-in/out timestamps per child per day)
- TimelineEvent (polymorphic activity logging)

Run `pnpm studio` to explore the full schema visually.

---

## Email Templates

EJS templates live in `src/app/templates/`:

- `invite-staff.ejs` — Invitation to join a branch as staff
- `invite-guardian.ejs` — Invitation to join as a child's guardian
- `magic-link.ejs` — Passwordless login link
- `waitlist-approved.ejs` — Notification that a child has been enrolled

Templates are rendered server-side and sent via Resend/Nodemailer.

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload (tsx watch) |
| `pnpm build` | Compile TypeScript + copy templates to `dist/` |
| `pnpm build:tsup` | Alternative build using tsup |
| `pnpm start` | Run compiled production server |
| `pnpm lint` | Run ESLint across `src/` |
| `pnpm migrate` | Run Prisma migrations |
| `pnpm generate` | Generate Prisma client |
| `pnpm studio` | Open Prisma Studio |
| `pnpm push` | Push schema changes without migration |
| `pnpm pull` | Introspect existing database |
| `pnpm stripe:webhook` | Forward Stripe webhooks to localhost (future billing use) |

---

## Security Considerations

- Helmet sets secure HTTP headers
- CORS is strictly configured to allow only the frontend origin
- Better Auth manages sessions via secure, HTTP-only cookies
- Zod validates every incoming request body, query, and param
- Prisma prevents SQL injection via parameterized queries
- Cloudinary handles media storage with signed uploads

---

## Contributing

1. Ensure migrations are created for any schema change: `pnpm migrate --name describe_change`
2. Follow the existing Route → Controller → Service pattern
3. Add Zod validation for every new endpoint
4. Use `catchAsync` wrappers in controllers to ensure errors reach the global handler
5. Write Prisma queries in services, never in controllers

---

## License

TBD — See root LICENSE file when available.