-- Agenda Venezuela - seed de los 5 eventos actuales
-- Correr UNA VEZ despues de schema.sql. Usa las imagenes ya publicadas en el
-- repo (GitHub Pages). Es idempotente: no duplica si ya existe un evento con
-- el mismo nombre.

insert into public.events (name, image, start_date, end_date, all_day, address, city, organizer, beneficiary, hours, note)
select 'Mercadillo de ropa',
       'https://macakuaya.github.io/AgendaVenezuela/events/unidos-por-venezuela-mercadillo.jpg',
       '2026-07-10', '2026-07-12', true,
       'Rambla Francesc Macià, 10', 'Terrassa',
       'Daniela Cedeño', 'Fundación Mires y Gotas de Luz',
       'Viernes 17:00-22:00 · Sábado 11:00-23:00 · Domingo 11:00-22:00',
       'Campaña «Unidos por Venezuela». El 100% de los fondos va directo a las víctimas del terremoto del 24 de junio.'
where not exists (select 1 from public.events where name = 'Mercadillo de ropa');

insert into public.events (name, image, start_date, all_day, url, organizer, beneficiary, needs, contact_phone, whatsapp_url, instagram_url, note)
select 'Donaciones de medicina e insumos médicos',
       'https://macakuaya.github.io/AgendaVenezuela/events/gente-activa-medicina.jpg',
       '2026-07-11', true,
       'https://www.instagram.com/reel/DagTAOHsk8G/',
       'Gente Activa (@genteactivabcn)',
       'La arquidiócesis (canal humanitario a través de la iglesia)',
       'Material médico y de rehabilitación: kits de cirugía traumatológica (fracturas de miembros superiores e inferiores), bastones, andadores, prótesis (para amputados), vendaje elástico tubular, muñequera rígida e inmovilizador cervical rígido. También cajas, agua y bocadillos para los voluntarios.',
       '+34 612 54 31 62',
       'https://chat.whatsapp.com/Co0WZGboWje6BdWkh6ir8W',
       'https://www.instagram.com/reel/DagTAOHsk8G/',
       'Campaña «Ayuda Humanitaria para Venezuela» (2da fase) de Gente Activa. Contacto: Juanjo (@genteactivabcn). Sin dirección fija; las direcciones de entrega están en el Instagram.'
where not exists (select 1 from public.events where name = 'Donaciones de medicina e insumos médicos');

insert into public.events (name, image, start_date, end_date, all_day, venue, address, city, url, organizer, beneficiary, needs, ticket_url, note)
select 'Juntos por Venezuela',
       'https://macakuaya.github.io/AgendaVenezuela/events/juntos-por-venezuela.jpg',
       '2026-07-11T17:00:00', '2026-07-11T23:00:00', false,
       'El Mas Vell', 'Carrer de Barcelona, 2', 'El Masnou',
       'https://entradium.com/events/a-tu-lado-venezuela',
       'Juan Carlos Pinedo (por confirmar)', 'Meals 4 Hope',
       'Aporte económico (entrada desde 5 €)',
       'https://entradium.com/events/a-tu-lado-venezuela',
       'Con cocineros, músicos, DJs, comediantes, artistas y talleres. Aparición especial de La Poderosa, el mejor restaurante de empanadas de Barcelona (actualmente cerrado). Aporte desde 5 €.'
where not exists (select 1 from public.events where name = 'Juntos por Venezuela');

insert into public.events (name, image, start_date, all_day, venue, address, city, url, beneficiary, website, instagram_url, lineup, note)
select 'Tothom amb Veneçuela!',
       'https://macakuaya.github.io/AgendaVenezuela/events/tothom-amb-venezuela.jpg',
       '2026-07-12T19:00:00', false,
       'Estudi Rosazul', 'Plaça Julio Gonzalez 8 baixos, Poblenou', 'Barcelona',
       'https://www.instagram.com/p/DaQaMEVT4IZ/',
       'Damnificados por los terremotos en Venezuela',
       'https://elsusurro.com',
       'https://www.instagram.com/p/DaQaMEVT4IZ/',
       '["Suki Landaeta","Daniel Cros","Ensamble Condal","Mar de Leva","Ensemble Tepuy"]'::jsonb,
       'Concierto solidario por los damnificados de los terremotos.'
where not exists (select 1 from public.events where name = 'Tothom amb Veneçuela!');

insert into public.events (name, image, start_date, end_date, all_day, venue, address, city, url, organizer, beneficiary, instagram_url, note)
select 'Pop Up de repostería',
       'https://macakuaya.github.io/AgendaVenezuela/events/venta-solidaria-pasteleria.jpg',
       '2026-07-17T15:00:00', '2026-07-17T20:00:00', false,
       'Aula Canal', 'C/ Muntaner 562', 'Barcelona',
       'https://www.instagram.com/p/Dand2J5jN2_/',
       'Anna Katherina Camacho', 'World Central Kitchen',
       'https://www.instagram.com/p/Dand2J5jN2_/',
       'Venta solidaria de pastelería de Aula Canal (Anna Katherina). Cada dulce ayuda a llevar comida y esperanza a las familias afectadas por el reciente terremoto en Venezuela.'
where not exists (select 1 from public.events where name = 'Pop Up de repostería');
