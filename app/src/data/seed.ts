import { levelOfStage } from './ladder'
import type { Activity, AppState, Employer, Level, PaperStatus, LevelEvent, Stage, Staff, StudentLead } from './types'

const DAY = 86_400_000
export const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString()
export const daysFromNow = (n: number) => daysAgo(-n)

const LINCOLN = 'lincoln'

const staff: Staff[] = [
  { id: 's-johnson', schoolId: LINCOLN, name: 'Dana Johnson', display: 'Ms. Johnson', title: 'English teacher & WBL coordinator', email: 'djohnson@lincoln.frusd.org', phone: '(303) 555-0142', color: 'bg-brand-700' },
  { id: 's-patel', schoolId: LINCOLN, name: 'Raj Patel', display: 'Mr. Patel', title: 'CTE engineering teacher', email: 'rpatel@lincoln.frusd.org', phone: '(303) 555-0157', color: 'bg-indigo-600' },
  { id: 's-gomez', schoolId: LINCOLN, name: 'Alicia Gómez', display: 'Ms. Gómez', title: 'School counselor', email: 'agomez@lincoln.frusd.org', phone: '(303) 555-0163', color: 'bg-rose-600' },
  { id: 's-reed', schoolId: LINCOLN, name: 'Marcus Reed', display: 'Coach Reed', title: 'PE teacher & football coach', email: 'mreed@lincoln.frusd.org', phone: '(303) 555-0171', color: 'bg-amber-600' },
  { id: 's-shah', schoolId: LINCOLN, name: 'Priya Shah', display: 'Dr. Shah', title: 'Assistant principal', email: 'pshah@lincoln.frusd.org', phone: '(303) 555-0108', color: 'bg-violet-600' },
  { id: 's-mesa', schoolId: 'mesa', name: 'Jordan Ellis', display: 'Mr. Ellis', title: 'Career counselor', email: 'jellis@mesa.frusd.org', phone: '(303) 555-0201', color: 'bg-sky-600' },
  { id: 's-clear', schoolId: 'clear', name: 'Sam Whitfield', display: 'Ms. Whitfield', title: 'CTE director', email: 'swhitfield@clear.frusd.org', phone: '(303) 555-0301', color: 'bg-emerald-600' },
]

type Spec = {
  id: string
  name: string
  sector: string
  contact: [string, string]
  owner: string
  stage: Stage
  source?: Employer['source']
  relationship: string
  warmth?: Employer['warmth']
  /** days ago for each level reached, in order (level 1 first) */
  levels?: number[]
  stageDays: number
  lastContact: number | null
  helpers?: string[]
  notes?: string
  checkBack?: number
  paper?: Record<string, PaperStatus>
}

export const slug = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function mk(schoolId: string, city: string, s: Spec): Employer {
  const [contactName, contactTitle] = s.contact
  const first = contactName.split(' ')[0].toLowerCase()
  const domain = slug(s.name).split('-').slice(0, 2).join('')
  const levelHistory: LevelEvent[] = (s.levels ?? []).map((d, i) => ({ level: (i + 1) as Level, date: daysAgo(d) }))
  return {
    id: s.id,
    schoolId,
    name: s.name,
    sector: s.sector,
    city,
    contactName,
    contactTitle,
    contactEmail: `${first}@${domain}.com`,
    contactPhone: `(720) 555-0${(100 + Math.abs(hash(s.id)) % 899).toString()}`,
    ownerId: s.owner,
    helperIds: s.helpers ?? [],
    stage: s.stage,
    source: s.source ?? 'staff',
    relationship: s.relationship,
    warmth: s.warmth ?? 'know',
    levelHistory,
    stageSince: daysAgo(s.stageDays),
    lastContact: s.lastContact === null ? null : daysAgo(s.lastContact),
    checkBackDate: s.checkBack !== undefined ? daysAgo(s.checkBack) : undefined,
    notes: s.notes ?? '',
    token: slug(s.name),
    paperwork: s.paper ?? {},
  }
}

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return h
}

