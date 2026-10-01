import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Check, CheckCircle2, ChevronDown, Heart, Mail, Phone, Sparkles } from 'lucide-react'
import { useStore } from '../data/store'
import { ACTIVITIES, LEVELS, SECTORS, activityById, levelOfStage } from '../data/ladder'
import type { Staff } from '../data/types'
import { requirementsForLevel } from '../lib/paperwork'
import { shortDate } from '../lib/format'
import { Avatar, useToast } from '../components/ui'

function ContactCard({ person, schoolName }: { person: Staff; schoolName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <Avatar person={person} size="lg" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Your contact at {schoolName}</p>
        <p className="font-semibold text-stone-900">{person.name}</p>
        <p className="text-sm text-stone-600">{person.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 text-sm">
          <a href={`tel:${person.phone}`} className="flex items-center gap-1 text-brand-700">
            <Phone size={13} /> {person.phone}
          </a>
          <a href={`mailto:${person.email}`} className="flex items-center gap-1 text-brand-700">
            <Mail size={13} /> Email
          </a>
        </div>
      </div>
    </div>
  )
}

export function EmployerView() {
  const { token = '' } = useParams()
  const { state } = useStore()
  const e = state.employers.find((x) => x.token === token)
  // Decide once per visit, so the confirmation screen still shows right after signing up.
  const [onboarding] = useState(() => !!e && !e.signup && levelOfStage(e.stage) === 0)
  if (!e) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">This link isn't working</h1>
        <p className="mt-2 text-stone-600">It may have been mistyped. Please contact the person who sent it to you.</p>
        <p className="mt-6 text-xs text-stone-500">
          (Prototype: links only work in the same browser. Try <Link className="underline" to="/e/sol-bakery-and-cafe">Sol Bakery's link</Link>.)
        </p>
      </div>
    )
  }
  return onboarding ? <EmployerOnboarding employerId={e.id} /> : <EmployerHome employerId={e.id} />
}

