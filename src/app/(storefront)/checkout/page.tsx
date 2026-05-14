"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, AlertCircle, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { formatCOP } from "@/lib/utils/format";
import { getCourier } from "@/lib/shipping";
import type { CheckoutForm } from "@/types";

const DEPARTMENTS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
  "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
  "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés","Santander",
  "Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, shippingCost, total, sessionId, clearCart, setShippingCost } =
    useCartStore();

  const [form, setFormState] = useState<CheckoutForm>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    coupon_code: "",
    terms_accepted: false,
  });
  const [courierName, setCourierName] = useState<string>("");
  const [prefilled, setPrefilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "payment">("form");
  const [wompiData, setWompiData] = useState<{
    publicKey: string;
    currency: string;
    amountInCents: number;
    reference: string;
    redirectUrl: string;
    integritySignature: string;
  } | null>(null);

  useEffect(() => {
    if (items.length === 0) router.replace("/carrito");
  }, [items, router]);

  // Precargar datos del usuario autenticado
  useEffect(() => {
    if (prefilled) return;
    const supabase = createClient();

    async function prefillFromUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates: Partial<CheckoutForm> = {};
      if (user.email) updates.email = user.email;

      const { data: customer } = await supabase
        .from("customers")
        .select("full_name, phone")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (customer) {
        if (customer.full_name) updates.full_name = customer.full_name;
        if (customer.phone) updates.phone = customer.phone;
      }

      const { data: address } = await supabase
        .from("customer_addresses")
        .select("address, city, department")
        .eq("customer_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

      if (address) {
        if (address.address) updates.address = address.address;
        if (address.city) updates.city = address.city;
        if (address.department) updates.department = address.department;
      }

      if (Object.keys(updates).length > 0) {
        setFormState((f) => ({ ...f, ...updates }));
        if (updates.city) {
          const result = getCourier(updates.city);
          setShippingCost(result.cost);
          setCourierName(result.courier);
        }
      }
      setPrefilled(true);
    }

    prefillFromUser();
  }, [prefilled, setShippingCost]);

  function set(field: keyof CheckoutForm, value: string | boolean) {
    setFormState((f) => {
      const next = { ...f, [field]: value };

      // Recalcular courier cuando cambia la ciudad — RB-CHK-04
      if (field === "city" && typeof value === "string" && value.length > 2) {
        const result = getCourier(value);
        setShippingCost(result.cost);
        setCourierName(result.courier);
      }

      return next;
    });
    setError(null);
  }

  function validate(): string | null {
    if (!form.full_name.trim()) return "Ingresa tu nombre completo.";
    if (!form.email.includes("@")) return "El correo no es válido.";
    if (form.phone.replace(/\D/g, "").length < 7) return "El teléfono no es válido.";
    if (!form.address.trim()) return "Ingresa tu dirección.";
    if (!form.city.trim()) return "Ingresa tu ciudad.";
    if (!form.department) return "Selecciona tu departamento.";
    if (!form.terms_accepted) return "Debes aceptar los términos y condiciones.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, items, sessionId, total, subtotal, discountAmount, shippingCost }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al procesar el pedido."); return; }

      setWompiData(data.wompi);
      setStep("payment");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/carrito" className="text-[#6a6356] hover:text-[#0e0e0e] transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <h1
          className="text-3xl text-[#0e0e0e]"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          Checkout
        </h1>
      </div>

      {step === "payment" && wompiData ? (
        <WompiWidget data={wompiData} total={total} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── FORMULARIO ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <Section title="Datos de contacto">
              <Field label="Nombre completo *" id="full_name">
                <Input
                  id="full_name" type="text" autoComplete="name"
                  value={form.full_name}
                  onChange={(v) => set("full_name", v)}
                  placeholder="María García"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Correo electrónico *" id="email">
                  <Input
                    id="email" type="email" autoComplete="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    placeholder="maria@ejemplo.com"
                  />
                </Field>
                <Field label="Teléfono *" id="phone">
                  <Input
                    id="phone" type="tel" autoComplete="tel"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    placeholder="3001234567"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Dirección de envío">
              <Field label="Dirección *" id="address">
                <Input
                  id="address" type="text" autoComplete="street-address"
                  value={form.address}
                  onChange={(v) => set("address", v)}
                  placeholder="Calle 10 # 4-55, Apt 201"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ciudad *" id="city">
                  <Input
                    id="city" type="text" autoComplete="address-level2"
                    value={form.city}
                    onChange={(v) => set("city", v)}
                    placeholder="Medellín"
                  />
                </Field>
                <Field label="Departamento *" id="department">
                  <select
                    id="department"
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    className="w-full border border-[#d8cfbb] bg-[#faf7f1] px-3 py-2.5 text-sm text-[#0e0e0e] outline-none focus:border-[#0e0e0e] transition-colors"
                  >
                    <option value="">Seleccionar…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Indicador de courier — RB-CHK-04 */}
              {courierName && (
                <div className="flex items-center gap-2 text-xs text-[#6a6356] bg-[#e8e0c8] px-3 py-2.5">
                  <Truck size={13} />
                  <span>
                    Envío vía <strong className="text-[#0e0e0e]">{courierName}</strong> —{" "}
                    <strong className="text-[#0e0e0e]">{formatCOP(shippingCost)}</strong>
                  </span>
                </div>
              )}
            </Section>

            <Section title="Código de descuento">
              <div className="flex gap-2">
                <Input
                  id="coupon" type="text"
                  value={form.coupon_code ?? ""}
                  onChange={(v) => set("coupon_code", v)}
                  placeholder="Código de cupón"
                />
                <button
                  type="button"
                  className="px-5 py-2.5 border border-[#d8cfbb] text-[11px] tracking-[0.15em] uppercase text-[#6a6356] hover:border-[#0e0e0e] hover:text-[#0e0e0e] transition-colors whitespace-nowrap"
                >
                  Aplicar
                </button>
              </div>
            </Section>

            {/* Términos */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.terms_accepted}
                  onChange={(e) => set("terms_accepted", e.target.checked)}
                  className="mt-0.5 accent-[#0e0e0e]"
                />
                <span className="text-xs text-[#6a6356] leading-relaxed">
                  He leído y acepto los{" "}
                  <Link href="/terminos" target="_blank" className="text-[#b85539] underline underline-offset-2">
                    Términos y Condiciones
                  </Link>
                  , la{" "}
                  <Link href="/privacidad" target="_blank" className="text-[#b85539] underline underline-offset-2">
                    Política de Privacidad
                  </Link>{" "}
                  y autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.save_address ?? false}
                  onChange={(e) => set("save_address", e.target.checked)}
                  className="mt-0.5 accent-[#0e0e0e]"
                />
                <span className="text-xs text-[#6a6356]">
                  Deseo recibir novedades y ofertas por correo electrónico.
                </span>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-[#b85539] bg-[#b85539]/10 border border-[#b85539]/30 px-4 py-3">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#0e0e0e] text-[#faf7f1] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#f0c419] hover:text-[#0e0e0e] disabled:bg-[#d8cfbb] disabled:cursor-not-allowed transition-all duration-300"
            >
              <Lock size={13} strokeWidth={1.5} />
              {submitting ? "Procesando…" : "Continuar al pago"}
            </button>

            <p className="text-[10px] text-center text-[#6a6356] flex items-center justify-center gap-1.5">
              <Lock size={10} /> Pago seguro procesado por Wompi (Bancolombia)
            </p>
          </form>

          {/* ── RESUMEN ── */}
          <div className="lg:col-span-2">
            <div className="bg-[#e8e0c8] border border-[#d8cfbb] p-5 sticky top-24">
              <h2 className="text-[10px] tracking-[0.25em] uppercase text-[#6a6356] font-[600] mb-4">
                Tu pedido ({items.length} {items.length === 1 ? "prenda" : "prendas"})
              </h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between gap-2 text-xs">
                    <span className="text-[#0e0e0e] leading-snug">
                      {item.productName}{" "}
                      <span className="text-[#6a6356]">× {item.quantity}</span>
                    </span>
                    <span className="text-[#0e0e0e] font-[500] shrink-0">
                      {formatCOP(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#d8cfbb] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#6a6356]">
                  <span>Subtotal</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#b85539]">
                    <span>Descuento</span>
                    <span>−{formatCOP(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6a6356]">
                  <span>
                    Envío
                    {courierName && (
                      <span className="block text-[10px] text-[#6a6356]/70">{courierName}</span>
                    )}
                  </span>
                  <span className="text-right">
                    {shippingCost > 0 ? formatCOP(shippingCost) : (
                      <span className="text-xs text-[#6a6356]/70">Ingresa tu ciudad</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-[600] text-[#0e0e0e] text-base pt-1 border-t border-[#d8cfbb]">
                  <span>Total</span>
                  <span>{formatCOP(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[10px] tracking-[0.25em] uppercase text-[#6a6356] font-[600] border-b border-[#d8cfbb] pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-[#6a6356] mb-1.5 font-[500]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  id, type, value, onChange, placeholder, autoComplete,
}: {
  id: string; type: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <input
      id={id} type={type} value={value} autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#d8cfbb] bg-[#faf7f1] px-3 py-2.5 text-sm text-[#0e0e0e] placeholder:text-[#6a6356]/50 outline-none focus:border-[#0e0e0e] transition-colors"
    />
  );
}

function WompiWidget({ data, total }: {
  data: { publicKey: string; currency: string; amountInCents: number; reference: string; redirectUrl: string; integritySignature: string };
  total: number;
}) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mb-6">
        <h2
          className="text-3xl text-[#0e0e0e] mb-2"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          Completa tu pago
        </h2>
        <p className="text-sm text-[#6a6356]">
          Total a pagar: <strong className="text-[#0e0e0e]">{formatCOP(total)}</strong>
        </p>
      </div>

      <form action="https://checkout.wompi.co/p/" method="GET">
        <input type="hidden" name="public-key" value={data.publicKey} />
        <input type="hidden" name="currency" value={data.currency} />
        <input type="hidden" name="amount-in-cents" value={data.amountInCents} />
        <input type="hidden" name="reference" value={data.reference} />
        <input type="hidden" name="redirect-url" value={data.redirectUrl} />
        <input type="hidden" name="signature:integrity" value={data.integritySignature} />

        <button
          type="submit"
          className="w-full py-4 bg-[#0e0e0e] text-[#faf7f1] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#f0c419] hover:text-[#0e0e0e] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Lock size={13} strokeWidth={1.5} />
          Pagar con Wompi
        </button>
      </form>

      <p className="mt-4 text-[10px] text-[#6a6356]">
        Tarjeta de crédito/débito · PSE · Nequi · Daviplata
      </p>
    </div>
  );
}
