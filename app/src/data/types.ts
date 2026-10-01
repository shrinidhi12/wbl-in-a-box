export type Role = 'coordinator' | 'staff' | 'student' | 'employer' | 'district'

export type Stage = 'lead' | 'invited' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'notnow'

export type Level = 1 | 2 | 3 | 4 | 5

export type LeadSource = 'staff' | 'student' | 'explorer' | 'inbound'

export type Warmth = 'cold' | 'know' | 'close'

export type PaperStatus = 'not_needed' | 'needed' | 'requested' | 'received' | 'expired'

export interface District {
  id: string
  name: string
}

export interface School {
  id: string
  slug: string
  name: string
  city: string
  districtId: string
}

export interface Staff {
  id: string
  schoolId: string
  name: string
  /** How students and employers address them, e.g. "Ms. Johnson" */
  display: string
  title: string
  email: string
  phone: string
  color: string
}

export interface LevelEvent {
  level: Level
  date: string
}

export interface Employer {
  id: string
  schoolId: string
  name: string
  sector: string
  city: string
  contactName: string
  contactTitle: string
  contactEmail: string
  contactPhone: string
  ownerId: string
  helperIds: string[]
  stage: Stage
  source: LeadSource
  /** Relationship to the owner when it came in, e.g. "Parent of a junior" */
  relationship: string
  warmth: Warmth
  levelHistory: LevelEvent[]
  stageSince: string
  lastContact: string | null
  checkBackDate?: string
  notes: string
  token: string
  paperwork: Record<string, PaperStatus>
  /** What the employer picked in the public onboarding flow */
  signup?: { activityIds: string[]; dates: string; signedUpAt: string }
}

export type ActivityType =
  | 'email'
  | 'text'
  | 'call'
  | 'meeting'
  | 'event'
  | 'thankyou'
  | 'proposal'
  | 'levelup'
  | 'note'
  | 'signup'

export interface Activity {
  id: string
  employerId: string
  date: string
  type: ActivityType
  byId: string | null
  text: string
}

export interface StudentLead {
  id: string
  schoolId: string
  studentName: string
  grade: string
  business: string
  sector: string
  howKnown: string
  contactName: string
  contactInfo: string
  teacherId: string
  submittedAt: string
  claimedEmployerId?: string
}

export interface ThankYou {
  id: string
  employerId: string
  student: string
  text: string
  date: string
}

export interface Opportunity {
  id: string
  employerId: string
  kind: string
  level: 3 | 4 | 5
  title: string
  dates: string
  slots: number
  supervisor: string
  skills: string
  description: string
  status: 'draft' | 'proposed' | 'accepted'
  createdAt: string
}

export interface SchoolEvent {
  id: string
  schoolId: string
  title: string
  activityId: string
  date: string
  employerIds: string[]
  students: number
  checklist: { label: string; done: boolean }[]
  happened: boolean
}

export interface Intro {
  id: string
  employerId: string
  group: string
  activity: string
  date: string
  studentPrep: { label: string; done: boolean }[]
  employerPrep: { label: string; done: boolean }[]
}

export interface JourneyState {
  completed: string[]
  why: string
  selfCheck: Record<string, number>
}

export interface AppState {
  role: Role
  schoolId: string
  districts: District[]
  schools: School[]
  staff: Staff[]
  employers: Employer[]
  activities: Activity[]
  studentLeads: StudentLead[]
  thankYous: ThankYou[]
  opportunities: Opportunity[]
  events: SchoolEvent[]
  intros: Intro[]
  journey: JourneyState
  /** Intake profile per school (zip, student interests, course catalogue, focus industries) */
  profiles: Record<string, SchoolProfile>
  /** Seeded journey progress for other staff, for the team view */
  teamProgress: Record<string, number>
}

export interface SchoolProfile {
  zip: string
  /** Student interest by industry: 0 = not much, 1 = some, 2 = a lot */
  interests: Record<string, number>
  interestSources: string[]
  interestNotes: string
  catalogName: string
  courses: { name: string; sectors: string[] }[]
  focusSectors: string[]
  completedAt?: string
}
