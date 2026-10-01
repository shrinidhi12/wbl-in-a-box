/**
 * ILLUSTRATIVE SAMPLE labor-market data for the prototype. These numbers are NOT real statistics.
 * In production, replace with live data from:
 *  - CDLE Labor Market Information (Colorado LMI Gateway): employment, wages, projections by region
 *  - BLS QCEW / OEWS: county employment and wages
 *  - CWDC Talent Pipeline Report: Colorado's top jobs and in-demand industries
 */
import { SECTORS } from './ladder'

export const MARKET_SOURCES = [
  { label: 'CDLE Labor Market Information (Colorado LMI Gateway)', url: 'https://www.colmigateway.com/' },
  { label: 'CWDC Colorado Talent Pipeline Report', url: 'https://cwdc.colorado.gov/resources/colorado-talent-pipeline-report' },
  { label: 'BLS Quarterly Census of Employment and Wages', url: 'https://www.bls.gov/cew/' },
]

export interface SectorMarket {
  sector: string
  /** Jobs in the region */
  employment: number
  /** % change over the past year */
  yoy: number
  /** % projected growth over 5 years */
  proj5: number
  medianWage: number
  /** Projected annual openings (growth + turnover) */
  openings: number
  note: string
}

export interface Region {
  id: string
  name: string
  prefixes: string[]
  /** Scale applied to base (Denver Metro) employment */
  scale: number
  /** Percentage-point adjustments to 5-yr growth by sector */
  growthAdj: Partial<Record<string, number>>
  notes: Partial<Record<string, string>>
  changes: string[]
}

const BASE: Omit<SectorMarket, 'note'>[] = [
  { sector: 'Healthcare', employment: 172000, yoy: 3.8, proj5: 12.5, medianWage: 68000, openings: 21000 },
  { sector: 'Construction & Trades', employment: 118000, yoy: 2.9, proj5: 9.8, medianWage: 62000, openings: 14500 },
  { sector: 'Advanced Manufacturing', employment: 74000, yoy: 1.6, proj5: 6.1, medianWage: 71000, openings: 8200 },
  { sector: 'Technology', employment: 131000, yoy: 0.8, proj5: 7.4, medianWage: 112000, openings: 11800 },
  { sector: 'Hospitality & Food', employment: 165000, yoy: 1.2, proj5: 4.0, medianWage: 36000, openings: 31000 },
  { sector: 'Retail', employment: 142000, yoy: -0.9, proj5: -1.5, medianWage: 38000, openings: 22000 },
  { sector: 'Automotive', employment: 21000, yoy: 1.0, proj5: 3.2, medianWage: 55000, openings: 2600 },
  { sector: 'Government & Public Service', employment: 96000, yoy: 2.1, proj5: 5.5, medianWage: 70000, openings: 9400 },
  { sector: 'Finance & Business', employment: 109000, yoy: 0.6, proj5: 4.3, medianWage: 82000, openings: 10100 },
  { sector: 'Agriculture & Energy', employment: 26000, yoy: 2.4, proj5: 8.9, medianWage: 74000, openings: 3100 },
  { sector: 'Arts & Media', employment: 33000, yoy: -0.4, proj5: 1.8, medianWage: 58000, openings: 3300 },
  { sector: 'Education & Nonprofit', employment: 88000, yoy: 1.1, proj5: 3.0, medianWage: 52000, openings: 9000 },
]

const BASE_NOTES: Record<string, string> = {
  Healthcare: 'Aging population and clinic expansions drive demand for CNAs, medical assistants and technicians.',
  'Construction & Trades': 'Housing and infrastructure projects; persistent shortages of electricians, plumbers and HVAC techs.',
  'Advanced Manufacturing': 'Aerospace, medical device and food manufacturing are adding skilled production roles.',
  Technology: 'Hiring has cooled for general software roles; cybersecurity, data and IT support are still growing.',
  'Hospitality & Food': 'Back to pre-pandemic levels. High turnover means many entry-level openings.',
  Retail: 'Store employment is flat to declining as e-commerce and warehouse logistics grow.',
  Automotive: 'Technician shortage continues; EV and hybrid service skills are emerging.',
  'Government & Public Service': 'Retirements are opening roles in public works, utilities and public safety.',
  'Finance & Business': 'Steady demand for accounting, bookkeeping and customer-facing finance roles.',
  'Agriculture & Energy': 'Solar and wind installation and grid work are among the fastest-growing trades.',
  'Arts & Media': 'Small, competitive field. Growth is concentrated in digital design and video.',
  'Education & Nonprofit': 'Steady demand for paraprofessionals, early-childhood educators and youth workers.',
}

