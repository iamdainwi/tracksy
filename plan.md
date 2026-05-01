# Tracksy — Build Plan

> Status key: ⬜ Not started · 🔄 In progress · ✅ Done
>
> **All core modules shipped. Build: clean. TypeScript: zero errors.**

---

## Tech Stack (confirmed)

| Concern | Choice |
|---|---|
| Framework | Next.js 16.2.4 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn (radix-maia, hugeicons) |
| Auth | Clerk |
| Database | PostgreSQL on Neon (serverless driver) |
| ORM | Drizzle ORM |
| Email | Resend + React Email |
| Drag-and-drop | @dnd-kit |
| CSV | PapaParse |
| Validation | Zod |
| Cron | Vercel Cron |

---

## Module Map

### M0 — Foundation ✅
Install all missing runtime dependencies. Wire environment variables. Confirm Clerk, Neon, and Resend connectivity.

**Packages to install:**
- `@clerk/nextjs` — auth
- `drizzle-orm` + `drizzle-kit` — ORM + migrations
- `@neondatabase/serverless` + `ws` — Neon serverless driver
- `resend` + `@react-email/components` + `react-email` — email
- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — kanban drag-and-drop
- `zod` — schema validation
- `papaparse` + `@types/papaparse` — CSV
- `recharts` — analytics charts
- `date-fns` — date formatting/math
- `@types/ws` — TypeScript types for ws

**Files to create/update:**
- `.env.local` — real credentials (user must provide)
- `drizzle.config.ts` — Drizzle config pointing to Neon
- `next.config.ts` — add Clerk + any image domains
- `middleware.ts` — Clerk auth middleware (root level)

---

### M1 — Database Schema ✅
Define all tables in `lib/db/schema.ts`, generate and apply the initial migration.

**Tables:**
- `users` — synced from Clerk (clerk_id, email, created_at)
- `applications` — core entity (id, user_id, company, role, status enum, applied_at, source, job_url, salary, notes, next_step_at, next_step_label, created_at, updated_at)
- `reminders` — (id, application_id FK, scheduled_for, sent_at)

**Status enum:** `applied | screening | interview | offer | rejected | ghosted`

**Indexes:**
- `(user_id, status)` on applications
- `(scheduled_for) WHERE sent_at IS NULL` on reminders (partial index)

**Files:**
- `lib/db/schema.ts`
- `lib/db/index.ts` — Drizzle client (Neon serverless)
- `drizzle/0000_initial.sql` — generated migration
- `drizzle.config.ts`

---

### M2 — Authentication ✅
Clerk integration: middleware, sign-in/sign-up pages, user sync webhook.

**Files:**
- `middleware.ts` — `clerkMiddleware()` protecting `/dashboard/**` and `/api/**`
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `app/(auth)/layout.tsx` — centered auth layout
- `app/api/webhooks/clerk/route.ts` — Clerk webhook to sync users table on create/delete
- `lib/auth.ts` — `currentUser()` helper, `requireUser()` that throws 401

---

### M3 — Dashboard Shell ✅
Persistent layout with sidebar navigation. Responsive — collapses to bottom nav on mobile.

**Routes:**
- `/dashboard` → redirect to `/dashboard/applications`
- `/dashboard/applications` — kanban pipeline
- `/dashboard/analytics` — charts
- `/dashboard/settings` — user settings

**Files:**
- `app/(dashboard)/layout.tsx` — sidebar shell, user avatar, nav links
- `app/(dashboard)/page.tsx` — redirect
- `components/layout/sidebar.tsx`
- `components/layout/mobile-nav.tsx`

---

### M4 — Applications API ✅
Route handlers for full CRUD. All routes verify Clerk session. No user can touch another user's data.

**Files:**
- `app/api/applications/route.ts` — GET (list with filters), POST (create)
- `app/api/applications/[id]/route.ts` — GET, PATCH (update), DELETE
- `lib/db/queries/applications.ts` — all DB queries isolated here, never inlined

**Query helpers:**
- `getUserApplications(userId, filters?)` — list with optional status/search filter
- `getApplicationById(id, userId)` — ownership-checked fetch
- `createApplication(userId, data)` — insert + schedule reminder if next_step_at provided
- `updateApplication(id, userId, data)` — patch fields, reschedule reminder on next_step_at change
- `deleteApplication(id, userId)` — delete + cascade reminders

