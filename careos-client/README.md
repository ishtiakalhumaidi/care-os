<p align="center">
  <img src="https://raw.githubusercontent.com/ishtiakalhumaidi/care-os/main/careos-client/public/logo.svg" alt="CareOS" width="80" />
</p>

<h1 align="center">CareOS — Client</h1>
<p align="center"><strong>Next.js 16 frontend for the CareOS childcare operating system.</strong></p>

<p align="center">
  <a href="https://careos-sys.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Live%20Demo-Trust%20Indigo-4F46E5?style=flat-square&logo=vercel" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/shadcn-Base%20UI-000000?style=flat-square" alt="shadcn" />
</p>

---

## Overview

The CareOS client is a **role-based, multi-tenant dashboard** built for five distinct user personas: **Owners**, **Center Admins**, **Teachers**, **Guardians**, and **Platform Admins**. It powers everything from the public landing page with live activity feeds, to the kiosk check-in interface, to the real-time classroom ratio dashboard.

Built with **Next.js 16 App Router**, **Tailwind CSS v4**, and **shadcn/ui (Base UI variant)**. Every screen is designed to balance **engineered trust** with **childcare warmth**.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 16.2 | App Router, SSR, API routes |
| **Runtime** | React | 19.2 | UI library |
| **Language** | TypeScript | 5.x | End-to-end type safety |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **UI Primitives** | shadcn/ui | latest | Base UI variant (not Radix) |
| **Animation** | Framer Motion | 12.x | Page transitions, micro-interactions |
| **Data Fetching** | TanStack React Query | 5.x | Server state, caching, mutations |
| **Forms** | TanStack Form + Zod | latest | Type-safe forms with validation |
| **Auth** | Better Auth | 1.6 | Session-based auth, OAuth, magic links |
| **Theming** | next-themes | 0.4 | Dark / light / system mode |
| **Icons** | Lucide React | latest | Consistent iconography |
| **Date Utils** | date-fns | 4.x | Date formatting & manipulation |
| **Notifications** | Sonner | 2.x | Toast notifications |
| **Package Manager** | pnpm | 9.x | Fast, disk-space efficient |
| **Deployment** | Vercel | — | Edge network, zero-config |

### Typography System

| Role | Font | Usage |
|------|------|-------|
| **Display** | Bricolage Grotesque | Headlines, hero text, brand moments |
| **Body** | Manrope | Paragraphs, labels, UI copy |
| **System / Mono** | Space Mono | Timestamps, code, data tables |

---

## Design Philosophy

> **Engineered Trust × Childcare Warmth**

The interface sits at the intersection of two emotional needs:

1. **Trust** — Parents and regulators need to feel the system is bulletproof, compliant, and precise.
2. **Warmth** — Childcare is fundamentally about human connection, not cold logistics.

We encode this tension visually:

- **Trust Indigo** (`#4F46E5`) anchors the admin, compliance, and data-heavy surfaces.
- **Warm Coral** accents the parent-facing feeds, galleries, and communication layers.
- A quiet **systems grid** provides the "engineered" backbone.
- A **live activity feed** replaces static feature lists as the signature element — because a childcare center is a living organism, not a brochure.

We deliberately avoid generic SaaS-template defaults. Every structural choice (floating badges, timeline cards, ratio meters) encodes something true about running a childcare center.

---

## Project Structure

