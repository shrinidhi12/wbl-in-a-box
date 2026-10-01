import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Search } from 'lucide-react'
import { useMe, useSchoolData, useStore } from '../data/store'
import { STAGES, activityById } from '../data/ladder'
import type { Stage } from '../data/types'
import { computeNudges } from '../lib/nudges'
import { daysSince, relDate, shortDate } from '../lib/format'
import { STEPS } from '../lib/content'
import { NudgeList } from '../components/NudgeList'
import { Avatar, Section, Tabs } from '../components/ui'

export function Today() {
  const { state } = useStore()
  const me = useMe()
  const [scope, setScope] = useState<'mine' | 'school'>('mine')
  const mine = computeNudges(state, state.schoolId, me.id)
  const all = computeNudges(state, state.schoolId)
  const upcoming = state.events.filter((e) => e.schoolId === state.schoolId && !e.happened).sort((a, b) => a.date.localeCompare(b.date))
  const nextStep = STEPS.find((s) => !state.journey.completed.includes(s.id))
  const hour = new Date().getHours()

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <header>
          <h1 className="h-display text-2xl sm:text-3xl">
            Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {me.name.split(' ')[0]}
          </h1>
          <p className="text-stone-600">
            {mine.length ? `${mine.length} thing${mine.length > 1 ? 's' : ''} to keep your relationships warm today.` : 'Nothing urgent. A great day to reach out to someone new.'}
          </p>
        </header>
        <Section
          title="Your touchpoints"
          action={
            state.role === 'coordinator' ? (
              <div className="-mb-4">
                <Tabs value={scope} onChange={setScope} tabs={[{ id: 'mine', label: `Mine (${mine.length})` }, { id: 'school', label: `Whole school (${all.length})` }]} />
              </div>
            ) : undefined
          }
        >
          <NudgeList nudges={scope === 'mine' ? mine : all} showOwner={scope === 'school'} />
          <p className="mt-3 text-xs text-stone-500">Nudges are reminders for you. Nothing is ever sent to employers automatically.</p>
        </Section>
      </div>
      <aside className="space-y-5">
        {nextStep && (
          <Link to={`/journey/${nextStep.id}`} className="card block bg-brand-50 p-5 hover:shadow-md">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <BookOpen size={14} /> Continue your journey
            </p>
            <p className="mt-1 font-semibold text-stone-900">
              {nextStep.number}: {nextStep.title}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {state.journey.completed.length} of {STEPS.length} steps done <ArrowRight size={14} className="inline" />
            </p>
          </Link>
        )}
        <Section title="Upcoming events">
          {upcoming.length === 0 ? (
            <p className="text-sm text-stone-500">
              None scheduled. <Link className="text-brand-700 underline" to="/journey/s4">Plan one</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-stone-100 text-xs leading-tight">
                    <CalendarDays size={14} className="text-stone-500" />
                    {shortDate(e.date)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">
                      {activityById(e.activityId)?.emoji} {e.title}
                    </span>
                    <span className="text-xs text-stone-500">
                      {relDate(e.date)} · {e.employerIds.length} employer{e.employerIds.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </aside>
    </div>
  )
}

export function Pipeline() {
  const { state, setStage } = useStore()
  const me = useMe()
  const { employers } = useSchoolData()
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const [q, setQ] = useState('')
  const staff = (id: string) => state.staff.find((s) => s.id === id)!

  const list = useMemo(
    () =>
      employers.filter(
        (e) => (scope === 'all' || e.ownerId === me.id || e.helperIds.includes(me.id)) && (!q || `${e.name} ${e.contactName} ${e.sector}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [employers, scope, q, me.id],
  )
  const order = STAGES.map((s) => s.id)
  const move = (id: string, from: Stage, dir: -1 | 1) => {
    const main: Stage[] = order.filter((s) => s !== 'notnow')
    const i = main.indexOf(from)
    const to = from === 'notnow' ? 'lead' : main[Math.max(0, Math.min(main.length - 1, i + dir))]
    if (to !== from) setStage(id, to, me.id)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-display text-2xl">Employer pipeline</h1>
          <p className="text-sm text-stone-600">Every employer, from first lead to internship partner. Use the arrows to move a card.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input className="input !w-56 !pl-8" placeholder="Search employers" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search employers" />
          </label>
          <div className="-mb-4">
            <Tabs value={scope} onChange={setScope} tabs={[{ id: 'all', label: 'Whole school' }, { id: 'mine', label: 'Mine' }]} />
          </div>
        </div>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-4">
        <div className="flex min-w-max gap-3">
          {STAGES.map((s) => {
            const col = list.filter((e) => e.stage === s.id)
            return (
              <section key={s.id} className="w-64 shrink-0 rounded-xl bg-stone-100 p-2" aria-label={s.label}>
                <h2 className="flex items-center justify-between px-1.5 py-1 text-sm font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                  </span>
                  <span className="text-xs font-normal text-stone-500">{col.length}</span>
                </h2>
                <ul className="mt-1 space-y-2">
                  {col.map((e) => {
                    const owner = staff(e.ownerId)
                    const d = daysSince(e.stageSince)
                    return (
                      <li key={e.id} className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
                        <Link to={`/employers/${e.id}`} className="block font-medium text-stone-900 hover:text-brand-700">
                          {e.name}
                        </Link>
                        <p className="truncate text-xs text-stone-500">
                          {e.contactName} · {e.sector}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-stone-500" title={`Owner: ${owner.name}`}>
                            <Avatar person={owner} size="sm" />
                            {d}d
                            {e.source === 'student' && <span className="chip bg-warm-50 !px-1.5 text-warm-700">student</span>}
                            {e.helperIds.length > 0 && <span>+{e.helperIds.length}</span>}
                          </span>
                          <span className="flex gap-0.5">
                            <button className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30" disabled={e.stage === 'lead'} onClick={() => move(e.id, e.stage, -1)} aria-label={`Move ${e.name} back`}>
                              <ArrowLeft size={14} />
                            </button>
                            <button className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30" disabled={e.stage === 'level5'} onClick={() => move(e.id, e.stage, 1)} aria-label={`Move ${e.name} forward`}>
                              <ArrowRight size={14} />
                            </button>
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
