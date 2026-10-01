import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, Copy, ExternalLink, Inbox, MapPin, Send, UserPlus, Users } from 'lucide-react'
import { useMe, useProfile, useSchool, useSchoolData, useStore } from '../data/store'
import { ACTIVITIES, SECTORS } from '../data/ladder'
import type { Employer, Warmth } from '../data/types'
import { relDate } from '../lib/format'
import { Empty, StageChip, Tabs, copyText, useToast } from '../components/ui'
import { EmployerSelect, findDuplicate, inviteUrl } from './shared'

/* ---------- S1: Network map ---------- */

const LOCAL_EMPLOYERS = [
  { name: 'Front Range Auto Repair', sector: 'Automotive', size: '12 employees', distance: '0.8 mi', hot: true },
  { name: 'Peak Robotics', sector: 'Advanced Manufacturing', size: '140 employees', distance: '3.2 mi', hot: true },
  { name: 'Belmar Urgent Care', sector: 'Healthcare', size: '35 employees', distance: '1.1 mi', hot: true },
  { name: 'Kaiser Permanente – Lakewood', sector: 'Healthcare', size: '400+ employees', distance: '2.4 mi', hot: true },
  { name: 'Westland Plumbing & Heating', sector: 'Construction & Trades', size: '22 employees', distance: '1.9 mi', hot: true },
  { name: 'Lakewood Habitat ReStore', sector: 'Education & Nonprofit', size: '15 employees', distance: '2.0 mi', hot: false },
  { name: 'Terumo BCT', sector: 'Advanced Manufacturing', size: '1,000+ employees', distance: '4.5 mi', hot: true },
  { name: 'Green Mountain Grill', sector: 'Hospitality & Food', size: '18 employees', distance: '0.6 mi', hot: false },
  { name: 'Red Rocks Community College', sector: 'Education & Nonprofit', size: '600+ employees', distance: '3.0 mi', hot: false },
  { name: 'Xcel Energy – Lookout Mountain', sector: 'Agriculture & Energy', size: '200 employees', distance: '6.1 mi', hot: true },
  { name: 'Byte Size IT Services', sector: 'Technology', size: '9 employees', distance: '1.4 mi', hot: true },
  { name: 'Lakewood Police Department', sector: 'Government & Public Service', size: '300+ employees', distance: '1.7 mi', hot: false },
  { name: 'Alameda Credit Union', sector: 'Finance & Business', size: '40 employees', distance: '1.2 mi', hot: false },
  { name: 'Colfax Print & Design', sector: 'Arts & Media', size: '7 employees', distance: '2.2 mi', hot: false },
  { name: 'Union Square Dental', sector: 'Healthcare', size: '14 employees', distance: '0.9 mi', hot: true },
  { name: 'Mile High Collision', sector: 'Automotive', size: '25 employees', distance: '2.8 mi', hot: true },
]

function DuplicateWarning({ dup, onHelper, onAnyway }: { dup: Employer; onHelper: () => void; onAnyway: () => void }) {
  const { state } = useStore()
  const owner = state.staff.find((s) => s.id === dup.ownerId)!
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm" role="alert">
      <p className="flex items-start gap-2 font-medium text-amber-900">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        {owner.display} already has a relationship with {dup.name} (<StageChip stage={dup.stage} />
        ). Want to join as a helper instead?
      </p>
      <div className="mt-2 flex gap-2 pl-6">
        <button className="btn-primary !py-1 text-xs" onClick={onHelper}>
          Join as helper
        </button>
        <button className="btn-ghost !py-1 text-xs" onClick={onAnyway}>
          It's a different business. Add anyway
        </button>
      </div>
    </div>
  )
}

export function NetworkMap() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'know' | 'students' | 'explore'>((params.get('tab') as 'students') ?? 'know')
  const { studentLeads } = useSchoolData()
  const waiting = studentLeads.filter((l) => !l.claimedEmployerId).length
  return (
    <div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'know', label: <span className="flex items-center gap-1.5"><Users size={14} /> Who do you know?</span> },
          { id: 'students', label: <span className="flex items-center gap-1.5"><Inbox size={14} /> Student-sourced {waiting > 0 && <span className="rounded-full bg-warm-500 px-1.5 text-[11px] text-white">{waiting}</span>}</span> },
          { id: 'explore', label: <span className="flex items-center gap-1.5"><MapPin size={14} /> Local industry explorer</span> },
        ]}
      />
      {tab === 'know' && <WhoDoYouKnow />}
      {tab === 'students' && <StudentInbox />}
      {tab === 'explore' && <Explorer />}
    </div>
  )
}

