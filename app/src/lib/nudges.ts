import { MAX_LEVEL, levelOfStage, stageInfo } from '../data/ladder'
import type { AppState, Employer } from '../data/types'
import { daysSince } from './format'

export type NudgeKind = 'thank' | 'quiet' | 'next' | 'checkback' | 'followup' | 'studentLeads'

export interface Nudge {
  id: string
  kind: NudgeKind
  employerId?: string
  ownerId?: string
  title: string
  detail: string
  action: string
  urgency: 1 | 2 | 3
}

/**
 * Rule-based nudges. They prompt a human to act; nothing is ever sent automatically.
 * Returns nudges for one staff member (owner) or, when ownerId is undefined, for the whole school.
 */
export function computeNudges(state: AppState, schoolId: string, ownerId?: string): Nudge[] {
  const out: Nudge[] = []
  const emps = state.employers.filter((e) => e.schoolId === schoolId && (!ownerId || e.ownerId === ownerId))
  const acts = (e: Employer) => state.activities.filter((a) => a.employerId === e.id)

  for (const e of emps) {
    const list = acts(e)
    const lastEvent = list.filter((a) => a.type === 'event').sort((a, b) => b.date.localeCompare(a.date))[0]
    const thankedAfter = lastEvent && list.some((a) => a.type === 'thankyou' && a.date >= lastEvent.date)
    const level = levelOfStage(e.stage)

    if (lastEvent && !thankedAfter && daysSince(lastEvent.date) <= 7) {
      const d = daysSince(lastEvent.date)
      out.push({
        id: `thank-${e.id}`,
        kind: 'thank',
        employerId: e.id,
        ownerId: e.ownerId,
        title: `Thank ${e.contactName.split(' ')[0]} at ${e.name}`,
        detail: `They took part ${d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`}. Thank within 48 hours, ideally with a student note.`,
        action: 'Add a thank-you',
        urgency: d >= 2 ? 3 : 2,
      })
      continue
    }
    if (e.stage === 'notnow' && e.checkBackDate && daysSince(e.checkBackDate) >= 0) {
      out.push({ id: `cb-${e.id}`, kind: 'checkback', employerId: e.id, ownerId: e.ownerId, title: `Check back with ${e.name}`, detail: `They asked you to check back around now. ${e.notes}`.trim(), action: 'Reach out', urgency: 2 })
      continue
    }
    if (e.stage === 'invited' && daysSince(e.lastContact) >= 7) {
      out.push({ id: `fu-${e.id}`, kind: 'followup', employerId: e.id, ownerId: e.ownerId, title: `Follow up on your invite to ${e.name}`, detail: `Invite sent ${daysSince(e.lastContact)} days ago with no reply. A short call often works better than a second email.`, action: 'Follow up', urgency: 2 })
      continue
    }
    if (level >= 1 && level < MAX_LEVEL && daysSince(e.stageSince) >= 21 && !list.some((a) => a.type === 'proposal' && a.date >= e.stageSince)) {
      out.push({ id: `next-${e.id}`, kind: 'next', employerId: e.id, ownerId: e.ownerId, title: `Suggest a next step to ${e.name}`, detail: `On ${stageInfo(e.stage).label} for ${daysSince(e.stageSince)} days. Invite them one level up.`, action: 'Build an opportunity', urgency: 1 })
      continue
    }
    if (level >= 1 && daysSince(e.lastContact) >= 14) {
      out.push({ id: `quiet-${e.id}`, kind: 'quiet', employerId: e.id, ownerId: e.ownerId, title: `It’s been quiet with ${e.name}`, detail: `No contact in ${daysSince(e.lastContact)} days. Share a student moment or just say hi.`, action: 'Log a touchpoint', urgency: 1 })
    }
  }

  const unclaimed = state.studentLeads.filter((l) => l.schoolId === schoolId && !l.claimedEmployerId && (!ownerId || l.teacherId === ownerId))
  if (unclaimed.length) {
    out.push({ id: 'student-leads', kind: 'studentLeads', title: `${unclaimed.length} student-sourced lead${unclaimed.length > 1 ? 's' : ''} waiting`, detail: 'Students shared businesses they’re connected to. Claim the ones you can follow up on.', action: 'Review leads', urgency: 2 })
  }

  return out.sort((a, b) => b.urgency - a.urgency)
}
