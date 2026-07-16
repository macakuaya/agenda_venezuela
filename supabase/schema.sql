-- Agenda Venezuela - setup de Supabase
-- Correr una sola vez en: Supabase > SQL Editor > New query > pegar > Run.
-- Crea la tabla de eventos, las reglas de seguridad (RLS), el bucket de
-- imagenes y sus politicas. Con esto, cualquiera puede LEER y CREAR eventos,
-- pero NADIE puede EDITAR ni BORRAR desde la web (eso se hace desde el panel).

-- 1) Tabla de eventos
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  image text,
  start_date text not null,
  end_date text,
  all_day boolean default false,
  venue text,
  address text,
  city text,
  url text,
  organizer text,
  beneficiary text,
  needs text,
  contact_phone text,
  whatsapp_url text,
  instagram_url text,
  ticket_url text,
  website text,
  hours text,
  lineup jsonb,
  note text
);

-- 2) Seguridad a nivel de fila
alter table public.events enable row level security;

-- Lectura publica
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select using (true);

-- Cualquiera puede crear/editar/borrar (opcion "rapida", sin login; el PIN de
-- /clarisa solo frena en la web). Ver supabase/edit-delete.sql para el detalle.
drop policy if exists "anyone insert events" on public.events;
create policy "anyone insert events" on public.events
  for insert with check (true);

drop policy if exists "anyone update events" on public.events;
create policy "anyone update events" on public.events
  for update using (true) with check (true);

drop policy if exists "anyone delete events" on public.events;
create policy "anyone delete events" on public.events
  for delete using (true);

-- 3) Contenido editable del bloque comunitario
create table if not exists public.site_content (
  id text primary key,
  community_text text not null,
  community_link_label text not null default 'únete aquí',
  community_whatsapp_url text not null,
  updated_at timestamptz not null default now()
);

insert into public.site_content (
  id,
  community_text,
  community_link_label,
  community_whatsapp_url
)
values (
  'community',
  'Esta es una iniciativa hecha a partir del grupo Barcelona Earthquake Collaboration. Si quieres unirte a nuestro grupo de WhatsApp para recibir noticias verificadas de próximos eventos y noticias solidarias sobre Venezuela,',
  'únete aquí',
  'https://chat.whatsapp.com/Co0WZGboWje6BdWkh6ir8W'
)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content
  for select using (true);

drop policy if exists "anyone insert site content" on public.site_content;
create policy "anyone insert site content" on public.site_content
  for insert with check (true);

drop policy if exists "anyone update site content" on public.site_content;
create policy "anyone update site content" on public.site_content
  for update using (true) with check (true);

-- 4) Bucket de imagenes (publico)
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Lectura publica de las imagenes
drop policy if exists "public read event images" on storage.objects;
create policy "public read event images" on storage.objects
  for select using (bucket_id = 'event-images');

-- Cualquiera puede subir imagenes a ese bucket (sin login)
drop policy if exists "anyone upload event images" on storage.objects;
create policy "anyone upload event images" on storage.objects
  for insert with check (bucket_id = 'event-images');

-- Cualquiera puede borrar imagenes del bucket (para limpiar al borrar eventos)
drop policy if exists "anyone delete event images" on storage.objects;
create policy "anyone delete event images" on storage.objects
  for delete using (bucket_id = 'event-images');
