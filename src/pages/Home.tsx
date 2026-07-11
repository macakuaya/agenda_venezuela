import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import EventCard from '../components/EventCard'
import eventsData from '../data/events.json'
import type { EventItem } from '../types'

// Visual-only tabs for now (see plan). "Todos" is the active default.
const TABS = ['Todos', 'Esta semana', 'Este mes', 'Online'] as const

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0])
  const [toast, setToast] = useState<string | null>(null)

  const events = useMemo(() => {
    return [...(eventsData as EventItem[])].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
  }, [])

  const showToast = (message: string) => setToast(message)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="app">
      <Header />
      <main className="container">
        <nav className="tabs" aria-label="Filtros">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab${tab === activeTab ? ' tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {events.length === 0 ? (
          <p className="empty">Todavía no hay eventos. ¡Vuelve pronto!</p>
        ) : (
          <div className="event-list">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onShared={showToast} />
            ))}
          </div>
        )}

        <footer className="footer">
          <Link to="/design-system" className="footer__link">
            Design system
          </Link>
        </footer>
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
