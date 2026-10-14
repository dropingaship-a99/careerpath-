'use client'

import { useState } from 'react'
import { Bookmark, Compass } from 'lucide-react'
import { careers, getCareer } from '@/lib/career-data'
import { CareerDetail } from './career-detail'
import { AiCareerLab } from './ai-career-lab'
import { DiscoverView } from './discover-view'
import { EducationView } from './education-view'
import { ExploreView } from './explore-view'
import { HomeView } from './home-view'
import { CareerCard, PageHeader } from './shared'
import { Sidebar, type ViewId } from './sidebar'
import { Topbar } from './topbar'

const viewLabels: Record<ViewId, string> = {
  home: 'Dashboard',
  explore: 'Explore Careers',
  discover: 'Discover Myself',
  education: 'Explore by Education',
  ai: 'AI Career Lab',
  saved: 'Saved Careers',
  resources: 'Resources',
  settings: 'Settings',
}

export function AppShell() {
  const [view, setView] = useState<ViewId>('home')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saved, setSaved] = useState<string[]>(['data-scientist'])
  const [navKey, setNavKey] = useState(0)

  const navigate = (id: ViewId) => {
    setView(id)
    setDetailId(null)
    setSidebarOpen(false)
    setNavKey((k) => k + 1)
    window.scrollTo({ top: 0 })
  }

  const openCareer = (id: string) => {
    setDetailId(id)
    window.scrollTo({ top: 0 })
  }

  const toggleSave = (id: string) => setSaved((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const flowProps = { onHome: () => navigate('home'), saved, onToggleSave: toggleSave }
  const detail = detailId ? getCareer(detailId) : undefined

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        active={view}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        savedCount={saved.length}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} onSelectCareer={openCareer} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {detail ? (
            <CareerDetail
              key={detail.id}
              career={detail}
              backLabel={`Back to ${viewLabels[view]}`}
              onBack={() => setDetailId(null)}
              saved={saved.includes(detail.id)}
              onToggleSave={() => toggleSave(detail.id)}
              onExploreSimilar={() => navigate('explore')}
            />
          ) : (
            <div key={navKey}>
              {view === 'home' && <HomeView onNavigate={navigate} onSelectCareer={openCareer} />}
              {view === 'explore' && <ExploreView {...flowProps} />}
              {view === 'discover' && <DiscoverView {...flowProps} />}
              {view === 'education' && <EducationView {...flowProps} />}
              {view === 'ai' && <AiCareerLab onSelectCareer={openCareer} />}
              {view === 'saved' && <SavedView saved={saved} onSelect={openCareer} onExplore={() => navigate('explore')} />}
              {(view === 'resources' || view === 'settings') && (
                <PageHeader title={viewLabels[view]} subtitle="This section will be designed in the next iteration." />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SavedView({ saved, onSelect, onExplore }: { saved: string[]; onSelect: (id: string) => void; onExplore: () => void }) {
  const items = careers.filter((c) => saved.includes(c.id))
  return (
    <div>
      <PageHeader title="Saved Careers" subtitle="Careers you have bookmarked to revisit and compare later." />
      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <Bookmark className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">No saved careers yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap “Save Career” on any career to keep it here.</p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Compass className="size-4" aria-hidden="true" />
            Explore Careers
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <CareerCard key={c.id} career={c} showStats onSelect={() => onSelect(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
