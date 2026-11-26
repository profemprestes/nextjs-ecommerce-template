import React from "react";
import Image from "next/image";
import Link from "next/link";

const CounDown = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-lg bg-[#D0E9F3] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-[520px] w-full">
            <span className="block font-medium text-custom-1 text-blue mb-2.5">
              Camino al Mundial 2026
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              La Celeste y selecciones en Versión Jugador
            </h2>

            <p className="text-body mb-6">
              Tela técnica respirable, corte entallado (slim fit) y escudo
              termosellado. Si dudás entre dos talles o la preferís holgada, te
              recomendamos pedir un talle más.
            </p>

            <div className="flex flex-wrap gap-4 mb-7.5">
              <div className="rounded-lg bg-white px-4 py-3 shadow-2">
                <span className="block text-custom-xs text-dark-4">
                  Versión Fan
                </span>
                <span className="font-semibold text-lg text-dark">
                  Desde $ 1.690
                </span>
              </div>
              <div className="rounded-lg bg-white px-4 py-3 shadow-2">
                <span className="block text-custom-xs text-dark-4">
                  Edición Retro
                </span>
                <span className="font-semibold text-lg text-dark">
                  Desde $ 1.890
                </span>
              </div>
              <div className="rounded-lg bg-white px-4 py-3 shadow-2">
                <span className="block text-custom-xs text-dark-4">
                  Versión Jugador
                </span>
                <span className="font-semibold text-lg text-blue">
                  Desde $ 1.990
                </span>
              </div>
            </div>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark"
            >
              Ver catálogo completo
            </Link>
          </div>

          <div className="shrink-0 relative w-[280px] sm:w-[320px] h-[320px] sm:h-[360px] overflow-hidden rounded-lg shadow-2">
            <Image
              src="/camisetas/uruguay-away-2026-nike-jugador.jpeg"
              alt="Camiseta Uruguay 2026 Nike Versión Jugador"
              fill
              sizes="(min-width: 640px) 320px, 280px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounDown;
