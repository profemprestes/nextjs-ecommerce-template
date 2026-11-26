import React from "react";
import Image from "next/image";
import Link from "next/link";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              Ediciones Retro 1988–2018
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              Desde $ 1.890
            </h2>

            <p className="text-body">
              Clásicos de colección con etiquetas y dorsales históricos:
              Manchester United 1993–95 y 1996, España 1996, Italia 1994,
              Peñarol 1998 y más modelos por encargo.
            </p>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Ver retros
            </Link>
          </div>

          <Image
            src="/camisetas/manchester-united-away-1993-1995-umbro.jpeg"
            alt="Camiseta Manchester United Retro 1993-95"
            className="hidden md:block absolute top-1/2 -translate-y-1/2 right-4 lg:right-14 -z-1 rounded-lg object-cover w-[260px] h-[280px] shadow-1"
            width={260}
            height={280}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/camisetas/boca-juniors-home-2026-2027-adidas.jpeg"
              alt="Camiseta Boca Juniors Titular 2026-27"
              className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-3 sm:left-8 -z-1 rounded-lg object-cover w-[180px] h-[200px] shadow-1"
              width={180}
              height={200}
            />

            <div className="sm:text-right sm:pl-48">
              <span className="block text-lg text-dark mb-1.5">
                Versión Fan
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Calce Clásico
              </h2>

              <p className="font-semibold text-custom-1 text-teal">
                Desde $ 1.690
              </p>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
              >
                Explorar clubes
              </Link>
            </div>
          </div>

          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/camisetas/como.jpeg"
              alt="Camiseta Como 1907 Azul 2026"
              className="hidden sm:block absolute top-1/2 -translate-y-1/2 right-3 sm:right-8 -z-1 rounded-lg object-cover w-[180px] h-[200px] shadow-1"
              width={180}
              height={200}
            />

            <div className="sm:pr-48">
              <span className="block text-lg text-dark mb-1.5">
                ¿No ves tu talle o club?
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Pedidos <span className="text-orange">por encargo</span>
              </h2>

              <p className="max-w-[285px] text-custom-sm">
                Conseguimos todos los talles y modelos puntuales de fútbol o
                básquetbol.
              </p>

              <a
                href="https://wa.me/59899760998?text=Hola%20F%C3%BAtbol%20en%20la%20Piel!%20Quiero%20consultar%20por%20una%20camiseta%20por%20encargo."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
