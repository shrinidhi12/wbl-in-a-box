Build a clickable PROTOTYPE of "WBL in a Box": a guided platform that teaches a Colorado
high school how to recruit local employers and move them up an engagement ladder, from
light-touch involvement toward internships for students.

This is a design prototype. No real functionality is needed: no backend, no sending, no
auth. Screens should look and feel real, with realistic seeded data, and interactions
that update on-screen state (in memory is fine) so a demo flows end to end.

## North-star metric
Employers climbing rungs on the engagement ladder. Dashboards lead with
"employers who moved up a rung this semester".

## Users
- WBL Coordinator: often a teacher with no WBL experience (e.g. an English teacher handed
  the job). Primary user. Follows the guided journey.
- Contributing staff: counselors, CTE teachers, coaches with their own employer contacts.
- Students: add employer leads from their community ties via a simple form. Assume they
  have permission to network.
- Employers: never create accounts. Everything is through a personal link from a named
  school person.
- District viewer: sees aggregate numbers across schools only, never employer names.

## Core principles
1. Relationship first. Employer-facing screens always show ONE named school person.
2. Engagement ladder, aligned to Colorado's WBL continuum (Learning ABOUT / THROUGH / AT
   Work; verify current terms against CWDC/CDE and cite the source):
     Rung 1 Light touch: career fair, guest speaker, mock interviews, resume review
     Rung 2 Exposure: worksite tour, job shadow
     Rung 3 Deeper: classroom industry project, mentoring
     Rung 4 Immersive: internship, pre-apprenticeship, paid work
3. Community contribution first; talent pipeline is the longer-term pitch.
4. The system nudges humans; it never auto-contacts employers.
5. Paperwork proportional to the rung.
6. Plain language for a first-timer. Short instruction, then do something.

## The guided journey (the spine of the school experience)
A left-rail journey map with progress (Part 1: Background, 4 modules; Part 2: Onboarding,
6 stages). Each module/stage page has the same three-part layout:
  1. LEARN: brief instruction (2-4 short paragraphs or bullets, a real example, a
     "key takeaway" callout). Skimmable in under 3 minutes.
  2. DO: an interactive workflow tool (mocked).
  3. GRAB: resources (templates, one-pagers, scripts) as preview + "copy"/"download" mock.
Plus a "Mark complete" button, and "Next" leading to the following step.
Store all LEARN/GRAB content in Markdown/JSON files so non-developers can edit it.
Write real draft content (not lorem ipsum), clearly flagged where facts/stats need
verification.

### Part 1 — Background
B1. Why does work-based learning matter?
  LEARN: benefits for students (career clarity, skills, networks, equity of access to
         professional networks), for schools, and for the community/local economy.
  DO: "Your Why" builder: pick the outcomes that matter to your school and student
      population; generates a one-paragraph "why" statement reused later in outreach.
  GRAB: one-page "Why WBL" handout for staff/principal (stats marked "verify source").

B2. What challenges do employers face, and why might they resist WBL?
  LEARN: time/capacity, liability and insurance worries, supervising minors, paperwork,
         unclear benefit, past bad experiences, not knowing who to talk to at the school.
  DO: "Employer empathy map": pick an employer type (small restaurant, hospital, auto
      shop, tech firm, government office) and see/ edit their likely worries, gains,
      and constraints.
  GRAB: "Common employer concerns" cheat sheet.

B3. What does it take to win over and retain an employer?
  LEARN: one consistent contact, small first asks, make it easy, respect their time,
         say thank you, show impact, recognize them publicly, invite the next step.
  DO: "Partner experience self-check": a scorecard of the school's current practices
      with a score and 3 suggested improvements.
  GRAB: "Partner promise" template (what the school commits to every employer).

B4. What is the lifecycle of a school–employer relationship?
  LEARN: Discover -> Connect -> First engagement (Rung 1) -> Deepen (Rungs 2-3) ->
         Opportunity (Rung 4) -> Sustain/Champion (employer refers other employers).
  DO: Interactive lifecycle/ladder diagram: click each stage to see goals, typical
      duration, signals to move on, and risks of stalling.
  GRAB: Lifecycle + ladder poster (printable).

### Part 2 — Onboarding (actual process)
S1. Map your network and local industries / where to find partners
  LEARN: start with who you already know; staff, parents, alumni, students' community
         ties; local chambers, workforce centers, industry associations; Colorado's
         in-demand industries.
  DO: (a) Staff "Who do you know?" brainstorm board (name, business, relationship,
      warmth). (b) Shareable student lead form + QR code (mock), with submissions landing
      in a "Student-sourced" inbox to claim. (c) "Local industry explorer": mock map/list
      of local employers by sector with a "save as lead" action. Duplicate warnings
      ("Mr. Patel already knows them — join as helper?").
  GRAB: "Where to find employer partners" list; network brainstorm worksheet.

