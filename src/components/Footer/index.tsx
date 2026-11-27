import React from "react";
import Link from "next/link";

const linkClass =
  "text-noche/80 hover:text-noche underline-offset-4 hover:underline transition-colors";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tiza text-noche border-t border-[var(--border)]">
      <div className="container py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-6">
            <Link href="/" className="inline-block mb-4 text-noche">
              <span className="fep-display text-[clamp(2.25rem,4vw,3.25rem)]">
                Fútbol en la Piel
              </span>
            </Link>
            <p className="text-sm text-grada max-w-[44ch] mb-3 leading-relaxed">
              Camisetas de fútbol actuales, del Mundial 2026 y retros, en
              Uruguay. Entrega inmediata o por encargo, con envíos a los 19
              departamentos por DAC, Mirtrans y Correo Uruguayo.
            </p>
            <p className="text-sm text-grada">
              Pagás por transferencia bancaria, Mercado Pago o en efectivo.
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-sm font-semibold text-noche mb-4 [font-family:var(--font-body)] tracking-normal">
              Catálogo
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/shop-with-sidebar" className={linkClass}>
                  Catálogo con filtros
                </Link>
              </li>
              <li>
                <Link href="/shop-without-sidebar" className={linkClass}>
                  Ver todas las camisetas
                </Link>
              </li>
              <li>
                <Link href="/#talles" className={linkClass}>
                  Guía de talles
                </Link>
              </li>
              <li>
                <Link href="/cart" className={linkClass}>
                  Mi consulta
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-sm font-semibold text-noche mb-4 [font-family:var(--font-body)] tracking-normal">
              Hablemos
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="https://wa.me/59899760998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} tabular-nums`}
                >
                  WhatsApp +598 99 760 998
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/futbolenlapieluy1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Instagram @futbolenlapieluy1
                </a>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] text-[0.8125rem] text-grada">
          © {year} Fútbol en la Piel, Uruguay.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
