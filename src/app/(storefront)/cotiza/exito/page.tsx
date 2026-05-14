import Link from "next/link";
import { CheckCircle2, MessageCircle, Clock, ArrowRight } from "lucide-react";

interface Props {
  searchParams: Promise<{ numero?: string }>;
}

export default async function CotizaExitoPage({ searchParams }: Props) {
  const { numero } = await searchParams;

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      {/* Icono */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-[#f0c419] flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#0e0e0e]" strokeWidth={1.5} />
        </div>
      </div>

      <h1
        className="text-3xl text-[#0e0e0e] mb-3"
        style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
      >
        ¡Solicitud recibida!
      </h1>

      <p className="text-[#6a6356] text-sm leading-relaxed mb-6">
        Recibimos tu solicitud de cotización.
        {numero && (
          <>
            {" "}Tu número de referencia es{" "}
            <span className="font-[600] text-[#0e0e0e]">{numero}</span>.
          </>
        )}
      </p>

      {/* Pasos siguientes */}
      <div className="text-left border border-[#d8cfbb] divide-y divide-[#d8cfbb] mb-8">
        <div className="flex items-start gap-4 px-5 py-4">
          <Clock size={18} strokeWidth={1.5} className="text-[#f0c419] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-[500] text-[#0e0e0e]">Revisamos tu diseño</p>
            <p className="text-xs text-[#6a6356] mt-0.5">
              María José revisará los detalles que enviaste y preparará una propuesta personalizada.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 px-5 py-4">
          <MessageCircle size={18} strokeWidth={1.5} className="text-[#f0c419] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-[500] text-[#0e0e0e]">Te contactamos en 24 horas</p>
            <p className="text-xs text-[#6a6356] mt-0.5">
              Recibirás un correo con el precio, tiempo de producción y opciones de pago.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 px-5 py-4">
          <ArrowRight size={18} strokeWidth={1.5} className="text-[#f0c419] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-[500] text-[#0e0e0e]">Apruebas y pagas</p>
            <p className="text-xs text-[#6a6356] mt-0.5">
              Una vez apruebes la cotización, recibes un link de pago seguro para confirmar tu pedido.
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 text-sm font-[500] tracking-[0.1em] uppercase bg-[#0e0e0e] text-[#faf7f1] hover:bg-[#f0c419] hover:text-[#0e0e0e] transition-colors"
        >
          Volver al inicio
        </Link>
        <Link
          href="/catalogo"
          className="px-6 py-3 text-sm font-[500] tracking-[0.1em] uppercase border border-[#d8cfbb] text-[#6a6356] hover:border-[#0e0e0e] hover:text-[#0e0e0e] transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