const lincolnSpecs: Spec[] = [
  // Demo employer for the public onboarding flow (invited, hasn't responded yet)
  { id: 'e-sol', name: 'Sol Bakery & Café', sector: 'Hospitality & Food', contact: ['Maria López', 'Owner'], owner: 's-johnson', stage: 'invited', relationship: 'Ms. Johnson buys her coffee there every morning', warmth: 'close', stageDays: 3, lastContact: 3, notes: 'Maria mentioned she started baking at 16. Loves the idea of giving back.' },
  // Career fair two days ago, no thank-you yet (fires a nudge)
  { id: 'e-fra', name: 'Front Range Auto Repair', sector: 'Automotive', contact: ['Tom Becker', 'Shop owner'], owner: 's-patel', stage: 'level2', relationship: 'Former student of Mr. Patel', warmth: 'close', levels: [30, 2], stageDays: 2, lastContact: 2, paper: { 'event-details': 'received', 'visitor-policy': 'received' }, notes: 'Brought a diagnostic scanner to the fair. Students loved it.' },
  { id: 'e-clinic', name: 'Lakewood Family Health Clinic', sector: 'Healthcare', contact: ['Dr. Angela Kim', 'Clinic director'], owner: 's-gomez', stage: 'level3', relationship: 'Ms. Gómez’s former colleague', levels: [150, 120, 21], stageDays: 21, lastContact: 6, helpers: ['s-johnson'], paper: { 'site-visit-form': 'received', 'parent-permission': 'requested', 'site-safety': 'received' } },
  { id: 'e-acu', name: 'Alpine Credit Union', sector: 'Finance & Business', contact: ['Grace Owusu', 'Branch manager'], owner: 's-shah', stage: 'level3', relationship: 'Dr. Shah’s neighbor', levels: [320, 300, 45], stageDays: 45, lastContact: 9, paper: { 'parent-permission': 'received', 'mentor-agreement': 'received', 'volunteer-screening': 'received', 'visitor-policy': 'received' } },
  { id: 'e-peak', name: 'Peak Robotics', sector: 'Advanced Manufacturing', contact: ['Leo Martinez', 'Engineering manager'], owner: 's-patel', stage: 'level5', relationship: 'Robotics team sponsor', warmth: 'close', levels: [420, 400, 300, 180, 40], stageDays: 40, lastContact: 4, helpers: ['s-gomez'], paper: { 'parent-permission': 'received', 'site-safety': 'received', 'volunteer-screening': 'received', 'training-agreement': 'received', 'workers-comp': 'received', 'insurance-cert': 'requested', 'youth-hours': 'received', 'work-permit': 'not_needed', 'wage-check': 'received' } },
  // Reached level 1 a while ago, no next-step offer (fires a nudge)
  { id: 'e-rme', name: 'Rocky Mountain Electric', sector: 'Construction & Trades', contact: ['Dave Kowalski', 'Apprenticeship coordinator'], owner: 's-reed', stage: 'level2', relationship: 'Parent of a player on the team', levels: [60, 40], stageDays: 40, lastContact: 30, paper: { 'event-details': 'received' } },
  { id: 'e-city', name: 'City of Lakewood Public Works', sector: 'Government & Public Service', contact: ['Renee Carter', 'Community outreach lead'], owner: 's-johnson', stage: 'level2', relationship: 'Met at a chamber breakfast', warmth: 'know', levels: [20, 2], stageDays: 2, lastContact: 1, paper: { 'event-details': 'received' } },
  // Paused; check-back date reached (fires a nudge)
  { id: 'e-garden', name: 'Green Valley Garden Center', sector: 'Retail', contact: ['Hank Olsen', 'Owner'], owner: 's-johnson', stage: 'notnow', relationship: 'Student’s grandfather', levels: [], stageDays: 90, lastContact: 90, checkBack: 1, notes: 'Said spring is crazy busy. Asked to check back in the fall.' },
  // Invited 10 days ago, no reply (fires a follow-up nudge)
  { id: 'e-dental', name: 'Summit Dental Group', sector: 'Healthcare', contact: ['Dr. Felipe Ruiz', 'Dentist & owner'], owner: 's-gomez', stage: 'invited', relationship: 'Ms. Gómez’s dentist', stageDays: 10, lastContact: 10 },
  { id: 'e-brew', name: 'Mile High Brewing Co.', sector: 'Hospitality & Food', contact: ['Kara Nguyen', 'Operations manager'], owner: 's-reed', stage: 'level2', relationship: 'Booster club donor', levels: [80, 55], stageDays: 55, lastContact: 12 },
  { id: 'e-tech', name: 'Bluebird Software', sector: 'Technology', contact: ['Sam Patel', 'CTO'], owner: 's-patel', stage: 'level3', relationship: 'Mr. Patel’s cousin', warmth: 'close', levels: [170, 150, 30], stageDays: 30, lastContact: 8, paper: { 'site-visit-form': 'received', 'parent-permission': 'received', 'site-safety': 'needed' } },
  { id: 'e-hosp', name: 'St. Anthony West Hospital', sector: 'Healthcare', contact: ['Monica Reyes', 'Volunteer & education coordinator'], owner: 's-gomez', stage: 'level1', relationship: 'Cold outreach after a counselor conference', warmth: 'cold', levels: [25], stageDays: 25, lastContact: 15 },
  { id: 'e-library', name: 'Jefferson County Public Library', sector: 'Education & Nonprofit', contact: ['Owen Price', 'Teen services librarian'], owner: 's-johnson', stage: 'level4', relationship: 'Ms. Johnson’s book club', levels: [270, 250, 160, 50], stageDays: 50, lastContact: 5, paper: { 'mentor-agreement': 'received', 'volunteer-screening': 'requested', 'parent-permission': 'received' } },
  { id: 'e-hvac', name: 'Comfort Air HVAC', sector: 'Construction & Trades', contact: ['Luis Herrera', 'Owner'], owner: 's-reed', stage: 'invited', relationship: 'Parent of a sophomore', stageDays: 4, lastContact: 4, source: 'student' },
  { id: 'e-target', name: 'Target – Wadsworth Blvd', sector: 'Retail', contact: ['Janelle Brooks', 'Store director'], owner: 's-gomez', stage: 'lead', relationship: 'Student’s mom is a team lead there', stageDays: 6, lastContact: null, source: 'student' },
  { id: 'e-vet', name: 'Bear Creek Animal Hospital', sector: 'Healthcare', contact: ['Dr. Nina Ford', 'Veterinarian'], owner: 's-johnson', stage: 'lead', relationship: 'Ms. Johnson’s dog’s vet', warmth: 'know', stageDays: 8, lastContact: null },
  { id: 'e-arch', name: 'Studio Ridge Architects', sector: 'Arts & Media', contact: ['Imani Cole', 'Principal architect'], owner: 's-patel', stage: 'level1', levels: [12], relationship: 'Alum, class of 2009', warmth: 'know', stageDays: 12, lastContact: null },
  { id: 'e-fire', name: 'West Metro Fire Rescue', sector: 'Government & Public Service', contact: ['Capt. Ray Dominguez', 'Community risk reduction'], owner: 's-reed', stage: 'level3', relationship: 'Assistant coach is a firefighter', levels: [220, 200, 35], stageDays: 35, lastContact: 18, paper: { 'site-visit-form': 'received', 'parent-permission': 'received', 'site-safety': 'received' } },
  { id: 'e-bank', name: 'FirstBank – Belmar', sector: 'Finance & Business', contact: ['Chris Wallace', 'Branch manager'], owner: 's-shah', stage: 'notnow', relationship: 'PTA treasurer', stageDays: 40, lastContact: 40, checkBack: -30, notes: 'New branch manager starting in November. Try again then.' },
  { id: 'e-solar', name: 'Sunpath Solar', sector: 'Agriculture & Energy', contact: ['Erin Walsh', 'Field operations lead'], owner: 's-patel', stage: 'lead', relationship: 'Found via the local industry explorer', warmth: 'cold', stageDays: 2, lastContact: null, source: 'explorer' },
  { id: 'e-news', name: 'Lakewood Sentinel', sector: 'Arts & Media', contact: ['Tasha Green', 'Editor'], owner: 's-johnson', stage: 'level1', relationship: 'Covered the school play', levels: [70], stageDays: 70, lastContact: 20 },
  { id: 'e-pt', name: 'Motion Physical Therapy', sector: 'Healthcare', contact: ['Ben Okafor', 'Physical therapist'], owner: 's-reed', stage: 'level2', relationship: 'Treats the team’s injuries', warmth: 'close', levels: [40, 15], stageDays: 15, lastContact: 3 },
  { id: 'e-const', name: 'Hartman Construction', sector: 'Construction & Trades', contact: ['Gail Hartman', 'VP of operations'], owner: 's-patel', stage: 'invited', relationship: 'Sponsor of the bridge-building contest', stageDays: 6, lastContact: 6, helpers: ['s-reed'] },
  { id: 'e-cater', name: 'Casa Bonita Catering', sector: 'Hospitality & Food', contact: ['Rosa Vigil', 'Owner'], owner: 's-gomez', stage: 'lead', relationship: 'Student’s aunt', stageDays: 5, lastContact: null, source: 'student' },
  { id: 'e-gov', name: 'Colorado Department of Transportation – Region 1', sector: 'Government & Public Service', contact: ['Patrick O’Neil', 'Workforce programs'], owner: 's-shah', stage: 'invited', relationship: 'District partner contact', warmth: 'cold', stageDays: 12, lastContact: 12, source: 'inbound' },
]

