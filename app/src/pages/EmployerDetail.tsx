import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, ExternalLink, Mail, Phone, TrendingUp } from 'lucide-react'
import { useMe, useSchoolData, useStore } from '../data/store'
import { LEVELS, STAGES, levelOfStage } from '../data/ladder'
import type { ActivityType, Stage } from '../data/types'
import { relDate, shortDate } from '../lib/format'
import { Avatar, Empty, Section, StageChip, copyText, useToast } from '../components/ui'
import { PaperworkChecklist } from '../components/Paperwork'
import { inviteUrl } from '../tools/shared'

const ACT_ICON: Record<ActivityType, string> = {
  email: '✉️', text: '💬', call: '📞', meeting: '🤝', event: '🎪', thankyou: '💚', proposal: '📄', levelup: '⬆️', note: '📝', signup: '✅',
}

export function EmployerDetail() {
  const { id = '' } = useParams()
  const { state, setStage, updateEmployer, addHelper, logActivity } = useStore()
  const me = useMe()
  const { staff } = useSchoolData()
  const { toast, toastNode } = useToast()
  const e = state.employers.find((x) => x.id === id)
  const [logType, setLogType] = useState<ActivityType>('call')
  const [logText, setLogText] = useState('')
  if (!e) return <Empty>Employer not found. <Link to="/pipeline" className="underline">Back to pipeline</Link></Empty>

  const owner = state.staff.find((s) => s.id === e.ownerId)!
  const helpers = e.helperIds.map((h) => state.staff.find((s) => s.id === h)!).filter(Boolean)
  const acts = state.activities.filter((a) => a.employerId === e.id).sort((a, b) => b.date.localeCompare(a.date))
  const notes = state.thankYous.filter((t) => t.employerId === e.id)
  const opps = state.opportunities.filter((o) => o.employerId === e.id)
  const level = levelOfStage(e.stage)
  const reached = Math.max(0, ...e.levelHistory.map((r) => r.level))
  const isCoord = state.role === 'coordinator'

  return (
    <div className="space-y-5">
      <Link to="/pipeline" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft size={14} /> Pipeline
      </Link>
      <header className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="h-display text-2xl">{e.name}</h1>
            <StageChip stage={e.stage} />
          </div>
          <p className="text-sm text-stone-600">
            {e.sector} · {e.city} · Source: {e.source === 'student' ? 'student-sourced' : e.source}
          </p>
          <p className="mt-1 text-sm text-stone-500">Connection: {e.relationship || '—'}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <label className="flex items-center gap-2 text-sm">
            Stage
            <select className="input !w-auto" value={e.stage} onChange={(x) => setStage(e.id, x.target.value as Stage, me.id)}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1.5 text-xs" onClick={async () => toast((await copyText(inviteUrl(e.token))) ? 'Invite link copied' : 'Copy not available')}>
              <Copy size={14} /> Copy invite link
            </button>
            <a className="btn-secondary !py-1.5 text-xs" href={`/e/${e.token}`} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Their page
            </a>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <Section title="Contact">
            <p className="font-medium">{e.contactName}</p>
            <p className="text-sm text-stone-500">{e.contactTitle}</p>
            {e.contactEmail && <p className="mt-2 flex items-center gap-2 text-sm"><Mail size={14} /> {e.contactEmail}</p>}
            {e.contactPhone && <p className="flex items-center gap-2 text-sm"><Phone size={14} /> {e.contactPhone}</p>}
          </Section>

          <Section title="Relationship owner">
            <div className="flex items-center gap-3">
              <Avatar person={owner} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{owner.name}</p>
                <p className="text-xs text-stone-500">{owner.title}</p>
              </div>
            </div>
            {isCoord && (
              <label className="mt-3 block text-xs text-stone-600">
                Reassign (e.g. if someone leaves)
                <select className="input mt-1" value={e.ownerId} onChange={(x) => (updateEmployer(e.id, { ownerId: x.target.value, helperIds: e.helperIds.filter((h) => h !== x.target.value) }), toast('Owner updated'))}>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            )}
            <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Helpers</p>
            <div className="flex flex-wrap gap-2">
              {helpers.map((h) => (
                <span key={h.id} className="flex items-center gap-1.5 rounded-full bg-stone-100 py-0.5 pl-0.5 pr-2 text-xs">
                  <Avatar person={h} size="sm" /> {h.name}
                </span>
              ))}
              <select className="rounded-full border border-dashed border-stone-300 bg-white px-2 py-0.5 text-xs text-stone-600" value="" onChange={(x) => x.target.value && addHelper(e.id, x.target.value)} aria-label="Add helper">
                <option value="">+ Add helper</option>
                {staff.filter((s) => s.id !== e.ownerId && !e.helperIds.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </Section>

          <Section title="Engagement ladder">
            <ol className="space-y-2">
              {[...LEVELS].reverse().map((r) => {
                const hit = e.levelHistory.find((h) => h.level === r.level)
                const current = r.level === level
                return (
                  <li key={r.level} className={`flex items-center gap-3 rounded-lg p-2 ${current ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${r.level <= reached ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-400'}`}>{r.level}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{r.name}</span>
                      <span className="block text-xs text-stone-500">{hit ? `Reached ${shortDate(hit.date)}` : r.continuum}</span>
                    </span>
                    {current && <span className="chip bg-brand-700 text-white">Now</span>}
                  </li>
                )
              })}
            </ol>
            {level >= 1 && level < 5 && (
              <Link to={`/journey/s6?employer=${e.id}`} className="btn-primary mt-3 w-full justify-center">
                <TrendingUp size={16} /> Invite to Level {level + 1}
              </Link>
            )}
          </Section>

          <Section title="Notes">
            <textarea className="input min-h-24" defaultValue={e.notes} key={e.id} onBlur={(x) => x.target.value !== e.notes && (updateEmployer(e.id, { notes: x.target.value }), toast('Notes saved'))} placeholder="What do you know about them? What do they care about?" />
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Activity timeline">
            <form
              className="mb-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(x) => {
                x.preventDefault()
                if (!logText.trim()) return
                logActivity(e.id, logType, me.id, logText.trim())
                setLogText('')
                toast('Touchpoint logged')
              }}
            >
              <select className="input sm:!w-36" value={logType} onChange={(x) => setLogType(x.target.value as ActivityType)} aria-label="Touchpoint type">
                <option value="call">📞 Call</option>
                <option value="email">✉️ Email</option>
                <option value="text">💬 Text</option>
                <option value="meeting">🤝 Meeting</option>
                <option value="thankyou">💚 Thank-you</option>
                <option value="note">📝 Note</option>
              </select>
              <input className="input flex-1" value={logText} onChange={(x) => setLogText(x.target.value)} placeholder="What happened?" aria-label="Touchpoint details" />
              <button className="btn-primary justify-center">Log</button>
            </form>
            {acts.length === 0 ? (
              <Empty>No activity yet.</Empty>
            ) : (
              <ol className="relative space-y-3 border-l border-stone-200 pl-5">
                {acts.map((a) => {
                  const by = a.byId ? state.staff.find((s) => s.id === a.byId) : null
                  return (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs ring-1 ring-stone-200">{ACT_ICON[a.type]}</span>
                      <p className="text-sm text-stone-800">{a.text}</p>
                      <p className="text-xs text-stone-500">
                        {relDate(a.date)}
                        {by && ` · ${by.name}`}
                      </p>
                    </li>
                  )
                })}
              </ol>
            )}
          </Section>

          {level >= 1 && (
            <Section title={`Paperwork for Level ${level}`}>
              <PaperworkChecklist employer={e} level={level} />
            </Section>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Section title="Student thank-yous">
              {notes.length === 0 ? (
                <p className="text-sm text-stone-500">
                  None yet. <Link className="text-brand-700 underline" to={`/journey/s5?tab=thanks&employer=${e.id}`}>Add one</Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((t) => (
                    <li key={t.id} className="rounded-lg bg-warm-50 p-3 text-sm">
                      “{t.text}” <span className="block text-xs text-stone-500">{t.student}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title="Opportunities">
              {opps.length === 0 ? (
                <p className="text-sm text-stone-500">None yet.</p>
              ) : (
                <ul className="space-y-2">
                  {opps.map((o) => (
                    <li key={o.id} className="text-sm">
                      <span className="font-medium">{o.title}</span>
                      <span className="block text-xs text-stone-500">
                        Level {o.level} · {o.slots} slots · {o.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </div>
      </div>
      {toastNode}
    </div>
  )
}