---

### M5 — Pipeline (Kanban) View ✅
Drag-and-drop kanban board. Moving a card calls PATCH to update status. Optimistic UI.

**Columns:** Applied · Screening · Interview · Offer · Rejected · Ghosted

**Files:**
- `app/(dashboard)/applications/page.tsx` — server component, fetches applications
- `app/(dashboard)/applications/new/page.tsx` — new application form
- `components/kanban/board.tsx` — `'use client'`, DndContext
- `components/kanban/column.tsx` — SortableContext per column
- `components/kanban/card.tsx` — draggable card, status pill, next-step date
- `components/application-form.tsx` — shared create/edit form with Server Action

**Server Action:**
- `app/(dashboard)/applications/actions.ts` — `createApplication`, `updateApplicationStatus`

---

### M6 — Application Detail ✅
Full detail view: all fields, markdown notes, editable inline, status history timeline.

**Files:**
- `app/(dashboard)/applications/[id]/page.tsx` — server component
- `app/(dashboard)/applications/[id]/edit/page.tsx` — edit form
- `components/application-detail.tsx`

---

### M7 — Analytics Dashboard ✅
Real data from the database. No mock charts.

**Metrics computed server-side:**
- Response rate by week (applied vs. first-response)
- Average days from applied → first response
- Funnel conversion (applied → screen → interview → offer)
- Best-performing application sources

**Files:**
- `app/(dashboard)/analytics/page.tsx` — server component, runs aggregate queries
- `lib/db/queries/analytics.ts` — aggregate query helpers
- `components/analytics/response-chart.tsx` — Recharts bar chart (`'use client'`)
- `components/analytics/funnel.tsx` — horizontal funnel bars
- `components/analytics/stats-row.tsx` — 4-up stat cards

---

### M8 — Reminder System ⬜ (deferred — Resend not yet configured)
Cron job that dispatches emails daily. React Email template. Grouped per user.

**Flow:**
1. On application create/update, insert/update a `reminders` row for `next_step_at - 48h`
2. Vercel Cron hits `POST /api/cron/reminders` at 09:00 UTC with `CRON_SECRET` header
3. Handler queries unsent reminders due ≤ now, groups by user, sends one email per user
4. Marks reminders sent

**Files:**
- `app/api/cron/reminders/route.ts`
- `lib/email/client.ts` — Resend wrapper
- `lib/email/templates/reminder.tsx` — React Email template
- `vercel.json` — cron definition

---

### M9 — CSV Import / Export ✅
Import: multipart form upload, PapaParse, column mapping UI, bulk insert.
Export: stream CSV response from DB query.

**Files:**
- `app/(dashboard)/settings/import/page.tsx`
- `app/api/import/route.ts` — parse + bulk insert
- `app/api/export/route.ts` — stream CSV
- `lib/csv.ts` — parse/serialize logic

---

### M10 — Settings Page ✅
Notification preferences, account info (from Clerk), danger zone (export + delete account).

**Files:**
- `app/(dashboard)/settings/page.tsx`
- `app/(dashboard)/settings/layout.tsx` — settings sub-nav

---

### M11 — Polish ✅
Wire landing page CTA links to `/sign-up` and `/sign-in`. Update metadata. Add error boundaries and loading skeletons for all routes. Confirm `pnpm build` passes.

**Files:**
- `app/layout.tsx` — update title/description metadata
- `app/(dashboard)/**/loading.tsx` — skeleton loaders
- `app/(dashboard)/**/error.tsx` — error boundaries
- `app/page.tsx` — swap `#` hrefs to real routes

---

## Decisions & Constraints

- Server Components are the default. `'use client'` only for interactive pieces (DnD board, charts, forms with local state).
- All DB queries go through helpers in `lib/db/queries/` — no inline Drizzle in components or route handlers.
- Server Actions handle mutations from client components. Route handlers serve as the REST API for potential future clients.
- No `any` types. No `@ts-ignore`. Strict mode stays on.
- Comments only where the why is non-obvious. No docblocks.

---

## Pre-flight Checklist (must confirm before M0)

- [ ] Clerk account created, publishable key + secret key available
- [ ] Neon project created, `DATABASE_URL` connection string available
- [ ] Resend account created, API key available, sending domain verified
- [ ] `CRON_SECRET` value decided (any long random string)