const STAGE_POOL: Stage[] = ['lead', 'lead', 'invited', 'level1', 'level2', 'level2', 'level2', 'level3', 'level3', 'level4', 'level5', 'notnow']
const OTHER_NAMES = [
  ['Arvada Ace Hardware', 'Retail'], ['Ralston Creek Dental', 'Healthcare'], ['Olde Town Pizza', 'Hospitality & Food'],
  ['Westwoods Veterinary', 'Healthcare'], ['Arvada Center for the Arts', 'Arts & Media'], ['Red Rocks Credit Union', 'Finance & Business'],
  ['Pinnacle Machining', 'Advanced Manufacturing'], ['Frontier Plumbing', 'Construction & Trades'], ['Apex IT Solutions', 'Technology'],
  ['North Metro Fire', 'Government & Public Service'], ['Golden Brewing Works', 'Hospitality & Food'], ['Clear Creek Outfitters', 'Retail'],
  ['Mines Park Labs', 'Technology'], ['Table Mountain Electric', 'Construction & Trades'], ['Golden Senior Living', 'Healthcare'],
  ['Foothills Auto Body', 'Automotive'], ['Lookout Media', 'Arts & Media'], ['Golden Library District', 'Education & Nonprofit'],
  ['Coors Valley Ag Supply', 'Agriculture & Energy'], ['Canyon Physical Therapy', 'Healthcare'], ['Summit Ridge Bank', 'Finance & Business'],
  ['Jeffco Open Space', 'Government & Public Service'], ['Ridgeline Robotics', 'Advanced Manufacturing'],
]

