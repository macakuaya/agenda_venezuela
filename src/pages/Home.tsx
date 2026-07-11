import { useMemo, useState } from 'react'
import Header from '../components/Header'
import EventCard from '../components/EventCard'
import { useInterested } from '../hooks/useInterested'
import { parseDate, isPastEvent } from '../lib/date'
import eventsData from '../data/events.json'
import type { EventItem } from '../types'

type TabId = 'todos' | 'guardados' | 'pasados'

const events = (eventsData as EventItem[]).slice()

function byDateAsc(a: EventItem, b: EventItem) {
  return parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
}

const EMPTY: Record<TabId, string> = {
  todos: 'Todavía no hay eventos próximos. ¡Vuelve pronto!',
  guardados: 'Aún no has guardado eventos. Toca la estrella para guardarlos.',
  pasados: 'No hay eventos pasados.',
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('todos')
  const { isInterested } = useInterested()

  const upcoming = useMemo(
    () => events.filter((e) => !isPastEvent(e.startDate, e.endDate)).sort(byDateAsc),
    [],
  )
  const past = useMemo(
    () => events.filter((e) => isPastEvent(e.startDate, e.endDate)).sort(byDateAsc).reverse(),
    [],
  )
  const saved = useMemo(
    () => events.filter((e) => isInterested(e.id)).sort(byDateAsc),
    [isInterested],
  )

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'guardados', label: 'Guardados', count: saved.length },
    { id: 'pasados', label: 'Pasados' },
  ]

  const list =
    activeTab === 'guardados' ? saved : activeTab === 'pasados' ? past : upcoming

  return (
    <div className="app">
      <Header />
      <main className="container">
        <nav className="tabs" aria-label="Filtros">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab${tab.id === activeTab ? ' tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count ? ` (${tab.count})` : ''}
            </button>
          ))}
        </nav>

        {list.length === 0 ? (
          <p className="empty">{EMPTY[activeTab]}</p>
        ) : (
          <div className="event-list">
            {list.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
