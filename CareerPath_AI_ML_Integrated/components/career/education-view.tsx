'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, Check, CircleCheck, GraduationCap, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  careers,
  classes,
  coreSubjects,
  electiveSubjects,
  getCareer,
  subjectCombos,
  toneStyles,
  type FieldId,
  type Subject,
} from '@/lib/career-data'
import { CareerDetail } from './career-detail'
import { CareerResults } from './career-results'
import { BackLink, IconBox, PageHeader, Stepper } from './shared'
import type { FlowProps } from './types'

const steps = ['Class & Subjects', 'Career Options', 'Detailed Analysis']
const allSubjects = [...coreSubjects, ...electiveSubjects]

export function EducationView({ onHome, saved, onToggleSave }: FlowProps) {
  const [step, setStep] = useState(0)
  const [classId, setClassId] = useState('11')
  const [subjects, setSubjects] = useState<string[]>(['english', 'math', 'physics', 'chemistry'])
  const [careerId, setCareerId] = useState<string | null>(null)

  const toggle = (id: string) => setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const fieldWeights = new Map<FieldId, number>()
  subjects.forEach((id) =>
    allSubjects.find((s) => s.id === id)?.fields.forEach((f) => fieldWeights.set(f, (fieldWeights.get(f) ?? 0) + 1)),
  )
  const matches = careers
    .filter((c) => fieldWeights.has(c.field))
    .map((c) => ({ ...c, match: Math.min(99, c.match - 12 + (fieldWeights.get(c.field) ?? 0) * 5) }))

  const career = careerId ? getCareer(careerId) : undefined

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
      <BackLink label={step === 0 ? 'Back to Dashboard' : 'Back to Subjects'} onClick={step === 0 ? onHome : () => setStep(0)} />
      <PageHeader
        title={step === 0 ? 'Explore by Education' : 'Career Options'}
        subtitle={
          step === 0
            ? 'Choose your current class and subjects to see relevant career options, future study paths and guidance.'
            : `Careers that fit Class ${classId} with your selected subjects.`
        }
      />
      <Stepper steps={steps} current={step} onStepClick={setStep} />

      {step === 1 && (
        <CareerResults
          items={matches}
          onSelect={(id) => {
            setCareerId(id)
            setStep(2)
          }}
          onUpdate={() => setStep(0)}
          updateLabel="Update Subjects"
        />
      )}

      {step === 0 && (
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <section aria-labelledby="class-heading">
              <h2 id="class-heading" className="text-xl font-bold text-foreground">
                Select Your Current Class
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the class you are currently in.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {classes.map((c) => {
                  const isOn = classId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => setClassId(c.id)}
                      className={cn(
                        'relative flex flex-col gap-3 rounded-2xl border bg-card p-4 text-left transition-all',
                        isOn ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/40',
                      )}
                    >
                      <IconBox icon={c.id === '12' ? GraduationCap : BookOpen} tone={isOn ? 'blue' : 'indigo'} size="sm" />
                      <span>
                        <span className="block font-semibold text-foreground">{c.name}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{c.description}</span>
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
            </section>

            <section aria-labelledby="subjects-heading">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 id="subjects-heading" className="text-xl font-bold text-foreground">
                    Select Your Subjects
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose subjects you study or plan to take.</p>
                </div>
                <button type="button" onClick={() => setSubjects([])} className="text-sm font-medium text-primary hover:underline">
                  Clear All
                </button>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <SubjectGroup title="Core Subjects" note="Subjects you are currently taking." items={coreSubjects} selected={subjects} onToggle={toggle} />
                <SubjectGroup title="Optional / Elective" note="Additional subjects you are considering." items={electiveSubjects} selected={subjects} onToggle={toggle} />
              </div>
            </section>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
              <Lightbulb className="size-6 shrink-0 text-amber-500" aria-hidden="true" />
              <p className="flex-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> Your subject combination opens doors to different career paths.
              </p>
              <button
                type="button"
                disabled={subjects.length === 0}
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Find Career Options
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className="flex shrink-0 flex-col gap-4 xl:w-80">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground">Why Your Subjects Matter</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {['Determine your eligible career paths', 'Help choose the right higher education', 'Build skills for future opportunities'].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground">Popular Subject Combinations</h2>
              <ul className="mt-3 flex flex-col divide-y divide-border">
                {subjectCombos.map((c) => (
                  <li key={c.name} className="flex gap-3 py-3">
                    <span
                      className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold', toneStyles[c.tone].icon)}
                      aria-hidden="true"
                    >
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.subjects}</p>
                      <p className="mt-0.5 text-xs text-primary">{c.paths}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}

function SubjectGroup({
  title,
  note,
  items,
  selected,
  onToggle,
}: {
  title: string
  note: string
  items: Subject[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-4">
      <legend className="sr-only">{title}</legend>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((s) => {
          const isOn = selected.includes(s.id)
          return (
            <label
              key={s.id}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                isOn ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:border-primary/30',
              )}
            >
              {s.name}
              <input type="checkbox" checked={isOn} onChange={() => onToggle(s.id)} className="size-4 accent-primary" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
