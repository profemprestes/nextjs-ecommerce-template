import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-[#F5F5F7] text-[#1D1D1F] pt-20 pb-12 lg:pt-24 lg:pb-16">
      <div className="container flex flex-col items-center text-center">
        <span className="font-mono-cl text-xs uppercase text-[#6E6E73] mb-3">
          Montevideo · Envíos a los 19 departamentos · Desde $ 1.690 UYU
        </span>

        <h1 className="sport-display text-[#1D1D1F] mb-3 mx-auto">
          Fútbol en la Piel
        </h1>

        <p className="lead text-[#6E6E73] mb-6 mx-auto">
          Camisetas actuales, Mundial 2026 y ediciones retro en Uruguay, con
          entrega inmediata y envíos a todo el país.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link href="/shop-with-sidebar" className="sport-btn-primary">
            Explorar catálogo
          </Link>
          <Link href="/checkout" className="sport-btn-secondary">
            Consultar WhatsApp
          </Link>
        </div>

        {/* Product-tile whiteout triptych: flat 0px radius, zero shadows, zero overlaid text */}
        <div className="w-full grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[380px] lg:h-[430px] rounded-none overflow-hidden bg-[#FFFFFF]">
            <Image
              src="/catalogo/uruguay-2026_post1_01.jpg"
              alt="Camiseta Uruguay 2026"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>

          <div className="hidden md:block relative h-[380px] lg:h-[430px] rounded-none overflow-hidden bg-[#FFFFFF]">
            <Image
              src="/catalogo/noruega-2026_braut-haaland-9_post1_01.jpg"
              alt="Camiseta Noruega 2026 Haaland #9"
              fill
              sizes="25vw"
              loading="eager"
              className="object-cover"
            />
          </div>

          <div className="hidden md:block relative h-[380px] lg:h-[430px] rounded-none overflow-hidden bg-[#FFFFFF]">
            <Image
              src="/catalogo/manchester-united-1996_cantona-7_post1_01.jpg"
              alt="Camiseta Manchester United Retro 1996 Cantona #7"
              fill
              sizes="25vw"
              loading="eager"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