function WhoDoYouKnow() {
  const { state, addEmployer, addHelper } = useStore()
  const me = useMe()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const blank = { business: '', person: '', title: '', sector: SECTORS[0], relationship: '', warmth: 'know' as Warmth }
  const [f, setF] = useState(blank)
  const [dup, setDup] = useState<Employer | null>(null)

  const save = (force = false) => {
    if (!f.business.trim()) return
    const d = findDuplicate(employers, f.business)
    if (d && !force) return setDup(d)
    addEmployer({ schoolId: state.schoolId, name: f.business.trim(), sector: f.sector, city: 'Lakewood', contactName: f.person || 'Unknown', contactTitle: f.title, contactEmail: '', contactPhone: '', ownerId: me.id, stage: 'lead', source: 'staff', relationship: f.relationship, warmth: f.warmth })
    toast(`Added ${f.business} to your leads`)
    setF(blank)
    setDup(null)
  }

  const mine = employers.filter((e) => e.ownerId === me.id || e.helperIds.includes(me.id))

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <form className="space-y-3" onSubmit={(e) => (e.preventDefault(), save())}>
        <div>
          <label className="label" htmlFor="biz">Business</label>
          <input id="biz" className="input" value={f.business} onChange={(e) => (setF({ ...f, business: e.target.value }), setDup(null))} placeholder="e.g. Front Range Auto Repair" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="person">Person you know</label>
            <input id="person" className="input" value={f.person} onChange={(e) => setF({ ...f, person: e.target.value })} placeholder="Name" />
          </div>
          <div>
            <label className="label" htmlFor="ptitle">Their role</label>
            <input id="ptitle" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Owner" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="sector">Industry</label>
          <select id="sector" className="input" value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })}>
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rel">How do you know them?</label>
          <input id="rel" className="input" value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} placeholder="My neighbor, former student…" />
        </div>
        <fieldset>
          <legend className="label">How warm is the connection?</legend>
          <div className="flex gap-1">
            {(['cold', 'know', 'close'] as Warmth[]).map((w) => (
              <button type="button" key={w} aria-pressed={f.warmth === w} onClick={() => setF({ ...f, warmth: w })} className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium ${f.warmth === w ? 'border-brand-600 bg-brand-700 text-white' : 'border-stone-300 text-stone-600'}`}>
                {w === 'cold' ? '🧊 Cold' : w === 'know' ? '🙂 Know them' : '🔥 Close'}
              </button>
            ))}
          </div>
        </fieldset>
        {dup ? (
          <DuplicateWarning dup={dup} onHelper={() => (addHelper(dup.id, me.id), toast(`You're now a helper on ${dup.name}`), setDup(null), setF(blank))} onAnyway={() => save(true)} />
        ) : (
          <button className="btn-primary w-full justify-center">
            <UserPlus size={16} /> Add to my network
          </button>
        )}
      </form>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-stone-700">Your connections ({mine.length})</h4>
        <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
          {mine.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <Link to={`/employers/${e.id}`} className="min-w-0">
                <span className="block truncate text-sm font-medium text-stone-900 hover:text-brand-700">{e.name}</span>
                <span className="block truncate text-xs text-stone-500">
                  {e.contactName} · {e.relationship || '—'} {e.ownerId !== me.id && '· helper'}
                </span>
              </Link>
              <span className="flex shrink-0 items-center gap-2">
                <span title={e.warmth}>{e.warmth === 'close' ? '🔥' : e.warmth === 'know' ? '🙂' : '🧊'}</span>
                <StageChip stage={e.stage} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-stone-500">Tip: Ask every staff member to spend 10 minutes here. Use the brainstorm worksheet below at a staff meeting.</p>
      </div>
      {toastNode}
    </div>
  )
}

