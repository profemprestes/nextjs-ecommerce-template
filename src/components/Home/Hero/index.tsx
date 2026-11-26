import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-[var(--color-paper)] pt-6 pb-10 lg:pt-8 lg:pb-12">
      <div className="container">
        {/* Photographic triptych */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 mb-6 lg:mb-8">
          <div className="relative h-[280px] sm:h-[340px] lg:h-[400px] sport-photo overflow-hidden bg-[var(--color-paper-2)]">
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

          <div className="hidden md:block relative h-[400px] sport-photo overflow-hidden bg-[var(--color-paper-2)]">
            <Image
              src="/catalogo/noruega-2026_braut-haaland-9_post1_01.jpg"
              alt="Camiseta Noruega 2026 Haaland #9"
              fill
              sizes="25vw"
              loading="eager"
              className="object-cover"
            />
          </div>

          <div className="hidden md:block relative h-[400px] sport-photo overflow-hidden bg-[var(--color-paper-2)]">
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

        {/* Ledge: condensed headline + offer + control pair */}
        <div className="sport-rule-bar pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7 min-w-0">
            <h1 className="sport-display text-[var(--color-ink)] mb-3">
              Fútbol en la Piel
            </h1>
            <p className="lead text-[var(--color-ink-2)]">
              Camisetas actuales, Mundial 2026 y retros en Uruguay, con entrega
              inmediata y envíos a los 19 departamentos.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col lg:items-end gap-4">
            <p className="sport-mono text-lg text-[var(--color-ink)]">
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
