import co from '../config/states/co.json'
import type { PaperStatus } from '../data/types'

export type Requirement = (typeof co.requirements)[number]
export type SourceKey = keyof typeof co.sources

export const STATE_CONFIG = co

export const requirementsForLevel = (level: number): Requirement[] =>
  co.requirements.filter((r) => r.levels.includes(level))

export const sourceFor = (r: Requirement) => co.sources[r.source as SourceKey]

export const PAPER_STATUSES: { id: PaperStatus; label: string; cls: string }[] = [
  { id: 'not_needed', label: 'Not needed', cls: 'bg-stone-100 text-stone-500' },
  { id: 'needed', label: 'Needed', cls: 'bg-rose-50 text-rose-700' },
  { id: 'requested', label: 'Requested', cls: 'bg-amber-50 text-amber-800' },
  { id: 'received', label: 'Received', cls: 'bg-emerald-50 text-emerald-800' },
  { id: 'expired', label: 'Expired', cls: 'bg-stone-200 text-stone-700' },
]

export const WHO_LABEL: Record<string, string> = {
  school: 'School',
  employer: 'Employer',
  parent: 'Parent/guardian',
  district: 'District',
}
