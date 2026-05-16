import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Ricamo",
};

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <span className="text-[10px] tracking-[0.3em] uppercase text-[#b85539] font-[500]">Legal</span>
      <h1
        className="text-4xl text-[#0e0e0e] mt-2 mb-10"
        style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
      >
        Términos y Condiciones
      </h1>

      <div className="prose prose-sm max-w-none text-[#4a4036] leading-relaxed space-y-8">
        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">1. Generalidades</h2>
          <p>
            Al acceder y usar el sitio web de <strong>Ricamo</strong> (ricamo.co), aceptas estos términos
            y condiciones en su totalidad. Si no estás de acuerdo con alguno de sus términos, por favor
            abstente de usar este sitio.
          </p>
          <p>
            Ricamo es una marca colombiana de camisetas temáticas para festivales y eventos culturales,
            operada por María José Rivero con sede en Colombia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">2. Productos y pedidos</h2>
          <p>
            Ricamo ofrece tres tipos de productos: camisetas de catálogo (entrega inmediata o bajo demanda),
            camisetas configuradas a través de nuestro configurador visual, y camisetas personalizadas
            por cotización.
          </p>
          <p>
            Los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplique.
            Ricamo se reserva el derecho de modificar precios sin previo aviso.
          </p>
          <p>
            Las imágenes de productos son referenciales. Pequeñas variaciones de color pueden existir
            según la calibración de tu pantalla.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">3. Pagos</h2>
          <p>
            Los pagos se procesan a través de <strong>Wompi</strong>, plataforma certificada PCI-DSS.
            Ricamo no almacena datos de tarjetas de crédito o débito.
          </p>
          <p>
            Para productos bajo demanda y personalizados, se genera un link de pago único. El pedido
            se activa únicamente al confirmar el pago exitoso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">4. Envíos</h2>
          <p>
            Los envíos se realizan a todo Colombia a través de Coordinadora o Interrapidísimo según
            la ciudad de destino. Los tiempos de entrega son estimados y pueden variar por condiciones
            externas al control de Ricamo.
          </p>
          <p>
            Los tiempos de producción para productos bajo demanda y personalizados no incluyen el tiempo
            de tránsito del courier.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">5. Devoluciones y cambios</h2>
          <p>
            Los productos del catálogo con defecto de fabricación pueden ser devueltos dentro de los 5
            días calendario siguientes a la recepción. Consulta nuestra{" "}
            <a href="/devoluciones" className="text-[#b85539] underline">política de devoluciones</a>{" "}
            para más detalle.
          </p>
          <p>
            Los productos personalizados (configurados o por cotización) <strong>no admiten devolución</strong>{" "}
            salvo defecto de fabricación, por su naturaleza hecha a medida.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">6. Propiedad intelectual</h2>
          <p>
            Todos los diseños, imágenes, textos y contenidos de Ricamo son propiedad exclusiva de la
            marca. Está prohibida su reproducción total o parcial sin autorización escrita.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">7. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos términos, escríbenos a{" "}
            <a href="mailto:hola@ricamo.co" className="text-[#b85539] underline">hola@ricamo.co</a>.
          </p>
        </section>

        <p className="text-xs text-[#897568] border-t border-[#e8e0c8] pt-6">
          Última actualización: mayo 2026. Ricamo se reserva el derecho de modificar estos términos en
          cualquier momento. Los cambios entran en vigor al publicarse en este sitio.
        </p>
      </div>
    </div>
  );
}
