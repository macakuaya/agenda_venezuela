export interface EventItem {
  id: string
  /** Path to the event image (ideally 1200x630, 1.91:1). Relative to the site base. */
  image: string
  /** ISO date string, e.g. "2026-01-26T14:00:00". */
  startDate: string
  /** Optional ISO date string for multi-day events. */
  endDate?: string
  /** Event name / title. */
  name: string
  /** Venue or place name, e.g. "Teatro Teresa Carreño". */
  venue: string
  /** City, e.g. "Caracas". */
  city: string
  /** Optional external link for more info / tickets. */
  url?: string
}
