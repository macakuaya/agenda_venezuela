import { supabase, isSupabaseConfigured } from './supabase'
import { adminRequest, blobToBase64 } from './admin'
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
  if (ext !== 'jpg') throw new Error('La imagen debe estar en formato JPEG.')
  const result = await adminRequest('uploadImage', {
    file: {
      mimeType: 'image/jpeg',
      base64: await blobToBase64(file),
    },
  })
  if (!result.imageUrl) throw new Error('No se pudo subir la imagen.')
  return result.imageUrl
}

/** Inserts a new event row. */
export async function createEvent(event: NewEvent): Promise<void> {
  await adminRequest('createEvent', { event: eventToRow(event) })
}

/** Updates an existing event row. */
export async function updateEvent(id: string, event: NewEvent): Promise<void> {
  await adminRequest('updateEvent', { id, event: eventToRow(event) })
}

/** Deletes an event row (and its Storage image, if it lives in our bucket). */
export async function deleteEvent(id: string, image?: string): Promise<void> {
  await adminRequest('deleteEvent', { id, image })
}
