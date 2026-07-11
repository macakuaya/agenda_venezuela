import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useTokens } from '../hooks/useTokens'
import type { TokenDef } from '../design/tokens'
import { StarIcon } from '../components/Icons'

const GROUP_ORDER: TokenDef['group'][] = ['Color', 'Tipografía', 'Forma', 'Espaciado']

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function DesignSystem() {
  const { tokens, setToken, reset } = useTokens()

  const cssSnippet = useMemo(() => {
    const lines = tokens.map((t) => `  --${t.key}: ${t.value};`)
    return `:root {\n${lines.join('\n')}\n}`
  }, [tokens])

  const jsonSnippet = useMemo(() => {
    const obj: Record<string, string> = {}
    for (const t of tokens) obj[t.key] = t.value
    return JSON.stringify(obj, null, 2)
  }, [tokens])

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: tokens.filter((t) => t.group === group),
    }))
  }, [tokens])

  return (
    <div className="ds">
      <Link to="/" className="ds__back">← Volver a la agenda</Link>
      <h1>Design System</h1>
      <p className="ds__sub">
        Ajusta los tokens en vivo. Los cambios se guardan en este dispositivo. Exporta el CSS
        y pégalo en <code>src/index.css</code> para hacerlos permanentes.
      </p>

      <div className="ds__layout">
        <div>
          {grouped.map(({ group, items }) => (
            <section key={group} className="ds__group">
              <h3>{group}</h3>
              {items.map((t) => (
                <div key={t.key} className="ds__field">
                  <label htmlFor={t.key}>{t.label}</label>
                  {t.type === 'color' ? (
                    <input
                      id={t.key}
                      type="color"
                      value={t.value}
                      onChange={(e) => setToken(t.key, e.target.value)}
                    />
                  ) : (
                    <input
                      id={t.key}
                      type="text"
                      value={t.value}
                      onChange={(e) => setToken(t.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </section>
          ))}

          <div className="ds__actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => download('tokens.css', cssSnippet, 'text/css')}
            >
              Exportar CSS
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => download('tokens.json', jsonSnippet, 'application/json')}
            >
              Exportar JSON
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
              Restablecer
            </button>
          </div>
        </div>

        <div className="ds__preview">
          <h3 style={{ marginTop: 0 }}>Vista previa</h3>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <button className="btn btn--primary btn--sm">Enviar evento</button>
            <button className="btn btn--ghost btn--sm">Botón secundario</button>
          </div>

          <article className="card">
            <a className="card__link card__link--static">
              <div className="card__media">
                <img src={`${import.meta.env.BASE_URL}events/mercadillo-ropa.svg`} alt="Ejemplo" />
              </div>
              <div className="card__body">
                <p className="card__date">Jue, 26 ene · 14:00</p>
                <h2 className="card__title">Nombre del evento de ejemplo</h2>
                <p className="card__loc">Lugar del evento · Barcelona</p>
              </div>
            </a>
            <button className="card__star" aria-pressed="true" aria-label="Guardar evento">
              <StarIcon className="star" filled />
            </button>
          </article>

          <pre className="ds__code">{cssSnippet}</pre>
        </div>
      </div>
    </div>
  )
}
