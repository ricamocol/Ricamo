-- ============================================================
-- RICAMO — Extensiones del schema sobre base Mar Boutique
-- Versión: 1.0 | Fase 1 MVP
-- Aplicar DESPUÉS de las migraciones base de Mar Boutique
-- ============================================================

-- ============================================================
-- 1. NUEVOS ESTADOS DE PEDIDO
-- ============================================================

-- Agregar valores al enum order_status (no se pueden eliminar valores existentes)
alter type order_status add value if not exists 'cotizacion_pendiente';
alter type order_status add value if not exists 'pendiente_aprobacion';
alter type order_status add value if not exists 'en_ajustes';
alter type order_status add value if not exists 'aprobado_pendiente_pago';
alter type order_status add value if not exists 'en_produccion';
alter type order_status add value if not exists 'rechazado';

-- ============================================================
-- 2. INVENTARIO DUAL EN VARIANTES
-- ============================================================

-- stock_pre_producido: inventario físico disponible para envío rápido
-- bajo_demanda_habilitado: si se puede vender sin stock previo
-- tiempo_produccion_dias: días hábiles para producir bajo demanda

alter table product_variants
  add column if not exists stock_pre_producido  integer not null default 0 check (stock_pre_producido >= 0),
  add column if not exists bajo_demanda_habilitado boolean not null default true,
  add column if not exists tiempo_produccion_dias  integer not null default 3 check (tiempo_produccion_dias >= 1);

-- ============================================================
-- 3. EXTENSIONES DE LA TABLA ORDERS
-- ============================================================

-- flow: identifica cuál de los 3 flujos originó el pedido
-- A = pre-diseñado (carrito + pago inmediato)
-- B = configurador visual (aprobación + Wompi Link)
-- C = formulario de cotización (cotización + aprobación + Wompi Link)

alter table orders
  add column if not exists flow                    text check (flow in ('A', 'B', 'C')) default 'A',
  add column if not exists wompi_link_id           text,
  add column if not exists wompi_link_url          text,
  add column if not exists payment_reminder_sent_at jsonb default '{}'::jsonb,
  add column if not exists cotizacion_price        numeric(12,2),
  add column if not exists approved_at             timestamptz,
  add column if not exists rejected_at             timestamptz,
  add column if not exists rejection_reason        text,
  add column if not exists customization_data      jsonb,
  add column if not exists communication_thread    jsonb default '[]'::jsonb,
  add column if not exists courier                 text;

-- Índice para buscar pedidos por flujo
create index if not exists idx_orders_flow on orders(flow);
create index if not exists idx_orders_wompi_link on orders(wompi_link_id) where wompi_link_id is not null;

-- ============================================================
-- 4. TABLA: EVENTOS ACTIVOS (banner geo-segmentado)
-- ============================================================

create table if not exists active_events (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,           -- "Feria Ganadera Montería 2026"
  city         text not null,           -- ciudad para matching con geo-IP (minúsculas, sin tildes)
  city_display text not null,           -- versión para mostrar al usuario
  starts_at    date not null,
  ends_at      date not null,
  banner_text  text not null,           -- texto libre del banner
  is_active    boolean not null default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  constraint active_events_dates_check check (ends_at >= starts_at)
);

-- Solo un evento activo a la vez (Fase 1 — RB-EVT-01)
create unique index if not exists idx_active_events_single_active
  on active_events (is_active)
  where is_active = true;

create index if not exists idx_active_events_dates on active_events(starts_at, ends_at);

create trigger trg_active_events_updated_at
  before update on active_events
  for each row execute function set_updated_at();

-- RLS: público puede leer eventos activos en fechas vigentes
alter table active_events enable row level security;

create policy "active_events_public_read" on active_events
  for select using (is_active = true and starts_at <= current_date and ends_at >= current_date);

-- ============================================================
-- 5. TABLA: INFLUENCERS
-- ============================================================

create table if not exists influencers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  handle       text,                    -- @alias de Instagram/TikTok
  email        text,
  phone        text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger trg_influencers_updated_at
  before update on influencers
  for each row execute function set_updated_at();

-- ============================================================
-- 6. VINCULAR CUPONES A INFLUENCERS
-- ============================================================

-- Columna influencer_id en promotions para cupones de influencer
-- Los cupones de influencer tienen: max_uses = NULL, max_uses_per_customer = NULL (ilimitados — RB-INF-01)

alter table promotions
  add column if not exists influencer_id uuid references influencers(id) on delete set null;

create index if not exists idx_promotions_influencer on promotions(influencer_id)
  where influencer_id is not null;

-- ============================================================
-- 7. TABLA: ATRIBUCIONES DE INFLUENCER
-- ============================================================

