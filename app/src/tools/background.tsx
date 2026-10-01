import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, RefreshCw, X } from 'lucide-react'
import { useSchool, useSchoolData, useStore } from '../data/store'
import { LEVELS, levelOfStage } from '../data/ladder'
import type { Stage } from '../data/types'

/* ---------- B1: Your Why builder ---------- */

const OUTCOMES = [
  { id: 'clarity', label: 'Career clarity', phrase: 'see real careers up close, not just job titles' },
  { id: 'skills', label: 'Real-world skills', phrase: 'practice the skills employers value: communication, reliability and problem solving' },
  { id: 'network', label: 'Professional networks', phrase: 'build relationships with adults who can open doors' },
  { id: 'relevance', label: 'Classes feel relevant', phrase: 'connect what they learn in class to what happens at work' },
  { id: 'local', label: 'Futures close to home', phrase: 'discover good careers right here in our community' },
  { id: 'paid', label: 'Paid experience', phrase: 'earn money while building experience' },
]
const POPULATIONS = ['first-generation college students', 'students from low-income families', 'multilingual learners', 'students in CTE pathways', 'students who aren’t sure college is for them', 'every student']

export function WhyBuilder() {
  const { state, setWhy } = useStore()
  const school = useSchool()
  const [picked, setPicked] = useState<string[]>(['clarity', 'network'])
  const [pop, setPop] = useState('every student')
  const [draft, setDraft] = useState(state.journey.why)
  const [saved, setSaved] = useState(false)

  const generate = () => {
    const phrases = OUTCOMES.filter((o) => picked.includes(o.id)).map((o) => o.phrase)
    const list = phrases.length > 1 ? `${phrases.slice(0, -1).join(', ')} and ${phrases.at(-1)}` : phrases[0] ?? 'see what’s possible'
    setDraft(
      `At ${school.name}, we want ${pop} to ${list}. Many of our students don’t have family connections in the careers they’re curious about. Local employers like you can change that, starting with just an hour of your time.`,
    )
    setSaved(false)
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <fieldset>
          <legend className="label">What matters most for your students? (pick 2–3)</legend>
          <div className="flex flex-wrap gap-2">
            {OUTCOMES.map((o) => {
              const on = picked.includes(o.id)
              return (
                <button
                  key={o.id}
                  aria-pressed={on}
                  onClick={() => setPicked(on ? picked.filter((x) => x !== o.id) : [...picked, o.id])}
                  className={`chip border !py-1 !text-sm ${on ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-300 bg-white text-stone-600'}`}
                >
                  {on && <Check size={13} />} {o.label}
                </button>
              )
            })}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor="pop">
            Who are you especially thinking about?
          </label>
          <select id="pop" className="input" value={pop} onChange={(e) => setPop(e.target.value)}>
            {POPULATIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={generate}>
          <RefreshCw size={16} /> Draft my why
        </button>
      </div>
      <div>
        <label className="label" htmlFor="why">
          Your why statement (edit freely)
        </label>
        <textarea id="why" className="input min-h-40" value={draft} onChange={(e) => (setDraft(e.target.value), setSaved(false))} placeholder="Click “Draft my why” to get started…" />
        <div className="mt-2 flex items-center gap-3">
          <button className="btn-secondary" disabled={!draft.trim()} onClick={() => (setWhy(draft.trim()), setSaved(true))}>
            Save as our why
          </button>
          {(saved || (state.journey.why && state.journey.why === draft)) && (
            <span className="flex items-center gap-1 text-sm text-brand-700">
              <Check size={14} /> Saved. We'll use it in your outreach messages (S2).
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- B2: Employer empathy map ---------- */

type Quad = 'worries' | 'constraints' | 'gains' | 'easy'
const QUADS: { id: Quad; label: string; cls: string }[] = [
  { id: 'worries', label: 'What worries them', cls: 'bg-rose-50 border-rose-100' },
  { id: 'constraints', label: 'Real constraints', cls: 'bg-amber-50 border-amber-100' },
  { id: 'gains', label: 'What they could gain', cls: 'bg-emerald-50 border-emerald-100' },
  { id: 'easy', label: 'What would make it easy', cls: 'bg-sky-50 border-sky-100' },
]
const EMPATHY: Record<string, Record<Quad, string[]>> = {
  'Small restaurant or café': {
    worries: ['Losing staff during a rush', 'Food safety and kitchen hazards for minors', 'Looking unprofessional'],
    constraints: ['Owner is also the manager, cook and accountant', 'Unpredictable schedules', 'No HR department'],
    gains: ['Giving back to the neighborhood', 'Local goodwill and visibility', 'Future part-time hires'],
    easy: ['Off-peak times (2–4pm)', 'Guest talk about starting a business', 'A teacher handles everything'],
  },
  Hospital: {
    worries: ['Patient privacy (HIPAA)', 'Infection control', 'Approval chains'],
    constraints: ['Volunteer office owns youth programs', 'Badging and health screening', 'Shift work'],
    gains: ['Pipeline for hard-to-fill roles (CNA, techs)', 'Community health mission', 'Staff love mentoring'],
    easy: ['Start with a guest speaker or virtual Q&A', 'Go through the education coordinator', 'Group tours of non-clinical areas'],
  },
  'Auto shop': {
    worries: ['Shop floor safety', 'Insurance', 'Teens touching customer cars'],
    constraints: ['Paid by the job, so time is money', 'Small team'],
    gains: ['Technician shortage, so future hires matter', 'Pride in the trade', 'Showing off cool tools'],
    easy: ['Career fair table with a diagnostic demo', 'Short tour before opening', 'Safety rules prepared by school'],
  },
  'Tech company': {
    worries: ['Not sure what high schoolers can do', 'Confidentiality', 'Engineer time is expensive'],
    constraints: ['Remote/hybrid teams', 'Legal review for anything formal'],
    gains: ['Diversity in the talent pipeline', 'Employer brand', 'Employees want volunteer opportunities'],
    easy: ['Virtual Q&A', 'Mock interviews or resume reviews', 'A scoped class project'],
  },
  'Government office': {
    worries: ['Policy and approvals', 'Public perception', 'Background check rules'],
    constraints: ['Formal processes', 'Budget cycles'],
    gains: ['Aging workforce, so recruiting matters', 'Public service mission', 'Community outreach goals'],
    easy: ['Use existing outreach staff', 'Career fair or tour', 'Plan a semester ahead'],
  },
}

export function EmpathyMap() {
  const types = Object.keys(EMPATHY)
  const [type, setType] = useState(types[0])
  const [maps, setMaps] = useState(EMPATHY)
  const [adding, setAdding] = useState<Record<Quad, string>>({ worries: '', constraints: '', gains: '', easy: '' })
  const m = maps[type]

  const add = (q: Quad) => {
    const v = adding[q].trim()
    if (!v) return
    setMaps({ ...maps, [type]: { ...m, [q]: [...m[q], v] } })
    setAdding({ ...adding, [q]: '' })
  }
  const remove = (q: Quad, i: number) => setMaps({ ...maps, [type]: { ...m, [q]: m[q].filter((_, j) => j !== i) } })

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Employer type">
        {types.map((t) => (
          <button key={t} role="radio" aria-checked={t === type} onClick={() => setType(t)} className={`chip border !py-1 !text-sm ${t === type ? 'border-brand-600 bg-brand-700 text-white' : 'border-stone-300 bg-white text-stone-600'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {QUADS.map((q) => (
          <div key={q.id} className={`rounded-lg border p-4 ${q.cls}`}>
            <h4 className="mb-2 text-sm font-semibold text-stone-800">{q.label}</h4>
            <ul className="space-y-1">
              {m[q.id].map((item, i) => (
                <li key={i} className="group flex items-start justify-between gap-2 text-sm text-stone-700">
                  <span>• {item}</span>
                  <button className="opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => remove(q.id, i)} aria-label={`Remove ${item}`}>
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <form className="mt-2 flex gap-1" onSubmit={(e) => (e.preventDefault(), add(q.id))}>
              <input className="input !py-1 !text-xs" placeholder="Add your own…" value={adding[q.id]} onChange={(e) => setAdding({ ...adding, [q.id]: e.target.value })} aria-label={`Add to ${q.label}`} />
              <button className="btn-secondary !px-2 !py-1" aria-label="Add">
                <Plus size={14} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- B3: Partner experience self-check ---------- */

const CHECKS = [
  { id: 'contact', q: 'Every employer has one named person at our school they can call.', fix: 'Assign one owner to every employer, and put their name and phone on everything employers see.' },
  { id: 'small', q: 'Our first ask is small (an hour or two), not an internship.', fix: 'Lead with Level 1: career fairs, guest talks and virtual Q&As. See S4.' },
  { id: 'logistics', q: 'Employers get parking, check-in and an agenda before every visit.', fix: 'Use the run-of-show templates in S4 and send logistics a week ahead.' },
  { id: 'prep', q: 'Students are prepared with research and questions.', fix: 'Use the student prep sheet in S5 before every employer interaction.' },
  { id: 'thanks', q: 'We say thank you within 48 hours.', fix: 'Turn on thank-you nudges (Today view) and collect student notes the same day.' },
  { id: 'impact', q: 'We tell employers what students learned or did next.', fix: 'Share one student quote or outcome 2–3 weeks after every activity.' },
  { id: 'recognize', q: 'We recognize partners publicly.', fix: 'Use the Community Partner kit in S5: newsletter, social and window sign.' },
  { id: 'next', q: 'We invite partners to a next step each semester.', fix: 'Use the opportunity builder in S6 to propose one specific next level.' },
]
const SCALE = [
  { v: 0, label: 'Not yet' },
  { v: 1, label: 'Sometimes' },
  { v: 2, label: 'Always' },
]

export function SelfCheck() {
  const { state, setSelfCheck } = useStore()
  const answers = state.journey.selfCheck
  const answered = CHECKS.filter((c) => answers[c.id] !== undefined).length
  const score = Math.round((CHECKS.reduce((s, c) => s + (answers[c.id] ?? 0), 0) / (CHECKS.length * 2)) * 100)
  const fixes = CHECKS.filter((c) => answers[c.id] !== undefined && answers[c.id] < 2)
    .sort((a, b) => answers[a.id] - answers[b.id])
    .slice(0, 3)

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <ol className="space-y-2">
        {CHECKS.map((c, i) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-lg border border-stone-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-stone-800">
              <span className="mr-1 text-stone-400">{i + 1}.</span> {c.q}
            </span>
            <span className="flex shrink-0 gap-1" role="radiogroup" aria-label={c.q}>
              {SCALE.map((s) => (
                <button
                  key={s.v}
                  role="radio"
                  aria-checked={answers[c.id] === s.v}
                  onClick={() => setSelfCheck(c.id, s.v)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium ${answers[c.id] === s.v ? 'border-brand-600 bg-brand-700 text-white' : 'border-stone-300 text-stone-600 hover:bg-stone-50'}`}
                >
                  {s.label}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ol>
      <div className="space-y-3">
        <div className="rounded-xl bg-brand-50 p-5 text-center">
          <p className="text-sm text-brand-800">Partner experience score</p>
          <p className="h-display text-5xl text-brand-800">{answered ? score : '–'}</p>
          <p className="text-xs text-brand-700">
            {answered} of {CHECKS.length} answered
          </p>
        </div>
        {fixes.length > 0 && (
          <div className="rounded-xl border border-warm-100 bg-warm-50 p-4">
            <p className="mb-2 text-sm font-semibold text-warm-700">Your top {fixes.length} improvements</p>
            <ol className="list-decimal space-y-1.5 pl-4 text-sm text-stone-700">
              {fixes.map((f) => (
                <li key={f.id}>{f.fix}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- B4: Lifecycle explorer ---------- */

const LIFECYCLE: { id: string; name: string; goal: string; duration: string; signals: string; risk: string; stages: Stage[] }[] = [
  { id: 'discover', name: 'Discover', goal: 'Identify a business and a person who knows them.', duration: 'Days', signals: 'You have a named contact and a warm connection.', risk: 'Lists of company names with no person attached go nowhere.', stages: ['lead'] },
  { id: 'connect', name: 'Connect', goal: 'A personal first conversation and a small, specific ask.', duration: '1–3 weeks', signals: 'They reply, ask questions or say yes.', risk: 'Invites that are never followed up. Silence usually means busy.', stages: ['invited'] },
  { id: 'first', name: 'First engagement', goal: 'A great Level 1–2 experience: a conversation, then a school visit. Easy, organized, meaningful.', duration: 'A few weeks', signals: 'They enjoyed it and ask “what’s next?”', risk: 'No thank-you, or no follow-up after the event.', stages: ['level1', 'level2'] },
  { id: 'deepen', name: 'Deepen', goal: 'Hosting students, job shadows, mentoring (Level 3), then real projects and micro-internships (Level 4).', duration: '1–2 semesters', signals: 'Their staff get involved and they offer ideas.', risk: 'Jumping to an internship too fast, or making them do the paperwork.', stages: ['level3', 'level4'] },
  { id: 'opportunity', name: 'Opportunity', goal: 'Formal internships, WBL placements or apprenticeships (Level 5).', duration: 'A semester or more', signals: 'They’re asking about hiring or summer help.', risk: 'Paperwork surprises; a poorly matched student.', stages: ['level5'] },
  { id: 'sustain', name: 'Sustain & champion', goal: 'They return each year and introduce other employers.', duration: 'Ongoing', signals: 'They refer peers and tell others about you.', risk: 'Taking them for granted. Recognition stops when staff change.', stages: [] },
]

export function Lifecycle() {
  const { employers } = useSchoolData()
  const [active, setActive] = useState('first')
  const counts = useMemo(() => Object.fromEntries(LIFECYCLE.map((l) => [l.id, employers.filter((e) => l.stages.includes(e.stage)).length])), [employers])
  const champions = employers.filter((e) => levelOfStage(e.stage) >= 4).length
  const s = LIFECYCLE.find((l) => l.id === active)!

  return (
    <div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {LIFECYCLE.map((l, i) => (
          <li key={l.id}>
            <button onClick={() => setActive(l.id)} aria-pressed={active === l.id} className={`relative h-full w-full rounded-lg border p-3 text-left transition ${active === l.id ? 'border-brand-600 bg-brand-700 text-white shadow' : 'border-stone-200 bg-white hover:border-brand-200'}`}>
              <span className={`text-xs ${active === l.id ? 'text-brand-100' : 'text-stone-400'}`}>Stage {i + 1}</span>
              <span className="block font-semibold">{l.name}</span>
              <span className={`mt-1 block text-xs ${active === l.id ? 'text-brand-100' : 'text-stone-500'}`}>
                {l.id === 'sustain' ? `${champions} potential champions` : `${counts[l.id]} of your employers`}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-4 grid gap-3 rounded-xl bg-stone-50 p-5 sm:grid-cols-2">
        <Info label="Goal">{s.goal}</Info>
        <Info label="Typical duration">{s.duration}</Info>
        <Info label="Signals it's time to move on">{s.signals}</Info>
        <Info label="Risk if it stalls">{s.risk}</Info>
      </div>
      {s.stages.some((x) => x.startsWith('level')) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.filter((r) => s.stages.includes(`level${r.level}` as Stage)).map((r) => (
            <span key={r.level} className="chip bg-brand-50 text-brand-800">
              Level {r.level}: {r.name} · {r.continuum}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-sm text-stone-500">
        See where all your employers are on the{' '}
        <Link to="/pipeline" className="font-medium text-brand-700 underline">
          pipeline board
        </Link>
        .
      </p>
    </div>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="text-sm text-stone-800">{children}</p>
    </div>
  )
}
