import Link from "next/link";
import { CheckCircle2, Palette, Clock, ArrowRight } from "lucide-react";

interface Props {
  searchParams: Promise<{ numero?: string }>;
}

export default async function ConfiguraExitoPage({ searchParams }: Props) {
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
        ¡Diseño recibido!
      </h1>

      <p className="text-[#6a6356] text-sm leading-relaxed mb-6">
        Tu diseño fue enviado a María José para revisión.
        {numero && (
          <>
            {" "}Tu número de referencia es{" "}
            <span className="font-[600] text-[#0e0e0e]">{numero}</span>.
          </>
        )}
      </p>

      {/* Próximos pasos */}
      <div className="text-left border border-[#d8cfbb] divide-y divide-[#d8cfbb] mb-8">
        <div className="flex items-start gap-4 px-5 py-4">
          <Palette size={18} strokeWidth={1.5} className="text-[#f0c419] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-[500] text-[#0e0e0e]">María José revisa tu diseño</p>
            <p className="text-xs text-[#6a6356] mt-0.5">
              Revisamos cada diseño con cuidado para garantizar la mejor producción.
              Si necesitamos ajustes, te lo informamos.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 px-5 py-4">
          <Clock size={18} strokeWidth={1.5} className="text-[#f0c419] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-[500] text-[#0e0e0e]">Respuesta en menos de 24 horas</p>
            <p className="text-xs text-[#6a6356] mt-0.5">
              Recibirás un correo con la aprobación del diseño, el precio final y el link de pago.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 px-5 py-4">
          <ArrowRight size={18} strokeWidth={1.5} className="text-[#f0c419] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-[500] text-[#0e0e0e]">Pagas y entra a producción</p>
            <p className="text-xs text-[#6a6356] mt-0.5">
              Una vez aprobado y pagado, tu camiseta personalizada entra a maquila.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 text-sm font-[500] tracking-[0.1em] uppercase bg-[#0e0e0e] text-[#faf7f1] hover:bg-[#f0c419] hover:text-[#0e0e0e] transition-colors"
        >
          Volver al inicio
        </Link>
        <Link
          href="/cotiza"
          className="px-6 py-3 text-sm font-[500] tracking-[0.1em] uppercase border border-[#d8cfbb] text-[#6a6356] hover:border-[#0e0e0e] hover:text-[#0e0e0e] transition-colors"
        >
          Solicitar cotización manual
        </Link>
      </div>
    </div>
  );
}
