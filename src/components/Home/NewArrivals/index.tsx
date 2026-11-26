import React from "react";
import Image from "next/image";

const versions = [
  {
    index: "01",
    name: "Versión Jugador",
    price: "Desde $ 1.990",
    detail:
      "Corte entallado (slim fit en pecho y cintura), tela técnica respirable y escudo termosellado. Si dudás entre dos talles o la preferís holgada, pedí un talle más.",
  },
  {
    index: "02",
    name: "Versión Fan",
    price: "Desde $ 1.690",
    detail:
      "Calce clásico (regular fit, igual a una remera habitual), tela resistente para uso urbano o estadio y escudo bordado.",
  },
  {
    index: "03",
    name: "Edición Retro",
    price: "Desde $ 1.890",
    detail:
      "Clásicos históricos (1988–2018) con etiquetas y dorsales icónicos como Cantona #7, Baggio #10 o Ronaldo #9.",
  },
];

const NewArrival = () => {
  return (
    <section className="bg-[#F5EAD6] text-[#0A1B33] py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[460px] rounded-[22px] overflow-hidden border border-[#0A1B33]/15 bg-[#0A1B33]/5 shadow-[0_30px_70px_-35px_rgba(7,15,28,0.35)]">
              <Image
                src="/catalogo/uruguay-2026_post1_02.jpg"
                alt="Detalle de camiseta Uruguay 2026"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <span className="font-mono-cl text-xs uppercase text-[#1E5AA8] block mb-3">
              Confección y calce
            </span>
            <h2 className="sport-display text-[#0A1B33] mb-5">
              Versiones y confección
            </h2>
            <p className="text-[#0A1B33]/80 mb-8 max-w-[58ch]">
              En Versión Jugador trabajamos confecciones de calidad muy alta con
              telas técnicas y detalles fieles. Confirmamos stock y precio final
              por WhatsApp antes de coordinar el pago.
            </p>

            <div className="border-t border-[#0A1B33]/20">
              {versions.map((v) => (
                <div
                  key={v.name}
                  className="border-b border-[#0A1B33]/20 py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline"
                >
                  <div className="sm:col-span-8 min-w-0 flex gap-4">
                    <span className="font-mono-cl text-xs text-[#1E5AA8] pt-1.5 shrink-0">
                      {v.index}
                    </span>
                    <div>
                      <h3 className="sport-display text-[#0A1B33] mb-2">
                        {v.name}
                      </h3>
                      <p className="text-sm text-[#0A1B33]/80">{v.detail}</p>
                    </div>
                  </div>
                  <div className="sm:col-span-4 sm:text-right">
                    <span className="font-mono-cl text-lg text-[#0A1B33]">
                      {v.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
