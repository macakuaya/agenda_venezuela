// App-wide configuration. Static site, no backend.

// Brand / header title shown top-left.
export const BRAND_NAME = 'Agenda Venezuela'

// "Enviar evento" destination (JotForm).
export const SUBMIT_EVENT_URL = 'https://form.jotform.com/261915305293053'

// Bloque comunitario al final de la agenda. Edita estas tres líneas para
// cambiar el texto o el canal sin tener que tocar los componentes.
export const COMMUNITY_INVITE_TEXT =
  'Esta es una iniciativa hecha a partir del canal Barcelona Earthquake Collaboration. Si quieres unirte a nuestro canal de WhatsApp para recibir noticias verificadas de próximos eventos y noticias solidarias sobre Venezuela,'
export const COMMUNITY_INVITE_LINK_LABEL = 'únete aquí'
export const COMMUNITY_WHATSAPP_URL =
  'https://chat.whatsapp.com/Co0WZGboWje6BdWkh6ir8W'

// Locale used to format dates in Spanish.
export const LOCALE = 'es-VE'

// --- Supabase (backend de eventos) ---
// Estos valores son PUBLICOS (la anon key esta pensada para ir en el navegador;
// la seguridad la dan las reglas RLS). Pega aqui los tuyos de Supabase
// (Settings > API). Tambien se pueden pasar por variables de entorno VITE_*.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Nombre del bucket de Storage donde se suben las imagenes de eventos.
export const EVENT_IMAGES_BUCKET = 'event-images'
