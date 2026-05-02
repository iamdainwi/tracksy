# Tracksy

A focused job application tracker for the 100+ applications you'll send this season — with a table pipeline, deadline reminders, prep checklists, and response analytics.

[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

---

## Why Tracksy

Job searches mean tracking dozens of applications across companies, recruiters, deadlines, and follow-ups. Spreadsheets break by week two. Notion takes three hours to set up a tracker you'll maintain for four months.

Tracksy does four things well:

- **Track** applications through a status pipeline (Applied → Screening → Interview → Offer)
- **Remind** you 48 hours before interviews, follow-ups, and deadlines
- **Analyse** response rates so you know whether it's your resume or the market
- **Export** everything as CSV — your data, your call

---

## Features

### Pipeline table

A sortable, filterable data table for your applications. Filter by status with one click, sort by applied date or next step, search by company or role. Handles hundreds of applications without slowing down.

### Mobile-first list view

On mobile, applications are grouped by status in a tab strip you can swipe through. Floating action button for quick adds.

### Prep checklist

Each application has a per-step prep checklist — add notes, tasks, and reminders for upcoming interviews. Check items off as you go; progress is tracked with a progress bar.

### Smart reminders

Set a "next step" date when you log an application. Tracksy emails you 48 hours before any deadline. One email per day, batched — no spam.

### Response analytics

- Response rate by week (trending up or down?)
- Conversion funnel: Applied → Screening → Interview → Offer
- Breakdown by source: LinkedIn vs referral vs direct vs recruiter

### CSV import / export

Already tracking in Google Sheets? Drop your CSV into Settings → Import. Export everything in one click from Settings → Export.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Framework  | Next.js 16 (App Router, RSC)                  |
| Language   | TypeScript                                    |
| Database   | PostgreSQL — [Neon](https://neon.tech)         |
| ORM        | Drizzle ORM                                   |
| Auth       | Clerk                                         |
| Styling    | Tailwind CSS v4 + shadcn/ui                   |
| Icons      | Hugeicons                                     |
| Tables     | TanStack Table v8                             |
| Email      | Resend                                        |
| Deployment | Vercel                                        |

---

## Project Structure

```text
tracksy/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                        # Sidebar shell + user sync
│   │   ├── page.tsx                          # Redirects → /dashboard/applications
│   │   └── dashboard/
│   │       ├── applications/
│   │       │   ├── page.tsx                  # Pipeline page (server)
│   │       │   ├── loading.tsx               # Skeleton
│   │       │   ├── actions.ts                # Server Actions (create/update/delete)
│   │       │   ├── new/page.tsx              # Add application form
│   │       │   └── [id]/
│   │       │       ├── page.tsx              # Application detail
│   │       │       ├── edit/page.tsx         # Edit form
│   │       │       ├── delete-button.tsx
│   │       │       ├── checklist.tsx         # Prep checklist UI (client)
│   │       │       └── checklist-actions.ts  # Checklist server actions
│   │       ├── analytics/
│   │       │   ├── page.tsx                  # Analytics dashboard
│   │       │   └── loading.tsx
│   │       └── settings/
│   │           ├── page.tsx
│   │           └── import/
│   │               ├── page.tsx
│   │               └── import-form.tsx
│   ├── api/
│   │   ├── applications/
│   │   │   ├── route.ts                      # GET / POST
│   │   │   └── [id]/route.ts                 # PATCH / DELETE
│   │   ├── import/route.ts                   # CSV import
│   │   └── export/route.ts                   # CSV export
│   ├── page.tsx                              # Marketing landing page
│   └── layout.tsx
│
├── components/
│   ├── ui/                                   # shadcn primitives
│   ├── applications/
│   │   ├── applications-view.tsx             # Client shell (search + state)
│   │   ├── data-table.tsx                    # Desktop table (TanStack Table)
│   │   ├── application-card.tsx              # Mobile card
│   │   └── mobile-list-view.tsx              # Mobile tab view
│   ├── kanban/                               # Kept for reference; unused on main pipeline
│   └── layout/
│       └── app-sidebar.tsx                   # shadcn Sidebar
│
├── lib/
│   ├── db/
│   │   ├── index.ts                          # Drizzle + Neon HTTP client
│   │   ├── schema.ts                         # Tables + enums + types
│   │   └── queries/
│   │       ├── applications.ts               # React-cached query helpers
│   │       ├── analytics.ts                  # SQL GROUP BY aggregations
│   │       ├── checklist.ts                  # Checklist CRUD
│   │       └── users.ts                      # User sync (cached 24h)
│   ├── auth.ts                               # Clerk helpers
│   ├── csv.ts                                # Parse / serialize CSV
│   ├── rate-limit.ts                         # In-memory rate limiter
│   ├── status.ts                             # STATUS_CONFIG shared config
│   └── utils.ts
│
├── drizzle/                                  # Generated SQL migrations
├── public/
├── .env.example
├── drizzle.config.ts
├── proxy.ts                                  # Clerk middleware (Next.js 16 convention)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- `pnpm` (or `npm` / `yarn`)
- [Neon](https://neon.tech) database (free tier is fine)
- [Clerk](https://clerk.com) account (free tier)
- [Resend](https://resend.com) account for email reminders (free tier: 3,000 emails/month)

### 1. Clone and install

```bash
git clone https://github.com/iamdainwi/tracksy.git
cd tracksy
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Neon — use the pooled connection URL for production
DATABASE_URL=postgres://user:pass@host-pooler.neon.tech/db?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Resend (required for deadline reminders)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=reminders@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-random-secret-here
```

> **Neon tip:** In your Neon dashboard, use the **Pooled connection** string (hostname ends in `-pooler.neon.tech`). This enables PgBouncer and is required for production-scale serverless deployments.

### 3. Run migrations

```bash
pnpm db:migrate     # Apply migrations to your database
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, and you'll land directly in your pipeline.

---

## Database Schema

```ts
// Enums
applicationStatus: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'ghosted'
applicationSource: 'linkedin' | 'referral' | 'direct' | 'job_board' | 'recruiter' | 'other'

// Tables
users           — clerkId (unique), email
applications    — userId, company, role, status, appliedAt, source, jobUrl,
                  salary, location, notes, nextStepAt, nextStepLabel
checklist_items — applicationId (FK → applications), text, done, position
reminders       — applicationId (FK → applications), scheduledFor, sentAt
```

Indexes on `(userId)`, `(userId, status)`, `(userId, appliedAt)`, `(applicationId, position)`, and `(applicationId, sentAt)` for the reminder dispatch query.

---

## API Reference

All routes require a valid Clerk session. Responses are JSON.

| Method | Path                       | Description                   | Rate limit     |
|--------|----------------------------|-------------------------------|----------------|
| GET    | `/api/applications`        | List applications             | 120 req/min    |
| POST   | `/api/applications`        | Create application            | 30 req/min     |
| GET    | `/api/applications/[id]`   | Get one application           | —              |
| PATCH  | `/api/applications/[id]`   | Update application            | —              |
| DELETE | `/api/applications/[id]`   | Delete application            | —              |
| POST   | `/api/import`              | Bulk import from CSV (≤ 1 MB) | 3 req/min      |
| GET    | `/api/export`              | Download CSV export           | 5 req/min      |

### Example — create an application

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Stripe",
    "role": "Software Engineer",
    "status": "applied",
    "source": "referral",
    "nextStepAt": "2026-05-12T10:00:00Z",
    "nextStepLabel": "Phone screen"
  }'
```

---

## CSV Import Format

Columns (case-insensitive; missing columns default to null):

```csv
company,role,status,applied_at,source,job_url,salary,location,notes,next_step_at,next_step_label
Stripe,Software Engineer,interview,2026-04-15,referral,https://...,160k-200k,Remote,Went well,2026-05-01,Onsite
```

Valid `status` values: `applied`, `screening`, `interview`, `offer`, `rejected`, `ghosted`.

---

## Reminder System

A cron job hits `/api/cron/reminders` daily at 09:00 UTC. It:

1. Authenticates via the `CRON_SECRET` header
2. Queries reminders where `scheduledFor <= now()` and `sentAt IS NULL`
3. Groups by user — one email per user per day
4. Sends via Resend and marks `sentAt`

Configure the cron in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 9 * * *" }
  ]
}
```

---

## Development

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm db:generate    # Generate SQL migrations from schema changes
pnpm db:migrate     # Apply pending migrations
pnpm db:studio      # Drizzle Studio (visual DB browser at localhost:4983)
```

### Conventions

- **Server Components by default.** Add `'use client'` only for interactive components (forms, drag, state).
- **Mutations via Server Actions** (dashboard) or API routes (external consumers).
- **All DB queries in `lib/db/queries/`** — never inline in components or route handlers.
- **`React.cache()`** wraps per-request query deduplication. **`unstable_cache`** wraps cross-request caching (analytics: 5 min TTL; user sync: 24h TTL).
- **Rate limiting** is in-memory (`lib/rate-limit.ts`). Replace with [Upstash Redis](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) for multi-instance production deployments.

---

## Deployment

### Vercel

1. Push to GitHub
2. Import project into Vercel
3. Add all env vars from `.env.local` to Vercel project settings
4. Set `DATABASE_URL` to the **pooled** Neon connection string in production
5. Deploy — the `vercel.json` cron config is picked up automatically

### Self-hosted

```bash
pnpm build
pnpm start
```

You'll need to schedule a daily request to `/api/cron/reminders` with the `Authorization: Bearer <CRON_SECRET>` header (systemd timer, GitHub Actions, or any scheduler).

---

## Roadmap

- [ ] Chrome extension — log applications from LinkedIn / Greenhouse with one click
- [ ] Email integration — forward recruiter replies to auto-log responses
- [ ] Referral tracker — tag who referred you, track conversion rate
- [ ] AI follow-up drafts
- [ ] Calendar sync (Google Calendar / iCal)

Not planned: team collaboration, recruiter-side features, job recommendations.

---

## Contributing

Issues and PRs welcome.

1. Fork → feature branch → changes
2. `pnpm lint && pnpm typecheck`
3. Open a PR with context on what and why

---

## License

MIT — see [LICENSE](./LICENSE).

---

Built by [Dainwi Choudhary](https://dainwi.vercel.app).  
Bug? [Open an issue](https://github.com/iamdainwi/tracksy/issues).
