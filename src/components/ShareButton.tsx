import { ShareIcon } from './Icons'
import type { EventItem } from '../types'

interface Props {
  event: EventItem
  onShared?: (message: string) => void
}

/** Builds a deep link to a specific event (used for sharing). */
function eventUrl(event: EventItem): string {
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#/?evento=${encodeURIComponent(event.id)}`
}

export default function ShareButton({ event, onShared }: Props) {
  const handleShare = async () => {
    const url = event.url || eventUrl(event)
    const shareData = {
      title: event.name,
      text: `${event.name} · ${event.venue}, ${event.city}`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled or share failed; fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      onShared?.('Enlace copiado')
    } catch {
      onShared?.('No se pudo compartir')
    }
  }

  return (
    <button
      type="button"
      className="btn btn--ghost btn--icon-only"
      aria-label={`Compartir ${event.name}`}
      title="Compartir"
      onClick={handleShare}
    >
      <ShareIcon className="star" />
    </button>
  )
}
