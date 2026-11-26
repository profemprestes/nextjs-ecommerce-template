import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-gray-3 bg-white">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- footer menu start --> */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-17.5 xl:pt-22.5 pb-10 xl:pb-15">
          <div className="max-w-[330px] w-full">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logos/futbolenlapiel_horizontal_transparente.png"
                alt="Fútbol en la Piel"
                width={185}
                height={42}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="text-custom-sm text-body mb-5">
              La pasión se lleva puesta. Camisetas de fútbol y básquetbol en
              Uruguay con entrega inmediata y por encargo.
            </p>

            <ul className="flex flex-col gap-3 text-custom-sm">
              <li>
                Montevideo e Interior — cobertura en los 19 departamentos (DAC,
                Mirtrans y Correo Uruguayo).
              </li>
              <li>
                <a
                  href="https://wa.me/59899760998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-dark hover:text-blue ease-out duration-200"
                >
                  WhatsApp: +598 99 760 998
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/futbolenlapieluy1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-dark hover:text-blue ease-out duration-200"
                >
                  Instagram: @futbolenlapieluy1
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Tienda
            </h2>

            <ul className="flex flex-col gap-3.5">
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/shop-with-sidebar"
                >
                  Catálogo con filtros
                </Link>
              </li>
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/shop-without-sidebar"
                >
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/cart"
                >
                  Mi selección
                </Link>
              </li>
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/wishlist"
                >
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Información
            </h2>

            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/checkout"
                >
                  Consultar por WhatsApp
                </Link>
              </li>
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/#guia-compra"
                >
                  Cómo pedir y versiones
                </Link>
              </li>
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/#talles"
                >
                  Guía de talles (S a XL)
                </Link>
              </li>
              <li>
                <Link
                  className="ease-out duration-200 hover:text-blue"
                  href="/contact"
                >
                  Contacto y envíos
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark lg:text-right">
              Atención directa
            </h2>

            <p className="lg:text-right text-custom-sm mb-4 max-w-[240px]">
              Confirmamos stock, talle y envío antes de coordinar el pago.
            </p>

            <ul className="flex flex-col lg:items-end gap-3">
              <li>
                <a
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-6 text-white font-medium text-custom-sm rounded-md bg-blue ease-out duration-200 hover:bg-blue-dark"
                  href="https://wa.me/59899760998"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escribir por WhatsApp
                </a>
              </li>

              <li>
                <a
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-6 text-white font-medium text-custom-sm rounded-md bg-dark ease-out duration-200 hover:bg-dark-2"
                  href="https://www.instagram.com/futbolenlapieluy1/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver @futbolenlapieluy1
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* <!-- footer menu end --> */}
      </div>

      {/* <!-- footer bottom start --> */}
      <div className="py-5 xl:py-7.5 bg-gray-1">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-5 flex-wrap items-center justify-between">
            <p className="text-dark font-medium text-custom-sm">
              &copy; {year} Fútbol en la Piel — La pasión se lleva puesta.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-custom-sm">
              <span className="font-medium text-dark">Medios de pago:</span>
              <span className="text-body">
                Transferencia bancaria · Mercado Pago · Efectivo
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- footer bottom end --> */}
    </footer>
  );
};

export default Footer;
