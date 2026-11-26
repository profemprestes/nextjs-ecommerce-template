import React from "react";

const sizeGuide = [
  { size: "S", width: "48–50 cm", length: "70–72 cm", height: "1.65–1.73 m" },
  { size: "M", width: "51–53 cm", length: "72–74 cm", height: "1.73–1.80 m" },
  { size: "L", width: "54–56 cm", length: "75–77 cm", height: "1.80–1.86 m" },
  { size: "XL", width: "57–59 cm", length: "77–79 cm", height: "1.86+ m" },
];

const Testimonials = () => {
  return (
    <section id="talles" className="bg-[#F5EAD6] text-[#0A1B33] py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-end">
          <div className="lg:col-span-7 min-w-0">
            <span className="font-mono-cl text-xs uppercase text-[#1E5AA8] block mb-2">
              Guía de medidas
            </span>
            <h2 className="sport-display text-[#0A1B33]">
              Tabla de talles S a XL
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-[#0A1B33]/80">
              Medidas aproximadas en plano. Por encargo trabajamos todos los
              talles y te pasamos medidas exactas por WhatsApp.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border-t-2 border-[#0A1B33]/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="font-mono-cl text-xs uppercase text-[#0A1B33]/70">
                <th className="py-4 px-4 border-b border-[#0A1B33]/20">
                  Talle
                </th>
                <th className="py-4 px-4 border-b border-[#0A1B33]/20">
                  Ancho (axila a axila)
                </th>
                <th className="py-4 px-4 border-b border-[#0A1B33]/20">
                  Largo aproximado
                </th>
                <th className="py-4 px-4 border-b border-[#0A1B33]/20">
                  Altura orientativa
                </th>
              </tr>
            </thead>
            <tbody>
              {sizeGuide.map((row) => (
                <tr key={row.size} className="text-[#0A1B33]">
                  <td className="py-4 px-4 border-b border-[#0A1B33]/15 font-mono-cl text-sm">
                    {row.size}
                  </td>
                  <td className="py-4 px-4 border-b border-[#0A1B33]/15 font-mono-cl text-sm">
                    {row.width}
                  </td>
                  <td className="py-4 px-4 border-b border-[#0A1B33]/15 font-mono-cl text-sm">
                    {row.length}
                  </td>
                  <td className="py-4 px-4 border-b border-[#0A1B33]/15 font-mono-cl text-sm">
                    {row.height}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