function otherSchool(schoolId: string, city: string, ownerId: string, start: number, count: number): Employer[] {
  return Array.from({ length: count }, (_, i) => {
    const [name, sector] = OTHER_NAMES[(start + i) % OTHER_NAMES.length]
    const stage = STAGE_POOL[(i * 7 + start) % STAGE_POOL.length]
    const r = levelOfStage(stage)
    const levels = Array.from({ length: r }, (_, k) => 20 + (r - k) * ((i % 4) * 25 + 15))
    return mk(schoolId, city, {
      id: `${schoolId}-${i}`,
      name,
      sector,
      contact: ['Pat Rivera', 'Manager'],
      owner: ownerId,
      stage,
      source: (['staff', 'student', 'explorer', 'staff'] as const)[i % 4],
      relationship: 'Staff contact',
      levels,
      stageDays: levels[levels.length - 1] ?? 10,
      lastContact: 7 + i,
    })
  })
}

const employers: Employer[] = [
  ...lincolnSpecs.map((s) => mk(LINCOLN, 'Lakewood', s)),
  ...otherSchool('mesa', 'Arvada', 's-mesa', 0, 14),
  ...otherSchool('clear', 'Golden', 's-clear', 9, 11),
]

let n = 0
const act = (employerId: string, days: number, type: Activity['type'], byId: string | null, text: string): Activity => ({
  id: `a${++n}`,
  employerId,
  date: daysAgo(days),
  type,
  byId,
  text,
})