function EmployerOnboarding({ employerId }: { employerId: string }) {
  const { state, employerSignup } = useStore()
  const e = state.employers.find((x) => x.id === employerId)!
  const owner = state.staff.find((s) => s.id === e.ownerId)!
  const school = state.schools.find((s) => s.id === e.schoolId)!
  const first = e.contactName.replace(/^(Dr\.|Capt\.)\s*/, '').split(' ')[0]
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [later, setLater] = useState(false)
  const [f, setF] = useState({ contactName: e.contactName === 'Unknown' ? '' : e.contactName, name: e.name, contactEmail: e.contactEmail, contactPhone: e.contactPhone, dates: '' })
  const quote = state.thankYous.find((t) => t.employerId !== e.id)

  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id])

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <p className="mb-4 text-center text-sm font-medium text-brand-800">{school.name} · Community Partners</p>
      {step > 0 && step < 3 && (
        <div className="mb-4 flex items-center gap-2" aria-label={`Step ${step} of 2`}>
          {[1, 2].map((n) => (
            <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-brand-600' : 'bg-stone-200'}`} />
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h1 className="h-display text-3xl text-stone-900">Hi {first} 👋</h1>
            <p className="mt-2 text-lg text-stone-700">
              <strong>{owner.display}</strong> from {school.name} invited you to help students in our community discover what's possible.
            </p>
            <p className="mt-3 text-stone-600">
              Many of our students have never met someone who does what you do. An hour of your time can open a door. <strong>No commitment, no account, and the school handles the logistics.</strong>
            </p>
            {quote && (
              <blockquote className="mt-4 rounded-lg bg-warm-50 p-4 text-sm text-stone-700">
                “{quote.text}”<span className="mt-1 block text-xs text-stone-500">— {quote.student}, after meeting a local employer</span>
              </blockquote>
            )}
          </div>
          <ContactCard person={owner} schoolName={school.name} />
          <button className="btn-primary w-full justify-center !py-3 text-base" onClick={() => setStep(1)}>
            See how I could help <ArrowRight size={18} />
          </button>
          <p className="text-center text-xs text-stone-500">Takes about 2 minutes</p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">How would you like to help?</h1>
            <p className="text-stone-600">Pick anything that sounds doable. Most partners start here.</p>
          </div>
          <ul className="space-y-2">
            {ACTIVITIES.filter((a) => a.level <= 2).map((a) => {
              const on = picked.includes(a.id)
              return (
                <li key={a.id}>
                  <button aria-pressed={on} onClick={() => toggle(a.id)} className={`flex w-full items-center gap-3 rounded-xl border-2 bg-white p-4 text-left transition ${on ? 'border-brand-600 ring-2 ring-brand-100' : 'border-stone-200 hover:border-brand-200'}`}>
                    <span className="text-3xl" aria-hidden>{a.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-stone-900">{a.name}</span>
                      <span className="block text-sm text-stone-600">{a.time}</span>
                      <span className="block text-xs text-stone-500">Students: {a.studentsGet.toLowerCase()}</span>
                    </span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300'}`}>{on && <Check size={14} />}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm text-stone-600" onClick={() => setLater(!later)} aria-expanded={later}>
            <span>Later, if you enjoy it: tours, job shadows, internships</span>
            <ChevronDown size={16} className={later ? 'rotate-180' : ''} />
          </button>
          {later && (
            <ul className="grid grid-cols-2 gap-2">
              {ACTIVITIES.filter((a) => a.level > 2).map((a) => (
                <li key={a.id}>
                  <button aria-pressed={picked.includes(a.id)} onClick={() => toggle(a.id)} className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${picked.includes(a.id) ? 'border-brand-600 bg-brand-50' : 'border-stone-200 bg-white text-stone-600'}`}>
                    {a.emoji} {a.name}
                    <span className="block text-[10px] text-stone-400">Level {a.level} · {a.time}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setStep(0)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn-primary flex-1 justify-center !py-3" disabled={!picked.length} onClick={() => setStep(2)}>
              Continue <ArrowRight size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-stone-500">Not sure? Just call {owner.display} at {owner.phone}.</p>
        </div>
      )}

      {step === 2 && (
        <form
          className="space-y-4"
          onSubmit={(ev) => {
            ev.preventDefault()
            employerSignup(e.id, picked, f.dates, { contactName: f.contactName, name: f.name, contactEmail: f.contactEmail, contactPhone: f.contactPhone })
            setStep(3)
          }}
        >
          <div>
            <h1 className="text-2xl font-semibold">Almost done</h1>
            <p className="text-stone-600">Just the basics so {owner.display} can follow up.</p>
          </div>
          <div className="card space-y-3 p-5">
            <div>
              <label className="label" htmlFor="o-name">Your name</label>
              <input id="o-name" className="input !py-2.5 !text-base" value={f.contactName} onChange={(x) => setF({ ...f, contactName: x.target.value })} required autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="o-biz">Business</label>
              <input id="o-biz" className="input !py-2.5 !text-base" value={f.name} onChange={(x) => setF({ ...f, name: x.target.value })} required autoComplete="organization" />
            </div>
            <div>
              <label className="label" htmlFor="o-email">Email</label>
              <input id="o-email" type="email" className="input !py-2.5 !text-base" value={f.contactEmail} onChange={(x) => setF({ ...f, contactEmail: x.target.value })} required autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="o-phone">Phone</label>
              <input id="o-phone" type="tel" className="input !py-2.5 !text-base" value={f.contactPhone} onChange={(x) => setF({ ...f, contactPhone: x.target.value })} autoComplete="tel" />
            </div>
            <div>
              <label className="label" htmlFor="o-dates">When works best? (optional)</label>
              <input id="o-dates" className="input !py-2.5 !text-base" value={f.dates} onChange={(x) => setF({ ...f, dates: x.target.value })} placeholder="e.g. weekday mornings, not December" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn-primary flex-1 justify-center !py-3">
              I'm in! <Heart size={18} />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <div className="card p-8">
            <CheckCircle2 size={56} className="mx-auto text-brand-600" />
            <h1 className="h-display mt-3 text-3xl">Thank you, {f.contactName.split(' ')[0] || first}!</h1>
            <p className="mt-2 text-stone-700">You just made a real difference for {school.name} students.</p>
            <ol className="mt-6 space-y-3 text-left text-sm">
              {[
                `${owner.display} will call you this week to say hi and pick a date.`,
                'You’ll get parking, check-in and an agenda a week before.',
                'Afterwards, students will send you thank-you notes. They’ll show up right here.',
              ].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <ContactCard person={owner} schoolName={school.name} />
          <p className="text-xs text-stone-500">Bookmark this page. It's your personal partner page.</p>
        </div>
      )}
    </div>
  )
}

function EmployerHome({ employerId }: { employerId: string }) {
  const { state, logActivity } = useStore()
  const { toast, toastNode } = useToast()
  const [interested, setInterested] = useState(false)
  const e = state.employers.find((x) => x.id === employerId)!
  const owner = state.staff.find((s) => s.id === e.ownerId)!
  const school = state.schools.find((s) => s.id === e.schoolId)!
  const first = e.contactName.replace(/^(Dr\.|Capt\.)\s*/, '').split(' ')[0]
  const level = levelOfStage(e.stage)
  const events = state.events.filter((ev) => ev.employerIds.includes(e.id))
  const upcoming = events.filter((ev) => !ev.happened)
  const opps = state.opportunities.filter((o) => o.employerId === e.id && o.status !== 'draft')
  const needs = requirementsForLevel(level).filter((r) => r.who === 'employer' && !['received', 'not_needed'].includes(e.paperwork[r.id] ?? 'needed'))
  const notes = state.thankYous.filter((t) => t.employerId === e.id)
  const reached = events.filter((ev) => ev.happened).reduce((s, ev) => s + ev.students, 0) + state.opportunities.filter((o) => o.employerId === e.id && o.status === 'accepted').reduce((s, o) => s + o.slots, 0)
  const next = LEVELS.find((r) => r.level === level + 1)
  const nextAct = next && ACTIVITIES.find((a) => a.level === next.level)

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6 sm:py-10">
      <header className="text-center">
        <p className="text-sm font-medium text-brand-800">{school.name} · Community Partners</p>
        <h1 className="h-display mt-1 text-3xl">Welcome back, {first}</h1>
      </header>

      {level >= 1 ? (
        <div className="card flex items-center gap-4 bg-gradient-to-br from-warm-50 to-white p-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-warm-500 text-white shadow-inner">
            <Award size={32} />
          </span>
          <div>
            <p className="font-semibold text-stone-900">{school.name} Community Partner</p>
            <p className="text-sm text-stone-600">
              {e.name} has helped about <strong>{reached || 'dozens of'}</strong> students see their future.
            </p>
          </div>
        </div>
      ) : (
        <div className="card p-5">
          <p className="font-semibold">You're signed up! 🎉</p>
          <p className="text-sm text-stone-600">
            You picked: {e.signup?.activityIds.map((id) => activityById(id)?.name).join(', ')}. {owner.display} will be in touch soon.
          </p>
        </div>
      )}

      <ContactCard person={owner} schoolName={school.name} />

      {(upcoming.length > 0 || opps.length > 0) && (
        <section className="card p-5">
          <h2 className="mb-2 font-semibold">Coming up</h2>
          <ul className="space-y-2 text-sm">
            {upcoming.map((ev) => (
              <li key={ev.id}>
                📅 <strong>{ev.title}</strong>, {shortDate(ev.date)}
              </li>
            ))}
            {opps.map((o) => (
              <li key={o.id}>
                {activityById(o.kind)?.emoji ?? '⭐'} <strong>{o.title}</strong> {o.dates && `· ${o.dates}`} <span className="text-stone-500">({o.status === 'proposed' ? 'proposed' : 'confirmed'})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {needs.length > 0 && (
        <section className="card p-5">
          <h2 className="font-semibold">A few things we need from you</h2>
          <p className="mb-2 text-xs text-stone-500">{owner.display} will walk you through these. No legal homework required.</p>
          <ul className="space-y-1.5 text-sm">
            {needs.map((r) => (
              <li key={r.id} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                {r.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-5">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <Heart size={16} className="text-rose-500" /> Notes from students
        </h2>
        {notes.length === 0 ? (
          <p className="text-sm text-stone-500">Thank-you notes from students will appear here after your first activity.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((t) => (
              <li key={t.id} className="rounded-lg bg-warm-50 p-3 text-sm text-stone-800">
                “{t.text}”<span className="mt-1 block text-xs text-stone-500">— {t.student}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {level >= 1 && next && nextAct && (
        <section className="card border-brand-200 bg-brand-50 p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <Sparkles size={14} /> When you're ready
          </p>
          <p className="mt-1 font-semibold text-stone-900">
            Enjoyed it? Many partners next try a {nextAct.name.toLowerCase()}.
          </p>
          <p className="text-sm text-stone-600">
            {next.blurb} ({nextAct.time})
          </p>
          {interested ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-800">
              <Check size={16} /> Great! {owner.display} will reach out.
            </p>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                className="btn-primary"
                onClick={() => {
                  logActivity(e.id, 'signup', null, `${e.contactName} said they're interested in a ${nextAct.name.toLowerCase()} (Level ${next.level}).`)
                  setInterested(true)
                  toast('Thanks! We let your contact know.')
                }}
              >
                I'm interested
              </button>
              <button className="btn-ghost" onClick={() => toast('No problem. We’ll keep you posted on easy ways to help.')}>
                Not right now
              </button>
            </div>
          )}
        </section>
      )}
      {toastNode}
    </div>
  )
}

export function StudentForm() {
  const { slug = '' } = useParams()
  const { state, addStudentLead } = useStore()
  const school = state.schools.find((s) => s.slug === slug) ?? state.schools[0]
  const staff = state.staff.filter((s) => s.schoolId === school.id)
  const blank = { studentName: '', grade: '11', business: '', sector: SECTORS[0], howKnown: '', contactName: '', contactInfo: '', teacherId: staff[0]?.id ?? '' }
  const [f, setF] = useState(blank)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="card p-8">
          <p className="text-5xl">🙌</p>
          <h1 className="h-display mt-2 text-2xl">Thanks for sharing!</h1>
          <p className="mt-2 text-stone-600">{staff.find((s) => s.id === f.teacherId)?.display ?? 'A teacher'} will follow up. You might have just opened a door for a lot of students.</p>
          <button className="btn-primary mt-6" onClick={() => (setF({ ...blank, studentName: f.studentName, grade: f.grade, teacherId: f.teacherId }), setDone(false))}>
            Add another business
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:py-10">
      <header className="mb-4 text-center">
        <p className="text-sm font-medium text-brand-800">{school.name}</p>
        <h1 className="h-display mt-1 text-3xl">Know a business that could help?</h1>
        <p className="mt-2 text-stone-600">Where do you, your family or your neighbors work? Local businesses can host career fairs, tours and internships. Tell us who you know!</p>
      </header>
      <form
        className="card space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault()
          addStudentLead({ ...f, schoolId: school.id })
          setDone(true)
        }}
      >
        <div className="grid grid-cols-[1fr_90px] gap-2">
          <div>
            <label className="label" htmlFor="st-name">Your name</label>
            <input id="st-name" className="input !py-2.5 !text-base" value={f.studentName} onChange={(e) => setF({ ...f, studentName: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="st-grade">Grade</label>
            <select id="st-grade" className="input !py-2.5 !text-base" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })}>
              {['9', '10', '11', '12'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="st-biz">Business name</label>
          <input id="st-biz" className="input !py-2.5 !text-base" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} placeholder="e.g. Joe's Auto Body" required />
        </div>
        <div>
          <label className="label" htmlFor="st-sector">What kind of business?</label>
          <select id="st-sector" className="input !py-2.5 !text-base" value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })}>
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="st-how">How do you know them?</label>
          <input id="st-how" className="input !py-2.5 !text-base" value={f.howKnown} onChange={(e) => setF({ ...f, howKnown: e.target.value })} placeholder="My aunt works there / I work there…" required />
        </div>
        <div>
          <label className="label" htmlFor="st-contact">Who should we talk to? (optional)</label>
          <input id="st-contact" className="input !py-2.5 !text-base" value={f.contactName} onChange={(e) => setF({ ...f, contactName: e.target.value })} placeholder="Name" />
        </div>
        <div>
          <label className="label" htmlFor="st-info">Their email or phone (optional)</label>
          <input id="st-info" className="input !py-2.5 !text-base" value={f.contactInfo} onChange={(e) => setF({ ...f, contactInfo: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="st-teacher">Which teacher should follow up?</label>
          <select id="st-teacher" className="input !py-2.5 !text-base" value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })}>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.display}</option>)}
          </select>
        </div>
        <button className="btn-primary w-full justify-center !py-3 text-base">Share this business</button>
        <p className="text-center text-xs text-stone-500">A teacher will reach out to them, not you.</p>
      </form>
    </div>
  )
}
