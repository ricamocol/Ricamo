# Pendientes — Ricamo
> Última actualización: 13 mayo 2026

---

## 🔴 Decisiones bloqueantes (resolver antes del día 5)

- [ ] **DP-RIC-02** — Lista de ciudades para routing Coordinadora vs Interrapidísimo
- [ ] **DP-RIC-03** — Responsabilidad tributaria / IVA
- [ ] **DP-RIC-05** — Confirmar Resend como proveedor email (compartir con Mar Boutique)
- [ ] **DP-RIC-06** — Identidad visual: logo, paleta de colores, tipografía, handle real de Instagram/TikTok
- [ ] **DP-RIC-07** — Adquirir dominio `ricamo.co` y configurar DNS
- [ ] **DP-RIC-08** — Documentos legales (T&C, Privacidad, Tratamiento datos Ley 1581)
- [ ] **DP-RIC-09** — 2FA para admins: ¿obligatorio u opcional?
- [ ] **DP-RIC-10** — Fecha de lanzamiento MVP (alinear con Feria Ganadera de Montería)
- [ ] **DP-RIC-11** — Catálogo inicial de diseños del configurador visual
- [ ] **DP-RIC-12** — ¿Personalización disponible para guest o solo registrados?
- [ ] **DP-RIC-14** — Precio base del configurador + recargo personalización

---

## 🔴 Bloqueantes técnicos (sin esto no se lanza)

