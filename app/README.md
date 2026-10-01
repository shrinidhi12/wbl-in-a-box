# WBL in a Box (prototype)

A clickable prototype of a guided platform that helps a Colorado high school recruit local employers and move them up five **levels of employer engagement**, from a first conversation to formal internships.

| Level | Name | What the employer does |
|---|---|---|
| 1 | Conversation | A student reaches out for an informational conversation, or a teacher consults them on curriculum |
| 2 | School visit | Career fair, classroom presentation |
| 3 | Host & mentor | Hosts a student on site, job shadow, ongoing mentor or buddy |
| 4 | Project | Provides a project or micro-internship |
| 5 | Formal placement | Formal internship, WBL placement, apprenticeship |

> **Prototype only.** No backend, no real sending, no auth. Data lives in your browser (localStorage) and resets with the **Reset demo** button.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## Deploy (Netlify)

`netlify.toml` is included (build `npm run build`, publish `dist`, SPA redirect).

```bash
netlify deploy --prod
```

Or link the repo for continuous deploys with `netlify init`.

## What's in it

Use the **Prototype bar** at the top to switch roles (Coordinator, Staff, Student, Employer, District) and schools.

| Area | Route | What it shows |
|---|---|---|
| School profile (intake) | `/intake` | Step 0: ZIP code, student interests, course catalogue upload, local job market, and 3–4 focus industries |
| Guided journey | `/journey`, `/journey/:step` | 4 background modules (B1–B4) and 6 onboarding stages (S1–S6). Each step is **Learn → Do → Grab** |
| Today | `/today` | Rule-based nudges (thank within 48h, follow up on invites, suggest next level, check back, student leads) |
| Pipeline | `/pipeline` | Kanban: Lead → Invited → Levels 1–5, plus Not now |
| Employer detail | `/employers/:id` | Owner and helpers (reassignable), ladder history, timeline, Colorado paperwork, thank-yous |
| Dashboard | `/dashboard` | North star: employers who moved up a level this semester, plus partners in focus industries |
| Resources | `/resources` | All 21 templates, scripts and handouts |
| Employer link | `/e/:token` | Public, mobile-first, no login. Onboarding on the first visit, partner page after |
| Student form | `/s/:school` | Students share businesses they're connected to |
| District | `/district` | Aggregates only. No employer names or contacts |

## Editing content (no code needed)

| What | Where |
|---|---|
| Step titles, takeaways, examples, which tool and resources each step uses | `src/content/journey.json` |
| The **Learn** text for each step | `src/content/learn/<step>.md` (b1–b4, s1–s6) |
| Templates and handouts (**Grab**) | `src/content/resources/<id>.md` |
| Colorado paperwork rules, by level, with sources | `src/config/states/co.json` |
| Engagement levels and activity menu | `src/data/ladder.ts` |
| Course-to-industry keyword matching, sample catalogue | `src/data/catalog.ts` |
| Labor-market regions (by ZIP prefix) and sample figures | `src/data/market.ts` |
| How focus industries are scored | `src/lib/priorities.ts` |
| Demo data (schools, staff, employers) | `src/data/seed.ts` |

### Colorado paperwork sources
`co.json` cites each requirement's source: CWDC's Work-Based Learning continuum, the Colorado Youth Employment Opportunity Act (C.R.S. 8-12), CDLE youth employment guidance (INFO #22), the Colorado Workers' Compensation Act (school-sponsored training under C.R.S. 8-40-202), CTE in Colorado's Quality WBL Indicators, and U.S. DOL Fact Sheet #71. **Every item marked "verify" needs district or legal review. This is not legal advice.**

## School profile (intake)
1. **ZIP code** → Colorado labor-market region (by 3-digit prefix; non-Colorado ZIPs fall back to statewide).
2. **Student interests**: reflection prompts, where the sense comes from, and Not much / Some / A lot per industry.
3. **Course catalogue**: upload a .txt/.csv, paste a list, or use the sample. Courses are matched to industries by keyword, and links can be removed or added by hand.
4. **Local job market**: projected 5-year growth, jobs, openings and wages by industry, plus "what's changing".
5. **Priorities**: growth vs. student readiness (interest + courses) on a 2×2. Pick 3–4 focus industries, which then show on the journey home, in the S1 explorer and on the dashboard.

> ⚠️ **The labor-market figures are illustrative sample data, not real statistics.** Production should pull from [CDLE Labor Market Information](https://www.colmigateway.com/), the [CWDC Talent Pipeline Report](https://cwdc.colorado.gov/resources/colorado-talent-pipeline-report) and [BLS QCEW](https://www.bls.gov/cew/).

## What's mocked
- Labor-market data (see above). PDF/Word catalogue parsing loads the sample instead.
- No email/SMS. Messages are drafted for staff to send from their own email or phone.
- Invite links and the student form work only in the same browser (shared localStorage). Tabs stay in sync.
- The local industry explorer uses a fixed mock list.
- There are no background checks, e-signatures or integrations.
- Other staff members' journey progress is seeded.

## Code map
```
src/
  content/       journey.json, learn/*.md, resources/*.md
  config/states/ co.json
  data/          types, seed, ladder, store (React context + localStorage)
  lib/           nudges (rules), paperwork, content loader, formatting
  tools/         the 10 "Do" tools (background.tsx, outreach.tsx, grow.tsx)
  components/    layout, Learn/Do/Grab pieces, nudge list, paperwork checklist
  pages/         journey, today/pipeline, employer detail, reports, public pages
```
