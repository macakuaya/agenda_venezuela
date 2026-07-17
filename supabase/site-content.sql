-- Contenido editable de la página.
-- Ejecutar una vez en Supabase > SQL Editor para habilitar la edición del
-- bloque comunitario desde /#/clarisa.

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
  'Esta es una iniciativa hecha a partir del canal Barcelona Earthquake Collaboration. Si quieres unirte a nuestro canal de WhatsApp para recibir noticias verificadas de próximos eventos y noticias solidarias sobre Venezuela,',
  'únete aquí',
  'https://chat.whatsapp.com/Co0WZGboWje6BdWkh6ir8W'
)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content
  for select using (true);

drop policy if exists "anyone insert site content" on public.site_content;
drop policy if exists "anyone update site content" on public.site_content;
