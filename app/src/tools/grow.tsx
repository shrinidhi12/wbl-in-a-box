import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarPlus, CheckCircle2, ExternalLink, Heart, PartyPopper, Plus, Send, Users } from 'lucide-react'
import { useMe, useSchool, useSchoolData, useStore } from '../data/store'
import { ACTIVITIES, LEVELS, activityById, levelOfStage, stageInfo } from '../data/ladder'
import type { Opportunity } from '../data/types'
import { computeNudges } from '../lib/nudges'
import { relDate, shortDate } from '../lib/format'
import { Empty, Tabs, useToast } from '../components/ui'
import { NudgeList } from '../components/NudgeList'
import { PaperworkChecklist } from '../components/Paperwork'
import { EmployerSelect } from './shared'

/* ---------- S4: Entry-point picker + event planner ---------- */

const Q_TIME = [
  { v: 1, label: 'An hour or two' },
  { v: 2, label: 'Half a day' },
  { v: 3, label: 'Something recurring' },
]
const Q_WHERE = [
  { v: 'school', label: 'Come to school' },
  { v: 'site', label: 'At their business' },
  { v: 'virtual', label: 'Virtual only' },
]
const Q_COMFORT = [
  { v: 1, label: 'New to teens' },
  { v: 2, label: 'Somewhat' },
  { v: 3, label: 'Very comfortable' },
]

