import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  clearAdminPin,
  getStoredAdminPin,
  storeAdminPin,
  verifyAdminPin,
} from '../lib/admin'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  DEFAULT_COMMUNITY_CONTENT,
  fetchCommunityContent,
  saveCommunityContent,
  type CommunityContent,
} from '../lib/content'
import {
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  fetchEvents,
  type NewEvent,
} from '../lib/events'
import { resizeImage } from '../lib/image'
import { formatEventDate } from '../lib/date'
import type { EventItem } from '../types'

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const candidate = pin.trim()
    if (!candidate) return

    setChecking(true)
    setError('')
    try {
      await verifyAdminPin(candidate)
      storeAdminPin(candidate)
      onUnlock()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el PIN.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="clarisa clarisa--gate">
      <form className="pin" onSubmit={submit}>
        <h1>Panel de Clarisa</h1>
        <p className="clarisa__sub">Escribe el PIN para gestionar eventos.</p>
        <input
          type="password"
          className="input"
          placeholder="PIN"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError('')
          }}
          autoFocus
        />
        {error && <p className="form__error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={checking}>
          {checking ? 'Comprobando…' : 'Entrar'}
        </button>
        <Link to="/" className="clarisa__back">← Volver a la agenda</Link>
      </form>
    </div>
  )
}

const emptyForm = {
  name: '',
  startDay: '',
  startTime: '',
  endDay: '',
  endTime: '',
  allDay: false,
  venue: '',
  address: '',
  city: '',
  url: '',
  organizer: '',
  beneficiary: '',
  needs: '',
  contactPhone: '',
  whatsappUrl: '',
  instagramUrl: '',
  ticketUrl: '',
  website: '',
  hours: '',
  lineup: '',
  note: '',
}

type FormState = typeof emptyForm
type Status = 'idle' | 'saving' | 'done' | 'error'
type ContentStatus = 'idle' | 'saving' | 'done' | 'error'

// Turns a stored event back into the editable form fields.
function eventToForm(e: EventItem): FormState {
  const [sDay, sTime] = e.startDate.split('T')
  const [eDay, eTime] = (e.endDate ?? '').split('T')
  return {
    name: e.name,
    startDay: sDay ?? '',
    startTime: sTime ? sTime.slice(0, 5) : '',
    endDay: eDay ?? '',
    endTime: eTime ? eTime.slice(0, 5) : '',
    allDay: !!e.allDay,
    venue: e.venue ?? '',
    address: e.address ?? '',
    city: e.city ?? '',
    url: e.url ?? '',
    organizer: e.organizer ?? '',
    beneficiary: e.beneficiary ?? '',
    needs: e.needs ?? '',
    contactPhone: e.contactPhone ?? '',
    whatsappUrl: e.whatsappUrl ?? '',
    instagramUrl: e.instagramUrl ?? '',
    ticketUrl: e.ticketUrl ?? '',
    website: e.website ?? '',
    hours: e.hours ?? '',
    lineup: (e.lineup ?? []).join('\n'),
    note: e.note ?? '',
  }
}

