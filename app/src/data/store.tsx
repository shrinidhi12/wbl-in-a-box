import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { makeSeed, slug } from './seed'
import { activityById, levelOfStage, stageInfo } from './ladder'
import type { Activity, AppState, Level, SchoolProfile, Employer, Intro, Opportunity, Role, SchoolEvent, Stage, StudentLead, ThankYou } from './types'

const KEY = 'wbl-in-a-box-demo-v2'

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    /* storage unavailable: fall back to seed */
  }
  return makeSeed()
}

function save(s: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`
const now = () => new Date().toISOString()

function useStoreValue() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    save(state)
  }, [state])

  // Keep tabs in sync, so an employer link opened in a new tab updates the coordinator's view.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setState(JSON.parse(e.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev)
      fn(draft)
      return draft
    })
  }, [])

  const log = (d: AppState, employerId: string, type: Activity['type'], byId: string | null, text: string) => {
    d.activities.push({ id: uid('a'), employerId, date: now(), type, byId, text })
    const e = d.employers.find((x) => x.id === employerId)
    if (e && type !== 'levelup' && type !== 'note') e.lastContact = now()
  }

  const moveStage = (d: AppState, e: Employer, stage: Stage, byId: string | null) => {
    if (e.stage === stage) return
    const prevLevel = Math.max(0, ...e.levelHistory.map((r) => r.level))
    const newLevel = levelOfStage(stage)
    if (newLevel > prevLevel) {
      // Record only the level actually reached; skipped levels didn't happen.
      e.levelHistory.push({ level: newLevel as Level, date: now() })
      log(d, e.id, 'levelup', byId, `Moved to ${stageInfo(stage).label}`)
    } else {
      log(d, e.id, 'note', byId, `Stage changed to ${stageInfo(stage).label}`)
    }
    e.stage = stage
    e.stageSince = now()
  }

  const actions = {
    setRole: (role: Role) => update((d) => void (d.role = role)),
    setSchool: (schoolId: string) => update((d) => void (d.schoolId = schoolId)),
    reset: () => {
      const fresh = makeSeed()
      fresh.role = state.role
      setState(fresh)
    },

    addEmployer: (e: Omit<Employer, 'id' | 'token' | 'levelHistory' | 'stageSince' | 'lastContact' | 'paperwork' | 'helperIds' | 'notes'> & Partial<Employer>) => {
      const id = uid('e')
      const token = `${slug(e.name)}-${id.slice(-4)}`
      update((d) => {
        d.employers.push({ helperIds: [], notes: '', paperwork: {}, levelHistory: [], lastContact: null, ...e, id, token, stageSince: now() })
      })
      return id
    },
    updateEmployer: (id: string, patch: Partial<Employer>) =>
      update((d) => {
        const e = d.employers.find((x) => x.id === id)
        if (e) Object.assign(e, patch)
      }),
    setStage: (id: string, stage: Stage, byId: string | null) =>
      update((d) => {
        const e = d.employers.find((x) => x.id === id)
        if (e) moveStage(d, e, stage, byId)
      }),
    addHelper: (id: string, staffId: string) =>
      update((d) => {
        const e = d.employers.find((x) => x.id === id)
        if (e && e.ownerId !== staffId && !e.helperIds.includes(staffId)) e.helperIds.push(staffId)
      }),
    logActivity: (employerId: string, type: Activity['type'], byId: string | null, text: string) =>
      update((d) => log(d, employerId, type, byId, text)),
    sendInvite: (employerId: string, byId: string, channel: string) =>
      update((d) => {
        const e = d.employers.find((x) => x.id === employerId)
        if (!e) return
        log(d, employerId, channel === 'call' ? 'call' : channel === 'text' ? 'text' : 'email', byId, `Sent a personal invite (${channel}).`)
        if (e.stage === 'lead' || e.stage === 'notnow') moveStage(d, e, 'invited', byId)
      }),

    addStudentLead: (lead: Omit<StudentLead, 'id' | 'submittedAt'>) =>
      update((d) => void d.studentLeads.unshift({ ...lead, id: uid('sl'), submittedAt: now() })),
    claimStudentLead: (leadId: string, ownerId: string) =>
      update((d) => {
        const l = d.studentLeads.find((x) => x.id === leadId)
        if (!l || l.claimedEmployerId) return
        const id = uid('e')
        d.employers.push({
          id,
          schoolId: l.schoolId,
          name: l.business,
          sector: l.sector,
          city: 'Lakewood',
          contactName: l.contactName || 'Unknown',
          contactTitle: '',
          contactEmail: l.contactInfo.includes('@') ? l.contactInfo : '',
          contactPhone: l.contactInfo.includes('@') ? '' : l.contactInfo,
          ownerId,
          helperIds: [],
          stage: 'lead',
          source: 'student',
          relationship: `${l.studentName} (grade ${l.grade}): ${l.howKnown}`,
          warmth: 'know',
          levelHistory: [],
          stageSince: now(),
          lastContact: null,
          notes: '',
          token: `${slug(l.business)}-${id.slice(-4)}`,
          paperwork: {},
        })
        l.claimedEmployerId = id
      }),

    addThankYou: (t: Omit<ThankYou, 'id' | 'date'>, byId: string) =>
      update((d) => {
        d.thankYous.unshift({ ...t, id: uid('t'), date: now() })
        log(d, t.employerId, 'thankyou', byId, `Shared a student thank-you note from ${t.student}.`)
      }),

    saveOpportunity: (o: Omit<Opportunity, 'id' | 'createdAt'> & { id?: string }) => {
      const id = o.id ?? uid('o')
      update((d) => {
        const existing = d.opportunities.find((x) => x.id === id)
        if (existing) Object.assign(existing, o)
        else d.opportunities.unshift({ ...o, id, createdAt: now() })
      })
      return id
    },
    proposeOpportunity: (id: string, byId: string) =>
      update((d) => {
        const o = d.opportunities.find((x) => x.id === id)
        if (!o) return
        o.status = 'proposed'
        log(d, o.employerId, 'proposal', byId, `Proposed: ${o.title} (Level ${o.level}).`)
      }),
    acceptOpportunity: (id: string, byId: string) =>
      update((d) => {
        const o = d.opportunities.find((x) => x.id === id)
        if (!o) return
        o.status = 'accepted'
        const e = d.employers.find((x) => x.id === o.employerId)
        if (e && levelOfStage(e.stage) < o.level) moveStage(d, e, `level${o.level}` as Stage, byId)
      }),
    setPaperwork: (employerId: string, reqId: string, status: Employer['paperwork'][string]) =>
      update((d) => {
        const e = d.employers.find((x) => x.id === employerId)
        if (e) e.paperwork[reqId] = status
      }),

    saveEvent: (ev: Omit<SchoolEvent, 'id'>) => {
      const id = uid('ev')
      update((d) => void d.events.unshift({ ...ev, id }))
      return id
    },
    toggleEventCheck: (eventId: string, i: number) =>
      update((d) => {
        const ev = d.events.find((x) => x.id === eventId)
        if (ev) ev.checklist[i].done = !ev.checklist[i].done
      }),
    markEventHappened: (eventId: string, byId: string) =>
      update((d) => {
        const ev = d.events.find((x) => x.id === eventId)
        if (!ev || ev.happened) return
        ev.happened = true
        for (const eid of ev.employerIds) {
          const e = d.employers.find((x) => x.id === eid)
          if (!e) continue
          log(d, eid, 'event', byId, `Took part in ${ev.title}.`)
          const lvl = activityById(ev.activityId)?.level ?? 2
          if (levelOfStage(e.stage) < lvl) moveStage(d, e, `level${lvl}` as Stage, byId)
        }
      }),

    saveIntro: (intro: Omit<Intro, 'id'>, byId: string) =>
      update((d) => {
        d.intros.unshift({ ...intro, id: uid('in') })
        log(d, intro.employerId, 'meeting', byId, `Planned an introduction: ${intro.activity} with ${intro.group}.`)
      }),
    toggleIntroCheck: (introId: string, list: 'studentPrep' | 'employerPrep', i: number) =>
      update((d) => {
        const it = d.intros.find((x) => x.id === introId)
        if (it) it[list][i].done = !it[list][i].done
      }),

    employerSignup: (employerId: string, activityIds: string[], dates: string, contact: Partial<Employer>) =>
      update((d) => {
        const e = d.employers.find((x) => x.id === employerId)
        if (!e) return
        Object.assign(e, contact)
        e.signup = { activityIds, dates, signedUpAt: now() }
        log(d, employerId, 'signup', null, `${e.contactName} signed up through their invite link.`)
      }),

    completeStep: (stepId: string, done = true) =>
      update((d) => {
        const set = new Set(d.journey.completed)
        if (done) set.add(stepId)
        else set.delete(stepId)
        d.journey.completed = [...set]
      }),
    updateProfile: (patch: Partial<SchoolProfile>) =>
      update((d) => {
        d.profiles[d.schoolId] = { ...emptyProfile(), ...d.profiles[d.schoolId], ...patch }
      }),
    setWhy: (why: string) => update((d) => void (d.journey.why = why)),
    setSelfCheck: (id: string, v: number) => update((d) => void (d.journey.selfCheck[id] = v)),
  }

  return { state, ...actions }
}

type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}

/** The signed-in staff member for the current demo role. */
export function useMe() {
  const { state } = useStore()
  const id = state.role === 'staff' ? 's-patel' : 's-johnson'
  return state.staff.find((s) => s.id === id)!
}

export const emptyProfile = (): SchoolProfile => ({
  zip: '',
  interests: {},
  interestSources: [],
  interestNotes: '',
  catalogName: '',
  courses: [],
  focusSectors: [],
})

/** The current school's intake profile (empty until the intake is started). */
export function useProfile() {
  const { state } = useStore()
  return state.profiles?.[state.schoolId] ?? emptyProfile()
}

export function useSchool() {
  const { state } = useStore()
  return state.schools.find((s) => s.id === state.schoolId)!
}

export function useSchoolData() {
  const { state } = useStore()
  return useMemo(
    () => ({
      employers: state.employers.filter((e) => e.schoolId === state.schoolId),
      staff: state.staff.filter((s) => s.schoolId === state.schoolId),
      studentLeads: state.studentLeads.filter((l) => l.schoolId === state.schoolId),
    }),
    [state.employers, state.staff, state.studentLeads, state.schoolId],
  )
}
