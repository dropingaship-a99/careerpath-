'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, BookOpen, BrainCircuit, Check, CircleHelp, Compass, GraduationCap, LoaderCircle, MessageCircle, Send, Sparkles, Target, WandSparkles } from 'lucide-react'
import { careers, type Career, type FieldId } from '@/lib/career-data'
import { CareerCard, PageHeader, Tag } from './shared'

type FieldOption = { id: FieldId; label: string; description: string }
const fieldOptions: FieldOption[] = [
  { id: 'technology', label: 'Technology', description: 'Software, AI, cybersecurity, data' },
  { id: 'science', label: 'Science', description: 'Research, maths, engineering, environment' },
  { id: 'healthcare', label: 'Healthcare', description: 'Medicine, wellbeing, life sciences' },
  { id: 'business', label: 'Business', description: 'Finance, management, marketing' },
  { id: 'law', label: 'Law & society', description: 'Law, policy, public service' },
  { id: 'other', label: 'Creative & other', description: 'Design, communication, varied paths' },
]
const skillOptions = ['Problem solving', 'Coding', 'Maths & data', 'Writing', 'Creativity & design', 'Helping people', 'Research', 'Leadership', 'Communication', 'Organising']
const subjectOptions = ['Mathematics', 'Computer Science', 'Physics', 'Biology', 'Chemistry', 'Economics', 'Business Studies', 'Psychology', 'English', 'Art & Design']

function words(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9+#]+/).filter((word) => word.length > 2))
}