export default function Clarisa() {
  const [unlocked, setUnlocked] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [f, setF] = useState<FormState>({ ...emptyForm })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [events, setEvents] = useState<EventItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | undefined>()
  const [community, setCommunity] = useState<CommunityContent>(
    DEFAULT_COMMUNITY_CONTENT,
  )
  const [contentStatus, setContentStatus] = useState<ContentStatus>('idle')
  const [contentError, setContentError] = useState('')

  const loadEvents = () => {
    fetchEvents().then((rows) => rows && setEvents(rows))
  }

  const loadCommunity = () => {
    fetchCommunityContent().then((content) => content && setCommunity(content))
  }

  useEffect(() => {
    const storedPin = getStoredAdminPin()
    if (!storedPin) {
      setCheckingSession(false)
      return
    }

    verifyAdminPin(storedPin)
      .then(() => setUnlocked(true))
      .catch(() => clearAdminPin())
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    if (unlocked && isSupabaseConfigured) {
      loadEvents()
      loadCommunity()
    }
  }, [unlocked])

  if (checkingSession) {
    return (
      <div className="clarisa clarisa--gate">
        <p className="clarisa__sub">Comprobando la sesión…</p>
      </div>
    )
  }

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />

  const set = (key: keyof FormState, value: string | boolean) =>
    setF((prev) => ({ ...prev, [key]: value }))

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = e.target.files?.[0] ?? null
    setFile(sel)
    setPreview(sel ? URL.createObjectURL(sel) : existingImage ?? null)
  }

  const resetForm = () => {
    setF({ ...emptyForm })
    setFile(null)
    setPreview(null)
    setEditingId(null)
    setExistingImage(undefined)
    setDetailsOpen(false)
  }

  const startEdit = (e: EventItem) => {
    setF(eventToForm(e))
    setEditingId(e.id)
    setExistingImage(e.image || undefined)
    setPreview(e.image || null)
    setFile(null)
    setStatus('idle')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (e: EventItem) => {
    if (!window.confirm(`¿Borrar "${e.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteEvent(e.id, e.image)
      if (editingId === e.id) resetForm()
      loadEvents()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo borrar.')
    }
  }

  const buildDate = (day: string, time: string) =>
    f.allDay || !time ? day : `${day}T${time}:00`

  const saveCommunity = async (e: FormEvent) => {
    e.preventDefault()
    setContentError('')

    if (!community.text.trim() || !community.linkLabel.trim()) {
      setContentStatus('error')
      setContentError('El texto y la frase del enlace no pueden quedar vacíos.')
      return
    }

    try {
      const url = new URL(community.whatsappUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      setContentStatus('error')
      setContentError('Escribe un enlace de WhatsApp válido.')
      return
    }

    setContentStatus('saving')
    try {
      await saveCommunityContent({
        text: community.text.trim(),
        linkLabel: community.linkLabel.trim(),
        whatsappUrl: community.whatsappUrl.trim(),
      })
      setContentStatus('done')
    } catch (err) {
      setContentStatus('error')
      setContentError(
        err instanceof Error ? err.message : 'No se pudo guardar el texto.',
      )
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!f.name.trim() || !f.startDay) {
      setError('El nombre y la fecha de inicio son obligatorios.')
      return
    }
    setStatus('saving')
    try {
      let image = existingImage
      if (file) {
        const blob = await resizeImage(file)
        image = await uploadEventImage(blob)
      }
      const payload: NewEvent = {
        name: f.name.trim(),
        startDate: buildDate(f.startDay, f.startTime),
        endDate: f.endDay ? buildDate(f.endDay, f.endTime) : undefined,
        allDay: f.allDay || undefined,
        venue: f.venue.trim() || undefined,
        address: f.address.trim() || undefined,
        city: f.city.trim() || undefined,
        url: f.url.trim() || undefined,
        organizer: f.organizer.trim() || undefined,
        beneficiary: f.beneficiary.trim() || undefined,
        needs: f.needs.trim() || undefined,
        contactPhone: f.contactPhone.trim() || undefined,
        whatsappUrl: f.whatsappUrl.trim() || undefined,
        instagramUrl: f.instagramUrl.trim() || undefined,
        ticketUrl: f.ticketUrl.trim() || undefined,
        website: f.website.trim() || undefined,
        hours: f.hours.trim() || undefined,
        lineup: f.lineup.split('\n').map((s) => s.trim()).filter(Boolean),
        note: f.note.trim() || undefined,
        image,
      }
      if (editingId) await updateEvent(editingId, payload)
      else await createEvent(payload)
      setStatus('done')
      resetForm()
      loadEvents()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Algo salió mal.')
    }
  }

  const editing = editingId !== null

  return (
    <div className="clarisa">
      <Link to="/" className="clarisa__back">← Volver a la agenda</Link>
      <h1>{editing ? 'Editar evento' : 'Publicar un evento'}</h1>
      <p className="clarisa__sub">
        {editing
          ? 'Modifica los datos y guarda los cambios.'
          : 'Completa los datos y publica. El evento aparecerá al instante en la agenda.'}
      </p>

      {!isSupabaseConfigured && (
        <p className="form__error">
          El backend (Supabase) todavía no está configurado, así que aún no se
          pueden gestionar eventos. Avísale a quien administra el sitio.
        </p>
      )}

      {status === 'done' && (
        <p className="form__ok">¡Guardado! 🎉 Ya está en la agenda.</p>
      )}

      <section className="content-editor" aria-labelledby="content-editor-title">
        <div className="content-editor__heading">
          <span className="content-editor__eyebrow">Contenido de la página</span>
          <h2 id="content-editor-title">Texto del final</h2>
          <p>
            Cambia la invitación y el enlace que aparecen debajo de los eventos.
          </p>
        </div>
        <form className="form" onSubmit={saveCommunity}>
          <label className="form__field">
            <span>Texto</span>
            <textarea
              className="input content-editor__textarea"
              value={community.text}
              onChange={(event) =>
                setCommunity((current) => ({
                  ...current,
                  text: event.target.value,
                }))}
            />
          </label>
          <div className="form__row">
            <label className="form__field">
              <span>Frase enlazada</span>
              <input
                className="input"
                value={community.linkLabel}
                onChange={(event) =>
                  setCommunity((current) => ({
                    ...current,
                    linkLabel: event.target.value,
                  }))}
              />
            </label>
            <label className="form__field">
              <span>Canal de WhatsApp</span>
              <input
                className="input"
                type="url"
                value={community.whatsappUrl}
                onChange={(event) =>
                  setCommunity((current) => ({
                    ...current,
                    whatsappUrl: event.target.value,
                  }))}
              />
            </label>
          </div>
          {contentError && <p className="form__error">{contentError}</p>}
          {contentStatus === 'done' && (
            <p className="form__ok">Texto actualizado.</p>
          )}
          <button
            type="submit"
            className="btn btn--primary content-editor__submit"
            disabled={contentStatus === 'saving' || !isSupabaseConfigured}
          >
            {contentStatus === 'saving' ? 'Guardando…' : 'Guardar texto'}
          </button>
        </form>
      </section>

      {editing && (
        <div className="form__editing">
          <span>Editando un evento</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={resetForm}>
            Cancelar
          </button>
        </div>
      )}

      <form className="form" onSubmit={submit}>
        <label className="form__field">
          <span>Nombre del evento *</span>
          <input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} required />
        </label>

        <label className="form__field">
          <span>Imagen (flyer){editing ? ' — deja vacío para conservar la actual' : ''}</span>
          <input type="file" accept="image/*" onChange={onFile} />
        </label>
        {preview && <img className="form__preview" src={preview} alt="Vista previa" />}

        <label className="form__check">
          <input type="checkbox" checked={f.allDay} onChange={(e) => set('allDay', e.target.checked)} />
          <span>Todo el día (sin hora)</span>
        </label>

        <div className="form__row">
          <label className="form__field">
            <span>Fecha de inicio *</span>
            <input type="date" className="input" value={f.startDay} onChange={(e) => set('startDay', e.target.value)} required />
          </label>
          {!f.allDay && (
            <label className="form__field">
              <span>Hora de inicio</span>
              <input type="time" className="input" value={f.startTime} onChange={(e) => set('startTime', e.target.value)} />
            </label>
          )}
        </div>

        <div className="form__row">
          <label className="form__field">
            <span>Fecha de fin (opcional)</span>
            <input type="date" className="input" value={f.endDay} onChange={(e) => set('endDay', e.target.value)} />
          </label>
          {!f.allDay && f.endDay && (
            <label className="form__field">
              <span>Hora de fin</span>
              <input type="time" className="input" value={f.endTime} onChange={(e) => set('endTime', e.target.value)} />
            </label>
          )}
        </div>

        <label className="form__field">
          <span>Lugar</span>
          <input className="input" value={f.venue} onChange={(e) => set('venue', e.target.value)} placeholder="Ej: Estudi Rosazul" />
        </label>
        <div className="form__row">
          <label className="form__field">
            <span>Dirección</span>
            <input className="input" value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle y número" />
          </label>
          <label className="form__field">
            <span>Ciudad</span>
            <input className="input" value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Ej: Barcelona" />
          </label>
        </div>

        <label className="form__field">
          <span>Link (entradas o más info)</span>
          <input className="input" value={f.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." />
        </label>

        <button type="button" className="form__toggle" onClick={() => setDetailsOpen((v) => !v)}>
          {detailsOpen ? '− Menos detalles' : '+ Más detalles (opcional)'}
        </button>

        {detailsOpen && (
          <div className="form__details">
            <label className="form__field"><span>Organizador</span><input className="input" value={f.organizer} onChange={(e) => set('organizer', e.target.value)} /></label>
            <label className="form__field"><span>A beneficio de</span><input className="input" value={f.beneficiary} onChange={(e) => set('beneficiary', e.target.value)} /></label>
            <label className="form__field"><span>Qué necesita</span><textarea className="input" value={f.needs} onChange={(e) => set('needs', e.target.value)} /></label>
            <label className="form__field"><span>Teléfono</span><input className="input" value={f.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} /></label>
            <label className="form__field"><span>WhatsApp (link)</span><input className="input" value={f.whatsappUrl} onChange={(e) => set('whatsappUrl', e.target.value)} /></label>
            <label className="form__field"><span>Instagram (link)</span><input className="input" value={f.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} /></label>
            <label className="form__field"><span>Entradas (link)</span><input className="input" value={f.ticketUrl} onChange={(e) => set('ticketUrl', e.target.value)} /></label>
            <label className="form__field"><span>Web</span><input className="input" value={f.website} onChange={(e) => set('website', e.target.value)} /></label>
            <label className="form__field"><span>Nota</span><textarea className="input" value={f.note} onChange={(e) => set('note', e.target.value)} /></label>
          </div>
        )}

        {error && <p className="form__error">{error}</p>}

        <button type="submit" className="btn btn--primary form__submit" disabled={status === 'saving' || !isSupabaseConfigured}>
          {status === 'saving' ? 'Guardando…' : editing ? 'Guardar cambios' : 'Publicar evento'}
        </button>
      </form>

      {isSupabaseConfigured && (
        <section className="admin-list">
          <h2>Eventos publicados ({events.length})</h2>
          {events.length === 0 ? (
            <p className="clarisa__sub">Aún no hay eventos.</p>
          ) : (
            <ul>
              {events.map((e) => (
                <li key={e.id} className="admin-row">
                  <div className="admin-row__info">
                    <strong>{e.name}</strong>
                    <span>{formatEventDate(e.startDate, e.endDate, e.allDay)}</span>
                  </div>
                  <div className="admin-row__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(e)}>Editar</button>
                    <button type="button" className="btn btn--ghost btn--sm admin-row__del" onClick={() => remove(e)}>Borrar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
