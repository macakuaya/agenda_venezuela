import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import type { EventItem } from '../types'
import { formatEventDate } from '../lib/date'
import { useInterested } from '../hooks/useInterested'
import { ChevronDownIcon, HeartIcon, StarIcon } from './Icons'

interface Props {
  event: EventItem
}

interface DetailProps {
  label: string
  children: ReactNode
  wide?: boolean
}

function Detail({ label, children, wide = false }: DetailProps) {
  return (
    <div className={`card__detail${wide ? ' card__detail--wide' : ''}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function EventCard({ event }: Props) {
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const { isInterested, toggle } = useInterested()
  const active = isInterested(event.id)

  // Resolve image path against the Vite base so it works on GitHub Pages.
  const imgSrc = event.image.startsWith('http')
    ? event.image
    : `${import.meta.env.BASE_URL}${event.image.replace(/^\//, '')}`

  // Location: "<ciudad> · <lugar>" on one line, street address below (if any).
  const location = [event.city, event.venue].filter(Boolean).join(' · ')
  const phoneHref = event.contactPhone
    ? `tel:${event.contactPhone.replace(/[^\d+]/g, '')}`
    : undefined

  // Keep the most useful label when two event fields point to the same URL.
  const externalLinks = [
    event.ticketUrl && { label: 'Entradas', url: event.ticketUrl },
    event.whatsappUrl && { label: 'WhatsApp', url: event.whatsappUrl },
    event.instagramUrl && { label: 'Instagram', url: event.instagramUrl },
    event.website && { label: 'Sitio web', url: event.website },
    event.url && { label: 'Más información', url: event.url },
  ].filter((link): link is { label: string; url: string } => Boolean(link))
    .filter((link, index, links) => links.findIndex((item) => item.url === link.url) === index)

  return (
    <article className={`card${expanded ? ' card--expanded' : ''}`}>
      <button
        type="button"
        className="card__summary"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="card__media">
          <img src={imgSrc} alt="" loading="lazy" />
        </div>
        <div className="card__body">
          <p className="card__date">
            {formatEventDate(event.startDate, event.endDate, event.allDay)}
          </p>
          <h2 className="card__title">{event.name}</h2>
          {location && <p className="card__loc">{location}</p>}
          {event.address && <p className="card__loc">{event.address}</p>}
          {event.beneficiary && (
            <p className="card__beneficiary">
              <HeartIcon className="card__beneficiary-icon" />
              Para: {event.beneficiary}
            </p>
          )}
          <span className="card__disclosure" aria-hidden="true">
            {expanded ? 'Menos detalles' : 'Más detalles'}
            <ChevronDownIcon className="card__chevron" />
          </span>
        </div>
      </button>

      <button
        type="button"
        className="card__star"
        aria-pressed={active}
        aria-label={active ? 'Quitar de guardados' : 'Guardar evento'}
        title={active ? 'Guardado' : 'Guardar'}
        onClick={() => toggle(event.id)}
      >
        <StarIcon className="star" filled={active} />
      </button>

      {expanded && (
        <div
          id={detailsId}
          className="card__details"
          role="region"
          aria-label={`Detalles de ${event.name}`}
        >
          <dl className="card__detail-list">
            {event.organizer && <Detail label="Organiza">{event.organizer}</Detail>}
            {event.beneficiary && <Detail label="A beneficio de">{event.beneficiary}</Detail>}
            {event.needs && <Detail label="Qué necesita" wide>{event.needs}</Detail>}
            {event.hours && <Detail label="Horario" wide>{event.hours}</Detail>}
            {event.contactPhone && (
              <Detail label="Contacto">
                <a href={phoneHref}>{event.contactPhone}</a>
              </Detail>
            )}
            {event.lineup && event.lineup.length > 0 && (
              <Detail label="Artistas" wide>
                <ul className="card__lineup">
                  {event.lineup.map((artist) => <li key={artist}>{artist}</li>)}
                </ul>
              </Detail>
            )}
            {event.note && <Detail label="Información adicional" wide>{event.note}</Detail>}
          </dl>

          {externalLinks.length > 0 && (
            <div className="card__actions" aria-label="Enlaces del evento">
              {externalLinks.map((link, index) => (
                <a
                  key={link.url}
                  className={`card__action${index === 0 ? ' card__action--primary' : ''}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
