'use client'

import { useState } from 'react'
import { ArrowRight, Check, Lightbulb, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { careers, discoverTabs, getCareer, type FieldId } from '@/lib/career-data'
import { CareerDetail } from './career-detail'
import { CareerResults } from './career-results'
import { BackLink, IconBox, PageHeader, Stepper } from './shared'
import type { FlowProps } from './types'

const steps = ['Interests & Skills', 'Career Options', 'Detailed Analysis']
const allOptions = discoverTabs.flatMap((t) => t.options)

export function DiscoverView({ onHome, saved, onToggleSave }: FlowProps) {
  const [step, setStep] = useState(0)
  const [tab, setTab] = useState(discoverTabs[0].id)
  const [selected, setSelected] = useState<string[]>(['technology', 'problem-solving', 'creativity'])
  const [careerId, setCareerId] = useState<string | null>(null)

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const fieldWeights = new Map<FieldId, number>()
  selected.forEach((id) =>
    allOptions.find((o) => o.id === id)?.fields.forEach((f) => fieldWeights.set(f, (fieldWeights.get(f) ?? 0) + 1)),
  )
  const matches = careers
    .filter((c) => fieldWeights.has(c.field))
    .map((c) => ({ ...c, match: Math.min(99, c.match - 10 + (fieldWeights.get(c.field) ?? 0) * 6) }))

  const career = careerId ? getCareer(careerId) : undefined
  const activeTab = discoverTabs.find((t) => t.id === tab)!

  if (step === 2 && career) {
    return (
      <div>
        <Stepper steps={steps} current={2} onStepClick={setStep} />
        <CareerDetail
          key={career.id}
          career={career}
          backLabel="Back to Career Options"
          onBack={() => setStep(1)}
          saved={saved.includes(career.id)}
          onToggleSave={() => onToggleSave(career.id)}
          onExploreSimilar={() => setStep(1)}
        />
      </div>
    )
  }

  return (
    <div>
      <BackLink label={step === 0 ? 'Back to Dashboard' : 'Back to Interests & Skills'} onClick={step === 0 ? onHome : () => setStep(0)} />
      <PageHeader
        title={step === 0 ? 'Discover Myself' : 'Career Options'}
        subtitle={
          step === 0
            ? 'Find careers that match your interests, skills and personality. Tell us about yourself and we will suggest the best options.'
            : 'Explore careers that match your interests, skills and personality.'
        }
      />
      <Stepper steps={steps} current={step} onStepClick={setStep} />

      {step === 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6" aria-labelledby="select-heading">
          <div className="flex items-center gap-3">
            <IconBox icon={Sparkles} tone="blue" size="sm" />
            <h2 id="select-heading" className="text-lg font-semibold text-foreground">
              1. Select Your Interests & Skills
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Choose what interests you and what you are good at. You can select multiple options.</p>

          <div role="tablist" aria-label="Categories" className="mt-5 flex flex-wrap gap-2">
            {discoverTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-primary/10',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {activeTab.options.map((o) => {
              const isOn = selected.includes(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggle(o.id)}
                  className={cn(
                    'relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                    isOn ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'border-border hover:border-primary/40',
                  )}
                >
                  <IconBox icon={o.icon} tone={o.tone} size="sm" />
                  <span className="pr-4">
                    <span className="block text-sm font-semibold text-foreground">{o.name}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{o.description}</span>
                  </span>
                  {isOn && (
                    <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Find Career Matches
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-secondary/60 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb className="size-4 text-primary" aria-hidden="true" />
                Your Selections ({selected.length})
              </h3>
              {selected.length > 0 && (
                <button type="button" onClick={() => setSelected([])} className="text-xs font-medium text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>
            {selected.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nothing selected yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {selected.map((id) => {
                  const o = allOptions.find((x) => x.id === id)
                  if (!o) return null
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        {o.name}
                        <X className="size-3" aria-label={`Remove ${o.name}`} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {step === 1 && (
        <CareerResults
          items={matches}
          onSelect={(id) => {
            setCareerId(id)
            setStep(2)
          }}
          onUpdate={() => setStep(0)}
          updateLabel="Update Interests & Skills"
        />
      )}
    </div>
  )
}
