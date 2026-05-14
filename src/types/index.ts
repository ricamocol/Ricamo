// ── ENUMS ─────────────────────────────────────────────────────

export type ProductStatus = "draft" | "active" | "archived" | "published";

export type OrderFlow = "A" | "B" | "C";

export type OrderStatus =
  // Flujo A — pre-diseñados
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_in_transit"
  | "return_received"
  | "refunded"
  // Flujos B/C — Ricamo personalizados
  | "cotizacion_pendiente"
  | "pendiente_aprobacion"
  | "en_ajustes"
  | "aprobado_pendiente_pago"
  | "en_produccion"
  | "rechazado";

export type DiscountType = "percentage" | "fixed";

// Modo de entrega según inventario dual — RB-INV
export type DeliveryMode = "fast" | "on_demand" | "sold_out";

// ── CATÁLOGO ──────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hero_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface VariantAttributes {
  talla?: string;
  color?: string;
  [key: string]: string | undefined;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number | null;
  stock: number;
  reserved: number;
  attributes: VariantAttributes;
  available_stock: number; // stock - reserved (calculado)
  // Inventario dual Ricamo — RB-INV-01
  stock_pre_producido: number;
  bajo_demanda_habilitado: boolean;
  tiempo_produccion_dias: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  care_instructions: string | null;
  base_price: number;
  compare_price: number | null;
  status: ProductStatus;
  images: string[];
  created_at: string;
  updated_at: string;
  // Relaciones
  variants?: ProductVariant[];
  categories?: Category[];
  collections?: Collection[];
  occasions?: Occasion[];
  // Computados
  is_on_sale?: boolean;
  is_sold_out?: boolean;
  effective_price?: number;
  // Entrega — computado a partir de variantes
  delivery_mode?: DeliveryMode;
  tiempo_produccion_dias?: number;
}

// Helper: calcula el modo de entrega de una variante
export function getDeliveryMode(
  variant?: Pick<ProductVariant, "stock_pre_producido" | "bajo_demanda_habilitado"> | null
): DeliveryMode {
  if (!variant) return "sold_out";
  if (variant.stock_pre_producido > 0) return "fast";
  if (variant.bajo_demanda_habilitado) return "on_demand";
  return "sold_out";
}

// Helper: modo de entrega para un producto (usa la variante con mejor disponibilidad)
export function getProductDeliveryMode(variants?: ProductVariant[]): DeliveryMode {
  if (!variants?.length) return "sold_out";
  if (variants.some((v) => v.stock_pre_producido > 0)) return "fast";
  if (variants.some((v) => v.bajo_demanda_habilitado)) return "on_demand";
  return "sold_out";
}

// ── CARRITO ───────────────────────────────────────────────────

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  sku: string;
  attributes: VariantAttributes;
  quantity: number;
  unitPrice: number;
  reservedUntil?: string; // ISO timestamp
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  appliedPromotion?: Promotion | null;
  sessionId: string;
}

// ── PEDIDOS ───────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_sku: string;
  variant_attrs: VariantAttributes;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CommunicationMessage {
  author: "customer" | "admin";
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  // Flujo Ricamo
  flow: OrderFlow;
  customization_data: Record<string, unknown> | null;
  // Envío
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_department: string;
  // Financiero
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  cotizacion_price: number | null;
  // Pago
  wompi_transaction_id: string | null;
  wompi_reference: string | null;
  wompi_link_id: string | null;
  wompi_link_url: string | null;
  paid_at: string | null;
  payment_reminder_sent_at: {
    day3?: string;
    day7?: string;
    day14?: string;
  } | null;
  // Courier
  courier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  // Aprobación B/C
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  communication_thread: CommunicationMessage[] | null;
  // Meta
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

// ── CLIENTES ──────────────────────────────────────────────────

export interface Customer {
  id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  marketing_email: boolean;
  marketing_whatsapp: boolean;
  is_guest: boolean;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  is_default: boolean;
}

// ── WISHLIST ──────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  variant_id: string | null;
  added_at: string;
  product?: Product;
}

// ── PROMOCIONES / INFLUENCERS ─────────────────────────────────

export interface Promotion {
  id: string;
  code: string | null;
  name: string;
  discount_type: DiscountType;
  discount_value: number;
  scope: "global" | "product" | "collection";
  scope_id: string | null;
  max_uses: number | null;
  max_uses_per_customer: number;
  used_count: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_cumulative: boolean;
  influencer_id: string | null; // null = cupón general
}

export interface Influencer {
  id: string;
  name: string;
  handle: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface InfluencerAttribution {
  id: string;
  influencer_id: string;
  promotion_id: string;
  order_id: string;
  customer_email: string;
  order_total: number;
  created_at: string;
}

// ── EVENTOS ACTIVOS ───────────────────────────────────────────

export interface ActiveEvent {
  id: string;
  name: string;
  city: string;
  starts_at: string;
  ends_at: string;
  banner_text: string;
  is_active: boolean;
  created_at: string;
}

// ── CONFIGURADOR ──────────────────────────────────────────────

export interface ConfiguratorDesign {
  id: string;
  name: string;
  image_url: string;
  event_tag: string | null;
  style_tag: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ── COTIZACIONES ──────────────────────────────────────────────

export interface CotizacionAttachment {
  id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  uploaded_by: "customer" | "admin";
  created_at: string;
}

// ── CHECKOUT ──────────────────────────────────────────────────

export interface CheckoutForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  coupon_code?: string;
  terms_accepted: boolean;
  save_address?: boolean;
}

// ── WOMPI ─────────────────────────────────────────────────────

export type WompiTransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

export interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: WompiTransactionStatus;
      amount_in_cents: number;
      currency: string;
    };
  };
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
  sent_at: string;
}

// ── HELPERS ───────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
