'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  CircleCheck,
  Clock,
  Coins,
  Compass,
  FileText,
  Lightbulb,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Career, type Tone } from '@/lib/career-data'
import { BackLink, IconBox, Tag } from './shared'

const tabs = ['Overview', 'Companies', 'Salary & Hours', 'Benefits', 'Future Prospects'] as const
type Tab = (typeof tabs)[number]

const companyColors = ['bg-blue-600', 'bg-emerald-600', 'bg-orange-500', 'bg-violet-600', 'bg-pink-500', 'bg-teal-600']

export function CareerDetail({
  career,
  backLabel,
  onBack,
  saved,
  onToggleSave,
  onExploreSimilar,
  initialTab = 'Overview',
}: {
  career: Career
  backLabel: string
  onBack: () => void
  saved: boolean
  onToggleSave: () => void
  onExploreSimilar?: () => void
  initialTab?: Tab
}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const show = (t: Tab) => tab === 'Overview' || tab === t

  return (
    <div>
      <BackLink label={backLabel} onClick={onBack} />

      <header className="mt-4 flex flex-col gap-5 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center">
        <IconBox icon={career.icon} tone={career.tone} size="lg" />
        <div className="flex-1">
          <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">{career.name}</h1>
          <p className="mt-1 text-muted-foreground">{career.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag tone={career.tone}>{career.category}</Tag>
            <Tag tone="green">{career.demand} Demand</Tag>
            <Tag tone="blue">{career.growth}</Tag>
          </div>
        </div>
        <SaveButton saved={saved} onClick={onToggleSave} />
      </header>

      <div role="tablist" aria-label="Career details" className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {tab === 'Overview' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={TrendingUp} tone="green" label="Prosperity" value={career.demand === 'Medium' ? 'Moderate' : 'High'} note="Long-term career stability and growth." />
            <StatCard icon={Sparkles} tone="blue" label="Market Trend" value={career.trend} note={`Projected job growth ${career.growth}.`} />
            <StatCard icon={Users} tone="violet" label="Demand" value={career.demand} note="Hiring demand across industries." />
            <StatCard icon={Coins} tone="orange" label="Avg. Salary" value={career.salary} note="Varies by experience, city and company." />
          </div>
        )}

        <div className={cn('grid gap-5', tab === 'Overview' && 'lg:grid-cols-2')}>
          {tab === 'Overview' && (
            <Panel icon={FileText} title="Career Overview">
              <p className="text-sm leading-relaxed text-muted-foreground">{career.overview}</p>
              <h3 className="mt-5 text-sm font-semibold text-foreground">Top Job Roles</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {career.roles.map((r) => (
                  <li key={r} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                    {r}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {show('Companies') && (
            <Panel icon={Building2} title="Top Hiring Companies">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {career.companies.map((c, i) => (
                  <li key={c} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center">
                    <span className={cn('flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white', companyColors[i % companyColors.length])}>
                      {c.charAt(0)}
                    </span>
                    <span className="text-xs font-medium text-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {show('Salary & Hours') && (
            <Panel icon={Coins} title="Salary by Experience (LPA)">
              <ul className="flex flex-col gap-3">
                {career.salaryLevels.map((l, i) => (
                  <li key={l.level} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-xs text-muted-foreground">{l.level}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${35 + i * 30}%` }} />
                    </div>
                    <span className="w-28 shrink-0 text-right text-sm font-semibold text-foreground">{l.range}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-secondary p-4">
                <Clock className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{career.hours}</p>
                  <p className="text-xs text-muted-foreground">Typical working hours</p>
                </div>
              </div>
            </Panel>
          )}

          {show('Benefits') && (
            <Panel icon={Star} title="Benefits & Key Skills">
              <ul className="flex flex-col gap-2.5">
                {career.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CircleCheck className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 text-sm font-semibold text-foreground">Skills to build</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {career.skills.map((s) => (
                  <li key={s}>
                    <Tag tone="blue">{s}</Tag>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {show('Future Prospects') && (
            <Panel icon={Rocket} title="Future Prospects" className={tab === 'Overview' ? 'lg:col-span-2' : undefined}>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex flex-1 gap-3 rounded-xl bg-primary/5 p-4">
                  <Lightbulb className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-foreground">{career.future}</p>
                </div>
                <dl className="grid flex-1 grid-cols-3 gap-3">
                  <MiniStat label="Job Growth" value={career.growth.split(' ')[0]} />
                  <MiniStat label="Starting" value={career.salaryLevels[0].range.replace(' LPA', '')} />
                  <MiniStat label="Senior" value={career.salaryLevels[2].range.replace(' LPA', '')} />
                </dl>
              </div>
            </Panel>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <IconBox icon={Compass} tone="blue" size="sm" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Interested in this career?</p>
          <p className="text-xs text-muted-foreground">Save it to your profile or explore similar options.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SaveButton saved={saved} onClick={onToggleSave} />
          {onExploreSimilar && (
            <button
              type="button"
              onClick={onExploreSimilar}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Similar Careers
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  const Icon = saved ? BookmarkCheck : Bookmark
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
        saved ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/40',
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {saved ? 'Saved' : 'Save Career'}
    </button>
  )
}

function Panel({
  icon,
  title,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-5', className)}>
      <div className="mb-4 flex items-center gap-3">
        <IconBox icon={icon} tone="blue" size="sm" />
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function StatCard({ icon, tone, label, value, note }: { icon: LucideIcon; tone: Tone; label: string; value: string; note: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
      <IconBox icon={icon} tone={tone} />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <dd className="text-sm font-bold text-primary">{value}</dd>
      <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
    </div>
  )
}
