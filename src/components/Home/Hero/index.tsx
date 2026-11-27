import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

const JERSEYS = {
  uruguay: {
    src: "/catalogo/uruguay-2026_post1_01.jpg",
    alt: "Camiseta alternativa de Uruguay 2026",
  },
  penarol: {
    src: "/catalogo/penarol-1998_10_post1_01.jpg",
    alt: "Camiseta retro de Peñarol 1998",
  },
  nacional: {
    src: "/catalogo/nacional-2026_post1_01.jpg",
    alt: "Camiseta de Nacional 2026",
  },
};

const cssVars = (vars: Record<string, number>) =>
  vars as unknown as React.CSSProperties;

/** Jersey photo set inline in the headline at cap height (desktop/tablet). */
const Chip = ({ src, order }: { src: string; order: number }) => (
  <span
    aria-hidden="true"
    className="fep-chip hidden sm:inline-block"
    style={cssVars({ "--c": order })}
  >
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1024px) 220px, 140px"
      loading="eager"
      className="object-cover"
    />
  </span>
);

const Hero = ({ products }: { products: Product[] }) => {
  const total = products.length;
  const immediate = products.filter(
    (p) => p.modalidad === "entrega_inmediata"
  ).length;

  return (
    <section className="bg-tiza text-noche pt-24 pb-12 lg:pt-32 lg:pb-16">
      <div className="container">
        <h1 className="fep-hero-title">
          <span className="fep-line">
            <span style={cssVars({ "--i": 0 })}>
              La pasión <Chip src={JERSEYS.uruguay.src} order={0} />
            </span>
          </span>
          <span className="fep-line">
            <span style={cssVars({ "--i": 1 })}>
              se lleva <Chip src={JERSEYS.penarol.src} order={1} />
              <Chip src={JERSEYS.nacional.src} order={2} />
            </span>
          </span>
          <span className="fep-line">
            <span style={cssVars({ "--i": 2 })}>puesta.</span>
          </span>
        </h1>

        {/* Mobile: the inline photos stack below the headline */}
        <div className="sm:hidden mt-6 grid grid-cols-3 gap-2">
          {Object.values(JERSEYS).map((j, idx) => (
            <div
              key={j.src}
              className="fep-chip relative! block! w-full! h-auto! aspect-[3/4] rounded-xl!"
              style={cssVars({ "--c": idx })}
            >
              <Image
                src={j.src}
                alt={j.alt}
                fill
                sizes="33vw"
                loading="eager"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="fep-late mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 md:items-end">
          <p className="md:col-span-6 text-[1.0625rem] lg:text-lg leading-relaxed text-grada max-w-[46ch]">
            Camisetas de la Celeste, de clubes de acá y de afuera, y retros que
            marcaron época. Confirmamos talle y stock por WhatsApp y enviamos a
            los 19 departamentos.
          </p>

          <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 flex flex-col sm:flex-row md:justify-end items-start sm:items-center gap-4 sm:gap-6">
            {total > 0 && (
              <p className="text-sm text-grada max-w-[28ch] tabular-nums">
                {immediate > 0
                  ? `${immediate} modelos con entrega inmediata, de ${total} en catálogo.`
                  : `${total} modelos en catálogo.`}
              </p>
            )}
            <Link href="/shop-with-sidebar" className="fep-btn">
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
