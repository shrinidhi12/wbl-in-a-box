import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Clock, Compass, Lightbulb, MapPin, Quote, Sparkles } from 'lucide-react'
import { useMe, useProfile, useSchool, useStore } from '../data/store'
import { SECTOR_EMOJI } from '../data/ladder'
import { regionForZip } from '../data/market'
import { PARTS, STEPS, learnMarkdown, stepById, type Step } from '../lib/content'
import { Markdown } from '../components/ui'
import { ResourceCard } from '../components/ResourceCard'
import { TOOLS } from '../tools'

function JourneyRail({ current }: { current?: string }) {
  const { state } = useStore()
  const profile = useProfile()
  const done = new Set(state.journey.completed)
  return (
    <nav aria-label="Journey" className="space-y-5">
      <div>
        <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Start here</p>
        <Link to="/intake" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-stone-700 hover:bg-stone-100">
          {profile.completedAt ? <CheckCircle2 size={16} className="shrink-0 text-brand-600" /> : <Compass size={16} className="shrink-0 text-warm-500" />}
          <span className="w-6 shrink-0 text-xs text-stone-400">0</span>
          <span className="truncate">School profile</span>
        </Link>
      </div>
      {PARTS.map((p) => (
        <div key={p.id}>
          <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{p.title}</p>
          <ol className="space-y-0.5">
            {STEPS.filter((s) => s.part === p.id).map((s) => (
              <li key={s.id}>
                <Link
                  to={`/journey/${s.id}`}
                  aria-current={current === s.id ? 'step' : undefined}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${current === s.id ? 'bg-brand-50 font-medium text-brand-800' : 'text-stone-700 hover:bg-stone-100'}`}
                >
                  {done.has(s.id) ? <CheckCircle2 size={16} className="shrink-0 text-brand-600" /> : <Circle size={16} className="shrink-0 text-stone-300" />}
                  <span className="w-6 shrink-0 text-xs text-stone-400">{s.number}</span>
                  <span className="truncate">{s.short}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  )
}

function Progress() {
  const { state } = useStore()
  const pct = Math.round((state.journey.completed.length / STEPS.length) * 100)
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-stone-500">
        <span>Your progress</span>
        <span>
          {state.journey.completed.length} of {STEPS.length}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function JourneyHome() {
  const { state } = useStore()
  const me = useMe()
  const school = useSchool()
  const profile = useProfile()
  const done = new Set(state.journey.completed)
  const next = STEPS.find((s) => !done.has(s.id)) ?? STEPS[0]
  const needsIntake = !profile.completedAt

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-5">
          <Progress />
          <JourneyRail />
        </div>
      </aside>
      <div className="space-y-6">
        <section className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white sm:p-8">
            <p className="text-sm text-brand-100">Welcome, {me.name.split(' ')[0]} 👋</p>
            <h1 className="h-display mt-1 text-2xl sm:text-3xl">Let's build {school.name}'s employer network, one relationship at a time.</h1>
            <p className="mt-3 max-w-2xl text-brand-100">
              New to work-based learning? You're in the right place. This journey takes about 30 minutes of reading, spread over as long as you need. Each step has a short lesson, a tool to do the work, and templates to grab.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {needsIntake ? (
                <Link to="/intake" className="btn bg-white text-brand-800 hover:bg-brand-50">
                  Start here: your school profile (10 min) <ArrowRight size={16} />
                </Link>
              ) : (
                <Link to={`/journey/${next.id}`} className="btn bg-white text-brand-800 hover:bg-brand-50">
                  {state.journey.completed.length ? 'Continue' : 'Start'}: {next.number} {next.short} <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/today" className="btn text-white hover:bg-white/10">
                Skip to today's to-dos
              </Link>
            </div>
          </div>
          <div className="p-4 lg:hidden">
            <Progress />
          </div>
        </section>

        <ProfileCard />

        {PARTS.map((p) => (
          <section key={p.id}>
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mb-3 text-sm text-stone-500">{p.subtitle}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {STEPS.filter((s) => s.part === p.id).map((s) => (
                <StepCard key={s.id} step={s} done={done.has(s.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ProfileCard() {
  const profile = useProfile()
  const region = regionForZip(profile.zip)
  if (!profile.completedAt) {
    return (
      <Link to="/intake" className="card flex items-center gap-4 border-warm-100 bg-warm-50 p-5 hover:shadow-md">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warm-500 text-white">
          <Compass size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-stone-900">Start here: your school profile</span>
          <span className="block text-sm text-stone-600">Reflect on student interests, add your course catalogue, and see which local industries are growing. You'll leave with 3–4 focus industries.</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-warm-700" />
      </Link>
    )
  }
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Your focus industries</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-600">
            <MapPin size={14} /> {region?.name} · {profile.courses.filter((c) => c.sectors.length).length} career-connected courses
          </p>
        </div>
        <Link to="/intake" className="text-sm font-medium text-brand-700 underline">
          Edit profile
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.focusSectors.map((s) => (
          <span key={s} className="chip bg-brand-700 !py-1 !text-sm text-white">
            {SECTOR_EMOJI[s]} {s}
          </span>
        ))}
      </div>
    </section>
  )
}

function StepCard({ step, done }: { step: Step; done: boolean }) {
  return (
    <Link to={`/journey/${step.id}`} className="card group flex gap-3 p-4 transition-shadow hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${done ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
        {done ? <Check size={18} /> : step.number}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-stone-900 group-hover:text-brand-800">{step.title}</span>
        <span className="mt-0.5 block text-sm text-stone-500">
          {step.toolTitle} · {step.minutes} min read
        </span>
      </span>
    </Link>
  )
}

export function StepPage() {
  const { stepId = '' } = useParams()
  const step = stepById(stepId)
  const { state, completeStep } = useStore()
  if (!step) return <Navigate to="/journey" replace />

  const idx = STEPS.indexOf(step)
  const prev = STEPS[idx - 1]
  const next = STEPS[idx + 1]
  const done = state.journey.completed.includes(step.id)
  const Tool = TOOLS[step.tool]
  const part = PARTS.find((p) => p.id === step.part)!

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-5">
          <Link to="/journey" className="flex items-center gap-1 px-2 text-sm text-stone-500 hover:text-stone-800">
            <ArrowLeft size={14} /> Journey overview
          </Link>
          <Progress />
          <JourneyRail current={step.id} />
        </div>
      </aside>

      <article className="min-w-0 space-y-5">
        <header>
          <p className="text-sm font-medium text-brand-700">
            {part.title} · Step {step.number}
          </p>
          <h1 className="h-display mt-1 text-2xl text-stone-900 sm:text-3xl">{step.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
            <Clock size={14} /> {step.minutes} min read
          </p>
        </header>

        <section className="card p-5 sm:p-6" aria-labelledby="learn">
          <h2 id="learn" className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-800">1</span> Learn
          </h2>
          <Markdown md={learnMarkdown(step.id)} />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-stone-50 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <Quote size={13} /> Real example
              </p>
              <p className="text-sm text-stone-700">{step.example}</p>
            </div>
            <div className="rounded-lg border border-warm-100 bg-warm-50 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warm-700">
                <Lightbulb size={13} /> Key takeaway
              </p>
              <p className="text-sm font-medium text-stone-800">{step.takeaway}</p>
            </div>
          </div>
        </section>

        <section className="card border-brand-200 p-5 ring-1 ring-brand-100 sm:p-6" aria-labelledby="do">
          <h2 id="do" className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-800">2</span> Do
          </h2>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
            <Sparkles size={18} className="text-brand-600" /> {step.toolTitle}
          </h3>
          <p className="mb-5 text-sm text-stone-600">{step.toolBlurb}</p>
          {Tool ? <Tool /> : null}
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="grab">
          <h2 id="grab" className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <span className="rounded bg-warm-100 px-1.5 py-0.5 text-warm-700">3</span> Grab
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {step.resources.map((r) => (
              <ResourceCard key={r} id={r} />
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5">
          {prev ? (
            <Link to={`/journey/${prev.id}`} className="btn-ghost">
              <ArrowLeft size={16} /> {prev.number} {prev.short}
            </Link>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            <button className={done ? 'btn-secondary' : 'btn-secondary'} onClick={() => completeStep(step.id, !done)}>
              {done ? (
                <>
                  <CheckCircle2 size={16} className="text-brand-600" /> Completed
                </>
              ) : (
                <>
                  <Circle size={16} /> Mark complete
                </>
              )}
            </button>
            {next ? (
              <Link to={`/journey/${next.id}`} className="btn-primary" onClick={() => completeStep(step.id)}>
                Next: {next.number} {next.short} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-primary" onClick={() => completeStep(step.id)}>
                Finish: see your dashboard <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </footer>
      </article>
    </div>
  )
}
