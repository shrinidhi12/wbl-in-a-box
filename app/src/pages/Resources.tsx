import { Link } from 'react-router-dom'
import { ALL_RESOURCES, PARTS, STEPS } from '../lib/content'
import { ResourceCard } from '../components/ResourceCard'
import { Disclaimer } from '../components/Paperwork'

export function Resources() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h-display text-2xl">Resource library</h1>
        <p className="text-sm text-stone-600">Every template, script and handout from the journey in one place. Edit them freely to sound like your school.</p>
      </header>
      {PARTS.map((p) => (
        <section key={p.id} className="space-y-4">
          <h2 className="text-lg font-semibold">{p.title}</h2>
          {STEPS.filter((s) => s.part === p.id).map((s) => (
            <div key={s.id}>
              <Link to={`/journey/${s.id}`} className="mb-2 block text-sm font-medium text-stone-600 hover:text-brand-700">
                {s.number} · {s.title}
              </Link>
              {s.id === 's6' && (
                <div className="mb-2">
                  <Disclaimer />
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ALL_RESOURCES.filter((r) => r.step.id === s.id).map((r) => (
                  <ResourceCard key={r.id} id={r.id} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