create table if not exists influencer_attributions (
  id              uuid primary key default gen_random_uuid(),
  influencer_id   uuid not null references influencers(id) on delete restrict,
  promotion_id    uuid not null references promotions(id) on delete restrict,
  order_id        uuid not null references orders(id) on delete restrict,
  customer_email  text not null,
  order_total     numeric(12,2) not null,
  created_at      timestamptz default now()
);

create index if not exists idx_influencer_attributions_influencer on influencer_attributions(influencer_id);
create index if not exists idx_influencer_attributions_order on influencer_attributions(order_id);
create index if not exists idx_influencer_attributions_date on influencer_attributions(created_at);

-- RLS: solo admins
alter table influencer_attributions enable row level security;

-- ============================================================
-- 8. TABLA: DISEÑOS DEL CONFIGURADOR VISUAL
-- ============================================================

create table if not exists configurator_designs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  image_url    text not null,           -- URL en Supabase Storage
  thumbnail_url text,                   -- versión pequeña para la galería
  event_tag    text,                    -- filtro por evento (ej: "feria-ganadera")
  style_tag    text,                    -- filtro por estilo (ej: "tipografico", "ilustracion")
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_configurator_designs_active on configurator_designs(is_active, sort_order);

create trigger trg_configurator_designs_updated_at
  before update on configurator_designs
  for each row execute function set_updated_at();

-- RLS: público puede leer diseños activos
alter table configurator_designs enable row level security;

create policy "configurator_designs_public_read" on configurator_designs
  for select using (is_active = true);

-- ============================================================
-- 9. TABLA: ADJUNTOS DE COTIZACIONES
-- ============================================================

create table if not exists cotizacion_attachments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  file_url     text not null,           -- URL en Supabase Storage
  file_name    text not null,
  file_type    text,                    -- MIME type
  file_size_kb integer,
  uploaded_by  text not null check (uploaded_by in ('customer', 'admin')),
  created_at   timestamptz default now()
);

create index if not exists idx_cotizacion_attachments_order on cotizacion_attachments(order_id);

-- RLS: cliente ve solo sus adjuntos, admin ve todos
alter table cotizacion_attachments enable row level security;

create policy "cotizacion_attachments_own_data" on cotizacion_attachments
  for select using (
    order_id in (
      select id from orders where customer_id in (
        select id from customers where auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- 10. POLÍTICAS RLS ADICIONALES (admin ve todo)
-- ============================================================

-- Admins (service role) ya bypasean RLS. Estas políticas son para
-- el cliente anon de Supabase cuando el backend las necesite explícitamente.

-- active_events: admins pueden hacer CRUD
create policy "active_events_admin_all" on active_events
  for all using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- influencers: solo admins
create policy "influencers_admin_all" on influencers
  for all using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- influencer_attributions: solo admins
create policy "influencer_attributions_admin_all" on influencer_attributions
  for all using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- configurator_designs: admins pueden hacer CRUD
create policy "configurator_designs_admin_all" on configurator_designs
  for all using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- cotizacion_attachments: admins pueden ver y subir
create policy "cotizacion_attachments_admin_all" on cotizacion_attachments
  for all using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 11. DATOS INICIALES
-- ============================================================

-- Primer influencer: María José (fundadora — RB-INF-04)
insert into influencers (name, handle, email, notes)
values (
  'María José',
  '@mariajose_ricamo',
  'mariajose@ricamo.co',
  'Fundadora de Ricamo — influencer principal'
)
on conflict do nothing;

-- Atributo "diseño/estampado" para variantes del configurador
insert into variant_attributes (name)
values ('diseño')
on conflict (name) do nothing;

-- ============================================================
-- 12. FUNCIÓN: LÓGICA DE VENTA INVENTARIO DUAL
-- ============================================================

-- Retorna el modo de venta disponible para un SKU:
-- 'pre_producido' si hay stock físico
-- 'bajo_demanda' si está habilitado y no hay stock
-- 'agotado' si no hay ninguna opción

create or replace function get_inventory_mode(p_variant_id uuid)
returns text language plpgsql as $$
declare
  v_stock_pre   integer;
  v_bajo_demanda boolean;
begin
  select stock_pre_producido, bajo_demanda_habilitado
  into v_stock_pre, v_bajo_demanda
  from product_variants
  where id = p_variant_id;

  if v_stock_pre > 0 then
    return 'pre_producido';
  elsif v_bajo_demanda = true then
    return 'bajo_demanda';
  else
    return 'agotado';
  end if;
end;
$$;

-- ============================================================
-- FIN DE MIGRACIÓN RICAMO v1.0
-- ============================================================
