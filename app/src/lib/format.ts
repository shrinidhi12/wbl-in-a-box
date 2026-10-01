const DAY = 86_400_000

export const daysSince = (iso: string | null | undefined) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : Infinity

export function relDate(iso: string) {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / DAY)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d === -1) return 'tomorrow'
  if (d < 0) return `in ${-d} days`
  if (d < 30) return `${d} days ago`
  if (d < 365) return `${Math.round(d / 30)} mo ago`
  return `${Math.round(d / 365)} yr ago`
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const initials = (name: string) =>
  name
    .replace(/^(Dr|Capt|Mr|Ms|Mrs)\.?\s+/, '')
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Start of the current semester: Aug 1 for fall, Jan 1 for spring. */
export function semesterStart(d = new Date()) {
  return d.getMonth() >= 7 ? new Date(d.getFullYear(), 7, 1) : new Date(d.getFullYear(), 0, 1)
}

export const semesterLabel = (d = new Date()) => (d.getMonth() >= 7 ? `Fall ${d.getFullYear()}` : `Spring ${d.getFullYear()}`)
