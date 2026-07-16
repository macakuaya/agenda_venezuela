import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import EventCard from '../components/EventCard'
import { useInterested } from '../hooks/useInterested'
import { parseDate, isPastEvent, isTodayEvent } from '../lib/date'
import { fetchEvents } from '../lib/events'
import {
  DEFAULT_COMMUNITY_CONTENT,
  fetchCommunityContent,
} from '../lib/content'
import eventsData from '../data/events.json'
import type { EventItem } from '../types'
import CityFilter from '../components/CityFilter'

type TabId = 'todos' | 'hoy' | 'guardados' | 'pasados'
const ALL_CITIES = 'todas'

// Bundled events used as a fallback if Supabase is unreachable/not configured.
const fallbackEvents = (eventsData as EventItem[]).slice()

function byDateAsc(a: EventItem, b: EventItem) {
  return parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
}

function cityName(city?: string) {
  return city?.split(',')[0]?.trim() ?? ''
}

const EMPTY: Record<TabId, string> = {
  todos: 'Todavía no hay eventos próximos. ¡Vuelve pronto!',
  hoy: 'No hay eventos para hoy.',
  guardados: 'Aún no has guardado eventos. Toca la estrella para guardarlos.',
  pasados: 'No hay eventos pasados.',
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('todos')
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES)
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents)
  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState(DEFAULT_COMMUNITY_CONTENT)
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

  useEffect(() => {
    let alive = true
    fetchCommunityContent().then((content) => {
      if (alive && content) setCommunity(content)
    })
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

  const cityOptions = useMemo(
    () =>
      Array.from(
        new Set(events.map((event) => cityName(event.city)).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })),
    [events],
  )

  useEffect(() => {
    if (selectedCity !== ALL_CITIES && !cityOptions.includes(selectedCity)) {
      setSelectedCity(ALL_CITIES)
    }
  }, [cityOptions, selectedCity])

  const filteredList =
    selectedCity === ALL_CITIES
      ? list
      : list.filter((event) => cityName(event.city) === selectedCity)

  const resultLabel = `${filteredList.length} ${
    filteredList.length === 1 ? 'evento' : 'eventos'
  }`

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

        {cityOptions.length > 0 && (
          <CityFilter
            cities={cityOptions}
            value={selectedCity}
            allValue={ALL_CITIES}
            resultLabel={resultLabel}
            onChange={setSelectedCity}
          />
        )}

        {loading && list.length === 0 ? (
          <p className="empty">Cargando eventos…</p>
        ) : list.length === 0 ? (
          <p className="empty">{EMPTY[activeTab]}</p>
        ) : filteredList.length === 0 ? (
          <p className="empty">
            No hay eventos en {selectedCity} para este filtro.
          </p>
        ) : (
          <div className="event-list">
            {filteredList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <aside className="community" aria-labelledby="community-title">
          <span className="community__mark" aria-hidden="true">🇻🇪</span>
          <div>
            <h2 id="community-title" className="community__title">Una red para acompañarnos</h2>
            <p className="community__text">
              {community.text}{' '}
              <a
                className="community__link"
                href={community.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {community.linkLabel}
              </a>.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}
