import { Link } from 'react-router-dom'
import { ArrowUpRight, Lock, TrendingUp } from 'lucide-react'
import { useMe, useProfile, useSchool, useStore } from '../data/store'
import { STAGES, levelOfStage, stageInfo } from '../data/ladder'
import type { AppState } from '../data/types'
import { daysSince, relDate, semesterLabel, semesterStart } from '../lib/format'
import { STEPS } from '../lib/content'
import { Avatar, Section } from '../components/ui'

const SOURCE_LABEL: Record<string, string> = { staff: 'Staff networks', student: 'Students', explorer: 'Industry explorer', inbound: 'Inbound' }

export function schoolStats(state: AppState, schoolId: string) {
  const emps = state.employers.filter((e) => e.schoolId === schoolId)
  const start = semesterStart().toISOString()
  const levelUps = emps.flatMap((e) => e.levelHistory.filter((r) => r.date >= start).map((r) => ({ employer: e, ...r }))).sort((a, b) => b.date.localeCompare(a.date))
  const byStage = STAGES.map((s) => ({ ...s, count: emps.filter((e) => e.stage === s.id).length }))
  const bySource = Object.keys(SOURCE_LABEL).map((k) => ({ id: k, label: SOURCE_LABEL[k], count: emps.filter((e) => e.source === k).length }))
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    const key = d.toISOString().slice(0, 7)
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), count: emps.flatMap((e) => e.levelHistory).filter((r) => r.date.slice(0, 7) === key).length }
  })
  const engaged = emps.filter((e) => levelOfStage(e.stage) >= 1)
  const avgDays = engaged.length ? Math.round(engaged.reduce((s, e) => s + daysSince(e.stageSince), 0) / engaged.length) : 0
  const deep = emps.filter((e) => levelOfStage(e.stage) >= 3).length
  return { emps, levelUps, byStage, bySource, months, engaged: engaged.length, avgDays, deep, level5: emps.filter((e) => e.stage === 'level5').length }
}

function HBars({ rows, unit = '' }: { rows: { label: string; count: number; dot?: string }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[130px_1fr_32px] items-center gap-2 text-sm" title={`${r.label}: ${r.count}${unit}`}>
          <span className="flex items-center gap-1.5 truncate text-stone-600">
            {r.dot && <span className={`h-2 w-2 shrink-0 rounded-full ${r.dot}`} />}
            {r.label}
          </span>
          <span className="h-3 rounded-r bg-stone-100">
            <span className="block h-full rounded-r bg-brand-600 transition-all" style={{ width: `${(r.count / max) * 100}%` }} />
          </span>
          <span className="text-right font-medium tabular-nums text-stone-800">{r.count}</span>
        </li>
      ))}
    </ul>
  )
}

