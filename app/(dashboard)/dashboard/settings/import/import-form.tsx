'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ImportForm() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/import', { method: 'POST', body: formData })
    const json = await res.json()

    if (!res.ok) {
      setStatus('error')
      setMessage(json.error ?? 'Import failed')
      return
    }

    setStatus('done')
    setMessage(`Imported ${json.inserted} application${json.inserted !== 1 ? 's' : ''}.`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          id="csv-file"
          required
          onChange={() => setStatus('idle')}
        />
        <label
          htmlFor="csv-file"
          className="block cursor-pointer text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <span className="block font-medium mb-1">Click to choose a CSV file</span>
          <span className="text-xs">or drag and drop</span>
        </label>
        {inputRef.current?.files?.[0] && (
          <p className="mt-3 text-xs font-mono text-zinc-500">{inputRef.current.files[0].name}</p>
        )}
      </div>

      {status === 'done' && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      )}

      <Button type="submit" disabled={status === 'uploading'}>
        {status === 'uploading' ? 'Importing…' : 'Import'}
      </Button>
    </form>
  )
}
