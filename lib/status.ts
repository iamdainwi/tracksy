import type { ApplicationStatus } from './db/schema'

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; dot: string; ring: string }
> = {
  applied:   { label: 'Applied',   dot: 'bg-blue-500',    ring: 'ring-blue-500/20' },
  screening: { label: 'Screening', dot: 'bg-violet-500',  ring: 'ring-violet-500/20' },
  interview: { label: 'Interview', dot: 'bg-amber-500',   ring: 'ring-amber-500/20' },
  offer:     { label: 'Offer',     dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  rejected:  { label: 'Rejected',  dot: 'bg-muted-foreground/40', ring: 'ring-muted/20' },
  ghosted:   { label: 'Ghosted',   dot: 'bg-muted-foreground/20', ring: 'ring-muted/20' },
}

export const STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'ghosted',
]
