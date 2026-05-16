import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Ricamo",
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <span className="text-[10px] tracking-[0.3em] uppercase text-[#b85539] font-[500]">Legal</span>
      <h1
        className="text-4xl text-[#0e0e0e] mt-2 mb-10"
        style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
      >
        Política de Privacidad
      </h1>

      <div className="prose prose-sm max-w-none text-[#4a4036] leading-relaxed space-y-8">
        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">1. Responsable del tratamiento</h2>
          <p>
            <strong>Ricamo</strong>, con correo de contacto{" "}
            <a href="mailto:hola@ricamo.co" className="text-[#b85539] underline">hola@ricamo.co</a>,
            es responsable del tratamiento de los datos personales recopilados a través de este sitio,
            conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">2. Datos que recopilamos</h2>
          <p>Recopilamos la siguiente información cuando realizas una compra o te registras:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío</li>
            <li>Historial de pedidos</li>
          </ul>
          <p className="mt-3">
            También recopilamos datos de navegación (cookies, dirección IP, páginas visitadas) con
            fines de analítica y mejora del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">3. Finalidades del tratamiento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Procesar y gestionar tus pedidos</li>
            <li>Enviarte actualizaciones sobre el estado de tu pedido</li>
            <li>Brindarte atención al cliente</li>
            <li>Mejorar nuestros productos y servicios</li>
            <li>Enviarte comunicaciones de marketing si nos lo autorizas expresamente</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">4. Compartición con terceros</h2>
          <p>
            Ricamo comparte datos con terceros únicamente cuando es estrictamente necesario para
            operar el negocio:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Wompi</strong> — procesamiento de pagos</li>
            <li><strong>Coordinadora / Interrapidísimo</strong> — logística de envíos</li>
            <li><strong>Resend</strong> — envío de correos transaccionales</li>
            <li><strong>Supabase</strong> — almacenamiento seguro de datos</li>
          </ul>
          <p className="mt-3">No vendemos ni arrendamos tus datos personales a terceros.</p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">5. Tus derechos (ARCO)</h2>
          <p>
            Conforme a la ley colombiana, tienes derecho a Acceder, Rectificar, Cancelar y Oponerte
            al tratamiento de tus datos personales. Para ejercer estos derechos, escríbenos a{" "}
            <a href="mailto:hola@ricamo.co" className="text-[#b85539] underline">hola@ricamo.co</a>{" "}
            indicando tu solicitud y número de pedido o correo registrado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">6. Cookies</h2>
          <p>
            Usamos cookies propias (sesión, carrito) y de terceros (Google Analytics, Meta Pixel)
            para mejorar tu experiencia y medir el rendimiento de nuestras campañas. Puedes deshabilitar
            las cookies en la configuración de tu navegador, aunque esto puede afectar algunas
            funcionalidades del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-[600] text-[#0e0e0e] mb-3">7. Seguridad</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo
            cifrado en tránsito (HTTPS), control de acceso por roles y auditoría de cambios.
            Ningún sistema es 100% seguro; si detectas alguna vulnerabilidad, escríbenos de inmediato.
          </p>
        </section>

        <p className="text-xs text-[#897568] border-t border-[#e8e0c8] pt-6">
          Última actualización: mayo 2026. Nos reservamos el derecho de actualizar esta política.
          Los cambios se publican en esta página con la fecha de vigencia correspondiente.
        </p>
      </div>
    </div>
  );
}