```
careos-client/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Unauthenticated routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/
│   │   │   └── accept-invite/        # Magic-link invitation acceptance
│   │   │
│   │   ├── (dashboard)/              # Authenticated, role-gated routes
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar, header)
│   │   │   ├── loading.tsx           # Suspense fallback
│   │   │   ├── (commonProtectedLayout)/
│   │   │   ├── admin/                # Platform admin views
│   │   │   ├── center-admin/         # Center-level administration
│   │   │   ├── owner/                # Center owner dashboard
│   │   │   ├── teacher/              # Teacher timeline, schedules, kiosk
│   │   │   └── guardian/             # Parent portal, activity feed, billing
│   │   │
│   │   ├── page.tsx                  # Public landing page
│   │   ├── layout.tsx                # Root layout (fonts, providers)
│   │   ├── globals.css               # Tailwind v4 + theme tokens
│   │   ├── loading.tsx               # Global loading state
│   │   ├── not-found.tsx             # 404 page
│   │   └── global-error.tsx          # Error boundary
│   │
│   ├── components/
│   │   ├── common/                   # Nav, Logo, shared layout shells
│   │   ├── forms/                    # WaitlistForm, InviteForm, etc.
│   │   └── ui/                       # shadcn primitives + custom components
│   │       ├── ActivityFeed.tsx      # Live timeline component
│   │       ├── FloatingBadges.tsx    # Animated trust indicators
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── validations/              # Zod schemas (auth, enrollment, etc.)
│   │   └── utils.ts                  # cn() helper, formatters
│   │
│   └── ...
│
├── public/                           # Static assets, logo, favicon
├── components.json                   # shadcn/ui configuration
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Route Architecture

### `(auth)` — Authentication Routes

Group layout: minimal, distraction-free. No sidebar, no dashboard chrome.

| Route | Purpose |
|-------|---------|
| `/login` | Email/password + OAuth sign-in |
| `/register` | New account creation |
| `/forgot-password` | Password reset request |
| `/reset-password` | Token-based password reset |
| `/verify-email` | Email verification handler |
| `/accept-invite` | Magic-link invitation acceptance (staff / guardian onboarding) |

### `(dashboard)` — Role-Based Protected Routes

Group layout: persistent sidebar + header. Access is gated by RBAC middleware checking the user's role from the Better Auth session.

| Route | Role | Sprint | Description |
|-------|------|--------|-------------|
| `/owner` | Owner | 1 | Tenant/branch/classroom setup, enrollment approvals, staff invites |
| `/center-admin` | Center Admin | 1 | Day-to-day center management, ratio monitoring |
| `/teacher` | Teacher | 2 | Timeline logger, schedule view, kiosk check-in/out, timesheet clock |
| `/guardian` | Guardian | 1–2 | Waitlist application, child profile setup, activity feed, gallery |
| `/admin` | Platform Admin | 1 | Global user/plan management, system health |

---

## Key Features by Sprint

### Sprint 1: Tenant & Enrollment Pipeline ✅

| Feature | Location | Notes |
|---------|----------|-------|
| **Landing Page** | `app/page.tsx` | Hero, live activity feed simulation, waitlist capture form |
| **Waitlist Form** | `components/forms/WaitlistForm.tsx` | Guardian-facing child profile submission |
| **Enrollment Approval** | `app/(dashboard)/owner/enrollment/` | Admin UI: waitlist → enrolled → classroom assignment |
| **Invitation Flow** | `app/(auth)/accept-invite/` | Magic-link acceptance with role-aware redirect |
| **Guardian Setup Wizard** | `app/(dashboard)/guardian/setup/` | Medical/allergy profiles, authorized pickups |
| **Theme Toggle** | `components/common/ThemeToggle.tsx` | Dark / light / system via next-themes |

### Sprint 2: The Daily Operational Loop ✅

| Feature | Location | Notes |
|---------|----------|-------|
| **Kiosk Check-In/Out** | `app/(dashboard)/teacher/kiosk/` | Guardian-facing sign interface with time-stamping |
| **Live Ratio Dashboard** | `app/(dashboard)/center-admin/ratios/` | Real-time teacher-to-child ratio cards per room |
| **Teacher Timeline Logger** | `app/(dashboard)/teacher/timeline/` | Quick-tap UI for meals, naps, activities |
| **Staff Schedule View** | `app/(dashboard)/teacher/schedule/` | Upcoming shifts & classroom assignments |
| **Offline Data Sync** | `lib/offlineQueue.ts` | Kiosk actions queued when offline, synced on reconnect |
| **Guardian Activity Feed** | `app/(dashboard)/guardian/feed/` | Facebook-style wall: naps, meals, photos |
| **Timesheet Interface** | `app/(dashboard)/teacher/timesheet/` | Clock in/out with session persistence |

### Sprint 3: Parent Engagement, Billing & Compliance 🚧

| Feature | Location | Status |
|---------|----------|--------|
| **Encrypted Gallery** | `app/(dashboard)/guardian/gallery/` | 🚧 Cloudinary-integrated photo/video viewer |
| **Direct Messaging** | `app/(dashboard)/guardian/messages/` | ✅ Real-time chat with read receipts |
| **Emergency Broadcasts** | `app/(dashboard)/center-admin/broadcasts/` | 🚧 Push alert composer |
| **Billing Portal** | `app/(dashboard)/guardian/billing/` | 🚧 Invoice & payment method management |
| **Split-Custody Payments** | `app/(dashboard)/guardian/billing/split/` | 🚧 Percentage-based payment sharing UI |
| **Compliance PDF Generator** | `app/(dashboard)/owner/compliance/` | 🚧 Attendance & ratio report export |
| **Document Vault** | `app/(dashboard)/guardian/documents/` | 🚧 Immunization records & contract signing |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`corepack enable`)
- A running **CareOS Backend** at `http://localhost:5000`