S2. How to reach out
  LEARN: warm intro beats cold email; personal, short, specific, one small ask; use your
         "Why" from B1; follow up within a week.
  DO: Outreach composer: pick a lead, pick a channel (email/text/call script), pick a
      template; it pre-fills the sender's name, school "why", and a Rung 1 ask. Generates
      a personal invite link (mock) and a preview of exactly what the employer will see.
      Logs the outreach to the pipeline.
  GRAB: Email/text templates, phone script, employer one-pager.

S3. Handling common objections
  LEARN: listen first; most objections are about time, risk, or uncertainty; answer with
         a smaller ask.
  DO: Objection handler: choose an objection ("We don't have time", "What about
      liability?", "Teens aren't reliable", "We tried this before", "We're too small",
      "Talk to HR") and see a suggested reply, a smaller alternative ask, and a proof
      point. Include a mock "practice role-play" card with a sample dialogue.
  GRAB: Objection playbook PDF (mock).

S4. Suggested initial entry points
  LEARN: why Rung 1 first; match the ask to the employer's capacity.
  DO: Entry-point picker: answer 3 questions about an employer (time available, on-site
      or at school, comfort with teens) and get recommended Rung 1 activities with time
      commitment and what students get. "Plan it": a simple event planner card (date,
      employers attending, students, logistics checklist).
  GRAB: Rung 1 activity menu; career fair / guest speaker run-of-show templates.

S5. Cultivating the relationship over time; facilitating employer–student introductions
  LEARN: regular warm touchpoints; thank within 48 hours; share student impact; recognize
         publicly; tips for safe, well-prepared student introductions.
  DO: (a) Touchpoint planner and "Today" nudge list (no contact in 14 days, no thank-you
      after event, no next-step offer after a rung). (b) Student thank-you collector that
      shows notes on the employer's page. (c) Introduction planner: pair an employer with
      a class/student group for an activity, with prep checklist for students and employer.
  GRAB: Touchpoint calendar, thank-you templates, "Community Partner" recognition badge,
        student prep sheet.

S6. Converting the relationship into WBL opportunities
  LEARN: signals an employer is ready; how to propose Rung 2-4; who does what; paperwork
         grows with each rung.
  DO: (a) Opportunity builder: turn an employer relationship into a draft job shadow /
      project / internship description (dates, slots, supervisor, skills). (b) Colorado
      paperwork checklist that changes by rung (from `config/states/co.json`; research
      current Colorado requirements: CDE, CWDC, CDLE youth employment rules; cite
      sources; mark "verify with your district" where unsure), with item statuses.
  GRAB: Sample WBL agreement, site safety checklist, parent permission slip, insurance
        certificate request. Persistent banner: "Sample only — have your district
        review. Not legal advice."

## Supporting screens (reached from the journey and the top nav)
- Employer pipeline: kanban Lead -> Invited -> Rung 1 -> Rung 2 -> Rung 3 -> Rung 4, plus
  "Not now". Employer detail: owner + helpers, timeline, rung history, paperwork, notes.
- Employer view (public link, mobile-first): "Hi Maria — Ms. Johnson from Lincoln High
  invited you", school contact card, community-contribution pitch with a student quote,
  pick how to help (Rung 1 biggest), 2-minute form, confirmation. Return view: upcoming
  commitments, paperwork for their rung, student thank-you notes, recognition badge, a
  gentle next-rung invite.
- School dashboard: rung-ups this semester (headline), funnel by rung, leads by source,
  journey progress for the team.
- District dashboard: aggregates across 3 seeded schools only.

## Tech
- Vite + React + TypeScript + Tailwind + React Router; static build deployable to Netlify
  (`netlify.toml` with SPA redirect).
- In-memory state seeded from JSON (localStorage optional), with a "Reset demo" button.
- Header role switcher (Coordinator / Staff / Student / Employer / District) and school
  switcher. No real auth, sending, e-signature or integrations.
- Seed: one district, 3 Colorado schools; "Lincoln High" has 5 staff, ~25 employers across
  all stages, student-sourced leads, a duplicate-contact case, paperwork in various states.
- Mobile-first for the employer view and student form; WCAG AA, keyboard-navigable.

## Deliverables
1. `npm run dev` / `npm run build` work; every screen reachable.
2. README: run/deploy, where to edit journey content and the Colorado config, what is mocked.
3. DEMO.md: a 5-minute click-through: coordinator walks B1-B4 -> S1 maps network (student
   lead arrives) -> S2 sends an invite -> employer view on phone signs up for a career fair
   -> S3 handles an objection from another employer -> S5 logs a thank-you -> S6 builds a
   job shadow with the Colorado checklist -> dashboards show the rung-up.

Before coding, propose the page map, the shared Learn/Do/Grab page component, and the
content file structure, and wait for my OK.