const activities: Activity[] = [
  act('e-sol', 3, 'email', 's-johnson', 'Sent a personal invite link after chatting at the counter.'),
  act('e-fra', 30, 'call', 's-patel', 'Called Tom. He’s in for the fall career fair.'),
  act('e-fra', 2, 'event', 's-patel', 'Hosted a table at the Fall Career Fair. ~60 students stopped by.'),
  act('e-fra', 2, 'levelup', null, 'Moved to Level 2 · School visit'),
  act('e-city', 2, 'event', 's-johnson', 'Fall Career Fair: brought a snowplow simulator.'),
  act('e-city', 2, 'levelup', null, 'Moved to Level 2 · School visit'),
  act('e-city', 1, 'thankyou', 's-johnson', 'Sent a handwritten thank-you card plus 6 student notes.'),
  act('e-clinic', 120, 'event', 's-gomez', 'Dr. Kim spoke to the Health Sciences class.'),
  act('e-clinic', 21, 'levelup', null, 'Moved to Level 3 · Host & mentor'),
  act('e-clinic', 14, 'event', 's-gomez', 'Job shadow: 4 students shadowed nurses for a morning.'),
  act('e-clinic', 6, 'thankyou', 's-gomez', 'Shared student reflections with Dr. Kim.'),
  act('e-acu', 45, 'levelup', null, 'Moved to Level 3 · Host & mentor'),
  act('e-acu', 9, 'meeting', 's-shah', 'Monthly mentoring check-in with Grace and 3 students.'),
  act('e-peak', 40, 'levelup', null, 'Moved to Level 5 · Formal placement'),
  act('e-peak', 4, 'call', 's-patel', 'Check-in with Leo. Interns are doing great on the CAD project.'),
  act('e-rme', 40, 'event', 's-reed', 'Dave did a guest talk on electrical apprenticeships.'),
  act('e-rme', 38, 'thankyou', 's-reed', 'Thank-you email sent.'),
  act('e-garden', 90, 'call', 's-johnson', 'Hank said spring is too busy. Check back in fall.'),
  act('e-dental', 10, 'email', 's-gomez', 'Sent invite link.'),
  act('e-library', 50, 'levelup', null, 'Moved to Level 4 · Project'),
  act('e-library', 5, 'meeting', 's-johnson', 'Teen zine project: second check-in with the class.'),
  act('e-tech', 8, 'email', 's-patel', 'Asked about a summer internship slot.'),
  act('e-hosp', 25, 'call', 's-gomez', 'Monica talked with Ms. Gómez about which health courses best prepare students for CNA roles.'),
  act('e-arch', 12, 'meeting', 's-patel', 'Imani had coffee with two seniors interested in architecture.'),
]

const studentLeads: StudentLead[] = [
  { id: 'sl1', schoolId: LINCOLN, studentName: 'Jaylen M.', grade: '11', business: 'King Soopers – Union Blvd', sector: 'Retail', howKnown: 'I work there on weekends', contactName: 'Deb (store manager)', contactInfo: 'Ask for Deb at customer service', teacherId: 's-reed', submittedAt: daysAgo(1) },
  { id: 'sl2', schoolId: LINCOLN, studentName: 'Sofia R.', grade: '10', business: 'Bright Smiles Pediatric Dentistry', sector: 'Healthcare', howKnown: 'My mom is a dental hygienist there', contactName: 'Carmen Ruiz (my mom)', contactInfo: 'carmen.r@email.com', teacherId: 's-gomez', submittedAt: daysAgo(2) },
  { id: 'sl3', schoolId: LINCOLN, studentName: 'Ethan W.', grade: '12', business: 'Peak Robotics', sector: 'Advanced Manufacturing', howKnown: 'My uncle is an engineer there', contactName: 'Mike Walsh', contactInfo: '', teacherId: 's-patel', submittedAt: daysAgo(2) },
  { id: 'sl4', schoolId: LINCOLN, studentName: 'Amara O.', grade: '11', business: 'Denver Water', sector: 'Government & Public Service', howKnown: 'Family friend works in engineering', contactName: 'Mr. Adeyemi', contactInfo: '(720) 555-0199', teacherId: 's-johnson', submittedAt: daysAgo(4) },
  { id: 'sl5', schoolId: LINCOLN, studentName: 'Diego P.', grade: '9', business: 'Tacos El Güero (food truck)', sector: 'Hospitality & Food', howKnown: 'My dad owns it', contactName: 'Diego Sr.', contactInfo: '(303) 555-0133', teacherId: 's-johnson', submittedAt: daysAgo(6) },
]

