import type { EventItem } from '../types'
import { formatEventDate } from '../lib/date'
import InterestedButton from './InterestedButton'
import ShareButton from './ShareButton'

interface Props {
  event: EventItem
  onShared?: (message: string) => void
}

export default function EventCard({ event, onShared }: Props) {
  // Resolve image path against the Vite base so it works on GitHub Pages.
  const imgSrc = event.image.startsWith('http')
    ? event.image
    : `${import.meta.env.BASE_URL}${event.image.replace(/^\//, '')}`

  return (
    <article className="card">
      <div className="card__media">
        <img src={imgSrc} alt={event.name} loading="lazy" />
      </div>
      <div className="card__body">
        <p className="card__date">{formatEventDate(event.startDate, event.endDate)}</p>
        <h2 className="card__title">{event.name}</h2>
        <p className="card__address">
          {event.venue} · {event.city}
        </p>
        <div className="card__actions">
          <InterestedButton eventId={event.id} />
          <ShareButton event={event} onShared={onShared} />
        </div>
      </div>
    </article>
  )
}
