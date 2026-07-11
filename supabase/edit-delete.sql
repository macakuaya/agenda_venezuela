-- Agenda Venezuela - habilitar EDITAR y BORRAR eventos (opción rápida)
-- Correr una vez en Supabase > SQL Editor (después de schema.sql).
--
-- ADVERTENCIA: esto permite editar/borrar SIN login (con la llave pública).
-- El PIN de /clarisa solo frena en la web, no por API. Es la opción "rápida";
-- para endurecerla luego se puede pasar a validación por servidor o login.

drop policy if exists "anyone update events" on public.events;
create policy "anyone update events" on public.events
  for update using (true) with check (true);

drop policy if exists "anyone delete events" on public.events;
create policy "anyone delete events" on public.events
  for delete using (true);

-- Permitir borrar imágenes del bucket (para limpiar al borrar un evento)
drop policy if exists "anyone delete event images" on storage.objects;
create policy "anyone delete event images" on storage.objects
  for delete using (bucket_id = 'event-images');
