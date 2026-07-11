import { BRAND_NAME, SUBMIT_EVENT_URL } from '../config'

export default function Header() {
  const external = /^https?:/.test(SUBMIT_EVENT_URL)

  return (
    <header className="header">
      <div className="header__inner">
        <h1 className="header__title">{BRAND_NAME}</h1>
        <a
          className="btn btn--primary btn--sm"
          href={SUBMIT_EVENT_URL}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          Enviar evento
        </a>
      </div>
    </header>
  )
}
