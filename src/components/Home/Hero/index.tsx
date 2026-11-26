import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              <Image
                src="/images/hero/hero-bg.png"
                alt="Fondo decorativo"
                className="absolute right-0 bottom-0 -z-1 w-auto h-auto"
                width={534}
                height={520}
                loading="eager"
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="max-w-[175px] font-semibold text-dark text-lg mb-8 leading-snug">
                      <Link href="/shop-with-sidebar" className="hover:text-blue">
                        Noruega 2026 Haaland #9
                      </Link>
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 text-custom-xs mb-1">
                        Versión Jugador
                      </p>
                      <span className="font-semibold text-xl text-blue">
                        Desde $ 1.990
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 relative w-[112px] h-[140px] overflow-hidden rounded-md">
                    <Image
                      src="/camisetas/noruega.jpeg"
                      alt="Camiseta Noruega 2026 Haaland #9"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="max-w-[175px] font-semibold text-dark text-lg mb-8 leading-snug">
                      <Link href="/shop-with-sidebar" className="hover:text-blue">
                        Nacional 2026 Titular Blanca
                      </Link>
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 text-custom-xs mb-1">
                        Versión Fan
                      </p>
                      <span className="font-semibold text-xl text-blue">
                        Desde $ 1.690
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 relative w-[112px] h-[140px] overflow-hidden rounded-md">
                    <Image
                      src="/camisetas/nacional-home-2026-umbro-blanca.jpeg"
                      alt="Camiseta Nacional 2026 Titular Blanca"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
