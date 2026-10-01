import { SECTORS } from '../data/ladder'
import { marketFor, regionForZip, type SectorMarket } from '../data/market'
import type { SchoolProfile } from '../data/types'

export type Quadrant = 'sweet' | 'build' | 'passion' | 'later'

export const QUADRANTS: Record<Quadrant, { label: string; advice: string; cls: string }> = {
  sweet: { label: 'Prioritize', advice: 'Growing fast locally, and students are already interested or taking courses. Recruit here first.', cls: 'bg-brand-700 text-white' },
  build: { label: 'Build awareness', advice: 'Fast-growing, but students don’t know it yet. Level 1–2 activities (conversations, classroom visits) spark interest.', cls: 'bg-emerald-100 text-emerald-800' },
  passion: { label: 'Student passion', advice: 'Students love it, but local growth is modest. Keep a few strong partners so students can explore.', cls: 'bg-warm-100 text-warm-700' },
  later: { label: 'Lower priority', advice: 'Slower growth and less student interest right now.', cls: 'bg-stone-100 text-stone-600' },
}

export interface SectorPriority {
  sector: string
  market: SectorMarket
  interest: number
  courses: string[]
  /** 0–1: how ready students are (interest + coursework) */
  readiness: number
  /** 0–1: normalized projected growth */
  growth: number
  score: number
  quadrant: Quadrant
  reasons: string[]
}

/** Growth at or above this (5-yr %) counts as "fast growth" locally. */
export const FAST_GROWTH = 6

export function computePriorities(profile: SchoolProfile): SectorPriority[] {
  const region = regionForZip(profile.zip)
  if (!region) return []
  const market = marketFor(region)
  const maxG = Math.max(...market.map((m) => m.proj5))
  const minG = Math.min(...market.map((m) => m.proj5))

  return SECTORS.map((sector) => {
    const m = market.find((x) => x.sector === sector)!
    const interest = profile.interests[sector] ?? 0
    const courses = profile.courses.filter((c) => c.sectors.includes(sector)).map((c) => c.name)
    const readiness = (interest / 2) * 0.6 + Math.min(courses.length / 4, 1) * 0.4
    const growth = (m.proj5 - minG) / Math.max(maxG - minG, 0.1)
    const score = growth * 0.5 + readiness * 0.5
    const fast = m.proj5 >= FAST_GROWTH
    const ready = readiness >= 0.4
    const quadrant: Quadrant = fast && ready ? 'sweet' : fast ? 'build' : ready ? 'passion' : 'later'
    const reasons = [
      `${m.proj5 > 0 ? '+' : ''}${m.proj5}% projected growth`,
      ...(interest === 2 ? ['strong student interest'] : interest === 1 ? ['some student interest'] : []),
      ...(courses.length ? [`${courses.length} related course${courses.length > 1 ? 's' : ''}`] : []),
    ]
    return { sector, market: m, interest, courses, readiness, growth, score, quadrant, reasons }
  }).sort((a, b) => b.score - a.score)
}