export const REGIONS: Region[] = [
  {
    id: 'denver', name: 'Denver Metro & Boulder', prefixes: ['800', '801', '802', '803', '804'], scale: 1, growthAdj: {},
    notes: {},
    changes: [
      'Hospital and outpatient clinic expansions across the west and south metro.',
      'Aerospace and quantum-tech employers growing in the Boulder–Broomfield corridor.',
      'Large transit and housing construction projects through 2028.',
    ],
  },
  {
    id: 'northern', name: 'Northern Colorado (Fort Collins, Greeley, Loveland)', prefixes: ['805', '806'], scale: 0.35,
    growthAdj: { 'Agriculture & Energy': 3.5, 'Advanced Manufacturing': 2.5, Technology: -1.5, 'Construction & Trades': 1.5 },
    notes: { 'Agriculture & Energy': 'Food processing, agriculture technology and energy production anchor the region.' },
    changes: ['Food and beverage manufacturing expansions near Greeley.', 'New residential growth along the I-25 corridor.', 'University-linked research and ag-tech startups.'],
  },
  {
    id: 'plains', name: 'Eastern Plains', prefixes: ['807'], scale: 0.06,
    growthAdj: { 'Agriculture & Energy': 4, Healthcare: 1, Technology: -3, 'Finance & Business': -1.5 },
    notes: { 'Agriculture & Energy': 'Wind energy and agriculture are the biggest employers in many plains counties.' },
    changes: ['Wind farm construction and maintenance roles.', 'Rural hospitals recruiting nursing and allied health staff.', 'Agricultural equipment technicians in short supply.'],
  },
  {
    id: 'pikespeak', name: 'Pikes Peak (Colorado Springs)', prefixes: ['808', '809'], scale: 0.4,
    growthAdj: { 'Government & Public Service': 3, Technology: 2, 'Advanced Manufacturing': 1.5 },
    notes: { 'Government & Public Service': 'Military installations and defense contractors are major employers.', Technology: 'Cybersecurity demand linked to aerospace and defense.' },
    changes: ['Space and defense contractors expanding cybersecurity teams.', 'New healthcare campuses in the north and east of the city.', 'Tourism steady around Pikes Peak attractions.'],
  },
  {
    id: 'southern', name: 'Southern Colorado (Pueblo & San Luis Valley)', prefixes: ['810', '811', '812'], scale: 0.15,
    growthAdj: { Healthcare: 1.5, 'Advanced Manufacturing': 2, 'Agriculture & Energy': 2.5, Technology: -2.5 },
    notes: { 'Advanced Manufacturing': 'Steel and wind-tower manufacturing are regional anchors.' },
    changes: ['Renewable-energy component manufacturing.', 'Hospital systems recruiting technicians and nurses.', 'Solar projects in the San Luis Valley.'],
  },
  {
    id: 'southwest', name: 'Southwest (Durango, Cortez)', prefixes: ['813'], scale: 0.07,
    growthAdj: { 'Hospitality & Food': 2.5, Healthcare: 1.5, Technology: -2 },
    notes: { 'Hospitality & Food': 'Tourism and outdoor recreation drive seasonal hiring.' },
    changes: ['Outdoor recreation and tourism businesses.', 'Regional medical center expansion.', 'Housing shortage driving construction demand.'],
  },
  {
    id: 'western', name: 'Western Slope (Grand Junction, Montrose)', prefixes: ['814', '815'], scale: 0.12,
    growthAdj: { 'Agriculture & Energy': 2.5, Healthcare: 2, 'Hospitality & Food': 1.5, Technology: -2 },
    notes: { 'Agriculture & Energy': 'Energy, orchards and vineyards remain important employers.' },
    changes: ['Outdoor recreation manufacturers relocating to the valley.', 'Healthcare is the largest and fastest-growing employer.', 'Energy transition creating new grid and solar roles.'],
  },
  {
    id: 'mountain', name: 'Mountain resort communities', prefixes: ['816'], scale: 0.1,
    growthAdj: { 'Hospitality & Food': 3, 'Construction & Trades': 2.5, 'Finance & Business': -1, 'Advanced Manufacturing': -3 },
    notes: { 'Hospitality & Food': 'Ski resorts and tourism are the dominant employers, often year-round now.' },
    changes: ['Resort expansions and year-round tourism.', 'Workforce-housing construction projects.', 'Healthcare clinics serving resort towns.'],
  },
]

export const STATEWIDE: Region = {
  id: 'statewide', name: 'Colorado (statewide)', prefixes: [], scale: 2.4, growthAdj: {}, notes: {},
  changes: ['Healthcare, construction and energy lead projected growth statewide.', 'Retail employment is flat to declining.', 'Tech hiring has slowed but cybersecurity is still in demand.'],
}

export function regionForZip(zip: string): Region | null {
  if (!/^\d{5}$/.test(zip)) return null
  return REGIONS.find((r) => r.prefixes.includes(zip.slice(0, 3))) ?? STATEWIDE
}

export function marketFor(region: Region): SectorMarket[] {
  return BASE.map((b) => {
    const adj = region.growthAdj[b.sector] ?? 0
    return {
      ...b,
      employment: Math.round((b.employment * region.scale) / 100) * 100,
      openings: Math.round((b.openings * region.scale) / 10) * 10,
      proj5: Math.round((b.proj5 + adj) * 10) / 10,
      yoy: Math.round((b.yoy + adj / 3) * 10) / 10,
      note: region.notes[b.sector] ?? BASE_NOTES[b.sector],
    }
  }).sort((a, b) => b.proj5 - a.proj5)
}

/** Keeps the market table in the same sector order as the rest of the app if needed. */
export const sectorOrder = (s: string) => SECTORS.indexOf(s)
