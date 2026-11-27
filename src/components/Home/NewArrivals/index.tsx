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
    <section className="bg-[#FFFFFF] text-[#1D1D1F] py-14 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[460px] rounded-none overflow-hidden bg-[#F5F5F7]">
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
            <span className="font-mono-cl text-xs uppercase text-[#6E6E73] block mb-3">
              Confección y calce
            </span>
            <h2 className="sport-display text-[#1D1D1F] mb-5">
              Versiones y confección
            </h2>
            <p className="text-[#6E6E73] mb-8 max-w-[58ch]">
              En Versión Jugador trabajamos confecciones de calidad muy alta con
              telas técnicas y detalles fieles. Confirmamos stock y precio final
              por WhatsApp antes de coordinar el pago.
            </p>

            <div className="border-t border-black/15">
              {versions.map((v) => (
                <div
                  key={v.name}
                  className="border-b border-black/10 py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline"
                >
                  <div className="sm:col-span-8 min-w-0 flex gap-4">
                    <span className="font-mono-cl text-xs text-[#6E6E73] pt-1.5 shrink-0">
                      {v.index}
                    </span>
                    <div>
                      <h3 className="sport-display text-[#1D1D1F] mb-2">
                        {v.name}
                      </h3>
                      <p className="text-sm text-[#6E6E73]">{v.detail}</p>
                    </div>
                  </div>
                  <div className="sm:col-span-4 sm:text-right">
                    <span className="font-mono-cl text-lg text-[#1D1D1F]">
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
