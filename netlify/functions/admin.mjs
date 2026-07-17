import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const IMAGE_BUCKET = 'event-images'
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const EVENT_FIELDS = [
  'name',
  'image',
  'start_date',
  'end_date',
  'all_day',
  'venue',
  'address',
  'city',
  'url',
  'organizer',
  'beneficiary',
  'needs',
  'contact_phone',
  'whatsapp_url',
  'instagram_url',
  'ticket_url',
  'website',
  'hours',
  'lineup',
  'note',
]

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

function sameSecret(value, expected) {
  const received = Buffer.from(value ?? '')
  const configured = Buffer.from(expected ?? '')
  return (
    received.length > 0 &&
    received.length === configured.length &&
    timingSafeEqual(received, configured)
  )
}

function sanitizeEvent(input) {
  const event = {}
  for (const field of EVENT_FIELDS) {
    if (Object.hasOwn(input ?? {}, field)) event[field] = input[field]
  }
  return event
}

function storagePath(imageUrl) {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`
  if (typeof imageUrl !== 'string' || !imageUrl.includes(marker)) return null
  return decodeURIComponent(imageUrl.split(marker)[1] ?? '')
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const configuredPin = process.env.CLARISA_PIN

  if (!supabaseUrl || !serviceRoleKey || !configuredPin) {
    return json({ error: 'El panel todavía no está configurado.' }, 503)
  }

  if (!sameSecret(request.headers.get('x-clarisa-pin'), configuredPin)) {
    return json({ error: 'PIN incorrecto.' }, 401)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Solicitud inválida.' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    switch (body.action) {
      case 'verify':
        return json({ ok: true })

      case 'createEvent': {
        const event = sanitizeEvent(body.event)
        if (!event.name || !event.start_date) {
          return json({ error: 'El nombre y la fecha son obligatorios.' }, 400)
        }
        const { error } = await supabase.from('events').insert(event)
        if (error) throw error
        return json({ ok: true })
      }

      case 'updateEvent': {
        if (!body.id) return json({ error: 'Falta el evento que quieres editar.' }, 400)
        const event = sanitizeEvent(body.event)
        if (!event.name || !event.start_date) {
          return json({ error: 'El nombre y la fecha son obligatorios.' }, 400)
        }
        const { error } = await supabase.from('events').update(event).eq('id', body.id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'deleteEvent': {
        if (!body.id) return json({ error: 'Falta el evento que quieres borrar.' }, 400)
        const { error } = await supabase.from('events').delete().eq('id', body.id)
        if (error) throw error

        const path = storagePath(body.image)
        if (path) await supabase.storage.from(IMAGE_BUCKET).remove([path])
        return json({ ok: true })
      }

      case 'saveCommunity': {
        const content = body.content ?? {}
        if (!content.text || !content.linkLabel || !content.whatsappUrl) {
          return json({ error: 'Completa el texto y el enlace comunitario.' }, 400)
        }
        const { error } = await supabase.from('site_content').upsert({
          id: 'community',
          community_text: content.text,
          community_link_label: content.linkLabel,
          community_whatsapp_url: content.whatsappUrl,
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'uploadImage': {
        const file = body.file ?? {}
        if (file.mimeType !== 'image/jpeg' || typeof file.base64 !== 'string') {
          return json({ error: 'La imagen debe estar en formato JPEG.' }, 400)
        }

        const bytes = Buffer.from(file.base64, 'base64')
        if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
          return json({ error: 'La imagen es demasiado grande.' }, 400)
        }

        const name = `${crypto.randomUUID()}.jpg`
        const { error } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(name, bytes, { contentType: 'image/jpeg', upsert: false })
        if (error) throw error

        const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(name)
        return json({ ok: true, imageUrl: data.publicUrl })
      }

      default:
        return json({ error: 'Operación desconocida.' }, 400)
    }
  } catch (error) {
    console.error('Agenda Venezuela admin error:', error)
    return json({ error: 'No se pudo completar la operación.' }, 500)
  }
}
