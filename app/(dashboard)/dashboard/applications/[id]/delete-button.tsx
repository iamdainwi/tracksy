'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteApplicationAction } from '../actions'

export function DeleteApplicationButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('Delete this application? This cannot be undone.')) return
    startTransition(async () => {
      await deleteApplicationAction(id)
      router.push('/dashboard/applications')
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