function StudentInbox() {
  const { state, claimStudentLead } = useStore()
  const me = useMe()
  const school = useSchool()
  const { studentLeads } = useSchoolData()
  const { toast, toastNode } = useToast()
  const url = `${window.location.origin}/s/${school.slug}`
  const staffName = (id: string) => state.staff.find((s) => s.id === id)?.display ?? '—'

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
        <p className="text-sm font-semibold">Share with students</p>
        <p className="mb-3 text-xs text-stone-500">Post the QR code in classrooms or share the link in your LMS.</p>
        <div className="inline-block rounded-lg bg-white p-3 shadow-sm">
          <QRCodeSVG value={url} size={140} fgColor="#115e59" />
        </div>
        <p className="mt-2 break-all text-xs text-stone-500">{url}</p>
        <div className="mt-3 flex flex-col gap-2">
          <button className="btn-secondary justify-center text-xs" onClick={async () => toast((await copyText(url)) ? 'Link copied' : 'Copy not available')}>
            <Copy size={14} /> Copy link
          </button>
          <a href={`/s/${school.slug}`} target="_blank" rel="noreferrer" className="btn-secondary justify-center text-xs">
            <ExternalLink size={14} /> Open student form
          </a>
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-stone-700">Leads from students</h4>
        {studentLeads.length === 0 ? (
          <Empty>No student leads yet. Share the form!</Empty>
        ) : (
          <ul className="space-y-2">
            {studentLeads.map((l) => {
              const claimed = l.claimedEmployerId ? state.employers.find((e) => e.id === l.claimedEmployerId) : undefined
              return (
                <li key={l.id} className={`rounded-lg border p-3 ${claimed ? 'border-stone-200 bg-stone-50' : 'border-warm-100 bg-white'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900">{l.business}</p>
                      <p className="text-sm text-stone-600">
                        <span className="font-medium">{l.studentName}</span> (grade {l.grade}): “{l.howKnown}”
                      </p>
                      <p className="text-xs text-stone-500">
                        Contact: {l.contactName || '—'} {l.contactInfo && `· ${l.contactInfo}`} · Suggested follow-up: {staffName(l.teacherId)} · {relDate(l.submittedAt)}
                      </p>
                    </div>
                    {claimed ? (
                      <Link to={`/employers/${claimed.id}`} className="chip bg-emerald-50 text-emerald-800">
                        Claimed by {staffName(claimed.ownerId)} →
                      </Link>
                    ) : (
                      <div className="flex gap-1.5">
                        {l.teacherId !== me.id && (
                          <button className="btn-ghost !py-1 text-xs" onClick={() => (claimStudentLead(l.id, l.teacherId), toast(`Assigned to ${staffName(l.teacherId)}`))}>
                            Assign to {staffName(l.teacherId)}
                          </button>
                        )}
                        <button className="btn-primary !py-1 text-xs" onClick={() => (claimStudentLead(l.id, me.id), toast(`${l.business} is now your lead`))}>
                          Claim
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {toastNode}
    </div>
  )
}

function Explorer() {
  const { state, addEmployer, addHelper } = useStore()
  const me = useMe()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const profile = useProfile()
  const focus = profile.focusSectors
  const [sector, setSector] = useState<string>('All')
  const [hotOnly, setHotOnly] = useState(false)
  const [focusOnly, setFocusOnly] = useState(focus.length > 0)
  const [dupFor, setDupFor] = useState<{ name: string; dup: Employer } | null>(null)
  const list = LOCAL_EMPLOYERS.filter((x) => (sector === 'All' || x.sector === sector) && (!hotOnly || x.hot) && (!focusOnly || focus.includes(x.sector)))
  const sectors = ['All', ...new Set(LOCAL_EMPLOYERS.map((x) => x.sector))]

  const save = (x: (typeof LOCAL_EMPLOYERS)[number], force = false) => {
    const d = findDuplicate(employers, x.name)
    if (d && !force) return setDupFor({ name: x.name, dup: d })
    addEmployer({ schoolId: state.schoolId, name: x.name, sector: x.sector, city: 'Lakewood', contactName: 'Unknown', contactTitle: '', contactEmail: '', contactPhone: '', ownerId: me.id, stage: 'lead', source: 'explorer', relationship: 'Found via local industry explorer', warmth: 'cold' })
    setDupFor(null)
    toast(`Saved ${x.name} as a lead. Next: find a person there!`)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select className="input !w-auto" value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Filter by industry">
          {sectors.map((s) => <option key={s}>{s}</option>)}
        </select>
        {focus.length > 0 ? (
          <label className="flex items-center gap-1.5 text-sm text-stone-600">
            <input type="checkbox" checked={focusOnly} onChange={(e) => setFocusOnly(e.target.checked)} className="accent-brand-700" />
            ⭐ Our focus industries only
          </label>
        ) : (
          <Link to="/intake" className="text-xs text-brand-700 underline">
            Set focus industries in your school profile
          </Link>
        )}
        <label className="flex items-center gap-1.5 text-sm text-stone-600">
          <input type="checkbox" checked={hotOnly} onChange={(e) => setHotOnly(e.target.checked)} className="accent-brand-700" />
          Colorado in-demand industries only
        </label>
        <span className="ml-auto text-xs text-stone-500">Mock data · within 7 miles of {useSchool().name}</span>
      </div>
      {dupFor && (
        <div className="mb-3">
          <DuplicateWarning dup={dupFor.dup} onHelper={() => (addHelper(dupFor.dup.id, me.id), toast(`You're now a helper on ${dupFor.dup.name}`), setDupFor(null))} onAnyway={() => save(LOCAL_EMPLOYERS.find((x) => x.name === dupFor.name)!, true)} />
        </div>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((x) => {
          const existing = findDuplicate(employers, x.name)
          return (
            <li key={x.name} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{x.name}</p>
                <p className="text-xs text-stone-500">
                  {x.sector} · {x.size} · {x.distance}
                  {x.hot && <span className="ml-1 text-emerald-700">· in-demand</span>}
                  {focus.includes(x.sector) && <span className="ml-1">· ⭐ focus</span>}
                </p>
              </div>
              {existing ? (
                <Link to={`/employers/${existing.id}`} className="shrink-0 text-xs text-stone-500 underline">
                  Already in pipeline
                </Link>
              ) : (
                <button className="btn-secondary shrink-0 !py-1 text-xs" onClick={() => save(x)}>
                  Save as lead
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-xs text-stone-500">In a full version this would draw on chamber directories and CWDC Talent Pipeline data for your region.</p>
      {toastNode}
    </div>
  )
}

/* ---------- S2: Outreach composer ---------- */

type Channel = 'email' | 'text' | 'call'
const TEMPLATES = [
  { id: 'personal', label: 'I know them personally' },
  { id: 'warm', label: 'Warm intro through someone' },
  { id: 'local', label: 'Local, not yet connected' },
]

export function OutreachComposer() {
  const { state, sendInvite } = useStore()
  const me = useMe()
  const school = useSchool()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const candidates = employers.filter((e) => ['lead', 'invited', 'notnow'].includes(e.stage)).sort((a, b) => Number(b.ownerId === me.id) - Number(a.ownerId === me.id))
  const [params] = useSearchParams()
  const [empId, setEmpId] = useState(params.get('employer') ?? candidates.find((c) => c.id === 'e-vet')?.id ?? candidates[0]?.id ?? '')
  const [channel, setChannel] = useState<Channel>('email')
  const [tpl, setTpl] = useState('personal')
  const [activityId, setActivityId] = useState('career-fair')
  const [when, setWhen] = useState('our Spring Career Fair on March 12')
  const [edited, setEdited] = useState<string | null>(null)
  const e = employers.find((x) => x.id === empId)
  const act = ACTIVITIES.find((a) => a.id === activityId)!
  const why = state.journey.why || `At ${school.name}, we want every student to see real careers up close and meet adults who can open doors.`

  const generated = useMemo(() => {
    if (!e) return ''
    const first = e.contactName.split(' ')[0] === 'Unknown' ? 'there' : e.contactName.replace(/^(Dr\.|Capt\.)\s*/, '').split(' ')[0]
    const link = inviteUrl(e.token)
    const ask = `${act.name.toLowerCase()} (${act.time.toLowerCase()}) at ${when}`
    const opener =
      tpl === 'personal'
        ? `It's ${me.name.split(' ')[0]} from ${school.name}! I'm helping our school connect students with local businesses, and I thought of you right away.`
        : tpl === 'warm'
          ? `[Mutual contact] suggested I reach out. I'm ${me.name}, ${me.title.toLowerCase()} at ${school.name}.`
          : `I'm ${me.name}, ${me.title.toLowerCase()} at ${school.name}, just down the road. Our students are curious about ${e.sector.toLowerCase()} careers, and ${e.name} came up.`
    if (channel === 'text')
      return `Hi ${first}, it's ${me.display} from ${school.name}! Would you be up for a ${ask}? 2-minute details here: ${link}. Totally fine if not!`
    if (channel === 'call')
      return `OPEN: "Hi ${first}, it's ${me.name} from ${school.name}. ${tpl === 'personal' ? '' : 'I was hoping to grab two minutes. '}Do you have a moment?"\n\nWHY: "${why}"\n\nASK: "Would you be up for a ${ask}?"\n\nLISTEN. If they hesitate: "What would make that easier?" (See S3.)\n\nIF YES: "Wonderful! I'll text you a link with details: ${link}"\n\nIF NOT NOW: "Totally understand. Could I check back in a few months?"`
    return `Subject: A quick favor for ${school.name} students?\n\nHi ${first},\n\n${opener}\n\n${why}\n\nWould you be up for a ${ask}? Here's a short link with the details. It takes 2 minutes: ${link}\n\nNo pressure at all. Happy to answer questions anytime at ${me.phone}.\n\n${me.name}\n${me.title}, ${school.name}`
  }, [e, channel, tpl, act, when, me, school, why])

  const msg = edited ?? generated
  const reset = () => setEdited(null)

  if (!e) return <Empty>No leads yet. Add some in S1 first.</Empty>

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3">
        <EmployerSelect employers={candidates} value={empId} onChange={(v) => (setEmpId(v), reset())} label="Who are you reaching out to?" />
        <p className="-mt-1 text-xs text-stone-500">
          {e.contactName} · {e.relationship || 'no connection noted'}
        </p>
        <div>
          <span className="label">Channel</span>
          <Tabs value={channel} onChange={(c) => (setChannel(c), reset())} tabs={[{ id: 'email', label: 'Email' }, { id: 'text', label: 'Text' }, { id: 'call', label: 'Call script' }]} />
        </div>
        {channel === 'email' && (
          <div>
            <label className="label" htmlFor="tpl">Template</label>
            <select id="tpl" className="input" value={tpl} onChange={(x) => (setTpl(x.target.value), reset())}>
              {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="ask">Your small ask (Level 1)</label>
          <select id="ask" className="input" value={activityId} onChange={(x) => (setActivityId(x.target.value), reset())}>
            {ACTIVITIES.filter((a) => a.level <= 2).map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="when">When / which event</label>
          <input id="when" className="input" value={when} onChange={(x) => (setWhen(x.target.value), reset())} />
        </div>
        {!state.journey.why && (
          <p className="rounded-md bg-warm-50 p-2 text-xs text-warm-700">
            Using a default “why.” <Link className="underline" to="/journey/b1">Write your own in B1</Link>.
          </p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="msg">Your message (edit freely, it should sound like you)</label>
        <textarea id="msg" className="input min-h-72 font-mono text-[13px] leading-relaxed" value={msg} onChange={(x) => setEdited(x.target.value)} />
        <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">Personal invite link</p>
          <p className="break-all font-mono text-sm text-brand-900">{inviteUrl(e.token)}</p>
          <p className="mt-1 text-xs text-brand-800">Tied to {e.name} and to you. They'll see your name, photo and phone number.</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={async () => toast((await copyText(msg)) ? 'Message copied. Paste it into your email or phone.' : 'Copy not available')}>
            <Copy size={16} /> Copy message
          </button>
          <a className="btn-secondary" href={`/e/${e.token}`} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Preview what they'll see
          </a>
          <button className="btn-primary" onClick={() => (sendInvite(e.id, me.id, channel), toast(`Logged! ${e.name} moved to Invited.`))}>
            <Send size={16} /> I sent it
          </button>
        </div>
        <p className="mt-2 text-xs text-stone-500">The app never sends anything for you. Messages come from your own email or phone, so they stay personal.</p>
      </div>
      {toastNode}
    </div>
  )
}

/* ---------- S3: Objection handler ---------- */

const OBJECTIONS = [
  { id: 'time', q: '“We don’t have time.”', bucket: 'Time', listen: 'Is it this season, or always? Is it staff hours or their own time?', say: 'Completely understand. Most of our partners are small teams too.', smaller: 'A 20-minute conversation with one curious student, or curriculum advice for a teacher (Level 1).', proof: 'Tom at Front Range Auto started with one career fair afternoon.' },
  { id: 'liability', q: '“What about liability?”', bucket: 'Risk', listen: 'Are they worried about injury, insurance or legal paperwork?', say: 'Great question. For activities at school, students are under school supervision the whole time.', smaller: 'Start on our campus: a guest talk or career fair table.', proof: 'For later steps, we walk you through the paperwork and handle most of it. (Confirm specifics with your district.)' },
  { id: 'teens', q: '“Teens aren’t reliable.”', bucket: 'Uncertainty', listen: 'Did they have a specific bad experience?', say: 'That’s fair. We’ve all seen it. Our students come prepared, and a teacher is always there.', smaller: 'Mock interviews, so you see students at their best, with a teacher in the room.', proof: 'Share a student thank-you note from another partner.' },
  { id: 'before', q: '“We tried this before.”', bucket: 'Uncertainty', listen: 'What went wrong? Was it the school, the students, or the logistics?', say: 'I’m sorry that happened. Here’s what we do differently: you get one contact, and we follow through.', smaller: 'One event with a clear agenda, and you decide after.', proof: 'Our partner promise: thank-you within 48 hours, every time.' },
  { id: 'small', q: '“We’re too small.”', bucket: 'Uncertainty', listen: 'Do they think you only want big companies?', say: 'Small businesses are some of our best partners. Students love seeing how a business really runs.', smaller: 'A guest talk on how you started your business.', proof: 'Some of our students’ favorite partners have fewer than five employees.' },
  { id: 'hr', q: '“Talk to HR.”', bucket: 'Process', listen: 'Are they interested but unsure they’re allowed?', say: 'Happy to! Could you introduce me, or forward this one-pager?', smaller: 'A short call with HR together.', proof: 'Bring the employer one-pager from S2.' },
]
const ROLEPLAY = [
  { who: 'Employer', line: 'Honestly, we’re slammed through December.' },
  { who: 'You', line: 'Totally get it. What’s your slow season?' },
  { who: 'Employer', line: 'January’s pretty quiet.' },
  { who: 'You', line: 'Perfect. Could I put you down for a 30-minute virtual Q&A with our business class in late January?' },
  { who: 'Employer', line: 'Sure, that I can do.' },
  { who: 'You', line: 'Wonderful. I’ll send a calendar hold and three student questions ahead of time. Thank you!' },
]

export function ObjectionHandler() {
  const { logActivity } = useStore()
  const me = useMe()
  const { employers } = useSchoolData()
  const { toast, toastNode } = useToast()
  const [sel, setSel] = useState('time')
  const [lines, setLines] = useState(1)
  const [empId, setEmpId] = useState(employers.find((e) => e.id === 'e-dental')?.id ?? employers[0]?.id)
  const o = OBJECTIONS.find((x) => x.id === sel)!

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <ul className="space-y-1" role="listbox" aria-label="Objections">
          {OBJECTIONS.map((x) => (
            <li key={x.id}>
              <button role="option" aria-selected={sel === x.id} onClick={() => setSel(x.id)} className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${sel === x.id ? 'border-brand-600 bg-brand-50 font-medium text-brand-900' : 'border-stone-200 hover:bg-stone-50'}`}>
                {x.q}
                <span className="block text-xs font-normal text-stone-500">{x.bucket}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-3 rounded-xl bg-stone-50 p-5">
          <h4 className="text-lg font-semibold">{o.q}</h4>
          <Row label="👂 Listen for" text={o.listen} />
          <Row label="💬 Say" text={o.say} />
          <Row label="🔽 Smaller ask" text={o.smaller} highlight />
          <Row label="⭐ Proof point" text={o.proof} />
          <div className="flex flex-wrap items-end gap-2 border-t border-stone-200 pt-3">
            <div className="min-w-48 flex-1">
              <EmployerSelect employers={employers} value={empId} onChange={setEmpId} label="Heard this from…" id="obj-emp" />
            </div>
            <button className="btn-secondary" onClick={() => (logActivity(empId, 'note', me.id, `Objection: ${o.q} Offered: ${o.smaller}`), toast('Logged to their timeline'))}>
              Log it
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-stone-200 p-5">
        <h4 className="mb-3 font-semibold">🎭 Practice role-play: “We’re slammed”</h4>
        <ol className="space-y-2">
          {ROLEPLAY.slice(0, lines).map((l, i) => (
            <li key={i} className={`flex ${l.who === 'You' ? 'justify-end' : ''}`}>
              <span className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${l.who === 'You' ? 'bg-brand-700 text-white' : 'bg-stone-100 text-stone-800'}`}>
                <span className="block text-[10px] font-semibold uppercase opacity-70">{l.who}</span>
                {l.line}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex gap-2">
          {lines < ROLEPLAY.length ? (
            <button className="btn-secondary" onClick={() => setLines(lines + 1)}>Next line</button>
          ) : (
            <button className="btn-ghost" onClick={() => setLines(1)}>Start over</button>
          )}
          <span className="self-center text-xs text-stone-500">Try saying “your” lines out loud before revealing them.</span>
        </div>
      </div>
      {toastNode}
    </div>
  )
}

function Row({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div className={highlight ? 'rounded-lg border border-brand-200 bg-white p-3' : ''}>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="text-sm text-stone-800">{text}</p>
    </div>
  )
}

