import React from "react";

const sizeGuide = [
  { size: "S", width: "48–50 cm", length: "70–72 cm", height: "1.65–1.73 m" },
  { size: "M", width: "51–53 cm", length: "72–74 cm", height: "1.73–1.80 m" },
  { size: "L", width: "54–56 cm", length: "75–77 cm", height: "1.80–1.86 m" },
  { size: "XL", width: "57–59 cm", length: "77–79 cm", height: "1.86+ m" },
];

const Testimonials = () => {
  return (
    <section
      id="talles"
      className="bg-[var(--color-paper-2)] sport-rule-bar py-16 lg:py-24"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-end">
          <div className="lg:col-span-7 min-w-0">
            <h2 className="sport-display text-[var(--color-ink)]">
              Tabla de talles S a XL
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-[var(--color-ink-2)]">
              Medidas aproximadas en plano. Por encargo trabajamos todos los
              talles y te pasamos medidas exactas por WhatsApp.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-[var(--color-paper)] sport-rule-bar border-b-2 border-[var(--color-rule-2)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm font-medium text-[var(--color-muted)]">
                <th className="py-4 px-5 border-t border-[var(--color-rule)]">
                  Talle
                </th>
                <th className="py-4 px-5 border-t border-[var(--color-rule)]">
                  Ancho (axila a axila)
                </th>
                <th className="py-4 px-5 border-t border-[var(--color-rule)]">
                  Largo aproximado
                </th>
                <th className="py-4 px-5 border-t border-[var(--color-rule)]">
                  Altura orientativa
                </th>
              </tr>
            </thead>
            <tbody>
              {sizeGuide.map((row) => (
                <tr key={row.size} className="text-[var(--color-ink)]">
                  <td className="py-4 px-5 border-t border-[var(--color-rule)] font-semibold">
                    {row.size}
                  </td>
                  <td className="py-4 px-5 border-t border-[var(--color-rule)] sport-mono">
                    {row.width}
                  </td>
                  <td className="py-4 px-5 border-t border-[var(--color-rule)] sport-mono">
                    {row.length}
                  </td>
                  <td className="py-4 px-5 border-t border-[var(--color-rule)] sport-mono">
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
