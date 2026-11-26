import React from "react";
import Link from "next/link";

const PromoBanner = () => {
  return (
    <section
      id="guia-compra"
      className="bg-[var(--color-ink)] text-[var(--color-paper)] py-16 lg:py-24"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 min-w-0">
            <h2 className="sport-display text-[var(--color-paper)] mb-4">
              Envíos a los 19 departamentos
            </h2>
            <p className="lead text-[var(--color-paper-3)] mb-6">
              Elegís el modelo y talle, enviás tu consulta FEP-XXXX por WhatsApp
              y recién cuando confirmamos stock coordinamos el pago y la entrega
              en Montevideo o por DAC, Mirtrans y Correo Uruguayo al Interior.
            </p>
            <p className="text-sm text-[var(--color-paper-3)]">
              Cambios sin costo de envío ante falla o error nuestro, con prenda
              sin uso y etiqueta intacta (excepto personalizadas).
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
            <Link href="/checkout" className="sport-btn-primary">
              Armar consulta WhatsApp
            </Link>
            <a
              href="https://wa.me/59899760998"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] px-6 border-2 border-[var(--color-paper)] rounded-[4px] font-medium text-sm text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] transition-colors"
            >
              Chat directo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
