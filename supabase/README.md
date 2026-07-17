# Backend de eventos (Supabase) + panel de Clarisa

Los eventos de la agenda se guardan en **Supabase** (base de datos gratis). La app
los lee al cargar. Si Supabase no está configurado o falla, la app usa como
**respaldo** los eventos de `src/data/events.json`.

Clarisa (u otra persona) publica eventos desde la página oculta `/#/clarisa`, **sin
GitHub ni PRs**, y aparecen al instante en la agenda. Desde el mismo panel también
puede editar el texto comunitario que aparece al final de la página.

## Configurar Supabase (una sola vez)

1. Crea una cuenta y un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre **SQL Editor > New query**, pega el contenido de [`schema.sql`](schema.sql)
   y dale **Run**. Esto crea:
   - la tabla `events`,
   - las reglas de seguridad (RLS): el navegador puede **leer**, pero no puede
     crear, editar ni borrar directamente,
   - la tabla `site_content` para el texto comunitario,
   - el bucket público `event-images` para las fotos.
3. Para una instalación nueva puedes ejecutar [`seed.sql`](seed.sql), o importar
   el respaldo completo con `npm run migrate:backup -- /ruta/al/respaldo`.
4. Ve a **Settings > API** y copia:
   - **Project URL** (ej. `https://xxxx.supabase.co`)
   - **anon public** key,
   - **service_role** key.
5. Configura en Netlify:
   - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, que son públicos y se usan
     únicamente para leer,
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, disponibles solo para la
     Netlify Function,
   - `CLARISA_PIN`, un secreto largo que compartirás con Clarisa.
6. Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` ni `CLARISA_PIN` en variables `VITE_*`,
   el repositorio o el código del navegador.

Si el proyecto ya estaba configurado antes de incorporar el texto editable,
ejecuta una vez [`site-content.sql`](site-content.sql) en el SQL Editor.

## Panel de Clarisa (`/#/clarisa`)

- Página oculta (no enlazada), protegida por un **PIN verificado en el servidor**.
- El PIN se configura como variable privada `CLARISA_PIN` en Netlify.
- Clarisa: entra a `.../#/clarisa`, escribe el PIN, llena el formulario, sube la
  imagen del evento y pulsa **Publicar evento**. Listo, sale al instante.
- El bloque **Texto del final** permite cambiar la invitación, la frase enlazada y
  el enlace de WhatsApp sin editar código.
- La imagen se **comprime en el navegador** antes de subirse (ideal: horizontal
  1200x630).

El panel permite crear, editar y borrar eventos, subir imágenes y actualizar el
texto comunitario. Todas esas operaciones pasan por `netlify/functions/admin.mjs`.

## Notas de seguridad

- La llave pública no tiene políticas de escritura.
- La `service_role` existe únicamente en el entorno de la Netlify Function.
- Para cerrar las escrituras públicas de un proyecto antiguo ejecuta
  [`lock-down-writes.sql`](lock-down-writes.sql).
