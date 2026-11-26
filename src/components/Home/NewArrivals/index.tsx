import React from "react";
import Image from "next/image";

const versions = [
  {
    name: "Versión Jugador",
    price: "Desde $ 1.990",
    detail:
      "Corte entallado (slim fit en pecho y cintura), tela técnica respirable y escudo termosellado. Si dudás entre dos talles o la preferís holgada, pedí un talle más.",
  },
  {
    name: "Versión Fan",
    price: "Desde $ 1.690",
    detail:
      "Calce clásico (regular fit, igual a una remera habitual), tela resistente para uso urbano o estadio y escudo bordado.",
  },
  {
    name: "Edición Retro",
    price: "Desde $ 1.890",
    detail:
      "Clásicos históricos (1988–2018) con etiquetas y dorsales icónicos como Cantona #7, Baggio #10 o Ronaldo #9.",
  },
];

const NewArrival = () => {
  return (
    <section className="bg-[var(--color-paper-2)] sport-rule-bar py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative h-[380px] sm:h-[460px] sport-photo overflow-hidden bg-[var(--color-paper)]">
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
            <h2 className="sport-display text-[var(--color-ink)] mb-6">
              Versiones y confección
            </h2>
            <p className="text-[var(--color-ink-2)] mb-8 max-w-[58ch]">
              En Versión Jugador trabajamos confecciones de calidad muy alta con
              telas técnicas y detalles fieles. Confirmamos stock y precio final
              por WhatsApp antes de coordinar el pago.
            </p>

            <div className="sport-rule-bar">
              {versions.map((v) => (
                <div
                  key={v.name}
                  className="sport-rule-hair py-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-baseline"
                >
                  <div className="sm:col-span-7 min-w-0">
                    <h3 className="sport-display text-[var(--color-ink)] mb-2">
                      {v.name}
                    </h3>
                    <p className="text-sm text-[var(--color-ink-2)]">
                      {v.detail}
                    </p>
                  </div>
                  <div className="sm:col-span-5 sm:text-right">
                    <span className="sport-mono text-xl text-[var(--color-ink)]">
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
