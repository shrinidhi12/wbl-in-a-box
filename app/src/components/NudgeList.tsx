import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarClock, Heart, Inbox, MessageCircle, Phone, TrendingUp } from 'lucide-react'
import { useStore } from '../data/store'
import type { Nudge, NudgeKind } from '../lib/nudges'
import { Avatar, Empty } from './ui'

const ICON: Record<NudgeKind, { icon: typeof Heart; cls: string }> = {
  thank: { icon: Heart, cls: 'bg-rose-50 text-rose-600' },
  quiet: { icon: MessageCircle, cls: 'bg-sky-50 text-sky-600' },
  next: { icon: TrendingUp, cls: 'bg-emerald-50 text-emerald-700' },
  checkback: { icon: CalendarClock, cls: 'bg-amber-50 text-amber-700' },
  followup: { icon: Phone, cls: 'bg-violet-50 text-violet-700' },
  studentLeads: { icon: Inbox, cls: 'bg-warm-50 text-warm-700' },
}

export function nudgeHref(n: Nudge) {
  switch (n.kind) {
    case 'thank':
      return `/journey/s5?tab=thanks&employer=${n.employerId}`
    case 'next':
      return `/journey/s6?employer=${n.employerId}`
    case 'studentLeads':
      return '/journey/s1?tab=students'
    case 'followup':
      return `/journey/s2?employer=${n.employerId}`
    default:
      return `/employers/${n.employerId}`
  }
}

export function NudgeList({ nudges, showOwner, limit }: { nudges: Nudge[]; showOwner?: boolean; limit?: number }) {
  const { state } = useStore()
  const nav = useNavigate()
  if (!nudges.length) return <Empty>All caught up. Nice work! 🎉</Empty>
  return (
    <ul className="space-y-2">
      {nudges.slice(0, limit).map((n) => {
        const { icon: Icon, cls } = ICON[n.kind]
        const owner = n.ownerId ? state.staff.find((s) => s.id === n.ownerId) : undefined
        return (
          <li key={n.id} className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3">
            <span className={`rounded-lg p-2 ${cls}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900">
                {n.title}
                {n.urgency === 3 && <span className="chip ml-2 bg-rose-100 text-rose-700">Today</span>}
              </p>
              <p className="text-sm text-stone-600">{n.detail}</p>
              {showOwner && owner && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                  <Avatar person={owner} size="sm" /> {owner.name}
                </p>
              )}
            </div>
            <button className="btn-secondary shrink-0 !py-1.5 text-xs" onClick={() => nav(nudgeHref(n))}>
              {n.action} <ArrowRight size={14} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
