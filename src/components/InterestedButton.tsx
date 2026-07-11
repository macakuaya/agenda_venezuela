import { useInterested } from '../hooks/useInterested'
import { StarIcon } from './Icons'

interface Props {
  eventId: string
}

export default function InterestedButton({ eventId }: Props) {
  const { isInterested, toggle } = useInterested()
  const active = isInterested(eventId)

  return (
    <button
      type="button"
      className={`btn btn--primary${active ? ' btn--interested' : ''}`}
      aria-pressed={active}
      onClick={() => toggle(eventId)}
    >
      <StarIcon className="star" filled={active} />
      {active ? 'Te interesa' : 'Me interesa'}
    </button>
  )
}
