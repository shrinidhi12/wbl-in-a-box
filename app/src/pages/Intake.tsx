import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, ExternalLink, FileUp, MapPin, Sparkles, Star, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useProfile, useSchool, useStore } from '../data/store'
import { SECTORS, SECTOR_EMOJI } from '../data/ladder'
import { MARKET_SOURCES, marketFor, regionForZip } from '../data/market'
import { SAMPLE_CATALOG, SAMPLE_CATALOG_NAME, parseCatalog } from '../data/catalog'
import { FAST_GROWTH, QUADRANTS, computePriorities, type SectorPriority } from '../lib/priorities'

const STEPS = [
  { id: 'zip', label: 'Your school' },
  { id: 'interests', label: 'Student interests' },
  { id: 'catalog', label: 'Course catalogue' },
  { id: 'market', label: 'Local job market' },
  { id: 'priorities', label: 'Your priorities' },
] as const

export function Intake() {
  const profile = useProfile()
  const [step, setStep] = useState(profile.completedAt ? 4 : 0)
  const region = regionForZip(profile.zip)
  const canNext = step !== 0 || !!region

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-5">
        <p className="text-sm font-medium text-brand-700">Start here · School profile</p>
        <h1 className="h-display text-2xl sm:text-3xl">Know your students and your local economy</h1>
        <p className="mt-1 text-stone-600">About 10 minutes. You'll end with 3–4 focus industries, so your employer outreach goes where students are interested and jobs are growing.</p>
      </header>

      <ol className="mb-6 grid grid-cols-5 gap-1.5" aria-label="Intake steps">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button onClick={() => (i <= step || region) && setStep(i)} className="w-full text-left" aria-current={i === step ? 'step' : undefined}>
              <span className={`block h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-stone-200'}`} />
              <span className={`mt-1.5 hidden text-xs sm:block ${i === step ? 'font-semibold text-brand-800' : 'text-stone-500'}`}>
                {i + 1}. {s.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mb-3 text-xs font-medium text-stone-500 sm:hidden">
        Step {step + 1} of {STEPS.length}: {STEPS[step].label}
      </p>

      <section className="card p-5 sm:p-7">
        {step === 0 && <ZipStep />}
        {step === 1 && <InterestsStep />}
        {step === 2 && <CatalogStep />}
        {step === 3 && <MarketStep />}
        {step === 4 && <PrioritiesStep />}
      </section>

      {step < 4 && (
        <div className="mt-4 flex justify-between">
          <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next: {STEPS[step + 1].label} <ArrowRight size={16} />
          </button>
        </div>
      )}
      {step === 4 && (
        <div className="mt-4">
          <button className="btn-ghost" onClick={() => setStep(3)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Step 1: ZIP ---------- */

function ZipStep() {
  const profile = useProfile()
  const school = useSchool()
  const { updateProfile } = useStore()
  const region = regionForZip(profile.zip)
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Where is {school.name}?</h2>
        <p className="text-sm text-stone-600">We use your ZIP code to look up which industries are growing near you.</p>
      </div>
      <div className="max-w-xs">
        <label className="label" htmlFor="zip">
          School ZIP code
        </label>
        <input
          id="zip"
          className="input !py-2.5 !text-lg tracking-widest"
          inputMode="numeric"
          maxLength={5}
          placeholder="80226"
          value={profile.zip}
          onChange={(e) => updateProfile({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
        />
      </div>
      {region ? (
        <p className="flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm text-brand-900">
          <MapPin size={16} /> Labor market region: <strong>{region.name}</strong>
          {region.id === 'statewide' && <span className="text-xs text-brand-700">(outside Colorado's regional data, so we'll show statewide figures)</span>}
        </p>
      ) : (
        profile.zip.length > 0 && <p className="text-sm text-stone-500">Enter all 5 digits.</p>
      )}
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
        <p className="font-medium">What you'll do next</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5">
          <li>Reflect on what your students are interested in</li>
          <li>Add your course catalogue to see what students are already learning</li>
          <li>See which local industries are growing</li>
          <li>Pick 3–4 focus industries for employer outreach</li>
        </ol>
      </div>
    </div>
  )
}

/* ---------- Step 2: Student interests ---------- */

const SOURCES = ['Conversations with students', 'ICAP / career interest surveys (e.g. Xello, Naviance)', 'CTE class enrollment and waitlists', 'Clubs (DECA, HOSA, FFA, SkillsUSA, robotics)', 'Counselor knowledge', 'My gut feeling']
const LEVELS_OF_INTEREST = [
  { v: 0, label: 'Not much' },
  { v: 1, label: 'Some' },
  { v: 2, label: 'A lot' },
]

function InterestsStep() {
  const profile = useProfile()
  const { updateProfile } = useStore()
  const set = (sector: string, v: number) => updateProfile({ interests: { ...profile.interests, [sector]: v } })
  const toggleSource = (s: string) =>
    updateProfile({ interestSources: profile.interestSources.includes(s) ? profile.interestSources.filter((x) => x !== s) : [...profile.interestSources, s] })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">What are your students interested in?</h2>
        <p className="text-sm text-stone-600">There are no wrong answers. Take a minute to reflect before you click.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {['What careers do students mention in class or advisory?', 'Which electives and CTE classes fill up first?', 'Who do students look up to, and what do those people do?'].map((q) => (
          <div key={q} className="rounded-lg bg-warm-50 p-3 text-sm text-stone-700">
            💭 {q}
          </div>
        ))}
      </div>
      <fieldset>
        <legend className="label">Where does your sense of this come from? (optional)</legend>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => {
            const on = profile.interestSources.includes(s)
            return (
              <button key={s} type="button" aria-pressed={on} onClick={() => toggleSource(s)} className={`chip border !py-1 !text-xs ${on ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-300 bg-white text-stone-600'}`}>
                {on && <Check size={12} />} {s}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div>
        <p className="label">How much interest do you see in each industry?</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SECTORS.map((sector) => {
            const v = profile.interests[sector] ?? 0
            return (
              <li key={sector} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 p-2.5">
                <span className="text-sm font-medium">
                  <span aria-hidden className="mr-1.5">{SECTOR_EMOJI[sector]}</span>
                  {sector}
                </span>
                <span className="flex shrink-0 rounded-md bg-stone-100 p-0.5" role="radiogroup" aria-label={`Interest in ${sector}`}>
                  {LEVELS_OF_INTEREST.map((o) => (
                    <button key={o.v} role="radio" aria-checked={v === o.v} onClick={() => set(sector, o.v)} className={`rounded px-2 py-1 text-xs font-medium ${v === o.v ? (o.v === 2 ? 'bg-brand-700 text-white' : o.v === 1 ? 'bg-brand-100 text-brand-800' : 'bg-white text-stone-700 shadow-sm') : 'text-stone-500'}`}>
                      {o.label}
                    </button>
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <label className="label" htmlFor="notes">
          Anything else you're hearing from students? (optional)
        </label>
        <textarea id="notes" className="input min-h-20" value={profile.interestNotes} onChange={(e) => updateProfile({ interestNotes: e.target.value })} placeholder="e.g. Lots of interest in becoming a nurse or vet tech; several students want to start their own business…" />
      </div>
    </div>
  )
}

/* ---------- Step 3: Course catalogue ---------- */

function CatalogStep() {
  const profile = useProfile()
  const { updateProfile } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [paste, setPaste] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [showOther, setShowOther] = useState(false)

  const load = (text: string, name: string) => {
    const courses = parseCatalog(text)
    updateProfile({ courses, catalogName: name })
    setNotice(null)
  }

  const onFile = async (f: File) => {
    if (/\.(pdf|docx?|xlsx?)$/i.test(f.name)) {
      load(SAMPLE_CATALOG, SAMPLE_CATALOG_NAME)
      setNotice(`Reading text from ${f.name.split('.').pop()?.toUpperCase()} files is coming in the full version. For this prototype we loaded the sample catalogue so you can see how it works. Upload a .txt or .csv to use your own.`)
      return
    }
    load(await f.text(), f.name)
  }

  const bySector = SECTORS.map((s) => ({ sector: s, courses: profile.courses.filter((c) => c.sectors.includes(s)) })).filter((x) => x.courses.length)
  const other = profile.courses.filter((c) => !c.sectors.length)

  const unlink = (course: string, sector: string) =>
    updateProfile({ courses: profile.courses.map((c) => (c.name === course ? { ...c, sectors: c.sectors.filter((s) => s !== sector) } : c)) })
  const assign = (course: string, sector: string) =>
    updateProfile({ courses: profile.courses.map((c) => (c.name === course ? { ...c, sectors: [...c.sectors, sector] } : c)) })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">What are students already learning?</h2>
        <p className="text-sm text-stone-600">Add your course catalogue and we'll highlight which industries your classes already connect to. Those are natural places to find employer partners.</p>
      </div>

      <div
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          const f = e.dataTransfer.files[0]
          if (f) onFile(f)
        }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${drag ? 'border-brand-600 bg-brand-50' : 'border-stone-300 bg-stone-50'}`}
      >
        <FileUp className="mx-auto text-stone-400" size={28} />
        <p className="mt-2 text-sm font-medium">Drop your course catalogue here</p>
        <p className="text-xs text-stone-500">.txt or .csv (one course per line). PDF and Word coming soon.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            Choose file
          </button>
          <button className="btn-secondary" onClick={() => setShowPaste(!showPaste)}>
            Paste course list
          </button>
          <button className="btn-ghost" onClick={() => load(SAMPLE_CATALOG, SAMPLE_CATALOG_NAME)}>
            Use sample catalogue
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".txt,.csv,.md,.pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>

      {showPaste && (
        <div>
          <label className="label" htmlFor="paste">
            Paste course names, one per line
          </label>
          <textarea id="paste" className="input min-h-32 font-mono text-xs" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'Introduction to Health Sciences\nWelding Fundamentals\nAP Computer Science A'} />
          <button className="btn-primary mt-2" disabled={!paste.trim()} onClick={() => (load(paste, 'Pasted course list'), setShowPaste(false))}>
            Analyze courses
          </button>
        </div>
      )}

      {notice && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {notice}
        </p>
      )}

      {profile.courses.length > 0 && (
        <div>
          <p className="mb-3 text-sm">
            <CheckCircle2 size={16} className="mr-1 inline text-brand-600" />
            <strong>{profile.catalogName}</strong>: {profile.courses.length} courses, <strong>{profile.courses.length - other.length}</strong> linked to an industry. Remove a link that doesn't fit by clicking ×.
          </p>
          <ul className="grid gap-2 md:grid-cols-2">
            {bySector
              .sort((a, b) => b.courses.length - a.courses.length)
              .map(({ sector, courses }) => (
                <li key={sector} className="rounded-lg border border-stone-200 p-3">
                  <p className="mb-1.5 flex items-center justify-between text-sm font-semibold">
                    <span>
                      {SECTOR_EMOJI[sector]} {sector}
                    </span>
                    <span className="chip bg-brand-50 text-brand-800">{courses.length}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {courses.map((c) => (
                      <span key={c.name} className="inline-flex items-center gap-1 rounded-full bg-stone-100 py-0.5 pl-2 pr-1 text-xs text-stone-700">
                        {c.name}
                        <button onClick={() => unlink(c.name, sector)} aria-label={`Unlink ${c.name} from ${sector}`} className="rounded-full p-0.5 hover:bg-stone-200">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
          {other.length > 0 && (
            <div className="mt-3">
              <button className="text-sm text-stone-600 underline" onClick={() => setShowOther(!showOther)}>
                {showOther ? 'Hide' : 'Show'} {other.length} courses not linked to an industry (core academics, languages…)
              </button>
              {showOther && (
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {other.map((c) => (
                    <li key={c.name} className="flex items-center justify-between gap-2 rounded border border-stone-100 px-2 py-1 text-xs">
                      {c.name}
                      <select className="rounded border border-stone-200 bg-white px-1 py-0.5 text-xs text-stone-600" value="" onChange={(e) => e.target.value && assign(c.name, e.target.value)} aria-label={`Link ${c.name} to an industry`}>
                        <option value="">Link to…</option>
                        {SECTORS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- Step 4: Local job market ---------- */

function SampleDataNote() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <p className="flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          <strong>Illustrative sample data, not real statistics.</strong> In the full version these figures come live from:{' '}
          {MARKET_SOURCES.map((s, i) => (
            <span key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline">
                {s.label} <ExternalLink size={10} />
              </a>
              {i < MARKET_SOURCES.length - 1 ? '; ' : '.'}
            </span>
          ))}
        </span>
      </p>
    </div>
  )
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : `${n}`)

function MarketStep() {
  const profile = useProfile()
  const region = regionForZip(profile.zip)
  const [open, setOpen] = useState<string | null>(null)
  if (!region) return <p>Enter a ZIP code first.</p>
  const market = marketFor(region)
  const maxAbs = Math.max(...market.map((m) => Math.abs(m.proj5)))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">What's growing near you?</h2>
        <p className="text-sm text-stone-600">
          <MapPin size={14} className="mr-1 inline" />
          {region.name} · ZIP {profile.zip}
        </p>
      </div>
      <SampleDataNote />
      <div className="rounded-lg bg-stone-50 p-4">
        <p className="mb-1 text-sm font-semibold">What's changing in your region</p>
        <ul className="space-y-1 text-sm text-stone-700">
          {region.changes.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-2 hidden grid-cols-[1.4fr_2fr_70px_70px_80px] gap-3 px-2 text-xs font-medium uppercase tracking-wide text-stone-500 md:grid">
          <span>Industry</span>
          <span>Projected 5-yr growth</span>
          <span className="text-right">Jobs</span>
          <span className="text-right">Openings/yr</span>
          <span className="text-right">Median wage</span>
        </div>
        <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
          {market.map((m) => {
            const fast = m.proj5 >= FAST_GROWTH
            const pct = (Math.abs(m.proj5) / maxAbs) * 100
            return (
              <li key={m.sector}>
                <button className="grid w-full grid-cols-2 items-center gap-x-3 gap-y-1 px-2 py-2.5 text-left text-sm hover:bg-stone-50 md:grid-cols-[1.4fr_2fr_70px_70px_80px]" onClick={() => setOpen(open === m.sector ? null : m.sector)} aria-expanded={open === m.sector}>
                  <span className="font-medium">
                    {SECTOR_EMOJI[m.sector]} {m.sector}
                    {fast && <span className="chip ml-1.5 bg-emerald-50 !px-1.5 text-emerald-800">Fast growth</span>}
                  </span>
                  <span className="flex items-center gap-2" title={`${m.sector}: ${m.proj5}% projected 5-year growth`}>
                    <span className="h-2.5 flex-1 rounded-r bg-stone-100">
                      <span className={`block h-full rounded-r ${m.proj5 >= 0 ? 'bg-brand-600' : 'bg-stone-400'}`} style={{ width: `${pct}%` }} />
                    </span>
                    <span className="flex w-14 items-center justify-end gap-0.5 tabular-nums text-stone-800">
                      {m.proj5 >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {m.proj5 > 0 ? '+' : ''}
                      {m.proj5}%
                    </span>
                  </span>
                  <span className="text-xs text-stone-500 md:text-right md:text-sm md:text-stone-700">
                    <span className="md:hidden">Jobs </span>
                    {fmt(m.employment)}
                  </span>
                  <span className="text-xs text-stone-500 md:text-right md:text-sm md:text-stone-700">
                    <span className="md:hidden">Openings/yr </span>
                    {fmt(m.openings)}
                  </span>
                  <span className="text-xs text-stone-500 md:text-right md:text-sm md:text-stone-700">
                    <span className="md:hidden">Median </span>${fmt(m.medianWage)}
                  </span>
                </button>
                {open === m.sector && (
                  <p className="px-2 pb-3 text-sm text-stone-600">
                    {m.note} <span className="text-stone-400">Past year: {m.yoy > 0 ? '+' : ''}{m.yoy}% jobs.</span>
                  </p>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-xs text-stone-500">Click an industry for what's driving the change. "Fast growth" means {FAST_GROWTH}%+ projected over 5 years.</p>
      </div>
    </div>
  )
}

/* ---------- Step 5: Priorities ---------- */

function PrioritiesStep() {
  const profile = useProfile()
  const { updateProfile } = useStore()
  const nav = useNavigate()
  const priorities = useMemo(() => computePriorities(profile), [profile])
  const defaultFocus = priorities.filter((p) => p.quadrant === 'sweet' || p.quadrant === 'build').slice(0, 3).map((p) => p.sector)
  const [focus, setFocus] = useState<string[]>(profile.focusSectors.length ? profile.focusSectors : defaultFocus)
  const [saved, setSaved] = useState(!!profile.completedAt)
  const toggle = (s: string) => (setSaved(false), setFocus(focus.includes(s) ? focus.filter((x) => x !== s) : [...focus, s]))

  if (!priorities.length) return <p>Enter a ZIP code first.</p>
  const noInput = !Object.values(profile.interests).some(Boolean) && !profile.courses.length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Where should you focus first?</h2>
        <p className="text-sm text-stone-600">We combined local growth with student interest and your courses. Pick 3–4 focus industries. You can change them anytime.</p>
      </div>
      {noInput && (
        <p className="rounded-lg bg-warm-50 p-3 text-sm text-warm-700">
          Tip: you skipped student interests and courses, so this is based on growth alone. Go back to steps 2–3 for a better picture.
        </p>
      )}

      <PriorityMatrix priorities={priorities} focus={focus} onToggle={toggle} />

      <ul className="space-y-2">
        {priorities.map((p, i) => {
          const q = QUADRANTS[p.quadrant]
          const on = focus.includes(p.sector)
          return (
            <li key={p.sector}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${on ? 'border-brand-600 bg-brand-50/60' : 'border-stone-200'}`}>
                <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-700" checked={on} onChange={() => toggle(p.sector)} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-stone-400">#{i + 1}</span>
                    <span className="font-semibold">
                      {SECTOR_EMOJI[p.sector]} {p.sector}
                    </span>
                    <span className={`chip ${q.cls}`}>{q.label}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-600">{p.reasons.join(' · ')}</span>
                  {on && <span className="mt-1 block text-xs text-stone-500">{q.advice}</span>}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
        <button
          className="btn-primary"
          disabled={!focus.length}
          onClick={() => {
            updateProfile({ focusSectors: focus, completedAt: new Date().toISOString() })
            setSaved(true)
          }}
        >
          <Star size={16} /> Save {focus.length} focus industr{focus.length === 1 ? 'y' : 'ies'}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-brand-700">
            <Check size={16} /> Saved to your school profile
          </span>
        )}
      </div>

      {saved && (
        <div className="rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white">
          <p className="flex items-center gap-2 font-semibold">
            <Sparkles size={18} /> Your profile is ready. Here's what to do with it.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button className="btn bg-white text-brand-800 hover:bg-brand-50" onClick={() => nav('/journey/b1')}>
              Continue the journey: B1 Why WBL matters <ArrowRight size={16} />
            </button>
            <button className="btn text-white ring-1 ring-white/40 hover:bg-white/10" onClick={() => nav('/journey/s1?tab=explore')}>
              Find employers in your focus industries <ArrowRight size={16} />
            </button>
          </div>
          <p className="mt-3 text-xs text-brand-100">
            Your focus industries now appear on the <Link to="/journey" className="underline">journey home</Link>, in the local industry explorer (S1), and on your dashboard.
          </p>
        </div>
      )}
    </div>
  )
}

/** Growth (x) vs. student readiness (y), split into the four priority quadrants. */
function PriorityMatrix({ priorities, focus, onToggle }: { priorities: SectorPriority[]; focus: string[]; onToggle: (s: string) => void }) {
  const W = 640
  const H = 340
  const pad = { l: 44, r: 16, t: 16, b: 40 }
  const xs = priorities.map((p) => p.market.proj5)
  const xMin = Math.min(-2, ...xs) - 1
  const xMax = Math.max(...xs) + 1.5
  const x = (v: number) => pad.l + ((v - xMin) / (xMax - xMin)) * (W - pad.l - pad.r)
  const y = (v: number) => H - pad.b - v * (H - pad.t - pad.b)
  const vx = x(FAST_GROWTH)
  const hy = y(0.4)

  return (
    <figure className="rounded-xl border border-stone-200 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Priority matrix: projected growth versus student readiness">
        <rect x={vx} y={pad.t} width={W - pad.r - vx} height={hy - pad.t} className="fill-brand-50" />
        <text x={vx + 6} y={pad.t + 14} className="fill-brand-800 text-[11px] font-semibold">
          Prioritize
        </text>
        <text x={W - pad.r - 6} y={H - pad.b - 6} textAnchor="end" className="fill-stone-500 text-[11px]">
          Build awareness
        </text>
        <text x={pad.l + 6} y={pad.t + 14} className="fill-stone-500 text-[11px]">
          Student passion
        </text>
        <text x={pad.l + 6} y={H - pad.b - 6} className="fill-stone-400 text-[11px]">
          Lower priority
        </text>
        <line x1={vx} x2={vx} y1={pad.t} y2={H - pad.b} className="stroke-stone-300" strokeDasharray="4 4" />
        <line x1={pad.l} x2={W - pad.r} y1={hy} y2={hy} className="stroke-stone-300" strokeDasharray="4 4" />
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="stroke-stone-300" />
        <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} className="stroke-stone-300" />
        {[0, FAST_GROWTH, Math.round(xMax - 1)].map((t) => (
          <text key={t} x={x(t)} y={H - pad.b + 14} textAnchor="middle" className="fill-stone-500 text-[10px]">
            {t > 0 ? '+' : ''}
            {t}%
          </text>
        ))}
        <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle" className="fill-stone-600 text-[11px]">
          Projected 5-year job growth (local) →
        </text>
        <text transform={`translate(12 ${(pad.t + H - pad.b) / 2}) rotate(-90)`} textAnchor="middle" className="fill-stone-600 text-[11px]">
          Student interest + courses →
        </text>
        {placeDots(priorities, x, y, focus).map(({ p, rank, cx, cy, on, label }) => (
          <g key={p.sector} className="cursor-pointer" onClick={() => onToggle(p.sector)}>
            <title>{`#${rank} ${p.sector}: ${p.reasons.join(', ')}`}</title>
            <circle cx={cx} cy={cy} r={15} fill="transparent" />
            <circle cx={cx} cy={cy} r={9} strokeWidth={2} className={on ? 'fill-brand-700 stroke-white' : 'fill-white stroke-brand-600'} />
            <text x={cx} y={cy + 3.5} textAnchor="middle" className={`text-[10px] font-semibold ${on ? 'fill-white' : 'fill-brand-800'}`}>
              {rank}
            </text>
            {label && (
              <text x={label.x} y={label.y} textAnchor={label.anchor} className="fill-stone-900 text-[11px] font-semibold">
                {p.sector.split(' & ')[0]}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap items-center gap-3 px-1 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-700" /> Focus industry
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-brand-600 bg-white" /> Not selected
        </span>
        <span>Numbers match the ranked list below. Click a dot to add or remove it. Growth figures are illustrative sample data.</span>
      </figcaption>
    </figure>
  )
}

/**
 * Positions dots, nudging apart any that would overlap, and places text labels for focus
 * industries only (selective direct labels), stacking them so they don't collide.
 */
function placeDots(priorities: SectorPriority[], x: (v: number) => number, y: (v: number) => number, focus: string[]) {
  const dots: { p: SectorPriority; rank: number; cx: number; cy: number; on: boolean; label?: { x: number; y: number; anchor: 'start' | 'end' } }[] = []
  priorities.forEach((p, i) => {
    let cx = x(p.market.proj5)
    const cy = y(Math.min(0.95, Math.max(0.05, p.readiness)))
    while (dots.some((d) => Math.hypot(d.cx - cx, d.cy - cy) < 20)) cx += 20
    dots.push({ p, rank: i + 1, cx, cy, on: focus.includes(p.sector) })
  })
  const placed: { x1: number; x2: number; y: number }[] = []
  for (const d of dots.filter((d) => d.on)) {
    const name = d.p.sector.split(' & ')[0]
    const w = name.length * 6.5
    const right = d.cx < 640 - 30 - w
    let ly = d.cy + 4
    const x1 = right ? d.cx + 13 : d.cx - 13 - w
    const x2 = x1 + w
    const hitsDot = () => dots.some((o) => o !== d && o.cx + 9 > x1 && o.cx - 9 < x2 && Math.abs(o.cy - (ly - 4)) < 11)
    const hitsLabel = () => placed.some((l) => l.x1 < x2 && l.x2 > x1 && Math.abs(l.y - ly) < 13)
    for (let tries = 0; (hitsDot() || hitsLabel()) && tries < 6; tries++) ly += tries % 2 ? -(tries + 1) * 13 : (tries + 1) * 13
    placed.push({ x1, x2, y: ly })
    d.label = { x: right ? d.cx + 13 : d.cx - 13, y: ly, anchor: right ? 'start' : 'end' }
  }
  return dots
}
