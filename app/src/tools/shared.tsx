import type { Employer } from '../data/types'
import { stageInfo } from '../data/ladder'

const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '')

/** Finds an existing employer at the same school whose name looks like the same business. */
export function findDuplicate(employers: Employer[], name: string): Employer | undefined {
  const n = norm(name)
  if (n.length < 4) return undefined
  return employers.find((e) => {
    const m = norm(e.name)
    return m === n || m.includes(n) || n.includes(m)
  })
}

export function EmployerSelect({
  employers,
  value,
  onChange,
  label = 'Employer',
  id = 'employer',
}: {
  employers: Employer[]
  value: string
  onChange: (id: string) => void
  label?: string
  id?: string
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {employers.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} ({stageInfo(e.stage).short})
          </option>
        ))}
      </select>
    </div>
  )
}

export const inviteUrl = (token: string) => `${window.location.origin}/e/${token}`
