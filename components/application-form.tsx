'use client'

import { useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Application } from '@/lib/db/schema'
import { format } from 'date-fns'

interface ApplicationFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Application>
  submitLabel?: string
}

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}

export function ApplicationForm({ action, defaultValues, submitLabel = 'Save' }: ApplicationFormProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData)
      router.back()
    })
  }

  const appliedAtDefault = defaultValues?.appliedAt
    ? format(new Date(defaultValues.appliedAt), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const nextStepAtDefault = defaultValues?.nextStepAt
    ? format(new Date(defaultValues.nextStepAt), "yyyy-MM-dd'T'HH:mm")
    : ''

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Company" name="company" required>
          <Input
            id="company"
            name="company"
            defaultValue={defaultValues?.company ?? ''}
            placeholder="e.g. Stripe"
            required
          />
        </Field>

        <Field label="Role" name="role" required>
          <Input
            id="role"
            name="role"
            defaultValue={defaultValues?.role ?? ''}
            placeholder="e.g. Software Engineer"
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Status" name="status">
          <Select name="status" defaultValue={defaultValues?.status ?? 'applied'}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="ghosted">Ghosted</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Source" name="source">
          <Select name="source" defaultValue={defaultValues?.source ?? ''}>
            <SelectTrigger id="source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="job_board">Job board</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Applied on" name="appliedAt">
          <Input
            id="appliedAt"
            name="appliedAt"
            type="datetime-local"
            defaultValue={appliedAtDefault}
          />
        </Field>

        <Field label="Location" name="location">
          <Input
            id="location"
            name="location"
            defaultValue={defaultValues?.location ?? ''}
            placeholder="e.g. Remote, San Francisco"
          />
        </Field>
      </div>

      <Field label="Job URL" name="jobUrl">
        <Input
          id="jobUrl"
          name="jobUrl"
          type="url"
          defaultValue={defaultValues?.jobUrl ?? ''}
          placeholder="https://..."
        />
      </Field>

      <Field label="Salary range" name="salary">
        <Input
          id="salary"
          name="salary"
          defaultValue={defaultValues?.salary ?? ''}
          placeholder="e.g. $120k–$160k"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Next step date" name="nextStepAt">
          <Input
            id="nextStepAt"
            name="nextStepAt"
            type="datetime-local"
            defaultValue={nextStepAtDefault}
          />
        </Field>

        <Field label="Next step label" name="nextStepLabel">
          <Input
            id="nextStepLabel"
            name="nextStepLabel"
            defaultValue={defaultValues?.nextStepLabel ?? ''}
            placeholder="e.g. Phone screen"
          />
        </Field>
      </div>

      <Field label="Notes" name="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ''}
          placeholder="Interview prep, recruiter contact, salary notes…"
          rows={5}
          className="resize-none"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
