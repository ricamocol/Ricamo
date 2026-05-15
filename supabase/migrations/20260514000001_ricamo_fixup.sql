-- ============================================================
-- RICAMO — Fixup: objetos no idempotentes de la migración v1.0
-- Aplica lo que falló en 20260513000001 por triggers/políticas
-- ya existentes en el entorno de desarrollo.
-- ============================================================

-- ============================================================
-- TRIGGERS (CREATE OR REPLACE — PostgreSQL 14+)
-- ============================================================

create or replace trigger trg_active_events_updated_at
  before update on active_events
  for each row execute function set_updated_at();

create or replace trigger trg_influencers_updated_at
  before update on influencers
  for each row execute function set_updated_at();

create or replace trigger trg_configurator_designs_updated_at
  before update on configurator_designs
  for each row execute function set_updated_at();

-- ============================================================
-- TABLAS QUE PUDIERON NO HABERSE CREADO
-- ============================================================

create table if not exists influencers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  handle       text,
  email        text,
  phone        text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists configurator_designs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  image_url     text not null,
  thumbnail_url text,
  event_tag     text,
  style_tag     text,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists cotizacion_attachments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  file_url     text not null,
  file_name    text not null,
  file_type    text,
  file_size_kb integer,
  uploaded_by  text not null check (uploaded_by in ('customer', 'admin')),
  created_at   timestamptz default now()
);

create table if not exists influencer_attributions (
  id              uuid primary key default gen_random_uuid(),
  influencer_id   uuid not null references influencers(id) on delete restrict,
  promotion_id    uuid not null references promotions(id) on delete restrict,
  order_id        uuid not null references orders(id) on delete restrict,
  customer_email  text not null,
  order_total     numeric(12,2) not null,
  created_at      timestamptz default now()
);

-- ============================================================
-- COLUMNAS (idempotente con IF NOT EXISTS)
-- ============================================================

alter table promotions
  add column if not exists influencer_id uuid references influencers(id) on delete set null;

-- ============================================================
-- ÍNDICES
-- ============================================================

create index if not exists idx_configurator_designs_active on configurator_designs(is_active, sort_order);
create index if not exists idx_promotions_influencer on promotions(influencer_id) where influencer_id is not null;
create index if not exists idx_influencer_attributions_influencer on influencer_attributions(influencer_id);
create index if not exists idx_influencer_attributions_order on influencer_attributions(order_id);
create index if not exists idx_influencer_attributions_date on influencer_attributions(created_at);
create index if not exists idx_cotizacion_attachments_order on cotizacion_attachments(order_id);

-- ============================================================
-- RLS
-- ============================================================

alter table active_events enable row level security;
alter table influencers enable row level security;
alter table influencer_attributions enable row level security;
alter table configurator_designs enable row level security;
alter table cotizacion_attachments enable row level security;

-- ============================================================
-- POLÍTICAS (drop + create para idempotencia)
-- ============================================================

-- active_events
drop policy if exists "active_events_public_read" on active_events;
create policy "active_events_public_read" on active_events
  for select using (is_active = true and starts_at <= current_date and ends_at >= current_date);

drop policy if exists "active_events_admin_all" on active_events;
create policy "active_events_admin_all" on active_events
  for all using (
    auth.jwt() ->> 'role' = 'service_role' or
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- influencers
drop policy if exists "influencers_admin_all" on influencers;
create policy "influencers_admin_all" on influencers
  for all using (
    auth.jwt() ->> 'role' = 'service_role' or
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- influencer_attributions
drop policy if exists "influencer_attributions_admin_all" on influencer_attributions;
create policy "influencer_attributions_admin_all" on influencer_attributions
  for all using (
    auth.jwt() ->> 'role' = 'service_role' or
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- configurator_designs
drop policy if exists "configurator_designs_public_read" on configurator_designs;
create policy "configurator_designs_public_read" on configurator_designs
  for select using (is_active = true);

drop policy if exists "configurator_designs_admin_all" on configurator_designs;
create policy "configurator_designs_admin_all" on configurator_designs
  for all using (
    auth.jwt() ->> 'role' = 'service_role' or
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- cotizacion_attachments
drop policy if exists "cotizacion_attachments_own_data" on cotizacion_attachments;
create policy "cotizacion_attachments_own_data" on cotizacion_attachments
  for select using (
    order_id in (
      select id from orders where customer_id in (
        select id from customers where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "cotizacion_attachments_admin_all" on cotizacion_attachments;
create policy "cotizacion_attachments_admin_all" on cotizacion_attachments
  for all using (
    auth.jwt() ->> 'role' = 'service_role' or
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- FUNCIÓN DE INVENTARIO DUAL
-- ============================================================

create or replace function get_inventory_mode(p_variant_id uuid)
returns text language plpgsql as $$
declare
  v_stock_pre    integer;
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
-- DATOS INICIALES
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

-- Atributo diseño/estampado para el configurador visual
insert into variant_attributes (name)
values ('diseño')
on conflict (name) do nothing;

-- ============================================================
-- BUCKET DE STORAGE: cotizacion-files
-- ============================================================
-- Crear via dashboard de Supabase: Storage → New bucket → "cotizacion-files" (private)
-- O ejecutar manualmente:
-- insert into storage.buckets (id, name, public) values ('cotizacion-files', 'cotizacion-files', false) on conflict do nothing;
