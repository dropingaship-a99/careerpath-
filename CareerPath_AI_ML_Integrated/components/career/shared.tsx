'use client'

import { ArrowLeft, Check, ChevronRight, Clock, IndianRupee, TrendingUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Career, type Tone, toneStyles } from '@/lib/career-data'

export function IconBox({
  icon: Icon,
  tone,
  size = 'md',
}: {
  icon: LucideIcon
  tone: Tone
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl',
        toneStyles[tone].icon,
        size === 'sm' && 'size-9',
        size === 'md' && 'size-12',
        size === 'lg' && 'size-16 rounded-2xl',
      )}
    >
      <Icon className={cn(size === 'sm' ? 'size-4' : size === 'md' ? 'size-6' : 'size-8')} aria-hidden="true" />
    </span>
  )
}

export function Tag({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', toneStyles[tone].badge)}>
      {children}
    </span>
  )
}

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {label}
    </button>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-4">
      <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>
    </div>
  )
}

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: string[]
  current: number
  onStepClick?: (index: number) => void
}) {
  return (
    <ol className="my-8 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              disabled={!done || !onStepClick}
              onClick={() => onStepClick?.(i)}
              aria-current={active ? 'step' : undefined}
              className="flex shrink-0 items-center gap-2 disabled:cursor-default"
            >
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  active && 'border-primary bg-primary text-primary-foreground',
                  done && 'border-primary/30 bg-primary/10 text-primary',
                  !active && !done && 'border-border bg-card text-muted-foreground',
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-sm',
                  active ? 'font-semibold text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && <span className="h-px min-w-6 flex-1 bg-border" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

export function CareerCard({
  career,
  onSelect,
  showStats = false,
  showMatch = false,
}: {
  career: Career
  onSelect: () => void
  showStats?: boolean
  showMatch?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-4">
        <IconBox icon={career.icon} tone={career.tone} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">{career.name}</h3>
            {showStats && (
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            )}
          </div>
          {showMatch && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <TrendingUp className="size-3" aria-hidden="true" />
              {career.match}% match
            </span>
          )}
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{career.description}</p>
          <div className="mt-3">
            <Tag tone={career.tone}>{career.category}</Tag>
          </div>
        </div>
      </div>
      {showStats && (
        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
          <Stat icon={IndianRupee} label="Avg. Salary" value={career.salary.replace('₹', '')} />
          <Stat icon={TrendingUp} label="Demand" value={career.demand} />
          <Stat icon={Clock} label="Work Hours" value={career.hours.replace(' hrs/week', 'h/wk')} />
        </dl>
      )}
    </button>
  )
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="flex items-center gap-1 text-muted-foreground">
        <Icon className="size-3 shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="font-semibold leading-snug text-foreground">{value}</dd>
    </div>
  )
}
