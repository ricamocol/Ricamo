import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Devoluciones — Ricamo",
};

export default function DevolucionesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <span className="text-[10px] tracking-[0.3em] uppercase text-[#b85539] font-[500]">Legal</span>
      <h1
        className="text-4xl text-[#0e0e0e] mt-2 mb-10"
        style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
      >
        Política de Devoluciones
      </h1>

      <div className="prose prose-sm max-w-none text-[#4a4036] leading-relaxed space-y-8">
        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">Productos de catálogo</h2>
          <p>
            Aceptamos devoluciones de productos del catálogo (pre-producidos) únicamente en los
            siguientes casos dentro de los <strong>5 días calendario</strong> siguientes a la recepción:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Defecto de fabricación comprobable</li>
            <li>Error en el pedido (talla o diseño diferente al solicitado)</li>
            <li>Producto dañado durante el envío</li>
          </ul>
          <p className="mt-3">
            El producto debe estar sin usar, con etiquetas originales y en su empaque original.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">Productos personalizados</h2>
          <p>
            Las camisetas diseñadas a través del configurador o por cotización personalizada{" "}
            <strong>no admiten devolución ni cambio</strong> por su naturaleza hecha a medida,
            salvo defecto de fabricación comprobable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">Proceso de devolución</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Escríbenos a{" "}
              <a href="mailto:hola@ricamo.co" className="text-[#b85539] underline">hola@ricamo.co</a>{" "}
              con tu número de pedido y fotos del defecto o error.
            </li>
            <li>
              Nuestro equipo revisará tu solicitud en un plazo máximo de 2 días hábiles.
            </li>
            <li>
              Si procede, te indicaremos la dirección de envío para devolver el producto.
              El costo de envío de la devolución estará a cargo de Ricamo en caso de error
              nuestro, o del cliente en caso de cambio de talla por preferencia.
            </li>
            <li>
              Una vez recibido y verificado el producto, procesaremos el cambio o reembolso
              en un plazo de 5 días hábiles.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">Reembolsos</h2>
          <p>
            Los reembolsos se procesan por el mismo medio de pago original. Los tiempos dependen
            de tu banco o proveedor de pago (habitualmente 5–10 días hábiles).
          </p>
        </section>

        <div className="bg-[#faf7f1] border border-[#e8e0c8] p-5">
          <p className="text-sm font-[500] text-[#0e0e0e]">¿Tienes dudas?</p>
          <p className="text-sm text-[#6a6356] mt-1">
            Escríbenos antes de hacer cualquier envío. Estamos aquí para ayudarte.
          </p>
          <Link
            href="mailto:hola@ricamo.co"
            className="inline-block mt-3 text-[11px] tracking-[0.15em] uppercase text-[#b85539] font-[600] hover:underline"
          >
            hola@ricamo.co
          </Link>
        </div>
      </div>
    </div>
  );
}
