"use client";
import React, { useState } from "react";
import Image from "next/image";

const versions = [
  {
    key: "jugador",
    name: "Versión Jugador",
    price: "Desde $ 1.990",
    detail:
      "Corte entallado en pecho y cintura, tela técnica respirable y escudo termosellado. Si dudás entre dos talles o la preferís holgada, pedí un talle más.",
    img: "/catalogo/uruguay-2026_post1_02.jpg",
    alt: "Detalle de la camiseta de Uruguay 2026, Versión Jugador",
  },
  {
    key: "fan",
    name: "Versión Fan",
    price: "Desde $ 1.690",
    detail:
      "Calce clásico, igual a una remera de todos los días. Tela resistente para la calle o la tribuna y escudo bordado.",
    img: "/catalogo/liverpool-2026_araujo-33_version-fan_post1_01.jpg",
    alt: "Camiseta de Liverpool 2026 de Araujo, Versión Fan",
  },
  {
    key: "retro",
    name: "Edición Retro",
    price: "Desde $ 1.890",
    detail:
      "Clásicos de 1988 a 2018 con etiquetas y dorsales históricos, como Cantona 7, Baggio 10 o Ronaldo 9.",
    img: "/catalogo/penarol-1998_10_post1_01.jpg",
    alt: "Camiseta retro de Peñarol 1998 con el 10",
  },
];

const NewArrival = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-white text-noche py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[22px] overflow-hidden bg-[var(--field-deep)]">
              {versions.map((v, idx) => (
                <Image
                  key={v.key}
                  src={v.img}
                  alt={v.alt}
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  aria-hidden={idx !== active}
                  className={`object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out)] ${
                    idx === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <h2 className="fep-display text-[clamp(2.5rem,5.5vw,4.5rem)] text-noche mb-4">
              ¿Jugador, Fan o Retro?
            </h2>
            <p className="text-grada mb-8 max-w-[52ch]">
              Cambian el corte, la tela y el escudo. Tocá cada versión para verla
              de cerca. El precio final lo confirmamos por WhatsApp antes de que
              pagues.
            </p>

            <div className="border-t border-[var(--border)]">
              {versions.map((v, idx) => {
                const isActive = idx === active;
                return (
                  <button
                    key={v.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(idx)}
                    onMouseEnter={() => setActive(idx)}
                    onFocus={() => setActive(idx)}
                    className="group relative w-full text-left border-b border-[var(--border)] py-6 pl-5 pr-1 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-celeste origin-top transition-transform duration-500 ease-[var(--ease-spring)] ${
                        isActive ? "scale-y-100" : "scale-y-0"
                      }`}
                    />
                    <span className="sm:col-span-8 min-w-0">
                      <span
                        className={`fep-display block text-[clamp(1.75rem,3vw,2.5rem)] mb-2 transition-colors duration-300 ${
                          isActive ? "text-noche" : "text-noche/45 group-hover:text-noche/70"
                        }`}
                      >
                        {v.name}
                      </span>
                      <span className="block text-sm leading-relaxed text-grada max-w-[56ch]">
                        {v.detail}
                      </span>
                    </span>
                    <span className="sm:col-span-4 sm:text-right text-lg font-semibold tabular-nums text-noche">
                      {v.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
