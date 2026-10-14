'use client'

import { useState } from 'react'
import { Lightbulb, Pencil, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Career } from '@/lib/career-data'
import { CareerCard, IconBox } from './shared'

type Sort = 'match' | 'salary' | 'name'

const salaryOptions = [
  { value: 0, label: 'Any' },
  { value: 15, label: 'Up to 15+ LPA' },
  { value: 20, label: 'Up to 20+ LPA' },
  { value: 25, label: 'Up to 25+ LPA' },
]

export function CareerResults({
  items,
  onSelect,
  onUpdate,
  updateLabel,
}: {
  items: Career[]
  onSelect: (id: string) => void
  onUpdate: () => void
  updateLabel: string
}) {
  const categories = Array.from(new Set(items.map((c) => c.category)))
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [minMatch, setMinMatch] = useState(0)
  const [minSalary, setMinSalary] = useState(0)
  const [sort, setSort] = useState<Sort>('match')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = items
    .filter((c) => selectedCats.length === 0 || selectedCats.includes(c.category))
    .filter((c) => c.match >= minMatch && c.salaryMax >= minSalary)
    .sort((a, b) =>
      sort === 'match' ? b.match - a.match : sort === 'salary' ? b.salaryMax - a.salaryMax : a.name.localeCompare(b.name),
    )

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Careers for You</h2>
            <p className="mt-1 text-sm text-muted-foreground">Career options that match your selections.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {items.length}
            </span>
            <label className="sr-only" htmlFor="sort">
              Sort careers
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <option value="match">Sort by: Match Score</option>
              <option value="salary">Sort by: Salary</option>
              <option value="name">Sort by: Name</option>
            </select>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm xl:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No careers match these filters. Try widening them.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((c) => (
              <CareerCard key={c.id} career={c} showMatch showStats onSelect={() => onSelect(c.id)} />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
          <IconBox icon={Lightbulb} tone="amber" size="sm" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Not sure yet?</p>
            <p className="text-xs text-muted-foreground">Refine your selections to get even better matches.</p>
          </div>
          <button
            type="button"
            onClick={onUpdate}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-primary hover:border-primary/40"
          >
            <Pencil className="size-4" aria-hidden="true" />
            {updateLabel}
          </button>
        </div>
      </div>

      <aside
        aria-label="Filter careers"
        className={cn(
          'h-fit shrink-0 rounded-2xl border border-border bg-card p-5 xl:sticky xl:top-24 xl:block xl:w-64',
          filtersOpen ? 'block' : 'hidden',
        )}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filter Careers
          </h2>
          <button
            type="button"
            onClick={() => {
              setSelectedCats([])
              setMinMatch(0)
              setMinSalary(0)
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Reset
          </button>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-foreground">Career Category</legend>
          <div className="mt-2 flex flex-col gap-2">
            {categories.map((cat) => (
              <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleCat(cat)}
                  className="size-4 rounded accent-primary"
                />
                {cat}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 border-t border-border pt-4">
          <label htmlFor="match" className="flex justify-between text-sm font-medium text-foreground">
            Min. Match Score <span className="text-primary">{minMatch}%</span>
          </label>
          <input
            id="match"
            type="range"
            min={0}
            max={100}
            step={5}
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <label htmlFor="salary" className="text-sm font-medium text-foreground">
            Salary Range (LPA)
          </label>
          <select
            id="salary"
            value={minSalary}
            onChange={(e) => setMinSalary(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {salaryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </aside>
    </div>
  )
}
