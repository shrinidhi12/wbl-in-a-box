import type { Level, Stage } from './types'

export interface LevelInfo {
  level: Level
  name: string
  /** How it's described to an employer: what "you" do at this level */
  forEmployer: string
  continuum: string
  blurb: string
  paperwork: string
}

/**
 * Employer engagement levels. The continuum labels map each level onto the Colorado
 * Workforce Development Council's Work-Based Learning Continuum (Learning About / Through / At Work).
 * Source: https://cwdc.colorado.gov/strategies/work-based-learning (verify current terms).
 */
export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: 'Conversation',
    forEmployer: 'A student reaches out to learn about your work, or a teacher consults you on curriculum',
    continuum: 'Learning ABOUT Work',
    blurb: 'A short conversation. A student asks about your career, or a teacher asks what skills matter in your field.',
    paperwork: 'None',
  },
  {
    level: 2,
    name: 'School visit',
    forEmployer: 'You come to school for a career fair or classroom presentation',
    continuum: 'Learning ABOUT Work',
    blurb: 'You visit the school, at a career fair table or as a classroom speaker.',
    paperwork: 'Campus visitor check-in',
  },
  {
    level: 3,
    name: 'Host & mentor',
    forEmployer: 'You host a student on site, a student shadows you, or you mentor a student over time',
    continuum: 'Learning ABOUT → THROUGH Work',
    blurb: 'Students come to you for a tour or job shadow, or you become an ongoing mentor or buddy.',
    paperwork: 'Permission slips, site visit form, mentor agreement',
  },
  {
    level: 4,
    name: 'Project',
    forEmployer: 'You provide a real project or micro-internship for students',
    continuum: 'Learning THROUGH Work',
    blurb: 'You give students a real problem to solve, as a class project or a short paid micro-internship.',
    paperwork: 'Project agreement; pay rules if paid',
  },
  {
    level: 5,
    name: 'Formal placement',
    forEmployer: 'You offer a formal internship, WBL placement or apprenticeship',
    continuum: 'Learning AT Work',
    blurb: 'A student works with you: an internship, WBL placement, apprenticeship or paid job.',
    paperwork: 'Training agreement, insurance and youth employment rules',
  },
]

export const levelInfo = (l: number) => LEVELS.find((x) => x.level === l)

export interface Activity {
  id: string
  level: Level
  name: string
  time: string
  where: 'school' | 'site' | 'virtual' | 'either'
  /** 1 = fine for first-timers with teens, 3 = needs comfort working with teens */
  teenComfort: 1 | 2 | 3
  /** 1 = a couple of hours, 2 = half day, 3 = recurring */
  effort: 1 | 2 | 3
  studentsGet: string
  emoji: string
}

