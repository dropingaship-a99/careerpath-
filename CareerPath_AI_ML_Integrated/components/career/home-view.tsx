'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Compass, GraduationCap, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { careers, popularCareerIds } from '@/lib/career-data'
import { CareerCard } from './shared'
import type { ViewId } from './sidebar'

const entryCards: { id: ViewId; title: string; text: string; icon: LucideIcon; className: string; iconClass: string }[] = [
  {
    id: 'discover',
    title: 'Discover Myself',
    text: 'Know your interests, strengths and personality to find suitable careers.',
    icon: User,
    className: 'bg-violet-50/60 border-violet-100',
    iconClass: 'bg-violet-600',
  },
  {
    id: 'education',
    title: 'Explore by Education',
    text: 'Select your current class and see relevant subjects and future options.',
    icon: GraduationCap,
    className: 'bg-emerald-50/60 border-emerald-100',
    iconClass: 'bg-emerald-600',
  },
  {
    id: 'explore',
    title: 'Explore Careers Directly',
    text: 'Pick a field, browse roles and see future prospects, companies and salaries.',
    icon: Compass,
    className: 'bg-blue-50/60 border-blue-100',
    iconClass: 'bg-primary',
  },
]

export function HomeView({ onNavigate, onSelectCareer }: { onNavigate: (id: ViewId) => void; onSelectCareer: (id: string) => void }) {
  const [showAll, setShowAll] = useState(false)
  const list = showAll ? careers : careers.filter((c) => popularCareerIds.includes(c.id))

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-4 md:grid-cols-3" aria-label="Get started">
        {entryCards.map(({ id, title, text, icon: Icon, className, iconClass }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={cn(
              'group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5',
              className,
            )}
          >
            <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-full text-white', iconClass)}>
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-foreground">{title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
          </button>
        ))}
      </section>

      <section aria-labelledby="popular-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="popular-heading" className="text-2xl font-bold text-foreground">
              {showAll ? 'All Careers' : 'Popular Careers'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Explore some of the most in-demand and exciting career options.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {showAll ? 'Show less' : 'View all'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((c) => (
            <CareerCard key={c.id} career={c} onSelect={() => onSelectCareer(c.id)} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-blue-50 to-sky-100">
        <Image
          src="/images/hero-future.png"
          alt="Student looking at mountains with a signpost reading dream, plan, achieve"
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover object-right opacity-40 md:opacity-100"
        />
        <div className="relative max-w-lg p-8 md:p-10">
          <p className="text-sm font-semibold text-primary">Your Next Chapter Starts Here</p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground md:text-4xl">Explore Your Future</h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Discover careers that match your interests, skills and education path. Make informed decisions for a brighter tomorrow.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Exploring
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  )
}
