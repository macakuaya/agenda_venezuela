import { supabase, isSupabaseConfigured } from './supabase'
import { EVENT_IMAGES_BUCKET } from '../config'
import type { EventItem } from '../types'

// Shape of a row in the Supabase `events` table (snake_case).
interface EventRow {
  id: string
  name: string
  image: string | null
  start_date: string
  end_date: string | null
  all_day: boolean | null
  venue: string | null
  address: string | null
  city: string | null
  url: string | null
  organizer: string | null
  beneficiary: string | null
  needs: string | null
  contact_phone: string | null
  whatsapp_url: string | null
  instagram_url: string | null
  ticket_url: string | null
  website: string | null
  hours: string | null
  lineup: string[] | null
  note: string | null
}

function rowToEvent(row: EventRow): EventItem {
  const clean = <T>(v: T | null | undefined) => (v == null ? undefined : v)
  return {
    id: row.id,
    name: row.name,
    image: row.image ?? '',
    startDate: row.start_date,
    endDate: clean(row.end_date),
    allDay: row.all_day ?? undefined,
    venue: clean(row.venue),
    address: clean(row.address),
    city: clean(row.city),
    url: clean(row.url),
    organizer: clean(row.organizer),
    beneficiary: clean(row.beneficiary),
    needs: clean(row.needs),
    contactPhone: clean(row.contact_phone),
    whatsappUrl: clean(row.whatsapp_url),
    instagramUrl: clean(row.instagram_url),
    ticketUrl: clean(row.ticket_url),
    website: clean(row.website),
    hours: clean(row.hours),
    lineup: row.lineup ?? undefined,
    note: clean(row.note),
  }
}

/**
 * Fetches all events from Supabase. Returns null when Supabase is not
 * configured or the request fails, so the caller can fall back to local data.
 */
export async function fetchEvents(): Promise<EventItem[] | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })
  if (error) {
    console.error('Error cargando eventos de Supabase:', error.message)
    return null
  }
  return (data as EventRow[]).map(rowToEvent)
}

/** Input for creating a new event from the Clarisa form. */
export type NewEvent = Omit<EventItem, 'id' | 'image'> & { image?: string }

/** Maps an EventItem-like object to the snake_case DB columns. */
function eventToRow(e: NewEvent) {
  return {
    name: e.name,
    image: e.image ?? null,
    start_date: e.startDate,
    end_date: e.endDate ?? null,
    all_day: e.allDay ?? false,
    venue: e.venue ?? null,
    address: e.address ?? null,
    city: e.city ?? null,
    url: e.url ?? null,
    organizer: e.organizer ?? null,
    beneficiary: e.beneficiary ?? null,
    needs: e.needs ?? null,
    contact_phone: e.contactPhone ?? null,
    whatsapp_url: e.whatsappUrl ?? null,
    instagram_url: e.instagramUrl ?? null,
    ticket_url: e.ticketUrl ?? null,
    website: e.website ?? null,
    hours: e.hours ?? null,
    lineup: e.lineup && e.lineup.length ? e.lineup : null,
    note: e.note ?? null,
  }
}

/** Uploads an image blob to Storage and returns its public URL. */
export async function uploadEventImage(file: Blob, ext = 'jpg'): Promise<string> {
  if (!supabase) throw new Error('Supabase no esta configurado.')
  const name = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from(EVENT_IMAGES_BUCKET)
    .upload(name, file, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`)
  const { data } = supabase.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(name)
  return data.publicUrl
}

/** Inserts a new event row. */
export async function createEvent(event: NewEvent): Promise<void> {
  if (!supabase) throw new Error('Supabase no esta configurado.')
  const { error } = await supabase.from('events').insert(eventToRow(event))
  if (error) throw new Error(`No se pudo publicar el evento: ${error.message}`)
}

const RLS_HINT =
  'Revisa que hayas corrido supabase/edit-delete.sql en Supabase (permisos de edición/borrado).'

/** Updates an existing event row. */
export async function updateEvent(id: string, event: NewEvent): Promise<void> {
  if (!supabase) throw new Error('Supabase no esta configurado.')
  // .select() lets us detect when RLS silently blocked the write (0 rows).
  const { data, error } = await supabase
    .from('events')
    .update(eventToRow(event))
    .eq('id', id)
    .select('id')
  if (error) throw new Error(`No se pudo actualizar el evento: ${error.message}`)
  if (!data || data.length === 0) {
    throw new Error(`No se guardaron los cambios. ${RLS_HINT}`)
  }
}

/** Deletes an event row (and its Storage image, if it lives in our bucket). */
export async function deleteEvent(id: string, image?: string): Promise<void> {
  if (!supabase) throw new Error('Supabase no esta configurado.')
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw new Error(`No se pudo borrar el evento: ${error.message}`)
  if (!data || data.length === 0) {
    throw new Error(`No se borró el evento. ${RLS_HINT}`)
  }

  const marker = `/${EVENT_IMAGES_BUCKET}/`
  if (image && image.includes(marker)) {
    const path = image.split(marker)[1]
    if (path) await supabase.storage.from(EVENT_IMAGES_BUCKET).remove([path])
  }
}
