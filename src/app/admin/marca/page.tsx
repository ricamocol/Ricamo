export default function AdminMarcaPage() {
  return (
    <div>
      <h1
        className="text-3xl text-[#3D2B1F] mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Marca personal
      </h1>
      <p className="text-sm text-[#897568] mb-6">
        Gestión de la página de María José, lookbook y feeds embebidos — RB-MARCA-01
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "Historia y manifiesto",
            desc: "Edita el texto de presentación, bio y manifiesto de marca de María José.",
            soon: false,
          },
          {
            title: "Lookbook editorial",
            desc: "Gestiona las fotos del lookbook shoppable vinculadas a productos del catálogo.",
            soon: false,
          },
          {
            title: "Feed de Instagram",
            desc: "Configura el embed oficial de Instagram para el home.",
            soon: true,
          },
          {
            title: "Feed de TikTok",
            desc: "Configura el embed oficial de TikTok para el home.",
            soon: true,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white border border-[#DDD5C4] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-[500] text-[#3D2B1F]">{item.title}</h2>
                <p className="text-xs text-[#897568] mt-1">{item.desc}</p>
              </div>
              {item.soon && (
                <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 uppercase tracking-wide font-[600] flex-shrink-0 ml-3">
                  Próximamente
                </span>
              )}
            </div>
            {!item.soon && (
              <button className="mt-4 text-xs font-[500] text-[#B5888A] hover:text-[#3D2B1F] transition-colors">
                Editar →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
