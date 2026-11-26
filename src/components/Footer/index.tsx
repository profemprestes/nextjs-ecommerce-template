import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-paper-2)] sport-rule-bar">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logos/futbolenlapiel_horizontal_transparente.png"
                alt="Fútbol en la Piel"
                width={176}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-[var(--color-ink-2)] max-w-[44ch] mb-4">
              La pasión se lleva puesta. Camisetas de fútbol actuales y retros en
              Uruguay, con entrega inmediata y envíos a los 19 departamentos por
              DAC, Mirtrans y Correo Uruguayo.
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Pagos coordinados por transferencia bancaria, Mercado Pago o
              efectivo.
            </p>
          </div>

          <div className="md:col-span-4">
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-3">
              Catálogo y consulta
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-[var(--color-ink-2)]">
              <li>
                <Link
                  href="/shop-with-sidebar"
                  className="hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  Catálogo con filtros
                </Link>
              </li>
              <li>
                <Link
                  href="/shop-without-sidebar"
                  className="hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  Mi selección
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  Consultar por WhatsApp
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-3">
              Canales directos
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-[var(--color-ink-2)]">
              <li>
                <a
                  href="https://wa.me/59899760998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sport-mono hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  +598 99 760 998
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/futbolenlapieluy1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  @futbolenlapieluy1
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:underline hover:decoration-[var(--color-accent-deep)]"
                >
                  Contacto y entregas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="sport-rule-hair mt-10 pt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
          <p>{year} Fútbol en la Piel, Uruguay.</p>
          <p>Montevideo e Interior, 19 departamentos.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
