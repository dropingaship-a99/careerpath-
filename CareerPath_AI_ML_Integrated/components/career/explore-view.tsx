'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { careers, fields, getCareer, toneStyles, type Field } from '@/lib/career-data'
import { CareerDetail } from './career-detail'
import { BackLink, CareerCard, IconBox, PageHeader, Stepper } from './shared'
import type { FlowProps } from './types'

const steps = ['Choose Field', 'Select Role', 'Future Prospects']

export function ExploreView({ onHome, saved, onToggleSave }: FlowProps) {
  const [step, setStep] = useState(0)
  const [fieldId, setFieldId] = useState<Field['id']>('technology')
  const [roleId, setRoleId] = useState<string | null>(null)

  const field = fields.find((f) => f.id === fieldId)!
  const roles = careers.filter((c) => c.field === fieldId)
  const role = roleId ? getCareer(roleId) : undefined

  if (step === 2 && role) {
    return (
      <div>
        <Stepper steps={steps} current={2} onStepClick={setStep} />
        <CareerDetail
          key={role.id}
          career={role}
          backLabel={`Back to ${field.name} Roles`}
          onBack={() => setStep(1)}
          saved={saved.includes(role.id)}
          onToggleSave={() => onToggleSave(role.id)}
          onExploreSimilar={() => setStep(1)}
          initialTab="Overview"
        />
      </div>
    )
  }

  return (
    <div>
      <BackLink label={step === 0 ? 'Back to Dashboard' : 'Back to Fields'} onClick={step === 0 ? onHome : () => setStep(0)} />
      <PageHeader
        title={step === 0 ? 'Explore Careers Directly' : `${field.name} Roles`}
        subtitle={
          step === 0
            ? 'Pick a field you are curious about, choose a role and see its future prospects, top companies and salary in LPA.'
            : `Popular roles in ${field.name}. Select one to see companies, salary and future prospects.`
        }
      />
      <Stepper steps={steps} current={step} onStepClick={setStep} />

      {step === 0 && (
        <section aria-labelledby="field-heading" className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h2 id="field-heading" className="text-lg font-semibold text-foreground">
            1. Choose a Field
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Select the field you want to explore.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {fields.map((f) => {
              const count = careers.filter((c) => c.field === f.id).length
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFieldId(f.id)
                    setStep(1)
                  }}
                  className={cn(
                    'group flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
                    fieldId === f.id ? 'border-primary ring-2 ring-primary/15' : 'border-border',
                  )}
                >
                  <IconBox icon={f.icon} tone={f.tone} />
                  <span>
                    <span className="block font-semibold text-foreground">{f.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{f.description}</span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {count} roles
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-label={`${field.name} roles`}>
          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Switch field">
            {fields.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={f.id === fieldId}
                onClick={() => setFieldId(f.id)}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  f.id === fieldId ? 'bg-primary text-primary-foreground' : cn('hover:opacity-80', toneStyles[f.tone].badge),
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((c) => (
              <CareerCard
                key={c.id}
                career={c}
                showStats
                onSelect={() => {
                  setRoleId(c.id)
                  setStep(2)
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
