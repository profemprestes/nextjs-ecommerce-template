import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative bg-[#0A1B33] pt-24 pb-14 lg:pt-28 lg:pb-20 min-h-[100dvh] flex flex-col justify-between overflow-hidden">
      {/* Nocturnal floodlight backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(19,44,82,0.85)_0%,rgba(10,27,51,0)_72%)]"
      />

      <div className="container relative z-10 flex-1 flex flex-col justify-between gap-8">
        {/* Corner-anchored brand kicker */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono-cl text-xs uppercase text-[#A8D6F0]">
            Montevideo · Envíos a los 19 departamentos
          </span>
          <span className="font-mono-cl text-xs uppercase text-[#B8C7DC]">
            @futbolenlapieluy1
          </span>
        </div>

        {/* True-color photographic triptych — zero text overlaid on photos */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[380px] lg:h-[430px] rounded-[20px] overflow-hidden border border-[rgba(245,234,214,0.18)] bg-[#102442] shadow-[0_30px_70px_-35px_rgba(7,15,28,0.78)]">
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

          <div className="hidden md:block relative h-[380px] lg:h-[430px] rounded-[20px] overflow-hidden border border-[rgba(245,234,214,0.18)] bg-[#102442] shadow-[0_30px_70px_-35px_rgba(7,15,28,0.78)]">
            <Image
              src="/catalogo/noruega-2026_braut-haaland-9_post1_01.jpg"
              alt="Camiseta Noruega 2026 Haaland #9"
              fill
              sizes="25vw"
              loading="eager"
              className="object-cover"
            />
          </div>

          <div className="hidden md:block relative h-[380px] lg:h-[430px] rounded-[20px] overflow-hidden border border-[rgba(245,234,214,0.18)] bg-[#102442] shadow-[0_30px_70px_-35px_rgba(7,15,28,0.78)]">
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

        {/* Editorial display headline + offer + pill CTA pair */}
        <div className="sport-rule-bar pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7 min-w-0">
            <h1 className="sport-display text-[#F5EAD6] mb-3">
              Fútbol en la Piel
            </h1>
            <p className="lead text-[#B8C7DC]">
              Camisetas actuales, Mundial 2026 y ediciones retro en Uruguay, con
              entrega inmediata y envíos a todo el país.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col lg:items-end gap-4">
            <p className="font-mono-cl text-xl text-[#A8D6F0]">
              Desde $ 1.690 UYU
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop-with-sidebar" className="sport-btn-primary">
                Explorar catálogo
              </Link>
              <Link href="/checkout" className="sport-btn-secondary">
                Consultar WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
