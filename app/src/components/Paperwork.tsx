import { AlertTriangle, ExternalLink } from 'lucide-react'
import { useStore } from '../data/store'
import type { Employer, PaperStatus } from '../data/types'
import { PAPER_STATUSES, STATE_CONFIG, WHO_LABEL, requirementsForLevel, sourceFor } from '../lib/paperwork'

export function Disclaimer() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="note">
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>
        <strong>Sample only. Have your district review. Not legal advice.</strong> {STATE_CONFIG.state} sample configuration, last reviewed {STATE_CONFIG.lastReviewed}.
      </span>
    </p>
  )
}

export function PaperworkChecklist({ employer, level, compact }: { employer: Employer; level: number; compact?: boolean }) {
  const { setPaperwork } = useStore()
  const reqs = requirementsForLevel(level)
  if (level < 1) return <p className="text-sm text-stone-500">No paperwork until their first engagement.</p>
  const received = reqs.filter((r) => ['received', 'not_needed'].includes(employer.paperwork[r.id] ?? 'needed')).length

  return (
    <div className="space-y-3">
      {!compact && <Disclaimer />}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-emerald-500" style={{ width: `${(received / Math.max(reqs.length, 1)) * 100}%` }} />
        </div>
        <span className="text-xs text-stone-600">
          {received}/{reqs.length} done for Level {level}
        </span>
      </div>
      <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
        {reqs.map((r) => {
          const status = (employer.paperwork[r.id] ?? 'needed') as PaperStatus
          const st = PAPER_STATUSES.find((s) => s.id === status)!
          const src = sourceFor(r)
          return (
            <li key={r.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900">
                  {r.title}
                  <span className="chip ml-2 bg-stone-100 text-stone-600">{WHO_LABEL[r.who]}</span>
                  {r.verify && <span className="chip ml-1 bg-amber-50 text-amber-800">Verify with district</span>}
                </p>
                {!compact && <p className="mt-0.5 text-xs text-stone-600">{r.description}</p>}
                {!compact && src && (
                  <p className="mt-0.5 text-xs text-stone-500">
                    Source:{' '}
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-brand-700 underline">
                        {src.label} <ExternalLink size={10} />
                      </a>
                    ) : (
                      src.label
                    )}
                  </p>
                )}
              </div>
              <select
                aria-label={`Status of ${r.title}`}
                className={`shrink-0 rounded-md border-0 px-2 py-1 text-xs font-medium ${st.cls}`}
                value={status}
                onChange={(e) => setPaperwork(employer.id, r.id, e.target.value as PaperStatus)}
              >
                {PAPER_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
