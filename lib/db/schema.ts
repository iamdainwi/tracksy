import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'

export const applicationStatus = pgEnum('application_status', [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'ghosted',
])

export const applicationSource = pgEnum('application_source', [
  'linkedin',
  'referral',
  'direct',
  'job_board',
  'recruiter',
  'other',
])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    company: text('company').notNull(),
    role: text('role').notNull(),
    status: applicationStatus('status').notNull().default('applied'),
    appliedAt: timestamp('applied_at').notNull().defaultNow(),
    source: applicationSource('source'),
    jobUrl: text('job_url'),
    salary: text('salary'),
    location: text('location'),
    notes: text('notes'),
    nextStepAt: timestamp('next_step_at'),
    nextStepLabel: text('next_step_label'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('applications_user_status_idx').on(t.userId, t.status),
    index('applications_user_applied_idx').on(t.userId, t.appliedAt),
  ]
)

export const reminders = pgTable(
  'reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    applicationId: uuid('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    scheduledFor: timestamp('scheduled_for').notNull(),
    sentAt: timestamp('sent_at'),
  },
  (t) => [
    index('reminders_scheduled_idx').on(t.scheduledFor),
  ]
)

export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
export type ApplicationStatus = (typeof applicationStatus.enumValues)[number]
export type ApplicationSource = (typeof applicationSource.enumValues)[number]
export type Reminder = typeof reminders.$inferSelect
export type User = typeof users.$inferSelect
