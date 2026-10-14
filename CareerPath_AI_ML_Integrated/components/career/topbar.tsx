'use client'

import { useState } from 'react'
import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { careers } from '@/lib/career-data'
import { IconBox } from './shared'

const notifications = [
  { id: 1, text: 'New careers added in Healthcare', time: '2h ago' },
  { id: 2, text: 'Your saved career “Data Scientist” is trending', time: '1d ago' },
  { id: 3, text: 'Complete Discover Myself for better matches', time: '3d ago' },
]

export function Topbar({ onMenu, onSelectCareer }: { onMenu: () => void; onSelectCareer: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [openMenu, setOpenMenu] = useState<'bell' | 'user' | null>(null)
  const [unread, setUnread] = useState(true)

  const q = query.trim().toLowerCase()
  const results = q
    ? careers
        .filter((c) => [c.name, c.category, ...c.skills, ...c.roles].some((t) => t.toLowerCase().includes(q)))
        .slice(0, 6)
    : []

  const toggle = (menu: 'bell' | 'user') => {
    setOpenMenu((m) => (m === menu ? null : menu))
    if (menu === 'bell') setUnread(false)
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="relative max-w-md flex-1">
        <label htmlFor="global-search" className="sr-only">
          Search careers, skills, subjects
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search careers, skills, subjects..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
        />
        {focused && q && (
          <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{`No careers found for “${query}”`}</p>
            ) : (
              <ul>
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        onSelectCareer(c.id)
                        setQuery('')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary"
                    >
                      <IconBox icon={c.icon} tone={c.tone} size="sm" />
                      <span>
                        <span className="block text-sm font-medium text-foreground">{c.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {c.category} · {c.salary}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('bell')}
            aria-label="Notifications"
            aria-expanded={openMenu === 'bell'}
            className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-secondary"
          >
            <Bell className="size-5" aria-hidden="true" />
            {unread && <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />}
          </button>
          {openMenu === 'bell' && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-xl">
              <p className="px-2 py-1.5 text-sm font-semibold text-foreground">Notifications</p>
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="rounded-lg px-2 py-2 hover:bg-secondary">
                    <p className="text-sm text-foreground">{n.text}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('user')}
            aria-expanded={openMenu === 'user'}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-secondary"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-indigo-900 text-sm font-semibold text-white">
              M
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:inline">Medh</span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
          {openMenu === 'user' && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-popover p-2 shadow-xl">
              {['My Profile', 'Preferences', 'Sign out'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOpenMenu(null)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