function scoreCareer(career: Career, fields: FieldId[], skills: string[], subjects: string[], goal: string) {
  // Content-based TF-IDF + cosine similarity over the project's existing career catalogue.
  // This is a lightweight recommendation model, not a supervised model trained on people.
  const documents = careers.map((item) => `${item.name} ${item.description} ${item.category} ${item.overview} ${item.skills.join(' ')} ${item.field}`)
  const query = [
    ...fields.map((id) => fieldOptions.find((field) => field.id === id)?.label ?? id),
    ...skills,
    ...subjects,
    goal,
  ].join(' ')
  const tokenise = (value: string) => value.toLowerCase().split(/[^a-z0-9+#]+/).filter((word) => word.length > 2)
  const allDocuments = documents.map(tokenise)
  const queryTokens = tokenise(query)
  const careerWords = new Set(tokenise(documents[careers.findIndex((item) => item.id === career.id)] ?? ''))
  if (!queryTokens.length) return { score: 0, reasons: ['Choose an interest area, a skill, or a subject to personalise this result.'] }

  const documentFrequency = new Map<string, number>()
  for (const tokens of allDocuments) {
    for (const token of new Set(tokens)) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
  }
  const idf = (token: string) => Math.log((careers.length + 1) / ((documentFrequency.get(token) ?? 0) + 1)) + 1
  const vectorise = (tokens: string[]) => {
    const counts = new Map<string, number>()
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
    const vector = new Map<string, number>()
    for (const [token, count] of counts) vector.set(token, (1 + Math.log(count)) * idf(token))
    return vector
  }
  const queryVector = vectorise(queryTokens)
  const careerVector = vectorise(allDocuments[careers.findIndex((item) => item.id === career.id)] ?? [])
  let dot = 0
  let queryNorm = 0
  let careerNorm = 0
  for (const value of queryVector.values()) queryNorm += value * value
  for (const value of careerVector.values()) careerNorm += value * value
  for (const [token, value] of queryVector) dot += value * (careerVector.get(token) ?? 0)
  const cosine = queryNorm && careerNorm ? dot / (Math.sqrt(queryNorm) * Math.sqrt(careerNorm)) : 0
  const fieldMatch = fields.length ? (fields.includes(career.field) ? 1 : 0) : 0
  const relevance = fields.length ? (cosine * 0.65 + fieldMatch * 0.35) : cosine
  const score = Math.round(20 + Math.min(1, relevance) * 75)
  const matchingSkills = skills.filter((skill) => tokenise(skill).some((word) => careerWords.has(word)))
  const matchingSubjects = subjects.filter((subject) => tokenise(subject).some((word) => careerWords.has(word)))
  const reasons = [
    fields.includes(career.field) ? `Matches your ${fieldOptions.find((field) => field.id === career.field)?.label ?? career.field} interest` : '',
    matchingSkills.length ? `Connects with ${matchingSkills.join(', ').toLowerCase()}` : '',
    matchingSubjects.length ? `Relevant to ${matchingSubjects.join(', ')}` : '',
    !fields.includes(career.field) && !matchingSkills.length && !matchingSubjects.length && cosine > 0 ? 'Shares relevant terms with your interests and goals' : '',
  ].filter(Boolean)
  return { score, reasons: reasons.length ? reasons : ['Worth exploring alongside your current interests.'] }
}

export function AiCareerLab({ onSelectCareer }: { onSelectCareer: (id: string) => void }) {
  const [fields, setFields] = useState<FieldId[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [goal, setGoal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')

  const recommendations = useMemo(() => careers
    .map((career) => ({ career, ...scoreCareer(career, fields, skills, subjects, goal) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4), [fields, skills, subjects, goal])

  const toggle = <T extends string>(value: T, current: T[], setter: (next: T[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    setSubmitted(false)
  }

  async function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = question.trim()
    if (!content || sending) return
    const nextMessages = [...messages, { role: 'user' as const, content }]
    setMessages(nextMessages)
    setQuestion('')
    setSending(true)
    setChatError('')
    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-8),
          profile: { interests: fields.map((id) => fieldOptions.find((item) => item.id === id)?.label ?? id), skills, subjects, goal },
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'The AI advisor could not answer right now.')
      setMessages((current) => [...current, { role: 'assistant', content: String(data.answer || 'Try asking a more specific question.') }])
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="AI Career Lab" subtitle="Explore career directions with a transparent, interest-based matcher and an optional AI advisor. Your choices are used to personalise suggestions, not to predict your future." />

      <section className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-violet-500/10 p-5 md:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><BrainCircuit className="size-6" /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-foreground">Find directions that fit you</h2><Tag tone="violet">ML-style matching</Tag></div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">Choose what interests you. CareerPath scores the existing career catalogue against your selections and shows which factors influenced each result.</p>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          <fieldset>
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Compass className="size-4 text-primary" /> 1. Which areas would you like to explore?</legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {fieldOptions.map((field) => {
                const active = fields.includes(field.id)
                return <button type="button" key={field.id} aria-pressed={active} onClick={() => toggle(field.id, fields, setFields)} className={`rounded-2xl border p-4 text-left transition-colors ${active ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40'}`}>
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">{field.label}<span className={`flex size-5 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{active && <Check className="size-3" />}</span></span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{field.description}</span>
                </button>
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Target className="size-4 text-primary" /> 2. Skills you enjoy or want to build</legend>
            <div className="flex flex-wrap gap-2">{skillOptions.map((skill) => { const active = skills.includes(skill); return <button type="button" key={skill} aria-pressed={active} onClick={() => toggle(skill, skills, setSkills)} className={`rounded-full border px-3 py-2 text-sm transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary/40'}`}>{skill}</button> })}</div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><GraduationCap className="size-4 text-primary" /> 3. Subjects you like</legend>
            <div className="flex flex-wrap gap-2">{subjectOptions.map((subject) => { const active = subjects.includes(subject); return <button type="button" key={subject} aria-pressed={active} onClick={() => toggle(subject, subjects, setSubjects)} className={`rounded-full border px-3 py-2 text-sm transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary/40'}`}>{subject}</button> })}</div>
          </fieldset>

          <div>
            <label htmlFor="career-goal" className="mb-2 block text-sm font-semibold text-foreground">4. Anything else you want from a career? <span className="font-normal text-muted-foreground">(optional)</span></label>
            <textarea id="career-goal" value={goal} onChange={(event) => { setGoal(event.target.value.slice(0, 500)); setSubmitted(false) }} rows={3} maxLength={500} placeholder="For example: I enjoy solving problems, want to build useful apps, and prefer a mix of teamwork and independent work." className="w-full resize-y rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <div className="mt-1 text-right text-xs text-muted-foreground">{goal.length}/500</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setSubmitted(true)} disabled={!fields.length && !skills.length && !subjects.length && !goal.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="size-4" /> Find my matches <ArrowRight className="size-4" /></button>
            <button type="button" onClick={() => { setFields([]); setSkills([]); setSubjects([]); setGoal(''); setSubmitted(false) }} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary">Reset answers</button>
          </div>
        </div>
      </section>

      {submitted && <section aria-live="polite" className="space-y-4">
        <div><h2 className="text-xl font-bold text-foreground">Your career directions</h2><p className="mt-1 text-sm text-muted-foreground">Rankings are based on catalogue overlap with the preferences you selected, not on a validated psychological or employment prediction.</p></div>
        {recommendations.length ? <div className="grid gap-4 md:grid-cols-2">{recommendations.map(({ career, score, reasons }) => <div key={career.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"><Sparkles className="size-3.5" />{score}% relevance</span><span className="text-xs text-muted-foreground">Heuristic score</span></div>
          <CareerCard career={career} onSelect={() => onSelectCareer(career.id)} />
          <div className="mt-3 rounded-xl bg-secondary/60 p-3"><p className="text-xs font-semibold text-foreground">Why it appeared</p><ul className="mt-1 space-y-1">{reasons.map((reason) => <li key={reason} className="flex gap-2 text-xs leading-relaxed text-muted-foreground"><Check className="mt-0.5 size-3 shrink-0 text-primary" />{reason}</li>)}</ul></div>
          <button type="button" onClick={() => onSelectCareer(career.id)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Explore this career <ArrowRight className="size-4" /></button>
        </div>)}</div> : <div className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">Choose at least one interest, skill, or subject to get personalised suggestions.</div>}
      </section>}

      <section className="rounded-3xl border border-border bg-card p-5 md:p-7">
        <div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600"><WandSparkles className="size-5" /></span><div><h2 className="text-xl font-bold text-foreground">Ask the AI Career Advisor</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Ask about course choices, skills, portfolios, or how to explore a career. This uses a server-side AI API when configured.</p></div></div>
        <div className="mt-5 space-y-3" aria-live="polite">
          {messages.length === 0 && <div className="rounded-2xl bg-secondary/60 p-4"><p className="flex items-center gap-2 text-sm font-medium text-foreground"><MessageCircle className="size-4 text-primary" /> Try asking</p><p className="mt-2 text-sm text-muted-foreground">“How can I explore data science while I’m still in school?”</p></div>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-2xl p-4 text-sm leading-relaxed ${message.role === 'user' ? 'ml-6 bg-primary text-primary-foreground' : 'mr-4 border border-border bg-secondary/50 text-foreground'}`}><p className="mb-1 text-xs font-semibold opacity-75">{message.role === 'user' ? 'You' : 'CareerPath AI'}</p><p className="whitespace-pre-wrap">{message.content}</p></div>)}
          {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Thinking…</div>}
          {chatError && <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-foreground"><p className="font-semibold">AI advisor unavailable</p><p className="mt-1">{chatError}</p><p className="mt-1 text-muted-foreground">Career matching above works locally. To enable chat, set <code>OPENAI_API_KEY</code> in your server environment.</p></div>}
        </div>
        <form onSubmit={sendQuestion} className="mt-4 flex items-end gap-2">
          <label htmlFor="ai-question" className="sr-only">Ask the AI career advisor</label>
          <textarea id="ai-question" value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 1000))} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} rows={2} maxLength={1000} placeholder="Ask a career question… (Enter to send)" className="min-h-12 flex-1 resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15" />
          <button type="submit" disabled={!question.trim() || sending} aria-label="Send question" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{sending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}</button>
        </form>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><CircleHelp className="mt-0.5 size-3.5 shrink-0" /> AI answers can be wrong. Use them as a starting point and verify course eligibility, admissions, and career requirements with official sources or a qualified counsellor.</p>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-4"><BookOpen className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">How this works:</strong> career matching is a transparent, rule-based similarity model over the careers already in this project. It is not trained on personal data and does not make admissions, salary, or success predictions. The conversational AI is optional and requires a server-side API key.</p></div>
    </div>
  )
}
