# Backend de eventos (Supabase) + panel de Clarisa

Los eventos de la agenda se guardan en **Supabase** (base de datos gratis). La app
los lee al cargar. Si Supabase no está configurado o falla, la app usa como
**respaldo** los eventos de `src/data/events.json`.

Clarisa (u otra persona) publica eventos desde la página oculta `/#/clarisa`, **sin
GitHub ni PRs**, y aparecen al instante en la agenda.

## Configurar Supabase (una sola vez)

1. Crea una cuenta y un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre **SQL Editor > New query**, pega el contenido de [`schema.sql`](schema.sql)
   y dale **Run**. Esto crea:
   - la tabla `events`,
   - las reglas de seguridad (RLS): cualquiera puede **leer** y **crear**, pero
     **nadie** puede **editar/borrar** desde la web,
   - el bucket público `event-images` para las fotos.
3. Repite con [`seed.sql`](seed.sql) para cargar los 5 eventos actuales.
4. Ve a **Settings > API** y copia:
   - **Project URL** (ej. `https://xxxx.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)
5. Pégalos en `src/config.ts`:
   ```ts
   export const SUPABASE_URL = 'https://xxxx.supabase.co'
   export const SUPABASE_ANON_KEY = 'eyJ...'
   ```
   Son valores **públicos** (la anon key está pensada para ir en el navegador; la
   seguridad la dan las reglas RLS). También puedes usar las variables de entorno
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Haz commit/push. Al desplegar, la agenda leerá los eventos desde Supabase.

## Panel de Clarisa (`/#/clarisa`)

- Página oculta (no enlazada), **sin login**, protegida por un **PIN**.
- El PIN se configura en `CLARISA_PIN` (`src/config.ts`), por defecto
  `venezuela2026`. **Cámbialo** y dáselo a Clarisa.
- Clarisa: entra a `.../#/clarisa`, escribe el PIN, llena el formulario, sube la
  imagen del evento y pulsa **Publicar evento**. Listo, sale al instante.
- La imagen se **comprime en el navegador** antes de subirse (ideal: horizontal
  1200x630).

### Qué puede y qué no

- **Crear** eventos: sí, desde `/clarisa`.
- **Editar / borrar**: por seguridad no se puede desde la web. Se hace desde el
  panel de Supabase (**Table editor > events**), o desde **Storage** para las
  imágenes.

## Notas de seguridad

- El PIN es un freno anti-spam del lado del cliente (viaja en el código), no una
  barrera criptográfica. La protección "dura" es la RLS: aunque alguien encuentre
  la URL o el código, **no puede borrar ni editar** la base.
- Si algún día quieres un PIN inquebrantable o permitir editar/borrar con
  seguridad, se añade login (Supabase Auth) o una Edge Function.