export const ACTIVITIES: Activity[] = [
  { id: 'info-conversation', level: 1, name: 'Informational conversation', time: '20–30 min, phone or coffee', where: 'either', teenComfort: 1, effort: 1, studentsGet: 'Learn how a real person got into this career', emoji: '☕' },
  { id: 'curriculum-consult', level: 1, name: 'Curriculum advice for a teacher', time: '30 min conversation', where: 'virtual', teenComfort: 1, effort: 1, studentsGet: 'Classes that teach what your industry actually needs', emoji: '📚' },
  { id: 'career-fair', level: 2, name: 'Career fair table', time: '2–3 hours, once', where: 'school', teenComfort: 1, effort: 1, studentsGet: 'Meet you, ask questions, learn what jobs exist close to home', emoji: '🎪' },
  { id: 'guest-speaker', level: 2, name: 'Classroom presentation', time: '1 hour, once (in person or virtual)', where: 'either', teenComfort: 1, effort: 1, studentsGet: 'A real story of how someone got into your field', emoji: '🎤' },
  { id: 'mock-interviews', level: 2, name: 'Mock interviews at school', time: 'Half a morning', where: 'school', teenComfort: 2, effort: 2, studentsGet: 'Practice interviews with honest, kind feedback', emoji: '🤝' },
  { id: 'worksite-tour', level: 3, name: 'Host students on site', time: '1–2 hours at your site', where: 'site', teenComfort: 2, effort: 2, studentsGet: 'See the workplace, the tools and the people', emoji: '🏭' },
  { id: 'job-shadow', level: 3, name: 'Job shadow', time: 'Half or full day', where: 'site', teenComfort: 2, effort: 2, studentsGet: 'Follow someone through a real workday', emoji: '👀' },
  { id: 'mentoring', level: 3, name: 'Ongoing mentor or buddy', time: '1 hour a month for a semester', where: 'either', teenComfort: 3, effort: 3, studentsGet: 'A trusted adult in the field', emoji: '🧭' },
  { id: 'industry-project', level: 4, name: 'Class project', time: '3–4 check-ins over a few weeks', where: 'either', teenComfort: 2, effort: 3, studentsGet: 'Solve a real problem your business has', emoji: '🧩' },
  { id: 'micro-internship', level: 4, name: 'Micro-internship', time: '10–40 hours, short-term', where: 'either', teenComfort: 2, effort: 3, studentsGet: 'A short, paid, real-world assignment', emoji: '⚡' },
  { id: 'internship', level: 5, name: 'Formal internship', time: '6–12 weeks', where: 'site', teenComfort: 3, effort: 3, studentsGet: 'Real work experience and a reference', emoji: '💼' },
  { id: 'apprenticeship', level: 5, name: 'Apprenticeship / pre-apprenticeship', time: 'A semester to several years', where: 'site', teenComfort: 3, effort: 3, studentsGet: 'A paid pathway into a skilled career', emoji: '🛠️' },
  { id: 'paid-job', level: 5, name: 'Paid WBL placement', time: 'Ongoing', where: 'site', teenComfort: 3, effort: 3, studentsGet: 'A paycheck, school credit and work habits', emoji: '💵' },
]

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id)

export const STAGES: { id: Stage; label: string; short: string; color: string; dot: string }[] = [
  { id: 'lead', label: 'Lead', short: 'Lead', color: 'bg-stone-100 text-stone-700', dot: 'bg-stone-400' },
  { id: 'invited', label: 'Invited', short: 'Invited', color: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { id: 'level1', label: 'Level 1 · Conversation', short: 'L1 Conversation', color: 'bg-brand-50 text-brand-800', dot: 'bg-brand-200' },
  { id: 'level2', label: 'Level 2 · School visit', short: 'L2 School visit', color: 'bg-brand-100 text-brand-800', dot: 'bg-brand-600' },
  { id: 'level3', label: 'Level 3 · Host & mentor', short: 'L3 Host & mentor', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' },
  { id: 'level4', label: 'Level 4 · Project', short: 'L4 Project', color: 'bg-violet-100 text-violet-800', dot: 'bg-violet-600' },
  { id: 'level5', label: 'Level 5 · Formal placement', short: 'L5 Placement', color: 'bg-warm-100 text-warm-700', dot: 'bg-warm-500' },
  { id: 'notnow', label: 'Not now', short: 'Not now', color: 'bg-rose-50 text-rose-700', dot: 'bg-rose-400' },
]

export const stageInfo = (s: Stage) => STAGES.find((x) => x.id === s)!

export const levelOfStage = (s: Stage): number => (s.startsWith('level') ? Number(s.slice(5)) : 0)

export const stageOfLevel = (l: number): Stage => (l >= 1 && l <= 5 ? (`level${l}` as Stage) : 'lead')

export const MAX_LEVEL = 5

export const SECTORS = [
  'Healthcare',
  'Construction & Trades',
  'Advanced Manufacturing',
  'Technology',
  'Hospitality & Food',
  'Retail',
  'Automotive',
  'Government & Public Service',
  'Finance & Business',
  'Agriculture & Energy',
  'Arts & Media',
  'Education & Nonprofit',
]

export const SECTOR_EMOJI: Record<string, string> = {
  Healthcare: '🩺',
  'Construction & Trades': '🏗️',
  'Advanced Manufacturing': '⚙️',
  Technology: '💻',
  'Hospitality & Food': '🍽️',
  Retail: '🛍️',
  Automotive: '🚗',
  'Government & Public Service': '🏛️',
  'Finance & Business': '💼',
  'Agriculture & Energy': '🌾',
  'Arts & Media': '🎨',
  'Education & Nonprofit': '🍎',
}
