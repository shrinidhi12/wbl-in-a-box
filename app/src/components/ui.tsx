import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { stageInfo } from '../data/ladder'
import type { Staff, Stage } from '../data/types'
import { initials } from '../lib/format'
import { renderMarkdown } from '../lib/content'

export function Avatar({ person, size = 'md' }: { person: Pick<Staff, 'name' | 'color'>; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-xs'
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${person.color} ${s}`}>
      {initials(person.name)}
    </span>
  )
}

export function StageChip({ stage }: { stage: Stage }) {
  const s = stageInfo(stage)
  return <span className={`chip ${s.color}`}>{s.label}</span>
}

export function Markdown({ md, className = '' }: { md: string; className?: string }) {
  return (
    <div
      className={`prose prose-stone max-w-none prose-headings:font-semibold prose-a:text-brand-700 prose-blockquote:border-warm-500 prose-blockquote:bg-warm-50 prose-blockquote:py-1 prose-blockquote:not-italic prose-table:text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }}
    />
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 sm:p-8" onClick={onClose}>
      <div role="dialog" aria-modal aria-label={title} className={`card w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button className="btn-ghost !p-1.5" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2600)
    return () => clearTimeout(t)
  }, [msg])
  const node = msg ? (
    <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-lg">
      {msg}
    </div>
  ) : null
  return { toast: setMsg, toastNode: node }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">{children}</p>
}

export function Section({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-stone-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="tablist" className="mb-4 flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${value === t.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
