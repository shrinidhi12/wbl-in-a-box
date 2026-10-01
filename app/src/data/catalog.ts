/**
 * Course catalogue parsing for the intake flow. Matches course names to industries by keyword.
 * A production version would use an LLM or a curated CTE course-code crosswalk instead.
 */

const KEYWORDS: Record<string, string[]> = {
  Healthcare: ['health', 'medical', 'medicine', 'anatomy', 'physiology', 'nursing', 'cna', 'emt', 'sports medicine', 'biomedical', 'pharmacy', 'first aid', 'kinesiology'],
  'Construction & Trades': ['construction', 'carpentry', 'welding', 'electrical', 'electricity', 'plumbing', 'hvac', 'woodworking', 'woods', 'building trades', 'architecture', 'architectural'],
  'Advanced Manufacturing': ['manufacturing', 'engineering', 'robotics', 'machining', 'machine shop', 'cad', 'mechatronics', 'pltw', 'fabrication', '3d printing', 'metals'],
  Technology: ['computer', 'programming', 'coding', 'cybersecurity', 'cyber', 'information technology', 'networking', 'web', 'app development', 'data science', 'software', 'java', 'python', 'ai '],
  'Hospitality & Food': ['culinary', 'foods', 'food science', 'nutrition', 'baking', 'hospitality', 'prostart', 'restaurant', 'tourism'],
  Retail: ['marketing', 'retail', 'sales', 'merchandising', 'school store', 'fashion'],
  Automotive: ['automotive', 'auto ', 'small engines', 'diesel', 'collision', 'transportation technology'],
  'Government & Public Service': ['law', 'legal', 'criminal justice', 'government', 'public safety', 'fire science', 'jrotc', 'forensic', 'political'],
  'Finance & Business': ['accounting', 'finance', 'financial', 'business', 'economics', 'entrepreneurship', 'entrepreneur', 'banking', 'personal finance', 'management'],
  'Agriculture & Energy': ['agriculture', 'agricultural', 'ag ', 'animal science', 'horticulture', 'greenhouse', 'veterinary', 'environmental', 'energy', 'natural resources', 'ffa', 'equine'],
  'Arts & Media': ['art', 'web design', 'photography', 'film', 'video', 'journalism', 'graphic', 'music', 'theater', 'theatre', 'digital media', 'yearbook', 'animation', 'broadcast', 'ceramics'],
  'Education & Nonprofit': ['education', 'teacher', 'teaching', 'child development', 'early childhood', 'psychology', 'sociology', 'human services', 'peer tutor'],
}

/** Whole-word match (plural allowed), so "CAD" doesn't match "Cadet". */
function matches(course: string, kw: string) {
  const k = kw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${k}s?\\b`, 'i').test(course)
}

/** Course phrases that would otherwise be misread as belonging to an industry. */
const EXCLUDE: Record<string, string[]> = {
  'Arts & Media': ['culinary', 'language arts', 'martial', 'liberal arts'],
}

export interface Course {
  name: string
  sectors: string[]
}

const NOT_CAREER = ['physical education', 'driver education', 'driver’s education']

export function classifyCourse(name: string): string[] {
  if (NOT_CAREER.some((n) => name.toLowerCase().includes(n))) return []
  return Object.entries(KEYWORDS)
    .filter(([sector, kws]) => kws.some((k) => matches(name, k)) && !(EXCLUDE[sector] ?? []).some((x) => name.toLowerCase().includes(x)))
    .map(([sector]) => sector)
}

/** Splits a pasted or uploaded catalogue into course names (one per line, or CSV first column). */
export function parseCatalog(text: string): Course[] {
  const seen = new Set<string>()
  return text
    .split(/\r?\n/)
    .map((l) => l.split(/[,\t|]/)[0])
    .map((l) => l.replace(/^[\s\-*•\d.)]+/, '').replace(/\s*\(.*?\)\s*$/, '').trim())
    .filter((l) => l.length >= 3 && l.length <= 80 && !/^(course|title|name|department)s?$/i.test(l))
    .filter((l) => (seen.has(l.toLowerCase()) ? false : (seen.add(l.toLowerCase()), true)))
    .map((name) => ({ name, sectors: classifyCourse(name) }))
}

export const SAMPLE_CATALOG_NAME = 'Lincoln High 2026–27 course catalogue (sample)'

export const SAMPLE_CATALOG = `English 9
English 10
AP English Language
Creative Writing
Journalism
Yearbook
Algebra I
Geometry
Algebra II
Statistics
AP Calculus AB
Biology
Chemistry
Physics
Environmental Science
Anatomy & Physiology
Introduction to Health Sciences
Medical Terminology
Sports Medicine I
Certified Nursing Assistant (CNA) Prep
World History
US History
US Government
Economics
Psychology
Personal Finance
Introduction to Business
Accounting I
Marketing & Entrepreneurship
Introduction to Engineering Design (PLTW)
Principles of Engineering (PLTW)
Robotics
Computer Science Principles
AP Computer Science A
Cybersecurity Fundamentals
Web Design
Automotive Technology I
Automotive Technology II
Woodworking
Construction Trades I
Welding Fundamentals
Culinary Arts I
ProStart Culinary II
Child Development
Art I
Ceramics
Graphic Design
Digital Photography
Video Production
Concert Band
Theater Arts
Spanish I
Spanish II
French I
Physical Education
Weight Training
Criminal Justice
Teacher Cadet`
