import React from "react";

const steps = [
  {
    number: "01",
    title: "Elegí modelo, versión y talle",
    description:
      "Explorá el catálogo en stock inmediato (talles S a XL) o consultanos por modelos y talles por encargo.",
  },
  {
    number: "02",
    title: "Enviá tu consulta FEP-XXXX",
    description:
      "Armá tu selección y mandá el mensaje prearmado por WhatsApp. Confirmamos disponibilidad y precio final antes de cualquier pago.",
  },
  {
    number: "03",
    title: "Coordiná pago y entrega",
    description:
      "Pagás por transferencia bancaria, Mercado Pago o efectivo. Entregamos en Montevideo y despachamos por DAC, Mirtrans o Correo Uruguayo a los 19 departamentos.",
  },
];

const sizeGuide = [
  { size: "S", width: "48–50 cm", length: "70–72 cm", height: "1.65–1.73 m" },
  { size: "M", width: "51–53 cm", length: "72–74 cm", height: "1.73–1.80 m" },
  { size: "L", width: "54–56 cm", length: "75–77 cm", height: "1.80–1.86 m" },
  { size: "XL", width: "57–59 cm", length: "77–79 cm", height: "1.86+ m" },
];

const Testimonials = () => {
  return (
    <section id="guia-compra" className="overflow-hidden pb-16.5 pt-4">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Cómo pedir en 3 pasos */}
        <div className="mb-10">
          <span className="block font-medium text-blue mb-1.5">
            Sin cobro automático en la web
          </span>
          <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
            Cómo pedir tu camiseta en 3 pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7.5 mb-15">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-[10px] border border-gray-3 p-6 sm:p-7.5 shadow-1"
            >
              <span className="inline-block font-semibold text-sm text-blue bg-blue-light-5 px-3 py-1 rounded mb-4">
                Paso {step.number}
              </span>
              <h3 className="font-semibold text-lg text-dark mb-2.5">
                {step.title}
              </h3>
              <p className="text-custom-sm text-body leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Guía de talles S a XL */}
        <div
          id="talles"
          className="bg-meta rounded-[10px] border border-gray-3 p-6 sm:p-8.5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-xl text-dark mb-1">
                Guía de talles orientativa (medidas en plano)
              </h3>
              <p className="text-custom-sm text-body">
                En Versión Jugador (corte entallado), si dudás entre dos talles,
                pedí un talle más. Por encargo conseguimos todos los talles.
              </p>
            </div>
            <a
              href="https://wa.me/59899760998?text=Hola%20F%C3%BAtbol%20en%20la%20Piel!%20Necesito%20ayuda%20para%20elegir%20mi%20talle."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex font-medium text-custom-sm text-white bg-dark py-2.5 px-6 rounded-md hover:bg-blue ease-out duration-200"
            >
              Consultar medidas exactas
            </a>
          </div>

          <div className="overflow-x-auto bg-white rounded-md border border-gray-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-3 bg-gray-1 text-dark text-custom-sm font-medium">
                  <th className="py-3.5 px-5">Talle</th>
                  <th className="py-3.5 px-5">Ancho (axila a axila)</th>
                  <th className="py-3.5 px-5">Largo aproximado</th>
                  <th className="py-3.5 px-5">Altura orientativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3 text-custom-sm">
                {sizeGuide.map((row) => (
                  <tr key={row.size}>
                    <td className="py-3 px-5 font-semibold text-dark">
                      {row.size}
                    </td>
                    <td className="py-3 px-5">{row.width}</td>
                    <td className="py-3 px-5">{row.length}</td>
                    <td className="py-3 px-5">{row.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
