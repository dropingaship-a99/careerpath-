'use client'

import Image from 'next/image'
import { BookOpen, Bookmark, BrainCircuit, Compass, GraduationCap, House, Settings, User, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewId = 'home' | 'explore' | 'discover' | 'education' | 'ai' | 'saved' | 'resources' | 'settings'

const navItems: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'explore', label: 'Explore Careers', icon: Compass },
  { id: 'discover', label: 'Discover Myself', icon: User },
  { id: 'education', label: 'Explore by Education', icon: GraduationCap },
  { id: 'ai', label: 'AI Career Lab', icon: BrainCircuit },
  { id: 'saved', label: 'Saved Careers', icon: Bookmark },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
  savedCount,
}: {
  active: ViewId
  onNavigate: (id: ViewId) => void
  open: boolean
  onClose: () => void
  savedCount: number
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2">
          <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-3 text-left">
            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-primary-foreground">
              <Compass className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight text-foreground">CareerPath</span>
              <span className="block text-xs text-muted-foreground">Explore · Plan · Build</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active === id ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="flex-1 text-left">{label}</span>
              {id === 'saved' && savedCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{savedCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-primary/10">
          <p className="px-4 pt-4 text-sm leading-relaxed text-muted-foreground">
            Your future is built by the choices you make today.
          </p>
          <span className="mx-4 mt-2 block h-0.5 w-6 bg-primary" aria-hidden="true" />
          <Image
            src="/images/mountain-flag.png"
            alt=""
            width={240}
            height={140}
            className="mt-2 h-24 w-full object-cover object-bottom"
          />
        </div>
      </aside>
    </>
  )
}