### Installation

```bash
cd careos-client
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:5000/api/auth

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start the Next.js dev server (Turbopack)
pnpm dev

# The app will be available at http://localhost:3000
```

### Production Build

```bash
# Build with Bun runtime (as configured in package.json)
pnpm build

# Start production server
pnpm start
```

---

## Important: shadcn/ui Base UI Variant

This project uses shadcn's **Base UI** variant, **not** the more common Radix variant. This affects how you compose components:

```tsx
// ✅ Base UI variant — use render prop
<Select.Trigger render={<Button />} />

// ❌ Radix variant — asChild will NOT compile here
<Select.Trigger asChild>
  <Button />
</Select.Trigger>
```

When copying shadcn docs or examples, always verify which variant they assume. Radix examples using `asChild` will fail in this codebase.

---

## Component Conventions

### Custom Components

Located in `components/ui/`, extending shadcn primitives:

| Component | Purpose |
|-----------|---------|
| `ActivityFeed` | Live-scrolling timeline of classroom events |
| `FloatingBadges` | Animated trust indicators (ratios, compliance status) |
| `RatioMeter` | Visual teacher-to-child ratio gauge |
| `TimelineCard` | Meal/nap/activity entry with avatar and timestamp |
| `KioskPad` | Large-touch-target check-in/out interface |
| `EnrollmentPipeline` | Kanban-style waitlist → enrolled board |

### Form Pattern

All forms use **TanStack Form** + **Zod** for type-safe validation:

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const schema = z.object({
  childName: z.string().min(1, 'Name is required'),
  dateOfBirth: z.date(),
  allergies: z.string().optional(),
});

function EnrollmentForm() {
  const form = useForm({
    defaultValues: { childName: '', dateOfBirth: new Date(), allergies: '' },
    validatorAdapter: zodValidator(),
    validators: { onChange: schema },
    onSubmit: async (values) => {
      await api.enrollment.create(values);
    },
  });
  // ...
}
```

---

## Theming

Tailwind v4 theme tokens are defined in `globals.css` using CSS custom properties:

```css
:root {
  --color-trust-indigo: #4F46E5;
  --color-warm-coral: #F97066;
  --color-surface: #FAFAFA;
  --color-ink: #111827;
}

.dark {
  --color-surface: #0B0F19;
  --color-ink: #F3F4F6;
}
```

Toggle via `next-themes`:

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
// setTheme('light') | setTheme('dark') | setTheme('system')
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Production build (uses Bun runtime) |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint (Next.js config) |

---

## Deployment

Deployed automatically to **Vercel** on push to `main`:

- **Production:** [https://careos-sys.vercel.app](https://careos-sys.vercel.app)
- **Preview:** Generated for every Pull Request

### Environment on Vercel

Ensure these environment variables are set in the Vercel dashboard:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

---

## Performance Notes

- **App Router** with Server Components by default — minimal client JS on landing pages.
- **TanStack Query** provides stale-while-revalidate caching for dashboard data.
- **Framer Motion** animations are GPU-accelerated and respect `prefers-reduced-motion`.
- **next/font** automatically optimizes Bricolage Grotesque, Manrope, and Space Mono.

---

## Contributing

1. Follow the existing **group route** pattern: `(auth)` for public, `(dashboard)` for protected.
2. Place new dashboard pages under the correct **role directory** (`owner/`, `teacher/`, `guardian/`, etc.).
3. Use **TanStack Form + Zod** for all forms — no uncontrolled inputs.
4. Respect the **Base UI** composition pattern (`render` prop, not `asChild`).
5. Keep components in `components/ui/` if they are reusable across roles; role-specific components live closer to their route.

---

## License

TBD — See root `LICENSE` file when available.