function Columns({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div>
      <div className="flex h-36 items-end gap-2 border-b border-stone-200">
        {rows.map((r) => (
          <div key={r.label} className="group relative flex h-full flex-1 flex-col justify-end" title={`${r.label}: ${r.count} level-ups`}>
            <span className="mb-1 text-center text-xs font-medium tabular-nums text-stone-700">{r.count || ''}</span>
            <span className="mx-auto block w-full max-w-10 rounded-t bg-brand-600 group-hover:bg-brand-700" style={{ height: `${(r.count / max) * 80}%`, minHeight: r.count ? 4 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {rows.map((r) => (
          <span key={r.label} className="flex-1 text-center text-xs text-stone-500">
            {r.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Tile({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">{value}</p>
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  )
}

export function Dashboard() {
  const { state } = useStore()
  const school = useSchool()
  const me = useMe()
  const s = schoolStats(state, state.schoolId)
  const staff = state.staff.filter((x) => x.schoolId === state.schoolId)
  const profile = useProfile()
  const focusPartners = s.emps.filter((e) => profile.focusSectors.includes(e.sector) && levelOfStage(e.stage) >= 1).length

  return (
    <div className="space-y-5">
      <header>
        <h1 className="h-display text-2xl">{school.name} dashboard</h1>
        <p className="text-sm text-stone-600">{semesterLabel()} semester · north star: employers moving up the ladder</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
            <p className="flex items-center gap-1.5 text-sm text-brand-100">
              <TrendingUp size={16} /> Employers who moved up a level this semester
            </p>
            <p className="h-display mt-1 text-6xl tabular-nums">{new Set(s.levelUps.map((r) => r.employer.id)).size}</p>
            <p className="text-sm text-brand-100">{s.levelUps.length} level-ups in total since {semesterStart().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          </div>
          <ul className="max-h-56 divide-y divide-stone-100 overflow-y-auto">
            {s.levelUps.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-2 px-5 py-2 text-sm">
                <Link to={`/employers/${r.employer.id}`} className="truncate font-medium hover:text-brand-700">
                  {r.employer.name}
                </Link>
                <span className="flex shrink-0 items-center gap-2 text-xs text-stone-500">
                  <span className={`chip ${stageInfo(`level${r.level}` as never).color}`}>Level {r.level}</span> {relDate(r.date)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <Section title="Level-ups by month">
          <Columns rows={s.months} />
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Tile label="Active partners (Level 1+)" value={s.engaged} />
        <Tile label="Active in focus industries" value={profile.focusSectors.length ? focusPartners : '–'} hint={profile.focusSectors.length ? profile.focusSectors.join(', ') : 'Set in school profile'} />
        <Tile label="Hosting students (Level 3+)" value={s.deep} />
        <Tile label="Formal placements (Level 5)" value={s.level5} hint="internships & apprenticeships" />
        <Tile label="Avg days on current level" value={s.avgDays} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Pipeline by stage">
          <HBars rows={s.byStage.map((x) => ({ label: x.short, count: x.count, dot: x.dot }))} />
        </Section>
        <Section title="Where leads come from">
          <HBars rows={s.bySource.map((x) => ({ label: x.label, count: x.count }))} />
          <p className="mt-3 text-xs text-stone-500">Student-sourced leads count as a source so you can see the value of student networks.</p>
        </Section>
      </div>

      <Section title="Team">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="py-2 font-medium">Staff</th>
                <th className="py-2 text-right font-medium">Owns</th>
                <th className="py-2 text-right font-medium">Level-ups</th>
                <th className="py-2 pl-4 font-medium">Journey progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staff.map((p) => {
                const owned = s.emps.filter((e) => e.ownerId === p.id)
                const ups = s.levelUps.filter((r) => r.employer.ownerId === p.id).length
                const prog = p.id === me.id ? state.journey.completed.length : state.teamProgress[p.id] ?? 0
                return (
                  <tr key={p.id}>
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <Avatar person={p} size="sm" /> {p.name}
                        <span className="hidden text-xs text-stone-400 sm:inline">{p.title}</span>
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{owned.length}</td>
                    <td className="py-2 text-right tabular-nums">{ups}</td>
                    <td className="py-2 pl-4">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-24 rounded-full bg-stone-200">
                          <span className="block h-full rounded-full bg-brand-600" style={{ width: `${(prog / STEPS.length) * 100}%` }} />
                        </span>
                        <span className="text-xs text-stone-500">
                          {prog}/{STEPS.length}
                        </span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

export function District() {
  const { state } = useStore()
  const district = state.districts[0]
  const rows = state.schools.map((sc) => ({ school: sc, s: schoolStats(state, sc.id) }))
  const total = (f: (s: ReturnType<typeof schoolStats>) => number) => rows.reduce((t, r) => t + f(r.s), 0)
  const movers = (s: ReturnType<typeof schoolStats>) => new Set(s.levelUps.map((r) => r.employer.id)).size

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-700">District view</p>
          <h1 className="h-display text-2xl">{district.name}</h1>
          <p className="text-sm text-stone-600">{semesterLabel()} · work-based learning partnerships across {rows.length} high schools</p>
        </div>
        <p className="flex max-w-sm items-start gap-2 rounded-lg bg-stone-100 p-3 text-xs text-stone-600">
          <Lock size={14} className="mt-0.5 shrink-0" />
          Schools own their employer relationships. The district sees totals only, never employer names, contacts or notes.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card col-span-2 bg-brand-700 p-5 text-white md:col-span-1">
          <p className="text-xs text-brand-100">Employers moving up a level this semester</p>
          <p className="h-display text-5xl tabular-nums">{total(movers)}</p>
        </div>
        <Tile label="Active partners (Level 1+)" value={total((s) => s.engaged)} />
        <Tile label="Hosting students (Level 3+)" value={total((s) => s.deep)} />
        <Tile label="Formal placements (Level 5)" value={total((s) => s.level5)} />
      </div>

      <Section title="By school">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="py-2 font-medium">School</th>
                <th className="py-2 text-right font-medium">Moved up</th>
                {STAGES.map((st) => (
                  <th key={st.id} className="py-2 text-right font-medium">
                    {st.short}
                  </th>
                ))}
                <th className="py-2 text-right font-medium">Student-sourced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(({ school, s }) => (
                <tr key={school.id}>
                  <td className="py-2.5 font-medium">{school.name}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums text-brand-700">
                    {movers(s)} <ArrowUpRight size={12} className="inline" />
                  </td>
                  {s.byStage.map((st) => (
                    <td key={st.id} className="py-2.5 text-right tabular-nums text-stone-700">
                      {st.count}
                    </td>
                  ))}
                  <td className="py-2.5 text-right tabular-nums">{s.bySource.find((x) => x.id === 'student')!.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-5 md:grid-cols-3">
        {rows.map(({ school, s }) => (
          <Section key={school.id} title={school.name}>
            <p className="mb-2 text-xs text-stone-500">Level-ups by month</p>
            <Columns rows={s.months} />
          </Section>
        ))}
      </div>
    </div>
  )
}
