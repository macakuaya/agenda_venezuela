import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const backupDir = resolve(process.argv[2] ?? '')
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!process.argv[2]) {
  throw new Error('Uso: npm run migrate:backup -- /ruta/al/respaldo')
}
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY antes de importar.',
  )
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const events = JSON.parse(await readFile(resolve(backupDir, 'events.json'), 'utf8'))
const siteContent = JSON.parse(
  await readFile(resolve(backupDir, 'site_content.json'), 'utf8'),
)
const imageFiles = await readdir(resolve(backupDir, 'images'))

const imageByEvent = new Map(
  imageFiles.map((filename) => [filename.replace(/\.[^.]+$/, ''), filename]),
)

for (const event of events) {
  const filename = imageByEvent.get(event.id)
  if (!filename) throw new Error(`Falta la imagen del evento ${event.id}.`)

  const storageName = `${event.id}.jpg`
  const bytes = await readFile(resolve(backupDir, 'images', filename))
  const { error: uploadError } = await supabase.storage
    .from('event-images')
    .upload(storageName, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('event-images').getPublicUrl(storageName)
  event.image = data.publicUrl
}

const { error: eventsError } = await supabase
  .from('events')
  .upsert(events, { onConflict: 'id' })
if (eventsError) throw eventsError

const community = siteContent[0]
const { error: contentError } = await supabase.from('site_content').upsert({
  id: 'community',
  community_text: community.community_text,
  community_link_label: community.community_link_label,
  community_whatsapp_url: community.community_whatsapp_url,
})
if (contentError) throw contentError

console.log(`Migración completa: ${events.length} eventos y ${imageFiles.length} imágenes.`)
