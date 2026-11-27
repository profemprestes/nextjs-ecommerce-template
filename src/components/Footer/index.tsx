import React from "react";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F5F5F7] text-[#1D1D1F] border-t border-black/10">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-block mb-3 font-brand text-sm tracking-[0.02em] text-[#1D1D1F]"
            >
              FUTBOL EN LA PIEL
            </Link>
            <p className="text-sm text-[#6E6E73] max-w-[44ch] mb-4 leading-relaxed">
              Camisetas de fútbol actuales, Mundial 2026 y ediciones retro en
              Uruguay, con entrega inmediata y envíos a los 19 departamentos por
              DAC, Mirtrans y Correo Uruguayo.
            </p>
            <p className="text-xs font-mono-cl text-[#6E6E73] uppercase">
              Transferencia bancaria · Mercado Pago · Efectivo
            </p>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-mono-cl text-xs uppercase text-[#6E6E73] mb-4">
              Catálogo y consulta
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm font-medium">
              <li>
                <Link
                  href="/shop-with-sidebar"
                  className="text-[#0066CC] hover:underline"
                >
                  Catálogo con filtros
                </Link>
              </li>
              <li>
                <Link
                  href="/shop-without-sidebar"
                  className="text-[#0066CC] hover:underline"
                >
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#0066CC] hover:underline">
                  Mi selección
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-[#0066CC] hover:underline"
                >
                  Consultar por WhatsApp
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-mono-cl text-xs uppercase text-[#6E6E73] mb-4">
              Canales directos
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm font-medium">
              <li>
                <a
                  href="https://wa.me/59899760998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-cl text-[#0066CC] hover:underline"
                >
                  +598 99 760 998
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/futbolenlapieluy1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066CC] hover:underline"
                >
                  @futbolenlapieluy1
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#0066CC] hover:underline"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-black/10 flex flex-col sm:flex-row justify-between gap-4 text-xs text-[#6E6E73] font-mono-cl">
          <span>© {year} Fútbol en la Piel · Uruguay</span>
          <span>@futbolenlapieluy1</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
