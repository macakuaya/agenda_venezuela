-- Agenda Venezuela - cerrar las escrituras publicas de proyectos antiguos.
-- Correr una vez en Supabase > SQL Editor. La agenda seguira teniendo lectura
-- publica, pero crear/editar/borrar se hara solo desde la Netlify Function.

drop policy if exists "anyone insert events" on public.events;
drop policy if exists "anyone update events" on public.events;
drop policy if exists "anyone delete events" on public.events;

drop policy if exists "anyone insert site content" on public.site_content;
drop policy if exists "anyone update site content" on public.site_content;

drop policy if exists "anyone upload event images" on storage.objects;
drop policy if exists "anyone delete event images" on storage.objects;
