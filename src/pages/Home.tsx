import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import EventCard from '../components/EventCard'
import { useInterested } from '../hooks/useInterested'
import { parseDate, isPastEvent, isTodayEvent } from '../lib/date'
import { fetchEvents } from '../lib/events'
import eventsData from '../data/events.json'
import type { EventItem } from '../types'

type TabId = 'todos' | 'hoy' | 'guardados' | 'pasados'

// Bundled events used as a fallback if Supabase is unreachable/not configured.
const fallbackEvents = (eventsData as EventItem[]).slice()

function byDateAsc(a: EventItem, b: EventItem) {
  return parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
}

const EMPTY: Record<TabId, string> = {
  todos: 'Todavía no hay eventos próximos. ¡Vuelve pronto!',
  hoy: 'No hay eventos para hoy.',
  guardados: 'Aún no has guardado eventos. Toca la estrella para guardarlos.',
  pasados: 'No hay eventos pasados.',
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('todos')
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents)
  const [loading, setLoading] = useState(true)
  const { isInterested } = useInterested()

  useEffect(() => {
    let alive = true
    fetchEvents()
      .then((rows) => {
        if (!alive) return
        // Use Supabase data when available; otherwise keep the fallback.
        if (rows && rows.length) setEvents(rows)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const upcoming = useMemo(
    () => events.filter((e) => !isPastEvent(e.startDate, e.endDate)).sort(byDateAsc),
    [events],
  )
  const past = useMemo(
    () => events.filter((e) => isPastEvent(e.startDate, e.endDate)).sort(byDateAsc).reverse(),
    [events],
  )
  const today = useMemo(
    () => events.filter((e) => isTodayEvent(e.startDate, e.endDate)).sort(byDateAsc),
    [events],
  )
  const saved = useMemo(
    () => events.filter((e) => isInterested(e.id)).sort(byDateAsc),
    [events, isInterested],
  )

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoy', label: 'Hoy', count: today.length },
    { id: 'guardados', label: 'Guardados', count: saved.length },
    { id: 'pasados', label: 'Pasados' },
  ]

  const list =
    activeTab === 'hoy'
      ? today
      : activeTab === 'guardados'
        ? saved
        : activeTab === 'pasados'
          ? past
          : upcoming

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

        {loading && list.length === 0 ? (
          <p className="empty">Cargando eventos…</p>
        ) : list.length === 0 ? (
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