export function makeSeed(): AppState {
  n = activities.length
  return {
    role: 'coordinator',
    schoolId: LINCOLN,
    districts: [{ id: 'frusd', name: 'Front Range Unified School District' }],
    schools: [
      { id: LINCOLN, slug: 'lincoln-high', name: 'Lincoln High School', city: 'Lakewood', districtId: 'frusd' },
      { id: 'mesa', slug: 'mesa-ridge', name: 'Mesa Ridge High School', city: 'Arvada', districtId: 'frusd' },
      { id: 'clear', slug: 'clear-creek', name: 'Clear Creek Valley High School', city: 'Golden', districtId: 'frusd' },
    ],
    staff,
    employers: structuredClone(employers),
    activities: structuredClone(activities),
    studentLeads: structuredClone(studentLeads),
    thankYous: [
      { id: 't1', employerId: 'e-clinic', student: 'Maya, grade 11', text: 'I didn’t know nurses did so much problem solving. I want to look into the CNA program now. Thank you!', date: daysAgo(6) },
      { id: 't2', employerId: 'e-clinic', student: 'Andre, grade 12', text: 'Thank you for letting us ask so many questions. It made me feel like I could actually do this job.', date: daysAgo(6) },
      { id: 't3', employerId: 'e-city', student: 'Lily, grade 10', text: 'The snowplow simulator was the best part of the career fair!', date: daysAgo(1) },
      { id: 't4', employerId: 'e-peak', student: 'Ethan, grade 12', text: 'This internship is the first time I’ve used CAD for something real. Thank you for trusting us.', date: daysAgo(10) },
    ],
    opportunities: [
      { id: 'o1', employerId: 'e-peak', kind: 'internship', level: 5, title: 'CAD & assembly intern', dates: 'Sep 2 – Dec 12', slots: 2, supervisor: 'Leo Martinez', skills: 'CAD, measurement, teamwork', description: 'Two seniors work 10 hours a week helping the engineering team prototype fixtures.', status: 'accepted', createdAt: daysAgo(60) },
      { id: 'o2', employerId: 'e-clinic', kind: 'job-shadow', level: 3, title: 'Nursing job shadow morning', dates: 'Sep 17', slots: 4, supervisor: 'Dr. Angela Kim', skills: 'Observation, patient communication', description: 'Students shadow a nurse and a medical assistant for a morning.', status: 'accepted', createdAt: daysAgo(30) },
    ],
    events: [
      { id: 'ev1', schoolId: LINCOLN, title: 'Fall Career Fair', activityId: 'career-fair', date: daysAgo(2), employerIds: ['e-fra', 'e-city'], students: 180, checklist: [{ label: 'Book the gym', done: true }, { label: 'Send parking info to employers', done: true }, { label: 'Student question prep in advisory', done: true }, { label: 'Thank-you notes within 48 hours', done: false }], happened: true },
      { id: 'ev2', schoolId: LINCOLN, title: 'Healthcare careers guest speaker', activityId: 'guest-speaker', date: daysFromNow(10), employerIds: ['e-hosp'], students: 28, checklist: [{ label: 'Confirm date with speaker', done: true }, { label: 'Send parking + check-in info', done: false }, { label: 'Students prepare 3 questions each', done: false }], happened: false },
    ],
    intros: [],
    journey: { completed: [], why: '', selfCheck: {} },
    profiles: {},
    teamProgress: { 's-patel': 4, 's-gomez': 7, 's-reed': 2, 's-shah': 10 },
  }
}