- [x] **WhatsApp de Ricamo** — `+57 310 800 7700` configurado en `WhatsAppButton.tsx` y `templates.ts`
- [ ] **Redes sociales** — reemplazar handles de Instagram y TikTok en `Footer.tsx` y `maria-jose/page.tsx`
- [ ] **Variables de entorno Ricamo** — configurar en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`
- [ ] **Migración SQL** — extender schema de Mar Boutique con tablas Ricamo (inventario dual, active_events, influencers, configurator_designs, cotizacion_attachments)
- [ ] **Páginas legales** — `/terminos` y `/privacidad` adaptadas a Ricamo
- [ ] **Keys de Wompi en producción** — cambiar de sandbox a producción antes del lanzamiento
- [ ] **Verificar dominio en Resend** — sin esto los emails no salen al dominio real

---

## 🟡 Prioridad 1 — Base funcional Flujo A

- [ ] **Inventario dual** — extender `product_variants` con `stock_pre_producido`, `bajo_demanda_habilitado`, `tiempo_produccion_dias`
- [ ] **DeliveryBadge** — componente indicador "Entrega rápida 1-3 días" vs "Producción 3 días + envío"
- [ ] **Routing courier** — lógica `getCourier(city)` en `src/lib/shipping/` (Coordinadora/Interrapidísimo)
- [ ] **ProductCard** — mostrar badge de disponibilidad (pre-producido vs bajo demanda)
- [ ] **PDP (producto/[slug])** — mostrar indicador de disponibilidad dinámico
- [ ] **Panel admin: inventario dual** — vista por SKU con ambas dimensiones + edición rápida
- [ ] **Tipos TypeScript** — extender `src/types/index.ts` con tipos Ricamo (OrderStatus extendido, Influencer, ActiveEvent, ConfiguratorDesign)

---

## 🟡 Prioridad 2 — Flujos B y C

- [ ] **Wompi Link** — API para generar links sin vencimiento en `src/lib/wompi/`
- [ ] **Estados de pedido extendidos** — `cotizacion_pendiente`, `pendiente_aprobacion`, `en_ajustes`, `aprobado_pendiente_pago`, `rechazado`
- [ ] **Configurador visual Nivel 1** — selector camiseta + catálogo diseños + texto corto + preview canvas
- [ ] **Formulario de cotización** — con upload de archivos (JPG/PNG/PDF) a Supabase Storage
- [ ] **Panel admin: cotizaciones** — vista Flujos B y C, hilo de comunicación, aprobar/cotizar/rechazar
- [ ] **API: generación Wompi Link** — `POST /api/wompi-link`
- [ ] **Recordatorios de pago** — cron job en Render para días 3/7/14 sin pagar
- [ ] **Emails nuevos** — plantillas para: diseño aprobado, cotización lista, en ajustes, rechazado, recordatorio pago, en producción

---

## 🟡 Prioridad 3 — Diferenciadores Ricamo

- [ ] **Módulo influencers** — CRUD influencers + códigos ilimitados + tabla `influencer_attributions` + dashboard atribución
- [ ] **Banner geo-segmentado** — `EventBanner.tsx` + `active_events` table + `/api/geo` + fallback elegante
- [ ] **Panel admin: eventos activos** — CRUD de eventos con banner
- [ ] **Panel admin: influencers** — CRUD + generación de códigos + dashboard
- [ ] **Página /colecciones** — renombrar a "Eventos" conceptualmente, storytelling por evento
- [ ] **Página /configura** — ruta del configurador visual
- [ ] **Página /cotiza** — ruta del formulario de cotización

---

## 🟡 Prioridad 4 — Marca personal

- [ ] **Lookbook** — galería editorial shoppable (foto → link a PDP)
- [ ] **Feed Instagram embebido** — widget en home con fallback (Instagram Embed API)
- [ ] **Feed TikTok embebido** — widget en home con fallback (TikTok Embed)
- [ ] **Panel admin: marca** — gestión de contenido Sobre, Lookbook
- [ ] **Foto profesional** — DP-RIC-15: sesión de fotos para `/maria-jose` y Lookbook

---

## 🟡 Prioridad 5 — Panel admin y reportes

- [ ] **Dashboard** — métricas Ricamo: ventas por flujo, pedidos pendientes de aprobación, cotizaciones pendientes, links sin cobrar, alertas stock bajo, ventas por influencer
- [ ] **Admin: configurador** — CRUD catálogo de diseños del configurador
- [ ] **Reportes: demanda histórica** — ventas bajo demanda vs pre-producido por SKU
- [ ] **Reportes: atribución influencer** — ventas por influencer con período seleccionable
- [ ] **Configuración: ciudades courier** — lista editable de ciudades principales

---

## ✅ Completado (base Mar Boutique heredada)

- [x] Auth con Google OAuth y email/contraseña
- [x] Catálogo `/catalogo` con filtros, sort, Suspense
- [x] Página de producto `/producto/[slug]` con variantes y galería
- [x] Carrito con reserva de stock 10 min (aplica solo a Flujo A)
- [x] Checkout con Wompi (Flujo A)
- [x] Webhook Wompi idempotente
- [x] Pedidos en cuenta de cliente + seguimiento para guests
- [x] Panel admin base: productos, pedidos, inventario, clientes, colecciones, descuentos, reportes, configuración
- [x] Emails transaccionales con Resend (5 plantillas → adaptadas a Ricamo)
- [x] WhatsApp flotante
- [x] Protección `/admin` por rol
- [x] RLS Supabase + `createServiceClient`
- [x] Wishlist
- [x] Identidad visual adaptada → **pendiente DP-RIC-06** para colores/tipografía definitivos

---

## 🟢 Fase 2 (post-lanzamiento)

- [ ] WhatsApp Business API para notificaciones automáticas
- [ ] Agregador logístico (generación automática de guías Coordinadora/Interrapidísimo)
- [ ] Inventario multi-ubicación (bodega Medellín + bodega evento)
- [ ] Comisiones a influencers + reportes de liquidación
- [ ] Early bird para pre-lanzamientos de colecciones
- [ ] Blog con voz de María José
- [ ] "Detrás del diseño" por colección
- [ ] Testimonios / UGC con moderación
- [ ] Newsletter y comunidad
- [ ] Recordatorio carrito abandonado
- [ ] "Avísame cuando regrese" en agotados
- [ ] Instagram Shopping + TikTok Shopping
