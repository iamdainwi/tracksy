# Tracksy

A focused job application tracker for the 100+ applications you'll send this season — with deadline reminders, status pipelines, and response analytics.

[![Live Demo](https://img.shields.io/badge/demo-tracksy.vercel.app-000?style=flat-square)](https://tracksy.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=next.js)](https://nextjs.org)

![Tracksy Dashboard](./public/screenshots/dashboard.png)

---

## Why Tracksy exists

Job searches mean tracking dozens of applications across companies, recruiters, deadlines, and follow-ups. Spreadsheets break the moment you add a third tab. Notion is overkill and slow. Most "job tracker" apps are bloated CRMs designed for recruiters, not job seekers.

Tracksy is built for the person sending applications, not the person receiving them. It does four things well:

- ▸ Track applications with status pipelines (Applied → Screening → Interview → Offer)
- ▸ Send deadline reminders so you don't miss interview prep windows
- ▸ Show response analytics — actual data on which resumes get responses
- ▸ Export everything as CSV when you're done (your data, your call)

That's it. No CRM features. No team collaboration. No Slack integration.

---

## Features

### Application pipeline

A kanban-style board with five status columns. Drag cards between columns as your application progresses. Each card shows company, role, applied date, and next deadline at a glance.

### Smart reminders

Set a "next step" date when you log an application. Tracksy emails you 48 hours before any deadline (interview, follow-up, take-home submission). One email a day, batched — no notification spam.

### Response analytics

Real numbers on your search:

- Response rate by week (are you trending up or down?)
- Average time from applied → first response
- Conversion rate at each stage (applied → screen → interview → offer)
- Which application sources convert best (LinkedIn vs referral vs direct)

### Notes & artifacts

Per-application notes for interview prep, recruiter contacts, salary discussions. Markdown-supported. Searchable across the whole pipeline.

### CSV import / export

Already tracking in Google Sheets? Drop in your CSV. Switching tools later? Export everything in one click. Your data is yours.

### Authentication

Email + Google OAuth via Clerk. No password resets, no account recovery emails to manage.

---

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | Next.js 15 (App Router, React Server Components) |
| Language     | TypeScript                                    |
| Database     | PostgreSQL (Neon)                             |
| ORM          | Drizzle ORM                                   |
| Auth         | Clerk                                         |
| Styling      | Tailwind CSS v4 + shadcn/ui                   |
| Email        | Resend                                        |
| Cron         | Vercel Cron                                   |
| Deployment   | Vercel                                        |
| Analytics    | Plausible                                     |

---

## Project Structure

```
tracksy/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── applications/
│   │   │   ├── page.tsx              # Pipeline view (kanban)
│   │   │   ├── [id]/page.tsx         # Application detail
│   │   │   └── new/page.tsx          # Add new application
│   │   ├── analytics/page.tsx        # Response rate dashboard
│   │   ├── settings/page.tsx
│   │   └── layout.tsx                # Dashboard shell
│   ├── api/
│   │   ├── applications/
│   │   │   ├── route.ts              # GET/POST applications
│   │   │   └── [id]/route.ts         # PATCH/DELETE application
│   │   ├── import/route.ts           # CSV import handler
│   │   ├── export/route.ts           # CSV export handler
│   │   └── cron/reminders/route.ts   # Daily reminder dispatcher
│   ├── page.tsx                      # Marketing landing page
│   └── layout.tsx
│
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── kanban/
│   │   ├── board.tsx
│   │   ├── column.tsx
│   │   └── card.tsx
│   ├── analytics/
│   │   ├── response-chart.tsx
│   │   ├── funnel.tsx
│   │   └── stats-row.tsx
│   └── application-form.tsx
│
├── lib/
│   ├── db/
│   │   ├── index.ts                  # Drizzle client
│   │   └── schema.ts                 # Tables: applications, users, reminders
│   ├── email/
│   │   ├── client.ts                 # Resend wrapper
│   │   └── templates/
│   │       └── reminder.tsx          # React Email template
│   ├── auth.ts                       # Clerk helpers
│   ├── csv.ts                        # Parse/serialize logic
│   └── utils.ts
│
├── drizzle/
│   ├── 0000_initial.sql              # Generated migrations
│   └── meta/
│
├── public/
│   └── screenshots/
│
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** and `pnpm` (recommended) or `npm`
- **PostgreSQL database** — free tier on [Neon](https://neon.tech) is enough
- **Clerk account** — free tier works for development
- **Resend account** — free tier (3,000 emails/month) for reminders

### 1. Clone and install

```bash
git clone https://github.com/iamdainwi/tracksy.git
cd tracksy
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Database
DATABASE_URL=postgres://user:pass@host/db?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=reminders@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=generate-a-random-string-here
```

### 3. Run migrations

```bash
pnpm db:generate    # Generate SQL from schema.ts (only if you've changed schema)
pnpm db:migrate     # Apply migrations to your database
pnpm db:studio      # Optional: open Drizzle Studio at localhost:4983
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

Three core tables. Kept intentionally minimal.

```ts
// lib/db/schema.ts (excerpt)

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),           // Clerk user ID
  company: text('company').notNull(),
  role: text('role').notNull(),
  status: applicationStatus('status').notNull().default('applied'),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
  source: text('source'),                      // linkedin / referral / direct / etc
  jobUrl: text('job_url'),
  salary: text('salary'),
  notes: text('notes'),
  nextStepAt: timestamp('next_step_at'),       // Triggers reminders
  nextStepLabel: text('next_step_label'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reminders = pgTable('reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  scheduledFor: timestamp('scheduled_for').notNull(),
  sentAt: timestamp('sent_at'),
});

export const applicationStatus = pgEnum('application_status', [
  'applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted',
]);
```

Indexes on `(userId, status)` and `(scheduledFor) WHERE sentAt IS NULL` for the cron job.

---

## API Reference

All routes require authentication via Clerk session. Routes return JSON.

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/applications`         | List user's applications           |
| POST   | `/api/applications`         | Create application                 |
| GET    | `/api/applications/[id]`    | Get one application                |
| PATCH  | `/api/applications/[id]`    | Update application (status, notes) |
| DELETE | `/api/applications/[id]`    | Delete application                 |
| POST   | `/api/import`               | Bulk import from CSV               |
| GET    | `/api/export`               | Download CSV of all applications   |
| POST   | `/api/cron/reminders`       | Cron-only: dispatch reminders      |

### Example: Create application

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-session-token>" \
  -d '{
    "company": "Stripe",
    "role": "Software Engineer",
    "status": "applied",
    "source": "referral",
    "jobUrl": "https://stripe.com/jobs/listing/...",
    "nextStepAt": "2026-05-12T10:00:00Z",
    "nextStepLabel": "Phone screen"
  }'
```

---

## Reminder System

Reminders are sent by a Vercel Cron job that runs daily at 09:00 UTC.

```ts
// vercel.json
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 9 * * *" }
  ]
}
```

The handler at `/api/cron/reminders/route.ts`:

1. Authenticates via the `CRON_SECRET` header
2. Queries reminders where `scheduledFor <= now() + 48 hours` and `sentAt IS NULL`
3. Groups reminders by user (one email per user, even if they have 5 deadlines)
4. Renders a React Email template and sends via Resend
5. Marks reminders as sent

Failure handling: if Resend returns 4xx or 5xx, the reminder stays unsent and retries the next day. No exponential backoff — daily retry is fine for this use case.

---

## CSV Import / Export

### Import format

Tracksy accepts CSVs with these columns (case-insensitive, missing columns become null):

```csv
company,role,status,applied_at,source,job_url,salary,notes,next_step_at,next_step_label
Stripe,Software Engineer,interview,2026-04-15,referral,https://...,160000-200000,Phone screen with Sarah went well,2026-05-01,Onsite
```

Status values: `applied`, `screening`, `interview`, `offer`, `rejected`, `ghosted`.

### Export

`GET /api/export` returns the same format. Drop it into Google Sheets and it just works.

---

## Development

### Available scripts

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Run production build
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm db:generate      # Drizzle: generate SQL migrations from schema
pnpm db:migrate       # Drizzle: apply pending migrations
pnpm db:studio        # Drizzle Studio (DB browser)
pnpm test             # Run tests
```

### Code conventions

- Server Components by default; `'use client'` only for interactivity (drag-drop, forms with state)
- Server Actions for mutations from client components, plain API routes for everything else
- Drizzle queries always go through helpers in `lib/db/queries/` — never inline in components
- Tailwind: prefer composition over `@apply`. No custom CSS files except `globals.css`
- Comments are professional and terse. No tutorial-style explanations of obvious code

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import into Vercel
3. Add all env vars from `.env.local` to Vercel project settings
4. Set `CRON_SECRET` in Vercel as well (same value as production)
5. Deploy

The Vercel Cron config in `vercel.json` is picked up automatically on deploy.

### Self-hosted

Standard Next.js deployment. Run `pnpm build && pnpm start`. You'll need to set up your own cron (systemd timer, GitHub Actions scheduled workflow, or anything that hits `/api/cron/reminders` daily with the `CRON_SECRET` header).

---

## Roadmap

Planned for future releases. No promises on timing.

- [ ] Chrome extension to log applications from job board pages with one click
- [ ] AI-generated follow-up email drafts (using Groq)
- [ ] Email integration: forward recruiter emails to a Tracksy inbox to auto-log responses
- [ ] Referral tracker: log who referred you, automatic thank-you reminders
- [ ] Salary negotiation workspace per offer
- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar / iCal)

Not on the roadmap (intentionally):

- Team collaboration / shared boards (Tracksy is a personal tool)
- Recruiter-side features
- Job board / job recommendations (use LinkedIn for that)
- AI cover letter generator (already a thousand of those)

---

## FAQ

**Is my data safe?**
Your application data is stored in your own Postgres database (Neon free tier). Tracksy doesn't sell, share, or analyze your data. The only third party that sees your applications is whichever DB host you choose.

**Can I import from a Google Sheet?**
Yes — export your sheet as CSV, drop it into the import page, map columns, done. Format documented above.

**Does this work for non-tech jobs?**
Yes. Nothing in Tracksy is tech-specific. The status columns (Applied / Screening / Interview / Offer) apply to any white-collar job search.

**What happens to my data if I cancel?**
Free tier never cancels. If Pro is cancelled, you have 30 days to export. After that, data is hard-deleted from the database.

**Can I export everything?**
One click, full CSV, all fields. Your data, your call.

**Is there a Chrome extension?**
Not yet — on the roadmap.

---

## Contributing

This is currently a solo project, but issues and PRs are welcome.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make changes, run `pnpm lint && pnpm typecheck && pnpm test`
4. Commit with [Conventional Commits](https://www.conventionalcommits.org) format
5. Open a PR with a clear description of what and why

For larger changes, open an issue first to discuss.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Author

Built by [Dainwi Choudhary](https://dainwi.vercel.app) — got tired of losing track of applications during placement season, so built the tool I wished existed.

Found a bug? [Open an issue](https://github.com/iamdainwi/tracksy/issues). Have a question? [@iamdainwichoudhary](https://instagram.com/iamdainwichoudhary).
