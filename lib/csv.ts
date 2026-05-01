import Papa from 'papaparse'
import type { NewApplication, ApplicationStatus, ApplicationSource } from './db/schema'

const STATUS_VALUES = new Set(['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted'])
const SOURCE_VALUES = new Set(['linkedin', 'referral', 'direct', 'job_board', 'recruiter', 'other'])

function normalizeStatus(raw: string): ApplicationStatus {
  const v = raw.toLowerCase().trim()
  return STATUS_VALUES.has(v) ? (v as ApplicationStatus) : 'applied'
}

function normalizeSource(raw: string): ApplicationSource | null {
  const v = raw.toLowerCase().trim().replace(/\s+/g, '_')
  return SOURCE_VALUES.has(v) ? (v as ApplicationSource) : null
}

function normalizeDate(raw: string): Date | null {
  if (!raw) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

type RawRow = Record<string, string>

export function parseCSV(
  csv: string,
  userId: string
): Omit<NewApplication, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { data } = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.toLowerCase().trim().replace(/\s+/g, '_'),
  })

  return data.flatMap((row) => {
    const company = (row.company ?? '').trim()
    const role = (row.role ?? '').trim()
    if (!company || !role) return []

    return [
      {
        userId,
        company,
        role,
        status: normalizeStatus(row.status ?? ''),
        source: normalizeSource(row.source ?? ''),
        jobUrl: row.job_url ?? row.joburl ?? null,
        salary: row.salary ?? null,
        location: row.location ?? null,
        notes: row.notes ?? null,
        appliedAt: normalizeDate(row.applied_at ?? row.appliedat ?? row.date ?? '') ?? new Date(),
        nextStepAt: normalizeDate(row.next_step_at ?? row.nextstepat ?? ''),
        nextStepLabel: row.next_step_label ?? row.nextsteplabel ?? null,
      },
    ]
  })
}

export function serializeCSV(
  rows: {
    company: string
    role: string
    status: string
    appliedAt: Date
    source: string | null
    jobUrl: string | null
    salary: string | null
    location: string | null
    notes: string | null
    nextStepAt: Date | null
    nextStepLabel: string | null
  }[]
): string {
  return Papa.unparse(
    rows.map((r) => ({
      company: r.company,
      role: r.role,
      status: r.status,
      applied_at: r.appliedAt.toISOString(),
      source: r.source ?? '',
      job_url: r.jobUrl ?? '',
      salary: r.salary ?? '',
      location: r.location ?? '',
      notes: r.notes ?? '',
      next_step_at: r.nextStepAt?.toISOString() ?? '',
      next_step_label: r.nextStepLabel ?? '',
    }))
  )
}
