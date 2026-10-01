import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, Columns3, FolderOpen, Menu, RotateCcw, Sun, X } from 'lucide-react'
import { useMe, useSchool, useStore } from '../data/store'
import type { Role } from '../data/types'
import { computeNudges } from '../lib/nudges'
import { Avatar } from './ui'

export const ROLES: { id: Role; label: string }[] = [
  { id: 'coordinator', label: 'WBL Coordinator' },
  { id: 'staff', label: 'Contributing staff' },
  { id: 'student', label: 'Student' },
  { id: 'employer', label: 'Employer' },
  { id: 'district', label: 'District viewer' },
]

export function homeFor(role: Role, schoolSlug: string) {
  switch (role) {
    case 'student':
      return `/s/${schoolSlug}`
    case 'employer':
      return '/e/sol-bakery-and-cafe'
    case 'district':
      return '/district'
    case 'staff':
      return '/today'
    default:
      return '/journey'
  }
}

/** Thin bar across every screen so the prototype can be demoed from one browser. */
export function DemoBar() {
  const { state, setRole, setSchool, reset } = useStore()
  const school = useSchool()
  const nav = useNavigate()
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-stone-900 px-4 py-1.5 text-xs text-stone-300">
      <span className="font-semibold uppercase tracking-wider text-warm-500">Prototype</span>
      <label className="flex items-center gap-1.5">
        Viewing as
        <select
          className="rounded bg-stone-800 px-1.5 py-0.5 text-white"
          value={state.role}
          onChange={(e) => {
            const r = e.target.value as Role
            setRole(r)
            nav(homeFor(r, school.slug))
          }}
        >
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      {(state.role === 'coordinator' || state.role === 'staff') && (
        <label className="flex items-center gap-1.5">
          School
          <select className="rounded bg-stone-800 px-1.5 py-0.5 text-white" value={state.schoolId} onChange={(e) => setSchool(e.target.value)}>
            {state.schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        className="ml-auto flex items-center gap-1 hover:text-white"
        onClick={() => {
          if (confirm('Reset all demo data to the starting state?')) reset()
        }}
      >
        <RotateCcw size={12} /> Reset demo
      </button>
    </div>
  )
}

function NavItem({ to, icon, children, badge }: { to: string; icon: ReactNode; children: ReactNode; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`
      }
    >
      {icon}
      {children}
      {!!badge && <span className="ml-1 rounded-full bg-warm-500 px-1.5 text-[11px] font-semibold text-white">{badge}</span>}
    </NavLink>
  )
}

export function AppLayout() {
  const { state } = useStore()
  const me = useMe()
  const school = useSchool()
  const [open, setOpen] = useState(false)
  const nudgeCount = computeNudges(state, state.schoolId, state.role === 'staff' ? me.id : undefined).length

  const links = (
    <>
      <NavItem to="/journey" icon={<BookOpen size={16} />}>
        Journey
      </NavItem>
      <NavItem to="/today" icon={<Sun size={16} />} badge={nudgeCount}>
        Today
      </NavItem>
      <NavItem to="/pipeline" icon={<Columns3 size={16} />}>
        Pipeline
      </NavItem>
      <NavItem to="/dashboard" icon={<BarChart3 size={16} />}>
        Dashboard
      </NavItem>
      <NavItem to="/resources" icon={<FolderOpen size={16} />}>
        Resources
      </NavItem>
    </>
  )

  return (
    <div className="min-h-screen">
      <DemoBar />
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5">
          <NavLink to="/journey" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">W</span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold">WBL in a Box</span>
              <span className="block text-xs text-stone-500">{school.name}</span>
            </span>
          </NavLink>
          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
            {links}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right text-xs leading-tight sm:block">
              <div className="font-medium text-stone-800">{me.name}</div>
              <div className="text-stone-500">{state.role === 'coordinator' ? 'WBL Coordinator' : me.title}</div>
            </div>
            <Avatar person={me} />
            <button className="btn-ghost !p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-stone-200 p-2 md:hidden" onClick={() => setOpen(false)}>
            {links}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

/** Public pages (employer link, student form) get only the demo bar, no app chrome. */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-stone-50">
      <DemoBar />
      <Outlet />
    </div>
  )
}
