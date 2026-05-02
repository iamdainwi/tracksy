'use client'

import { useState, useTransition, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Delete02Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import {
  addChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
} from './checklist-actions'
import type { ChecklistItem } from '@/lib/db/schema'

interface PrepChecklistProps {
  applicationId: string
  initialItems: ChecklistItem[]
}

export function PrepChecklist({ applicationId, initialItems }: PrepChecklistProps) {
  const [items, setItems] = useState(initialItems)
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const done = items.filter((i) => i.done).length
  const total = items.length

  function handleToggle(item: ChecklistItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i))
    )
    startTransition(() =>
      toggleChecklistItemAction(item.id, applicationId, !item.done)
    )
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    startTransition(() => deleteChecklistItemAction(id, applicationId))
  }

  async function handleAdd() {
    const text = newText.trim()
    if (!text) return
    const optimistic: ChecklistItem = {
      id: `temp-${Date.now()}`,
      applicationId,
      text,
      done: false,
      position: items.length,
      createdAt: new Date(),
    }
    setItems((prev) => [...prev, optimistic])
    setNewText('')
    setAdding(false)
    startTransition(() => addChecklistItemAction(applicationId, text))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') {
      setAdding(false)
      setNewText('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Prep checklist
          </p>
          {total > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground/60">
              {done}/{total}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setAdding(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={Add01Icon} size={12} strokeWidth={2} />
          Add item
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1 w-full rounded-full bg-muted mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 group rounded-md px-2 py-1.5 -mx-2 hover:bg-muted/50 transition-colors"
          >
            <button
              onClick={() => handleToggle(item)}
              className={cn(
                'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                item.done
                  ? 'bg-foreground border-foreground text-background'
                  : 'border-border hover:border-foreground/40'
              )}
              aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {item.done && <HugeiconsIcon icon={Tick01Icon} size={9} strokeWidth={3} />}
            </button>

            <span
              className={cn(
                'flex-1 text-sm leading-relaxed',
                item.done ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
            >
              {item.text}
            </span>

            <button
              onClick={() => handleDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              aria-label="Delete item"
            >
              <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
            </button>
          </div>
        ))}

        {adding && (
          <div className="flex items-center gap-3 rounded-md px-2 py-1.5 -mx-2 bg-muted/50">
            <div className="w-4 h-4 rounded border border-border shrink-0" />
            <input
              ref={inputRef}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newText.trim()) {
                  setAdding(false)
                } else {
                  handleAdd()
                }
              }}
              placeholder="Add a prep item…"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        )}

        {total === 0 && !adding && (
          <button
            onClick={() => {
              setAdding(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className="w-full flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors border-2 border-dashed rounded-lg px-3 py-4 border-border/40 hover:border-border"
          >
            <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
            Add prep items — notes, questions, reminders for your next step
          </button>
        )}
      </div>
    </div>
  )
}
