# Tracksy — Complete Technical Documentation

This document covers every part of the Tracksy codebase — from high-level purpose down to individual function implementations, data flows, caching layers, and deployment. Read it top-to-bottom to understand the full application, or jump to any section.

---

## Table of Contents

1. [What Tracksy Does](#1-what-tracksy-does)
2. [Tech Stack — Every Dependency Explained](#2-tech-stack--every-dependency-explained)
3. [Environment Variables](#3-environment-variables)
4. [Project Structure](#4-project-structure)
5. [Database — Schema, Enums, Indexes](#5-database--schema-enums-indexes)
6. [Authentication — Clerk](#6-authentication--clerk)
7. [Middleware — proxy.ts](#7-middleware--proxyts)
8. [Routing — Every Page](#8-routing--every-page)
9. [Layouts](#9-layouts)
10. [Components — Every File Explained](#10-components--every-file-explained)
11. [Server Actions](#11-server-actions)
12. [API Routes](#12-api-routes)
13. [Library Modules — lib/](#13-library-modules--lib)
14. [Caching Strategy](#14-caching-strategy)
15. [Rate Limiting](#15-rate-limiting)
16. [CSV Import and Export](#16-csv-import-and-export)
17. [Reminder System](#17-reminder-system)
18. [Analytics](#18-analytics)
19. [Data Flow — End to End](#19-data-flow--end-to-end)
20. [Database Migrations](#20-database-migrations)
21. [Development Commands](#21-development-commands)
22. [Deployment](#22-deployment)
23. [Scalability Design](#23-scalability-design)

---

## 1. What Tracksy Does

Tracksy is a job application tracker. Users sign up, log every job application they send, track it through a pipeline of statuses, set deadlines for next steps (e.g. "phone screen on May 10"), and receive email reminders 48 hours before those deadlines. An analytics dashboard shows response rates over time and conversion through the hiring funnel.

**Core features:**

- **Pipeline table** — a sortable, filterable data table listing all applications. Filter by status with one click, search by company or role name. Handles hundreds of rows.
- **Mobile list view** — on small screens, applications are grouped by status in a horizontally-scrollable tab strip. Each status tab shows cards. A floating action button (FAB) adds new applications.
- **Application detail** — each application has a full detail page showing all fields, a prep checklist, notes, and a link to the original job posting.
- **Prep checklist** — per-application checklist for tasks like "research the company", "prepare STAR stories". Items can be checked off, showing a progress bar.
- **Deadline reminders** — set a "next step" date on any application; a daily cron job emails you 48 hours before that deadline.
- **Analytics** — response rate, weekly applied vs responses chart, conversion funnel (Applied → Screening → Interview → Offer), and breakdown by application source.
- **CSV import** — paste/upload a CSV from Google Sheets or another tracker; Tracksy bulk-inserts the rows.
- **CSV export** — download all applications as a CSV file at any time.
- **Settings** — view your account info, access import/export, danger zone (account deletion placeholder).

---

## 2. Tech Stack — Every Dependency Explained

### Runtime / Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.4 | React framework. App Router (RSC), Server Actions, file-based routing, `unstable_cache`, `revalidatePath`, `revalidateTag`. |
| `react` | 19.2.4 | UI library. Used via RSC (server components) and client components (`'use client'`). |
| `react-dom` | 19.2.4 | DOM renderer for React. |

### Auth

| Package | Version | Purpose |
|---------|---------|---------|
| `@clerk/nextjs` | ^7.2.9 | Authentication. Provides `<ClerkProvider>`, `<UserButton>`, `<SignIn>`, `<SignUp>`, `auth()`, `currentUser()`, `clerkMiddleware()`. Handles session management completely. |

### Database

| Package | Version | Purpose |
|---------|---------|---------|
| `@neondatabase/serverless` | ^1.1.0 | Neon Postgres HTTP+WebSocket driver. Used as the connection layer for Drizzle. The `neon()` function creates an HTTP-based SQL executor (no persistent TCP connection — safe in serverless). |
| `drizzle-orm` | ^0.45.2 | Type-safe ORM. Provides the query builder (`db.select()`, `db.insert()`, etc.), schema definition (columns, tables, enums, indexes), and transaction support. |
| `drizzle-kit` | ^0.31.10 | (devDependency) CLI tool for generating SQL migration files from schema changes and applying them. |
| `dotenv` | ^17.4.2 | (devDependency) Loads `.env.local` in `drizzle.config.ts` so Drizzle Kit can read `DATABASE_URL`. |

### UI — Components and Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `shadcn` | ^4.6.0 | Component library scaffolding tool. Used to generate the `components/ui/` primitives (Button, Input, Select, Tabs, Sidebar, etc.). |
| `radix-ui` | ^1.4.3 | Headless primitives powering shadcn components (dialogs, dropdowns, tooltips, etc.). |
| `tailwindcss` | ^4 | Utility-first CSS framework. All styles are Tailwind utility classes. |
| `@tailwindcss/postcss` | ^4 | (devDependency) PostCSS plugin integrating Tailwind into the build pipeline. |
| `tw-animate-css` | ^1.4.0 | Adds animation utility classes (fade-in, slide, etc.) on top of Tailwind. |
| `class-variance-authority` | ^0.7.1 | Used by shadcn components to define variant-based class maps (e.g. `Button` with `variant="outline"`). |
| `clsx` | ^2.1.1 | Conditionally joins class names. Used in `cn()` util. |
| `tailwind-merge` | ^3.5.0 | Merges Tailwind classes, resolving conflicts. Used in `cn()` util. |

### Icons

| Package | Version | Purpose |
|---------|---------|---------|
| `@hugeicons/react` | ^1.1.6 | React wrapper for Hugeicons. Provides the `<HugeiconsIcon>` component with `icon`, `size`, `strokeWidth` props. |
| `@hugeicons/core-free-icons` | ^4.1.1 | The free tier icon set. Named exports like `Add01Icon`, `Search01Icon`, etc. |
| `hugeicons-react` | ^0.4.0 | Older Hugeicons package. Present as a dependency because some files (`settings/page.tsx`) still import directly from it. |

### Tables

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-table` | ^8.21.3 | Headless table library. Powers the desktop data table (`components/applications/data-table.tsx`). Provides column definitions, sorting, filtering, and row state. |

### Charts

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^3.8.1 | Chart library for React. Powers the weekly activity chart in Analytics (`components/analytics/response-chart.tsx`). |

### Date Handling

| Package | Version | Purpose |
|---------|---------|---------|
| `date-fns` | ^4.1.0 | Date utility library. Used throughout for `format()`, `isPast()`, `isToday()`, `isTomorrow()`, `subHours()`, `subWeeks()`. |

### CSV

| Package | Version | Purpose |
|---------|---------|---------|
| `papaparse` | ^5.5.3 | CSV parser and serializer. Used in `lib/csv.ts` to parse uploaded CSV files and serialize application data for export. |

### Email

| Package | Version | Purpose |
|---------|---------|---------|
| `resend` | ^6.12.2 | Email API for sending deadline reminder emails. Used in the cron reminder API route. |
| `react-email` | ^6.0.5 | Framework for building HTML emails as React components. |
| `@react-email/components` | ^1.0.12 | Pre-built React components for email layouts (Html, Body, Text, etc.). |

### Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^4.4.1 | Runtime schema validation. Used in API routes (`app/api/applications/route.ts`, `app/api/applications/[id]/route.ts`) to validate request bodies. |

### DnD (Drag and Drop — Unused)

| Package | Purpose |
|---------|---------|
| `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Originally used for the kanban board (now removed). Package is still in `package.json` but no code uses it. Safe to remove. |

### WebSockets

| Package | Version | Purpose |
|---------|---------|---------|
| `ws` | ^8.20.0 | WebSocket library required by `@neondatabase/serverless` for certain connection modes. |

### TypeScript Types (devDependencies)

`@types/node`, `@types/react`, `@types/react-dom`, `@types/papaparse`, `@types/ws` — TypeScript type definitions for their respective packages.

---

## 3. Environment Variables

All variables go in `.env.local` (gitignored). Never commit this file.

```env
# PostgreSQL — Neon database connection (use pooled URL ending in -pooler.neon.tech for production)
DATABASE_URL=postgres://user:pass@host-pooler.neon.tech/db?sslmode=require

# Clerk — Authentication keys (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Resend — Email API key (from resend.com) — required for reminder emails
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=reminders@yourdomain.com

# App URL — used for metadataBase in layout.tsx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron secret — any random string; used to authenticate the cron job hitting /api/cron/reminders
CRON_SECRET=your-random-secret-here
```

**Why two different Neon URLs?** Neon provides a direct connection URL (standard TCP) and a pooled URL (`-pooler.neon.tech`). In production on serverless platforms (Vercel), use the pooled URL — it routes through PgBouncer, avoiding connection exhaustion because each serverless invocation doesn't hold a TCP socket open.

---

## 4. Project Structure

```
tracksy/
├── app/                              # Next.js App Router pages and API routes
│   ├── layout.tsx                    # Root layout — fonts, ClerkProvider, TooltipProvider
│   ├── page.tsx                      # Landing page (public, unauthenticated)
│   ├── globals.css                   # Global styles + Tailwind base
│   │
│   ├── (auth)/                       # Route group — auth pages share auth layout
│   │   ├── layout.tsx                # Centers content on the auth pages
│   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk's <SignIn> component
│   │   └── sign-up/[[...sign-up]]/page.tsx   # Clerk's <SignUp> component
│   │
│   ├── (dashboard)/                  # Route group — all dashboard pages share dashboard layout
│   │   ├── layout.tsx                # Sidebar shell + user sync (server component)
│   │   ├── page.tsx                  # Redirects / → /dashboard/applications
│   │   └── dashboard/
│   │       ├── applications/
│   │       │   ├── page.tsx          # Pipeline page — fetches apps, renders ApplicationsView
│   │       │   ├── loading.tsx       # Skeleton shown while page.tsx suspends
│   │       │   ├── actions.ts        # Server Actions: create, update, updateStatus, delete
│   │       │   ├── new/page.tsx      # "Add application" form page
│   │       │   └── [id]/
│   │       │       ├── page.tsx      # Application detail page
│   │       │       ├── edit/page.tsx # Edit form page
│   │       │       ├── delete-button.tsx    # Client component — confirm + call deleteAction
│   │       │       ├── checklist.tsx        # PrepChecklist client component
│   │       │       └── checklist-actions.ts # Server Actions: add, toggle, delete checklist items
│   │       ├── analytics/
│   │       │   ├── page.tsx          # Analytics dashboard (server component)
│   │       │   └── loading.tsx       # Analytics skeleton
│   │       └── settings/
│   │           ├── page.tsx          # Settings page (account info, import, export, danger zone)
│   │           └── import/
│   │               ├── page.tsx      # Import page
│   │               └── import-form.tsx  # CSV file upload form (client component)
│   │
│   └── api/
│       ├── applications/
│       │   ├── route.ts              # GET /api/applications, POST /api/applications
│       │   └── [id]/route.ts         # GET, PATCH, DELETE /api/applications/:id
│       ├── import/route.ts           # POST /api/import — CSV bulk import
│       ├── export/route.ts           # GET /api/export — CSV download
│       └── cron/reminders/route.ts   # GET /api/cron/reminders — daily reminder dispatch
│
├── components/
│   ├── ui/                           # shadcn primitives (do not modify directly)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx               # Full shadcn Sidebar system
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   │
│   ├── applications/
│   │   ├── applications-view.tsx     # Client shell: search state, routes to table vs mobile
│   │   ├── data-table.tsx            # Desktop TanStack Table with status filter pills
│   │   ├── application-card.tsx      # Mobile card: company avatar, status badge, next step
│   │   └── mobile-list-view.tsx      # Mobile tab view, grouped by status
│   │
│   ├── analytics/
│   │   ├── stats-row.tsx             # Four stat cards (total, response rate, interviews, offers)
│   │   ├── response-chart.tsx        # Recharts bar chart — weekly applied vs responses
│   │   └── funnel.tsx                # Conversion funnel visualization
│   │
│   ├── kanban/                       # Legacy — kept for reference, not used
│   │   ├── board.tsx
│   │   ├── card.tsx
│   │   └── column.tsx
│   │
│   ├── layout/
│   │   └── app-sidebar.tsx           # Sidebar nav: Pipeline, Analytics, Settings, Import
│   │
│   └── application-form.tsx          # Shared form used on /new and /edit pages
│
├── lib/
│   ├── auth.ts                       # requireAuth() and getAuthUser() helpers
│   ├── csv.ts                        # parseCSV() and serializeCSV()
│   ├── rate-limit.ts                 # In-memory rate limiter
│   ├── status.ts                     # STATUS_CONFIG and STATUSES constants
│   ├── utils.ts                      # cn() class name helper
│   └── db/
│       ├── index.ts                  # Drizzle db instance
│       ├── schema.ts                 # All tables, enums, types
│       └── queries/
│           ├── applications.ts       # CRUD queries for applications + reminder scheduling
│           ├── analytics.ts          # Three parallel GROUP BY queries + unstable_cache
│           ├── checklist.ts          # Checklist CRUD with ownership-verifying subqueries
│           └── users.ts              # syncUser() with 24h unstable_cache
│
├── hooks/
│   └── use-mobile.ts                 # useIsMobile() — listens to window width < 768px
│
├── drizzle/                          # Generated SQL migration files (committed)
│   ├── 0000_amused_scarlet_spider.sql  # Initial schema
│   ├── 0001_overrated_boom_boom.sql    # (patch)
│   ├── 0002_woozy_tag.sql              # checklist_items table + indexes
│   └── 0003_charming_sumo.sql          # Added 'on_campus' to application_source enum
│
├── proxy.ts                          # Clerk middleware (Next.js 16 uses proxy.ts, not middleware.ts)
├── drizzle.config.ts                 # Drizzle Kit config: schema path, migrations output, dialect
├── next.config.ts                    # Next.js config: image remote patterns for Clerk avatars
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies and scripts
├── .env.example                      # Template for environment variables
├── .gitignore                        # Ignores node_modules, .next, .env.local, plan.md, .claude/, etc.
└── README.md                         # Public-facing project overview
```

---

## 5. Database — Schema, Enums, Indexes

**File:** `lib/db/schema.ts`

### Enums

#### `application_status`
Represents where an application is in the hiring pipeline.

```
applied | screening | interview | offer | rejected | ghosted
```

- `applied` — submitted, no response yet
- `screening` — recruiter call / initial screen
- `interview` — technical or behavioral interviews
- `offer` — received an offer
- `rejected` — explicitly rejected
- `ghosted` — no response after a long time

#### `application_source`
Where the candidate found the job.

```
linkedin | referral | direct | job_board | recruiter | on_campus | other
```

- `on_campus` was added in migration `0003_charming_sumo.sql`.

---

### Table: `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, auto-generated with `gen_random_uuid()` |
| `clerk_id` | `text` | **Unique.** The Clerk user ID (e.g. `user_2abc...`). This is the reference for all `user_id` columns in other tables. |
| `email` | `text` | User's primary email address. Updated on every login via `syncUser()` upsert. |
| `created_at` | `timestamp` | Auto-set to `now()` on insert. |

**Purpose:** Stores one row per Clerk user. Created/updated on each dashboard page load via the `syncUser()` function in the dashboard layout.

---

### Table: `applications`

The core table. One row = one job application.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | No | Primary key |
| `user_id` | `text` | No | Clerk user ID. FK to `users.clerk_id` conceptually (no DB-level FK, for performance). |
| `company` | `text` | No | Company name |
| `role` | `text` | No | Job title |
| `status` | `application_status` | No | Default: `'applied'` |
| `applied_at` | `timestamp` | No | When the user applied. Default: `now()`. |
| `source` | `application_source` | Yes | Where the job was found. |
| `job_url` | `text` | Yes | URL to the job posting. |
| `salary` | `text` | Yes | Free text, e.g. `"$120k–$160k"`. Stored as text to support any format. |
| `location` | `text` | Yes | Free text, e.g. `"Remote"` or `"San Francisco"`. |
| `notes` | `text` | Yes | Free-form notes. Displayed as pre-wrapped text on detail page. |
| `next_step_at` | `timestamp` | Yes | Deadline for the next step. A reminder is scheduled 48h before this. |
| `next_step_label` | `text` | Yes | Label for the next step, e.g. `"Phone screen"`. |
| `created_at` | `timestamp` | No | Auto-set on insert. |
| `updated_at` | `timestamp` | No | Updated on every `UPDATE`. |

**Indexes:**

| Index name | Columns | Why |
|-----------|---------|-----|
| `applications_user_idx` | `(user_id)` | Fastest path for fetching all of a user's applications |
| `applications_user_status_idx` | `(user_id, status)` | Used when filtering by status |
| `applications_user_applied_idx` | `(user_id, applied_at)` | Used when ordering by applied date |

---

### Table: `checklist_items`

One row = one item in the prep checklist for a specific application.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | No | Primary key |
| `application_id` | `uuid` | No | FK → `applications.id` with `ON DELETE CASCADE`. Deleting an application deletes all its checklist items automatically. |
| `text` | `text` | No | The checklist item text |
| `done` | `boolean` | No | Default: `false`. Whether the item is checked. |
| `position` | `integer` | No | Default: `0`. Controls display order within the checklist. Each new item gets `max(position) + 1`. |
| `created_at` | `timestamp` | No | Auto-set on insert. |

**Index:** `checklist_app_pos_idx` on `(application_id, position)` — used when fetching and ordering checklist items for a given application.

---

### Table: `reminders`

One row = one scheduled email reminder. Created automatically when `next_step_at` is set on an application.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | No | Primary key |
| `application_id` | `uuid` | No | FK → `applications.id` with `ON DELETE CASCADE`. Deleting the application cancels its reminders. |
| `scheduled_for` | `timestamp` | No | When to send the reminder. Set to `nextStepAt - 48 hours`. |
| `sent_at` | `timestamp` | Yes | `NULL` until sent. The cron job sets this after sending. Used to prevent double-sends. |

**Indexes:**

| Index name | Columns | Why |
|-----------|---------|-----|
| `reminders_scheduled_idx` | `(scheduled_for)` | The cron query filters on `scheduled_for <= now()` |
| `reminders_unsent_idx` | `(application_id, sent_at)` | Efficiently finds unsent reminders for a given application |

---

### TypeScript Types (exported from schema.ts)

```ts
type Application     = typeof applications.$inferSelect    // full row type
type NewApplication  = typeof applications.$inferInsert    // insert type (id/timestamps optional)
type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'ghosted'
type ApplicationSource = 'linkedin' | 'referral' | 'direct' | 'job_board' | 'recruiter' | 'on_campus' | 'other'
type Reminder        = typeof reminders.$inferSelect
type User            = typeof users.$inferSelect
type ChecklistItem   = typeof checklistItems.$inferSelect
```

---

## 6. Authentication — Clerk

Tracksy uses Clerk v7 for authentication. Clerk handles sign-up, sign-in, session management, and user profiles entirely — no custom auth code is needed.

### Setup

`<ClerkProvider>` wraps the entire app in `app/layout.tsx`. This provides session context to all components.

### Sign-in / Sign-up Pages

Located at:
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

Both render Clerk's pre-built components:
```tsx
<SignIn fallbackRedirectUrl="/dashboard/applications" />
<SignUp fallbackRedirectUrl="/dashboard/applications" />
```

The `fallbackRedirectUrl` prop ensures users are sent to the dashboard after auth, not back to the landing page.

The `[[...sign-in]]` folder syntax is a "catch-all" route — it handles all Clerk sub-routes (e.g. `/sign-in/factor-one`, `/sign-in/factor-two`) needed for multi-step auth flows.

### Using Auth in Server Components

```ts
import { auth, currentUser } from '@clerk/nextjs/server'

// Get the userId (fast, no extra DB call)
const { userId } = await auth()
if (!userId) redirect('/sign-in')

// Get full user object (makes a Clerk API call)
const user = await currentUser()
```

### Using Auth in API Routes

```ts
import { auth } from '@clerk/nextjs/server'
const { userId } = await auth()
if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

### Auth Helpers (`lib/auth.ts`)

Two thin wrappers:

```ts
// requireAuth() — throws if not authenticated (used in Server Actions)
export async function requireAuth(): Promise<string>  // returns userId

// getAuthUser() — returns full Clerk user object or null
export async function getAuthUser()
```

### User Sync

Clerk stores user data in its own database. Tracksy maintains a local `users` table that maps Clerk IDs to emails (for joining, emailing reminders, etc.).

The sync runs in `app/(dashboard)/layout.tsx` on every dashboard page load:
```ts
const user = await currentUser()
if (user) {
  await syncUser(user.id, user.emailAddresses[0].emailAddress)
}
```

`syncUser()` is wrapped in `unstable_cache` with a 24-hour TTL per user, so the actual DB upsert runs at most once per day per user. See [Caching Strategy](#14-caching-strategy).

---

## 7. Middleware — proxy.ts

**File:** `proxy.ts` (not `middleware.ts` — Next.js 16 changed the convention)

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/applications(.*)',
  '/api/import(.*)',
  '/api/export(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()  // redirects to /sign-in if not authenticated
  }
})
```

**What it does:**
- Runs on every request that matches the `config.matcher` pattern.
- For dashboard pages and protected API routes, calls `auth.protect()` which redirects unauthenticated users to Clerk's sign-in page.
- Public pages (landing page, sign-in, sign-up) are not in the protected list, so they're accessible without auth.

**The matcher** pattern excludes static files (`_next`, images, fonts, CSS) and includes all `api/trpc` routes so the middleware doesn't run on assets.

---

## 8. Routing — Every Page

### Public Routes

#### `/` — Landing Page (`app/page.tsx`)
A marketing page. Entirely server-rendered. Shows:
- Hero section with app name and tagline
- Feature highlights (pipeline table mockup, mobile view mockup, analytics)
- Pricing section (free tier)
- FAQ accordion
- CTA strip before footer

No auth required. Links to `/sign-in` and `/sign-up`.

#### `/sign-in` — Sign In Page
Renders Clerk's `<SignIn>` component with `fallbackRedirectUrl="/dashboard/applications"`.

#### `/sign-up` — Sign Up Page
Renders Clerk's `<SignUp>` component with `fallbackRedirectUrl="/dashboard/applications"`.

---

### Dashboard Routes (all require auth)

#### `/` redirect
`app/(dashboard)/page.tsx` redirects immediately to `/dashboard/applications`.

---

#### `/dashboard/applications` — Pipeline (`app/(dashboard)/dashboard/applications/page.tsx`)

Server component. Does:
1. Calls `auth()` to get `userId`, redirects to `/sign-in` if missing.
2. Calls `getUserApplications(userId)` — React-cached, fetches up to 1000 applications.
3. Renders `<ApplicationsView initialApps={apps} />`.

`loading.tsx` shows a table skeleton while this suspends.

---

#### `/dashboard/applications/new` — Add Application

Server component wrapping `<ApplicationForm>`. The `action` prop is `createApplicationAction`. On submit, creates the application and `router.back()` navigates to the pipeline.

---

#### `/dashboard/applications/[id]` — Application Detail

Server component. Does:
1. Gets `userId` from `auth()`.
2. In parallel: `getApplicationById(id, userId)` and `getChecklistItems(id, userId)`.
3. If app not found: `notFound()` → 404 page.
4. Renders: breadcrumb, header (company + role + status badge), meta grid (applied date, source, location, salary, next step), job URL link, `<PrepChecklist>`, notes, Edit/Delete buttons.
5. Dynamic metadata: page `<title>` is `"{Company} — {Role}"`.

---

#### `/dashboard/applications/[id]/edit` — Edit Application

Server component. Fetches the application, renders `<ApplicationForm>` pre-filled with `defaultValues`. The `action` prop is a bound version of `updateApplicationAction(id, formData)`.

---

#### `/dashboard/analytics` — Analytics

Server component. Calls `getAnalytics(userId)` (cached 5 min). Renders:
- `<StatsRow>` — four stat boxes
- `<ResponseChart>` — weekly bar chart
- `<Funnel>` — conversion funnel
- By-source table

---

#### `/dashboard/settings` — Settings

Server component. Shows:
- Account section — user full name and email (from `currentUser()`)
- Data section — links to Import page and Export API
- Danger zone — disabled "Delete account" button with contact support note

---

#### `/dashboard/settings/import` — Import CSV

Renders `<ImportForm>` — a client component with a file input. On submit, POSTs to `/api/import`.

---

## 9. Layouts

### Root Layout (`app/layout.tsx`)

Wraps the entire app. Sets up:
- Three fonts: **Figtree** (assigned to `--font-sans`, used as default body font), **Geist Sans**, **Geist Mono**
- `<ClerkProvider>` — provides auth context
- `<TooltipProvider>` — provides tooltip context (required by shadcn Tooltip)
- Global metadata: title template `"%s · Tracksy"`, description, `metadataBase` for OG images

### Auth Layout (`app/(auth)/layout.tsx`)

Centers auth pages (sign-in, sign-up) on the screen with a simple flex container.

### Dashboard Layout (`app/(dashboard)/layout.tsx`)

Server component. Does:
1. Calls `currentUser()` (Clerk) and `syncUser()` (upsert to local DB — runs at most once per 24h per user due to cache).
2. Wraps content in `<SidebarProvider>` + `<AppSidebar>` + `<SidebarInset>`.
3. Adds a mobile header bar with the sidebar toggle button and "Tracksy" title.

All dashboard pages (`/dashboard/**`) inherit this layout automatically due to the route group folder structure.

---

## 10. Components — Every File Explained

### `components/layout/app-sidebar.tsx`

Client component. Renders the left navigation sidebar.

**Nav links:**
| Label | Path | Icon |
|-------|------|------|
| Pipeline | `/dashboard/applications` | LayoutGridIcon |
| Analytics | `/dashboard/analytics` | BarChartIcon |
| Settings | `/dashboard/settings` | Settings01Icon |
| Import | `/dashboard/settings/import` | FileImportIcon |

Active state: `isActive={pathname.startsWith(href)}` — the sidebar button gets `bg-sidebar-accent rounded-lg` styling when active.

Footer: Clerk's `<UserButton>` — shows the user's avatar, clicking opens a dropdown with profile and sign-out.

Sidebar is collapsible to icon-only mode (`collapsible="icon"`) for desktop.

---

### `components/application-form.tsx`

A shared form component used for both creating and editing applications.

**Props:**
```ts
interface ApplicationFormProps {
  action: (formData: FormData) => Promise<void>  // Server Action to call on submit
  defaultValues?: Partial<Application>            // Pre-fill form for edit
  submitLabel?: string                            // Button label, default "Save"
}
```

**Fields:**
- Company (required text)
- Role (required text)
- Status (select: applied / screening / interview / offer / rejected / ghosted)
- Source (select: On Campus / LinkedIn / Referral / Direct / Job board / Recruiter / Other)
- Applied on (datetime-local, defaults to now)
- Location (text)
- Job URL (url input)
- Salary range (text)
- Next step date (datetime-local)
- Next step label (text)
- Notes (textarea, 5 rows)

**Behavior:** On submit, calls `startTransition(() => { await action(formData); router.back() })`. Cancel button calls `router.back()`.

Dates are formatted with `date-fns format(date, "yyyy-MM-dd'T'HH:mm")` for the `datetime-local` input.

---

### `components/applications/applications-view.tsx`

Client component. The main shell for the pipeline page.

**Props:** `{ initialApps: Application[] }`

**State:**
- `apps` — the live list (starts from `initialApps`, updated optimistically on status change)
- `query` — search string

**Computed:** `filtered` — apps filtered by search query (company or role `includes` query, case-insensitive). Memoized with `useMemo`.

**Layout:**
- Header bar: "Pipeline" title (desktop only), search input, count display, "Add" button (desktop only)
- Mobile (< md): `<MobileListView>`
- Desktop (≥ md): `<ApplicationsTable>`

`handleStatusChange` updates local state optimistically so the UI is instant, while the Server Action runs in the background.

---

### `components/applications/data-table.tsx`

Client component. Desktop data table using TanStack Table v8.

**Columns:**
1. **Company** — shows a letter avatar + company name + role (two lines). Links to detail page.
2. **Status** — status badge with colored dot.
3. **Source** — text, capitalized, underscore replaced with space.
4. **Applied** — formatted date (`MMM d, yyyy`).
5. **Next step** — shows the next step label + date, colored amber if overdue/today/tomorrow.
6. **Actions** — dropdown menu with "Move to [status]" items (excluding current status) + "Open" link.

**Status filter pills** — above the table, pill buttons for each status. Clicking toggles that status in the active filter set. The status column uses TanStack's `filterFn` with a custom function that checks if the row's status is in the active set.

**Sorting** — clicking column headers toggles sort direction. Columns with `enableSorting: true` show a sort icon.

**Empty state** — when no rows match the filter, shows a full-width "No applications" message.

---

### `components/applications/mobile-list-view.tsx`

Client component. Mobile tab view.

**Structure:**
- Tab strip at top — horizontal scrollable list of status tabs, each showing the status label + count. Uses native `overflow-x-auto` (not Radix ScrollArea) for proper touch scroll.
- Tab content — per-status list of `<ApplicationCard>` components.
- Empty state per tab — illustrated empty state with status color dot.
- FAB — fixed bottom-right `<Link>` with `+` icon, navigates to `/dashboard/applications/new`.

**Active tab style** — soft pill matching the sidebar: `data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-lg`. No border, no shadow.

**Default tab** — hardcoded to `"applied"`.

---

### `components/applications/application-card.tsx`

Client component. A single application card for the mobile list view.

**Structure:**
- Company avatar (letter avatar, single char, `bg-accent`)
- Company name + role (clickable link to detail page)
- Kebab menu (3-dot) — "Move to [status]" items + "Open detail"
- Bottom row: status badge + source + next step date (or applied date if no next step)

**Next step urgency:** If the next step date is today, tomorrow, or past → colored amber with `font-medium`. Otherwise muted foreground.

**Optimistic update:** Calls `onStatusChange(id, newStatus)` immediately on select (updates parent state), then calls `updateApplicationStatusAction` in a transition.

---

### `components/analytics/stats-row.tsx`

Client component. Renders four stat cards in a row.

Props: `{ stats: { label: string; value: string | number }[] }`

Each card shows a large number/value and a label below it.

---

### `components/analytics/response-chart.tsx`

Client component. Renders a grouped bar chart using Recharts.

Data: array of `{ label: string; applied: number; responses: number }` — one item per week (8 weeks max).

Two bars per week: blue for applied, green for responses. X-axis shows the week label (e.g. "Apr 28"). Y-axis shows count.

---

### `components/analytics/funnel.tsx`

Client component. Shows the conversion funnel as a series of horizontal bars.

Stages: Applied → Screening → Interview → Offer. Each bar's width is proportional to the count relative to the "Applied" total. Shows percentage of original.

---

### `components/ui/` — shadcn Primitives

These are generated by the shadcn CLI and should not be edited manually (unless intentionally extending). They wrap Radix UI primitives with Tailwind styling.

| File | What it wraps |
|------|--------------|
| `button.tsx` | A `<button>` with variants: default, destructive, outline, secondary, ghost, link. Sizes: default, sm, lg, icon, icon-xs. |
| `input.tsx` | Styled `<input>` element. |
| `textarea.tsx` | Styled `<textarea>`. |
| `label.tsx` | `<label>` with consistent font styling. |
| `select.tsx` | Radix Select — `SelectTrigger`, `SelectContent`, `SelectItem`, etc. |
| `badge.tsx` | Small inline pill. Variants: default, secondary, destructive, outline. |
| `card.tsx` | Card container with `CardContent`, `CardHeader`, `CardTitle`, etc. |
| `tabs.tsx` | Radix Tabs — `TabsList`, `TabsTrigger`, `TabsContent`. |
| `sidebar.tsx` | Full shadcn Sidebar system with collapsible, icons, groups, tooltips. |
| `dropdown-menu.tsx` | Radix DropdownMenu — for the action menus on cards and table rows. |
| `skeleton.tsx` | Gray pulsing placeholder for loading states. |
| `tooltip.tsx` | Radix Tooltip — used for collapsed sidebar icon labels. |
| `scroll-area.tsx` | Radix ScrollArea — custom scrollbar styling. |
| `separator.tsx` | Horizontal or vertical divider line. |
| `sheet.tsx` | Slide-in overlay panel (used internally by Sidebar). |
| `dialog.tsx` | Modal dialog. |
| `table.tsx` | Styled HTML table elements (`Table`, `TableRow`, `TableCell`, etc.). |

---

## 11. Server Actions

Server Actions are async functions marked `'use server'` that run on the server in response to form submissions or client-side calls. They can mutate data and revalidate the Next.js cache.

### Application Actions (`app/(dashboard)/dashboard/applications/actions.ts`)

#### `createApplicationAction(formData: FormData)`
1. Gets `userId` via `requireAuth()` (throws if not authenticated).
2. Parses all form fields from `formData`.
3. Calls `createApplication(userId, data)` which inserts a row and schedules a reminder if `nextStepAt` is set.
4. Calls `revalidatePath('/dashboard/applications')` — invalidates the pipeline page cache.
5. Calls `revalidateTag(\`analytics:${userId}\`, 'max')` — invalidates the analytics cache for this user.

#### `updateApplicationStatusAction(id: string, status: ApplicationStatus)`
Called by `ApplicationCard` and `data-table.tsx` when the user changes an application's status via the dropdown.
1. Gets `userId`.
2. Calls `updateApplication(id, userId, { status })`.
3. Revalidates pipeline path and analytics tag.

#### `updateApplicationAction(id: string, formData: FormData)`
Called from the edit form.
1. Gets `userId`.
2. Parses all form fields.
3. Calls `updateApplication(id, userId, data)`.
4. Revalidates both the pipeline path and the specific application detail path.
5. Revalidates analytics tag.

#### `deleteApplicationAction(id: string)`
Called by `DeleteApplicationButton`.
1. Gets `userId`.
2. Calls `deleteApplication(id, userId)`.
3. Revalidates pipeline path and analytics tag.

---

### Checklist Actions (`app/(dashboard)/dashboard/applications/[id]/checklist-actions.ts`)

#### `addChecklistItemAction(applicationId: string, text: string)`
1. Gets `userId`.
2. Calls `addChecklistItem(applicationId, userId, text.trim())`.
3. Revalidates the application detail path.

#### `toggleChecklistItemAction(id: string, applicationId: string, done: boolean)`
1. Gets `userId`.
2. Calls `toggleChecklistItem(id, userId, done)`.
3. Revalidates the application detail path.

#### `deleteChecklistItemAction(id: string, applicationId: string)`
1. Gets `userId`.
2. Calls `deleteChecklistItem(id, userId)`.
3. Revalidates the application detail path.

---

## 12. API Routes

API routes are for external consumers (scripts, integrations, the CSV import/export UI). All routes require a valid Clerk session.

### `GET /api/applications`

Rate limit: 120 requests/min per user.

Query params:
- `status` — filter by a single status value
- `search` — filter by company/role name (case-insensitive)

Returns: JSON array of `Application` objects.

---

### `POST /api/applications`

Rate limit: 30 requests/min per user.

Body (validated with Zod):
```json
{
  "company": "Stripe",
  "role": "Software Engineer",
  "status": "applied",          // optional, default "applied"
  "appliedAt": "2026-05-01T...", // optional ISO datetime, default now
  "source": "referral",         // optional
  "jobUrl": "https://...",       // optional, must be valid URL
  "salary": "160k",             // optional
  "location": "Remote",         // optional
  "notes": "...",               // optional
  "nextStepAt": "...",          // optional ISO datetime
  "nextStepLabel": "..."        // optional
}
```

Returns: `201` with the created `Application` object.

---

### `GET /api/applications/:id`

Returns a single application. 404 if not found or belongs to different user.

---

### `PATCH /api/applications/:id`

All fields optional. Validates with Zod `patchSchema`. Returns the updated application. 404 if not found.

---

### `DELETE /api/applications/:id`

Deletes the application. Cascade deletes checklist items and reminders. Returns `204 No Content`. 404 if not found.

---

### `POST /api/import`

Rate limit: 3 requests/min per user.

Accepts `multipart/form-data` with a `file` field (CSV file, max 1MB).

Process:
1. Reads the file as text.
2. Calls `parseCSV(text, userId)` — skips rows missing company or role.
3. Inserts rows in chunks of 100 inside a database transaction (atomicity — either all insert or none).
4. Returns `{ inserted: N }`.

---

### `GET /api/export`

Rate limit: 5 requests/min per user.

Fetches all of the user's applications, serializes to CSV with `serializeCSV()`, returns a `text/csv` response with `Content-Disposition: attachment; filename="tracksy-export-{date}.csv"`.

`Cache-Control: no-store` ensures the browser never caches the export.

---

### `GET /api/cron/reminders`

**This route is called by a cron job (Vercel Cron), not by users.**

Authentication: checks `Authorization: Bearer {CRON_SECRET}` header.

Process:
1. Queries all reminders where `scheduled_for <= now()` AND `sent_at IS NULL`.
2. Joins to applications to get application details and user emails.
3. Groups by user — one email per user per run (avoids spamming).
4. For each user with pending reminders: sends a single email via Resend listing all upcoming deadlines.
5. Updates all sent reminders' `sent_at` to `now()`.

Cron schedule (set in `vercel.json`): `0 9 * * *` — runs daily at 09:00 UTC.

---

## 13. Library Modules — lib/

### `lib/db/index.ts`

Creates the Drizzle database instance:
```ts
const sql = neon(process.env.DATABASE_URL!)       // Neon HTTP driver
export const db = drizzle(sql, { schema })         // Drizzle ORM instance
```

The `{ schema }` option enables typed relational queries. All query files import `db` from here.

---

### `lib/db/queries/applications.ts`

All CRUD operations for the `applications` table.

#### `getUserApplications(userId, filters?)` — React `cache()`-wrapped
Fetches applications for a user. Filters: optional `status`, optional `search` (ILIKE on company + role), default limit 1000.

#### `getApplicationById(id, userId)` — React `cache()`-wrapped
Fetches a single application by id with userId ownership check. Returns `null` if not found.

#### `createApplication(userId, data)`
Inserts a new application. If `nextStepAt` is set, calls `scheduleReminder(app.id, app.nextStepAt)` to create a reminder row.

#### `updateApplication(id, userId, data)`
Updates an application with ownership check. If `nextStepAt` was changed:
1. Deletes existing unsent reminders for this application.
2. Schedules a new reminder if the new `nextStepAt` is in the future.

#### `deleteApplication(id, userId)`
Deletes the application. `ON DELETE CASCADE` on reminders and checklist_items means those are automatically deleted too.

#### `scheduleReminder(applicationId, nextStepAt)` — private
Creates a reminder at `nextStepAt - 48 hours`. Only if the computed `scheduledFor` is in the future.

---

### `lib/db/queries/analytics.ts`

Three parallel SQL GROUP BY queries. All wrapped in `unstable_cache` with 5-minute TTL.

#### Query 1: Status counts
```sql
SELECT status, count(*)::int
FROM applications
WHERE user_id = $userId
GROUP BY status
```
Used to compute: total applications, response rate, byStatus map, funnel stages.

#### Query 2: Weekly activity
```sql
SELECT date_trunc('week', applied_at)::text, count(*)::int,
       count(*) filter (where status not in ('applied', 'ghosted'))::int
FROM applications
WHERE user_id = $userId AND applied_at >= (now() - interval '8 weeks')
GROUP BY date_trunc('week', applied_at)
```
The `filter (where ...)` aggregate counts "responses" (any status that's not applied or ghosted) without a subquery.

#### Query 3: Source breakdown
```sql
SELECT coalesce(source::text, 'unknown'), count(*)::int,
       count(*) filter (where status not in ('applied', 'ghosted'))::int
FROM applications
WHERE user_id = $userId
GROUP BY coalesce(source::text, 'unknown')
ORDER BY count(*) desc
```

#### Derived computations (in TypeScript):
- `total` — sum of all status counts
- `responseRate` — `(screening + interview + offer) / total * 100`
- `funnel` — cumulative stages: Applied=total, Screening=screening+interview+offer, Interview=interview+offer, Offer=offer

---

### `lib/db/queries/checklist.ts`

#### `getChecklistItems(applicationId, userId)` — React `cache()`-wrapped
Single JOIN query: fetches checklist items while verifying ownership in one round-trip. Returns `null` if the application doesn't belong to the user (vs. `[]` for an application with zero items — distinguished by a second lightweight ownership check).

#### `addChecklistItem(applicationId, userId, text)`
Runs two parallel queries:
1. Ownership check on the application.
2. `SELECT max(position)` to find where to insert the new item.
Then inserts the new item at `max(position) + 1`.

#### `toggleChecklistItem(id, userId, done)`
Single `UPDATE ... WHERE id = $id AND application_id IN (SELECT id FROM applications WHERE user_id = $userId)` — ownership-verifying in one round-trip.

#### `deleteChecklistItem(id, userId)`
Same subquery pattern as toggle.

---

### `lib/db/queries/users.ts`

#### `syncUser(clerkId, email)` — `unstable_cache`-wrapped (24h TTL)
```sql
INSERT INTO users (clerk_id, email)
VALUES ($clerkId, $email)
ON CONFLICT (clerk_id) DO UPDATE SET email = excluded.email
```
Upserts the user row. The 24h cache ensures this runs at most once per day per user even with many page loads.

---

### `lib/auth.ts`

```ts
requireAuth()    // → userId string, throws Error('Unauthorized') if no session
getAuthUser()    // → Clerk User object or null
```

`requireAuth()` is used in all Server Actions. `getAuthUser()` is used in settings page to get the user's display name.

---

### `lib/csv.ts`

#### `parseCSV(csv: string, userId: string)`
Uses PapaParse with `header: true`. Normalizes column headers (lowercase, underscores). Skips rows missing company or role. Normalizes status values (unknown → `'applied'`), source values (unknown → `null`), and dates (invalid → `null` or `new Date()`).

Handles flexible column names: `job_url` or `joburl`, `applied_at` or `appliedat` or `date`, etc.

Returns an array of `NewApplication` objects ready to insert.

#### `serializeCSV(rows)`
Uses PapaParse `unparse()` to turn application objects into CSV text. Columns: `company, role, status, applied_at, source, job_url, salary, location, notes, next_step_at, next_step_label`.

---

### `lib/rate-limit.ts`

In-memory sliding-window rate limiter.

```ts
rateLimit(key: string, opts: { max: number; windowMs: number })
// Returns: { ok: boolean; remaining: number; retryAfter?: number }
```

Uses a `Map<string, { count: number; resetAt: number }>` as the store. A `setInterval` every 60 seconds purges expired entries to prevent memory leaks.

**Limitation:** Single-process only. On Vercel (multiple instances), each instance has its own in-memory store. For true global rate limiting in production, replace with Upstash Redis rate limiter.

---

### `lib/status.ts`

```ts
STATUS_CONFIG: Record<ApplicationStatus, { label: string; dot: string; ring: string }>
```

Maps each status to:
- `label` — display name (e.g. "Applied")
- `dot` — Tailwind class for the colored indicator dot (e.g. `"bg-blue-500"`)
- `ring` — Tailwind class for ring/shadow accent

```ts
STATUSES: ApplicationStatus[]
// ['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted']
```

Single source of truth for status ordering and display. Used by table, mobile view, cards, forms.

---

### `lib/utils.ts`

```ts
cn(...inputs: ClassValue[]): string
```

Combines `clsx` (conditional classes) + `tailwind-merge` (resolves Tailwind conflicts). Used everywhere to build dynamic class strings.

---

### `hooks/use-mobile.ts`

```ts
useIsMobile(): boolean
```

Uses `window.matchMedia('(max-width: 767px)')` to detect mobile viewport. Returns `true` on screens narrower than 768px. Responds to resize events via `addEventListener("change", ...)`.

---

## 14. Caching Strategy

Tracksy uses three layers of caching to minimize database queries.

### Layer 1: React `cache()` — Per-Request Deduplication

Used on: `getUserApplications`, `getApplicationById`, `getChecklistItems`

```ts
import { cache } from 'react'
export const getApplicationById = cache(async (id, userId) => { ... })
```

**What it does:** During a single server render, if the same function is called with the same arguments multiple times (e.g. once in `generateMetadata` and once in the page component), React deduplicates — the DB query only runs once.

**Scope:** Single request. The cache is thrown away after the request completes.

---

### Layer 2: `unstable_cache` — Cross-Request Caching

Used on: `getAnalytics` (5-minute TTL), `syncUser` (24-hour TTL per user)

```ts
import { unstable_cache } from 'next/cache'

export const getAnalytics = (userId: string) =>
  unstable_cache(_getAnalytics, ['analytics', userId], {
    revalidate: 300,           // 5 minutes
    tags: [`analytics:${userId}`],
  })(userId)
```

**What it does:** Caches the function result across requests. A second user loading the analytics page within 5 minutes hits the cache, not the database.

**Key:** Must include `userId` in the cache key array so each user gets their own cache entry.

**Tags:** Enable targeted invalidation — when a user creates/updates/deletes an application, `revalidateTag(\`analytics:${userId}\`)` is called in the Server Action, instantly busting only that user's analytics cache.

---

### Layer 3: `revalidatePath` / `revalidateTag` — On-Demand Invalidation

Called in Server Actions after mutations:

```ts
revalidatePath('/dashboard/applications')  // pipeline page
revalidatePath(`/dashboard/applications/${id}`)  // detail page
revalidateTag(`analytics:${userId}`, 'max')  // analytics cache
```

This ensures that after a mutation (create, update, delete), the next page load fetches fresh data from the database instead of serving stale cache.

---

## 15. Rate Limiting

All public-facing API routes apply per-user rate limits:

| Route | Method | Limit |
|-------|--------|-------|
| `/api/applications` | GET | 120 req/min |
| `/api/applications` | POST | 30 req/min |
| `/api/import` | POST | 3 req/min |
| `/api/export` | GET | 5 req/min |

Rate limits are NOT applied to Server Actions (they're form submissions, not REST APIs, and are already protected by Clerk session requirements).

The rate limiter key format is `"{METHOD}:{route}:{userId}"` — per-user, per-endpoint.

When a rate limit is exceeded, the response is:
```
HTTP 429 Too Many Requests
Retry-After: {seconds until reset}
Body: { "error": "Too many requests" }
```

---

## 16. CSV Import and Export

### Import Flow

1. User navigates to Settings → Import.
2. `ImportForm` (client component) renders a file input.
3. User selects a `.csv` file and clicks Import.
4. `ImportForm` POSTs `multipart/form-data` to `POST /api/import`.
5. API route validates: auth, rate limit (3/min), file exists, file size ≤ 1MB.
6. Calls `parseCSV(fileText, userId)`.
7. Inserts rows in chunks of 100 inside `db.transaction()` — atomic (all-or-nothing).
8. Returns `{ inserted: N }`.
9. `ImportForm` shows a success/error toast.

### Export Flow

1. User navigates to Settings and clicks Export.
2. `<a href="/api/export" download>` triggers a browser download.
3. `GET /api/export`: auth check, rate limit (5/min).
4. Calls `getUserApplications(userId)` — all applications.
5. Calls `serializeCSV(apps)` — converts to CSV text.
6. Returns with `Content-Disposition: attachment; filename="tracksy-export-{YYYY-MM-DD}.csv"`.
7. Browser saves the file.

### CSV Column Format

Import and export use the same column names:

```
company, role, status, applied_at, source, job_url, salary, location, notes, next_step_at, next_step_label
```

The parser is lenient on import — accepts alternate column names (`joburl`, `appliedat`, `date`) and normalizes values (unknown statuses → `'applied'`, invalid dates → `null`).

---

## 17. Reminder System

### How Reminders Are Created

When an application is created or updated with a `nextStepAt` date:
1. `createApplication()` / `updateApplication()` calls `scheduleReminder(applicationId, nextStepAt)`.
2. `scheduleReminder` computes `scheduledFor = nextStepAt - 48 hours`.
3. If `scheduledFor` is in the past, it does nothing (too late to remind).
4. Otherwise, inserts a row into the `reminders` table with `sent_at = NULL`.

On update: existing unsent reminders for that application are deleted first, then a new one is created. This handles cases where the user changes the next step date.

### How Reminders Are Sent

A cron job hits `GET /api/cron/reminders` daily at 09:00 UTC (configured in `vercel.json`).

The route:
1. Verifies `Authorization: Bearer {CRON_SECRET}` header.
2. Queries: `SELECT * FROM reminders WHERE scheduled_for <= now() AND sent_at IS NULL`.
3. For each reminder, joins to the application and then to the user's email.
4. Groups reminders by user (one email per user per day).
5. Sends email via Resend with a list of upcoming deadlines.
6. Updates `sent_at = now()` on all sent reminders.

### Cleanup

Because `reminders` has `ON DELETE CASCADE` referencing `applications`, deleting an application automatically removes all its reminders (including unsent ones).

---

## 18. Analytics

The analytics page (`/dashboard/analytics`) shows four things:

### 1. Stats Row

- **Applications** — total count of all applications
- **Response rate** — `(screening + interview + offer) / total × 100%`
- **Interviews** — count with status `interview`
- **Offers** — count with status `offer`

### 2. Weekly Activity Chart

A Recharts grouped bar chart. X-axis: last 8 weeks, labeled by week start date (e.g. "Apr 28"). Two bars per week:
- Blue: number of applications submitted that week
- Green: number that received a response (status is not `applied` or `ghosted`)

### 3. Conversion Funnel

Shows the cumulative pipeline:
- **Applied** = 100% (all applications)
- **Screening** = applications that reached screening or beyond
- **Interview** = applications that reached interview or beyond
- **Offer** = applications that received an offer

Visualized as horizontal bars, each bar's width proportional to the count relative to total.

### 4. By Source Breakdown

A table showing each application source with:
- Number applied
- Response rate percentage

Sorted by volume (most applied first).

### Caching

All analytics data is cached per user for 5 minutes (`unstable_cache`, `revalidate: 300`). Busted immediately when any application mutation happens via `revalidateTag(\`analytics:${userId}\`)`.

---

## 19. Data Flow — End to End

### Adding a New Application

```
User fills form → clicks "Save"
  → ApplicationForm calls handleSubmit(formData)
  → startTransition: createApplicationAction(formData) [Server Action]
    → requireAuth() → userId
    → createApplication(userId, data) [lib/db/queries/applications.ts]
      → db.insert(applications).values(...) [Neon HTTP request to Postgres]
      → if nextStepAt: scheduleReminder(appId, nextStepAt)
        → db.insert(reminders).values(...) [another Neon HTTP request]
    → revalidatePath('/dashboard/applications')
    → revalidateTag(`analytics:${userId}`, 'max')
  → router.back()  [navigates back to pipeline]
Pipeline page reloads → React re-renders with fresh data
```

### Changing Application Status (Mobile)

```
User taps kebab menu on card → selects "Interview"
  → ApplicationCard.handleStatusChange('interview')
    → onStatusChange(id, 'interview') [updates parent ApplicationsView state immediately]
      → apps array updated optimistically — UI is instant
    → startTransition: updateApplicationStatusAction(id, 'interview') [Server Action]
      → DB update runs in background
      → revalidatePath + revalidateTag
```

### Loading Analytics

```
User navigates to /dashboard/analytics
  → AnalyticsPage (Server Component) runs on server
  → getAnalytics(userId) called
    → unstable_cache checks cache for key ['analytics', userId]
    → If cache hit (within 5min): returns cached result, no DB query
    → If cache miss: runs _getAnalytics(userId)
      → Three parallel DB queries (Promise.all)
      → Result stored in cache with 5min TTL
  → Page renders with data
```

---

## 20. Database Migrations

Migrations are managed by Drizzle Kit. Migration files are stored in `drizzle/` and committed to git.

### Migration History

| File | Content |
|------|---------|
| `0000_amused_scarlet_spider.sql` | Initial schema: `application_source` enum, `application_status` enum, `applications` table, `reminders` table, `users` table with `users_clerk_id_unique` constraint. Indexes: `applications_user_status_idx`, `applications_user_applied_idx`, `reminders_scheduled_idx`. |
| `0001_overrated_boom_boom.sql` | Patch migration. |
| `0002_woozy_tag.sql` | Added `checklist_items` table. Added `applications_user_idx` on `(user_id)`. Added `checklist_app_pos_idx` on `(application_id, position)`. Added `reminders_unsent_idx` on `(application_id, sent_at)`. |
| `0003_charming_sumo.sql` | `ALTER TYPE application_source ADD VALUE 'on_campus' BEFORE 'other'` — added On Campus as an application source. |

### Running Migrations

```bash
# Generate a new migration file from schema changes
pnpm db:generate

# Apply all pending migrations to the database
pnpm db:migrate
```

**Important:** The `ALTER TYPE ... ADD VALUE` migration (adding enum values) is non-transactional in Postgres — it cannot be rolled back inside a transaction. This is a known Postgres limitation for enum modifications.

---

## 21. Development Commands

```bash
pnpm dev          # Start Next.js dev server at localhost:3000
pnpm build        # Production build (type-checks, compiles, optimizes)
pnpm start        # Start production server (run pnpm build first)
pnpm lint         # Run ESLint
pnpm typecheck    # Run tsc --noEmit (type check only, no emit)

pnpm db:generate  # Introspect schema.ts, generate new migration SQL in drizzle/
pnpm db:migrate   # Apply all pending migrations to DATABASE_URL
pnpm db:studio    # Open Drizzle Studio at localhost:4983 (visual DB browser)
```

---

## 22. Deployment

### Vercel (Recommended)

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.local` to Vercel project settings.
4. Set `DATABASE_URL` to Neon's **pooled** connection string (hostname ends in `-pooler.neon.tech`).
5. Add `vercel.json` with the cron config:
   ```json
   {
     "crons": [
       { "path": "/api/cron/reminders", "schedule": "0 9 * * *" }
     ]
   }
   ```
6. Deploy. Vercel picks up the cron automatically.

### Self-Hosted

```bash
pnpm build
pnpm start        # Listens on PORT (default 3000)
```

For reminders, schedule a daily HTTP request to `/api/cron/reminders` with header `Authorization: Bearer {CRON_SECRET}`. Use systemd timer, GitHub Actions, or any cron scheduler.

---

## 23. Scalability Design

The following design decisions were made specifically to handle high concurrency (target: 500k concurrent users):

### Database

- **SQL GROUP BY for analytics** — instead of fetching all applications and computing in JavaScript, analytics uses three parallel SQL queries with `GROUP BY` and `count(*) filter (where ...)`. This pushes computation to Postgres, which handles it efficiently regardless of application count.
- **Indexes on every query path** — `(user_id)`, `(user_id, status)`, `(user_id, applied_at)`, `(application_id, position)`, `(scheduled_for)`, `(application_id, sent_at)`. No sequential scans in hot paths.
- **Ownership subqueries in one round-trip** — checklist toggle/delete use `inArray` with a subquery instead of two separate queries (fetch app to verify ownership, then update). Halves DB round-trips.
- **Neon pooled connection** — uses PgBouncer via Neon's `-pooler.neon.tech` URL. Serverless functions don't hold connections open, preventing connection exhaustion.
- **Atomic CSV imports** — `db.transaction()` wraps chunk inserts. On failure, no partial data is inserted.

### Caching

- **React `cache()`** — deduplicates identical DB calls within a single render pass. If `getApplicationById` is called from `generateMetadata` and `page.tsx`, only one DB query runs.
- **`unstable_cache` with TTL** — analytics and user sync are cached across requests. Analytics: 5 minutes. User sync: 24 hours. This dramatically reduces DB load for read-heavy pages.
- **Tag-based invalidation** — analytics cache is invalidated per-user immediately on mutation via `revalidateTag`. No stale data, minimal unnecessary invalidation.

### API

- **Per-user rate limiting** — prevents any single user from hammering the API. Different limits per endpoint based on expected usage patterns.
- **Zod validation** — rejects malformed requests at the edge before they reach the database.
- **Server Actions for mutations** — avoid the overhead of JSON serialization/deserialization for form-based mutations.

### Memory

- **Rate limiter GC** — the in-memory rate limit store runs a cleanup interval every 60 seconds to remove expired entries, preventing unbounded memory growth.
- **Recommendation for production scale** — replace the in-memory rate limiter with Upstash Redis for multi-instance deployments. The current implementation has per-instance state, which means rate limits are per-pod, not global.

---

*End of documentation. Every feature, file, function, and decision in Tracksy is covered above.*
