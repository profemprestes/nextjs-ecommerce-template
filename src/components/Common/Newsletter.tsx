import React from "react";
import Image from "next/image";

const Newsletter = () => {
  return (
    <section className="overflow-hidden pb-16">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl">
          {/* <!-- bg shapes --> */}
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="Fondo decorativo"
            className="-z-1 rounded-xl object-cover"
            fill
            sizes="(min-width: 1280px) 1170px, 100vw"
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[520px] w-full">
              <h2 className="text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                ¿Buscás un modelo específico o querés ver nuevos ingresos?
              </h2>
              <p className="text-white/90 text-custom-sm">
                Seguinos en @futbolenlapieluy1 o escribinos por WhatsApp para
                consultar disponibilidad inmediata y pedidos por encargo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="https://wa.me/59899760998"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Escribir por WhatsApp
              </a>
              <a
                href="https://www.instagram.com/futbolenlapieluy1/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center py-3 px-7 text-dark bg-white font-medium rounded-md ease-out duration-200 hover:bg-gray-2"
              >
                Ver Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