function Choice<T extends string | number>({ label, options, value, onChange }: { label: string; options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button key={String(o.v)} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${value === o.v ? 'border-brand-600 bg-brand-700 text-white' : 'border-stone-300 text-stone-600 hover:bg-stone-50'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

const DEFAULT_CHECKLIST: Record<string, string[]> = {
  'career-fair': ['Book the space', 'Send employers parking + check-in info', 'Students research employers and prep questions', 'Name tags and table signs', 'Thank-you notes within 48 hours'],
  'guest-speaker': ['Confirm date with speaker', 'Send parking + check-in info', 'Students prepare 3 questions each', 'Thank-you notes within 48 hours'],
  default: ['Confirm date and format', 'Send logistics a week ahead', 'Prepare students', 'Thank-you within 48 hours'],
}

export function EntryPicker() {
  const { state, saveEvent, toggleEventCheck, markEventHappened } = useStore()
  const me = useMe()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const [time, setTime] = useState(1)
  const [where, setWhere] = useState('school')
  const [comfort, setComfort] = useState(1)
  const [planning, setPlanning] = useState<string | null>(null)

  const ranked = useMemo(() => {
    return ACTIVITIES.filter((a) => a.level <= 2)
      .map((a) => {
        let score = 3
        if (a.effort > time) score -= 2
        if (a.teenComfort > comfort) score -= 1.5
        if (where === 'virtual' && a.where !== 'virtual' && a.where !== 'either') score -= 2
        if (where === 'site' && a.where === 'school') score -= 1
        if (where === 'school' && a.where === 'virtual') score -= 0.5
        return { a, score }
      })
      .sort((x, y) => y.score - x.score)
  }, [time, where, comfort])

  const events = state.events.filter((e) => e.schoolId === state.schoolId).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <Choice label="1. How much time can they give?" options={Q_TIME} value={time} onChange={setTime} />
          <Choice label="2. Where would they prefer?" options={Q_WHERE} value={where} onChange={setWhere} />
          <Choice label="3. How comfortable are they with teens?" options={Q_COMFORT} value={comfort} onChange={setComfort} />
        </div>
        <ol className="space-y-2">
          {ranked.map(({ a, score }, i) => (
            <li key={a.id} className={`flex items-center gap-3 rounded-lg border p-3 ${i === 0 ? 'border-brand-600 bg-brand-50' : 'border-stone-200'} ${score < 1.5 ? 'opacity-60' : ''}`}>
              <span className="text-2xl" aria-hidden>{a.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {a.name} {i === 0 && <span className="chip ml-1 bg-brand-700 text-white">Best fit</span>}
                </p>
                <p className="text-xs text-stone-600">
                  ⏱ {a.time} · Students get: {a.studentsGet}
                </p>
              </div>
              <button className="btn-secondary shrink-0 !py-1 text-xs" onClick={() => setPlanning(a.id)}>
                <CalendarPlus size={14} /> Plan it
              </button>
            </li>
          ))}
        </ol>
      </div>

      {planning && (
        <EventPlanner
          activityId={planning}
          onCancel={() => setPlanning(null)}
          onSave={(ev) => {
            saveEvent(ev)
            setPlanning(null)
            toast('Event planned!')
          }}
          employers={employers}
        />
      )}

      <div>
        <h4 className="mb-2 font-semibold">Your events</h4>
        {events.length === 0 ? (
          <Empty>No events yet.</Empty>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {events.map((ev) => {
              const act = activityById(ev.activityId)
              const names = ev.employerIds.map((id) => state.employers.find((e) => e.id === id)?.name).filter(Boolean)
              return (
                <li key={ev.id} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {act?.emoji} {ev.title}
                      </p>
                      <p className="text-xs text-stone-500">
                        {shortDate(ev.date)} ({relDate(ev.date)}) · {ev.students} students
                      </p>
                    </div>
                    {ev.happened ? <span className="chip bg-emerald-50 text-emerald-800">Done</span> : <span className="chip bg-sky-50 text-sky-800">Upcoming</span>}
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    <Users size={13} className="mr-1 inline" />
                    {names.join(', ') || 'No employers yet'}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {ev.checklist.map((c, i) => (
                      <li key={i}>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="accent-brand-700" checked={c.done} onChange={() => toggleEventCheck(ev.id, i)} />
                          <span className={c.done ? 'text-stone-400 line-through' : ''}>{c.label}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  {!ev.happened && (
                    <button
                      className="btn-primary mt-3 !py-1.5 text-xs"
                      onClick={() => {
                        markEventHappened(ev.id, me.id)
                        toast(`🎉 ${names.length} employer${names.length === 1 ? '' : 's'} reached Level 1. Don't forget the thank-yous!`)
                      }}
                    >
                      <PartyPopper size={14} /> Mark as happened
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {toastNode}
    </div>
  )
}

function EventPlanner({ activityId, employers, onSave, onCancel }: { activityId: string; employers: ReturnType<typeof useSchoolData>['employers']; onSave: (ev: Parameters<ReturnType<typeof useStore>['saveEvent']>[0]) => void; onCancel: () => void }) {
  const { state } = useStore()
  const act = activityById(activityId)!
  const [title, setTitle] = useState(act.name)
  const [date, setDate] = useState(new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10))
  const [students, setStudents] = useState(act.id === 'career-fair' ? 150 : 30)
  const invitable = employers.filter((e) => ['lead', 'invited', 'level1', 'level2'].includes(e.stage))
  const [picked, setPicked] = useState<string[]>(invitable.filter((e) => e.stage === 'invited').map((e) => e.id).slice(0, 3))

  return (
    <form
      className="rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-5"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ schoolId: state.schoolId, title, activityId, date: new Date(date + 'T12:00').toISOString(), employerIds: picked, students, happened: false, checklist: (DEFAULT_CHECKLIST[activityId] ?? DEFAULT_CHECKLIST.default).map((label) => ({ label, done: false })) })
      }}
    >
      <h4 className="mb-3 font-semibold">
        {act.emoji} Plan: {act.name}
      </h4>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="label" htmlFor="ev-title">Title</label>
          <input id="ev-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ev-date">Date</label>
          <input id="ev-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ev-n">Students</label>
          <input id="ev-n" type="number" min={1} className="input" value={students} onChange={(e) => setStudents(Number(e.target.value))} />
        </div>
      </div>
      <fieldset className="mt-3">
        <legend className="label">Employers attending</legend>
        <div className="grid max-h-40 gap-1 overflow-y-auto rounded-lg border border-stone-200 bg-white p-2 sm:grid-cols-2">
          {invitable.map((e) => (
            <label key={e.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-brand-700" checked={picked.includes(e.id)} onChange={() => setPicked(picked.includes(e.id) ? picked.filter((x) => x !== e.id) : [...picked, e.id])} />
              {e.name} <span className="text-xs text-stone-400">{stageInfo(e.stage).short}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex gap-2">
        <button className="btn-primary">Save event</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ---------- S5: Cultivate ---------- */

const STUDENT_PREP = ['Research the business', 'Write 3 questions', 'Review dress and safety expectations', 'Plan thank-you notes']
const EMPLOYER_PREP = ['Share who is coming and what they are studying', 'Send agenda and logistics', 'Confirm a staff member is reachable', 'Agree on photo/media rules']

export function Cultivate() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'today' | 'thanks' | 'intros'>((params.get('tab') as 'thanks') ?? 'today')
  const { state, addThankYou, saveIntro, toggleIntroCheck } = useStore()
  const me = useMe()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const engaged = employers.filter((e) => levelOfStage(e.stage) >= 1)
  const [empId, setEmpId] = useState(params.get('employer') ?? engaged[0]?.id ?? '')
  const [student, setStudent] = useState('')
  const [note, setNote] = useState('')
  const [intro, setIntro] = useState({ employerId: engaged[0]?.id ?? '', group: 'Health Sciences, period 3', activity: 'Mock interviews', date: '' })

  useEffect(() => {
    const e = params.get('employer')
    if (e) setEmpId(e)
    const t = params.get('tab')
    if (t) setTab(t as 'thanks')
  }, [params])

  const nudges = computeNudges(state, state.schoolId)
  const emp = state.employers.find((e) => e.id === empId)
  const notes = state.thankYous.filter((t) => t.employerId === empId)
  const intros = state.intros.filter((i) => employers.some((e) => e.id === i.employerId))

  return (
    <div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'today', label: `Touchpoints due (${nudges.length})` },
          { id: 'thanks', label: 'Student thank-yous' },
          { id: 'intros', label: 'Introduction planner' },
        ]}
      />
      {tab === 'today' && (
        <div>
          <p className="mb-3 text-sm text-stone-600">Rule-based reminders for the whole school. Each staff member sees their own list on the Today page.</p>
          <NudgeList nudges={nudges} showOwner />
        </div>
      )}

      {tab === 'thanks' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!note.trim() || !emp) return
              addThankYou({ employerId: empId, student: student.trim() || 'A student', text: note.trim() }, me.id)
              setNote('')
              setStudent('')
              toast(`Added to ${emp.name}'s page`)
            }}
          >
            <EmployerSelect employers={engaged} value={empId} onChange={setEmpId} label="Thank-you for…" id="ty-emp" />
            <div>
              <label className="label" htmlFor="ty-st">Student (first name and grade only)</label>
              <input id="ty-st" className="input" value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Maya, grade 11" />
            </div>
            <div>
              <label className="label" htmlFor="ty-note">Their note</label>
              <textarea id="ty-note" className="input min-h-28" value={note} onChange={(e) => setNote(e.target.value)} placeholder="One thing I learned from you was…" />
              <p className="mt-1 text-xs text-stone-500">Tip: snap photos of handwritten cards and type a favorite line here.</p>
            </div>
            <button className="btn-primary">
              <Heart size={16} /> Add to their employer page
            </button>
          </form>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">What {emp?.contactName.split(' ')[0] ?? 'they'} will see</h4>
              {emp && (
                <a className="flex items-center gap-1 text-xs text-brand-700 underline" href={`/e/${emp.token}`} target="_blank" rel="noreferrer">
                  Open their page <ExternalLink size={12} />
                </a>
              )}
            </div>
            {notes.length === 0 ? (
              <Empty>No notes yet for this employer.</Empty>
            ) : (
              <ul className="space-y-2">
                {notes.map((t) => (
                  <li key={t.id} className="rounded-lg bg-warm-50 p-3 text-sm">
                    <p className="text-stone-800">“{t.text}”</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {t.student} · {relDate(t.date)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'intros' && (
        <div className="space-y-5">
          <form
            className="grid gap-3 rounded-lg border border-stone-200 p-4 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault()
              saveIntro({ ...intro, date: intro.date || new Date().toISOString().slice(0, 10), studentPrep: STUDENT_PREP.map((label) => ({ label, done: false })), employerPrep: EMPLOYER_PREP.map((label) => ({ label, done: false })) }, me.id)
              toast('Introduction planned')
            }}
          >
            <div className="lg:col-span-1">
              <EmployerSelect employers={engaged} value={intro.employerId} onChange={(v) => setIntro({ ...intro, employerId: v })} id="in-emp" />
            </div>
            <div>
              <label className="label" htmlFor="in-group">Student group</label>
              <input id="in-group" className="input" value={intro.group} onChange={(e) => setIntro({ ...intro, group: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="in-act">Activity</label>
              <select id="in-act" className="input" value={intro.activity} onChange={(e) => setIntro({ ...intro, activity: e.target.value })}>
                {ACTIVITIES.filter((a) => a.level >= 2 && a.level <= 4).map((a) => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="in-date">Date</label>
              <input id="in-date" type="date" className="input" value={intro.date} onChange={(e) => setIntro({ ...intro, date: e.target.value })} />
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full justify-center">
                <Plus size={16} /> Plan intro
              </button>
            </div>
          </form>
          <p className="text-xs text-stone-500">🛡️ Safety defaults: groups, not one-on-one; communication through school channels; a staff member is reachable throughout.</p>
          {intros.length === 0 ? (
            <Empty>No introductions planned yet.</Empty>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {intros.map((it) => {
                const e = state.employers.find((x) => x.id === it.employerId)
                return (
                  <li key={it.id} className="rounded-lg border border-stone-200 p-4">
                    <p className="font-medium">
                      {it.activity}: {e?.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {it.group} · {it.date}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {(['studentPrep', 'employerPrep'] as const).map((list) => (
                        <div key={list}>
                          <p className="mb-1 text-xs font-semibold uppercase text-stone-500">{list === 'studentPrep' ? 'Students' : 'Employer'}</p>
                          {it[list].map((c, i) => (
                            <label key={i} className="flex items-start gap-2 text-sm">
                              <input type="checkbox" className="mt-1 accent-brand-700" checked={c.done} onChange={() => toggleIntroCheck(it.id, list, i)} />
                              <span className={c.done ? 'text-stone-400 line-through' : ''}>{c.label}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
      {toastNode}
    </div>
  )
}

/* ---------- S6: Opportunity builder ---------- */

export function OpportunityBuilder() {
  const [params] = useSearchParams()
  const { state, saveOpportunity, proposeOpportunity, acceptOpportunity } = useStore()
  const me = useMe()
  const school = useSchool()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const engaged = employers.filter((e) => levelOfStage(e.stage) >= 1).sort((a, b) => levelOfStage(a.stage) - levelOfStage(b.stage))
  const [empId, setEmpId] = useState(params.get('employer') ?? engaged.find((e) => e.id === 'e-fra')?.id ?? engaged[0]?.id ?? '')
  const emp = state.employers.find((e) => e.id === empId)
  const currentLevel = emp ? levelOfStage(emp.stage) : 0
  const nextKinds = ACTIVITIES.filter((a) => a.level >= 3)
  const suggested = Math.min(5, Math.max(3, currentLevel + 1))
  const defaultKind = nextKinds.find((a) => a.level === suggested) ?? nextKinds[0]
  const [kind, setKind] = useState(defaultKind.id)
  const [oppId, setOppId] = useState<string | undefined>()
  const act = activityById(kind)!

  const [f, setF] = useState({ dates: '', slots: 4, supervisor: '', skills: '' })
  useEffect(() => {
    const e = params.get('employer')
    if (e) setEmpId(e)
  }, [params])
  useEffect(() => {
    setKind(defaultKind.id)
    setOppId(undefined)
    setF({ dates: '', slots: 4, supervisor: emp?.contactName ?? '', skills: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId])

  const title = `${act.name} at ${emp?.name ?? ''}`
  const description = emp
    ? `${f.slots} ${school.name} students will join ${emp.name} for a ${act.name.toLowerCase()} (${act.time.toLowerCase()})${f.dates ? ` on ${f.dates}` : ''}. ${f.supervisor || emp.contactName} will be their supervisor. Students will ${act.studentsGet.charAt(0).toLowerCase() + act.studentsGet.slice(1)}${f.skills ? `, practicing ${f.skills}` : ''}. The school handles student selection, preparation, permission slips and transportation.`
    : ''
  const opp: Opportunity | undefined = oppId ? state.opportunities.find((o) => o.id === oppId) : undefined
  const existing = state.opportunities.filter((o) => o.employerId === empId)

  if (!emp) return <Empty>No engaged employers yet. Get someone to Level 1 first (S4).</Empty>

  const save = () => {
    const id = saveOpportunity({ id: oppId, employerId: emp.id, kind, level: act.level as 3 | 4 | 5, title, dates: f.dates, slots: f.slots, supervisor: f.supervisor, skills: f.skills, description, status: opp?.status ?? 'draft' })
    setOppId(id)
    return id
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <EmployerSelect employers={engaged} value={empId} onChange={setEmpId} label="Which partner is ready for more?" id="op-emp" />
          <p className="-mt-1 text-xs text-stone-500">
            Currently on {stageInfo(emp.stage).label}. Suggested next: Level {suggested}.
          </p>
          <div>
            <label className="label" htmlFor="op-kind">Opportunity type</label>
            <select id="op-kind" className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
              {LEVELS.filter((r) => r.level >= 3).map((r) => (
                <optgroup key={r.level} label={`Level ${r.level}: ${r.name}`}>
                  {nextKinds.filter((a) => a.level === r.level).map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
                </optgroup>
              ))}
            </select>
            {act.level > currentLevel + 1 && <p className="mt-1 text-xs text-amber-700">⚠️ That skips a level. Consider a smaller step first.</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label" htmlFor="op-dates">Dates</label>
              <input id="op-dates" className="input" value={f.dates} onChange={(e) => setF({ ...f, dates: e.target.value })} placeholder="Nov 12" />
            </div>
            <div>
              <label className="label" htmlFor="op-slots">Student slots</label>
              <input id="op-slots" type="number" min={1} className="input" value={f.slots} onChange={(e) => setF({ ...f, slots: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="op-sup">Worksite supervisor</label>
            <input id="op-sup" className="input" value={f.supervisor} onChange={(e) => setF({ ...f, supervisor: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="op-skills">Skills students will practice</label>
            <input id="op-skills" className="input" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="diagnostics, customer service" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Draft to bring to {emp.contactName.split(' ')[0]}</p>
            <h4 className="mt-1 text-lg font-semibold">
              {act.emoji} {title}
            </h4>
            <p className="text-xs text-stone-500">
              Level {act.level} · {LEVELS[act.level - 1].continuum} · {act.time}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-700">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-secondary" onClick={() => (save(), toast('Draft saved'))}>
              Save draft
            </button>
            <button className="btn-secondary" onClick={() => (proposeOpportunity(save(), me.id), toast('Logged as proposed'))}>
              <Send size={16} /> I proposed it
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                const id = save()
                acceptOpportunity(id, me.id)
                toast(act.level > currentLevel ? `🎉 ${emp.name} moved up to Level ${act.level}!` : 'Marked as accepted')
              }}
            >
              <CheckCircle2 size={16} /> They said yes!
            </button>
            {opp && <span className="chip bg-stone-100 text-stone-700">Status: {opp.status}</span>}
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Colorado paperwork for Level {act.level}</h4>
        <PaperworkChecklist employer={emp} level={act.level} />
      </div>

      {existing.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold">Opportunities with {emp.name}</h4>
          <ul className="space-y-2">
            {existing.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-3 text-sm">
                <span>
                  <span className="font-medium">{o.title}</span> · Level {o.level} · {o.slots} slots {o.dates && `· ${o.dates}`}
                </span>
                <span className={`chip ${o.status === 'accepted' ? 'bg-emerald-50 text-emerald-800' : o.status === 'proposed' ? 'bg-sky-50 text-sky-800' : 'bg-stone-100 text-stone-600'}`}>{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-stone-500">
        See everything about this partner on their{' '}
        <Link to={`/employers/${emp.id}`} className="font-medium text-brand-700 underline">
          employer page
        </Link>
        .
      </p>
      {toastNode}
    </div>
  )
}
