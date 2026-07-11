import { LOCALE } from '../config'

const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' })
const dayMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Formats an event's date range in Spanish, e.g.:
 *  - Single day:  "Jue, 26 ene · 14:00"
 *  - Range:       "Jue, 26 ene – Vie, 27 ene"
 */
export function formatEventDate(startISO: string, endISO?: string): string {
  const start = new Date(startISO)
  const startLabel = `${cap(weekday.format(start))}, ${dayMonth.format(start)}`

  if (!endISO) {
    return `${startLabel} · ${time.format(start)}`
  }

  const end = new Date(endISO)
  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) {
    return `${startLabel} · ${time.format(start)}–${time.format(end)}`
  }

  const endLabel = `${cap(weekday.format(end))}, ${dayMonth.format(end)}`
  return `${startLabel} – ${endLabel}`
}
