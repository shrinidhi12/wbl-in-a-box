# WBL in a Box: gaps and decisions

## Decisions made
| Gap | Decision |
|---|---|
| Fidelity | Clickable prototype. Mock data, no real functionality. |
| School UX | Guided journey: 4 background modules, then 6 onboarding stages. Each stage = instruction + tool + resource. |
| Unit of deployment / buyer | Each school owns its relationships. The district usually pays. |
| District role | Rollup reports only. No employer names or contacts. |
| North-star metric | Employers climbing the engagement ladder |
| Student side | Out of scope. Students only add employer leads; we assume they have permission to network. |
| Employer login | Link-only (magic links) |
| Ownership | One owner per employer plus helpers. The coordinator can reassign. |
| Employer value message | Community contribution and recognition first, with student impact stories. Talent pipeline comes later. |
| School-year renewal, integrations | Out of scope |
| Paperwork state | Colorado sample |
| Hosting | Static site that runs locally and deploys to Netlify |


### Resolved in the prompt
Everything in the decisions table above is written into PROMPT.md.

### Deferred until after the prototype
- **Student matching and placement.** Out of scope, so "students placed" can't be shown. Rung-ups stand in for it.
- **School-year renewal, integrations (CSV/Sheets/SIS), real background checks.**
- **Real persistence and multi-device use.** A live demo can't open the employer link on a separate phone with real shared data.

### Open risks
- **Content is the product.** The 10 Learn/Grab modules carry most of the value. Claude Code will write drafts, but an experienced Colorado WBL coordinator should review them. Any stats need real sources.
- **Colorado legal accuracy.** Youth employment, insurance, and liability items need district or expert sign-off. The "not legal advice" banner has to stay.
- **Student data assumption.** Confirm that students submitting adult contact info fits district policy and Colorado's Student Data Transparency and Security Act.
- **Journey vs. daily work.** The guided journey suits first-time coordinators, but returning users need a fast path to "Today" and the pipeline. Make sure the journey doesn't get in their way.
- **District buyer value.** Check that aggregate-only reports give a district enough to justify paying.
- **Teacher capacity.** Keep nudges few and specific.
- **Intermediaries** (CareerWise, workforce boards, chambers). They could be a source in S1 or a partner later.
