"use client";
import React, { useState } from "react";
import Link from "next/link";

const steps = [
  {
    title: "Elegís modelo y talle",
    detail: "Escribinos con este formulario o directo por WhatsApp.",
  },
  {
    title: "Confirmamos stock y precio",
    detail:
      "Te mandamos fotos reales y medidas. Pagás por transferencia, Mercado Pago o efectivo.",
  },
  {
    title: "La recibís",
    detail:
      "En Montevideo coordinamos entrega o retiro. Al Interior despachamos por DAC, Mirtrans o Correo Uruguayo.",
  },
];

const SIZES = ["S", "M", "L", "XL"];

const PromoBanner = () => {
  const [modelo, setModelo] = useState("");
  const [talle, setTalle] = useState("M");
  const [zona, setZona] = useState<"montevideo" | "interior">("montevideo");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo.trim()) {
      setError("Escribí el modelo o la selección que buscás.");
      return;
    }
    setError("");
    const zonaLabel =
      zona === "montevideo" ? "Montevideo" : "Interior (DAC/Mirtrans)";
    const text = encodeURIComponent(
      `Hola Fútbol en la Piel! Quiero consultar por:\n- Modelo: ${modelo.trim()}\n- Talle: ${talle}\n- Envío: ${zonaLabel}`
    );
    window.open(
      `https://wa.me/59899760998?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const segment = (active: boolean) =>
    `min-h-11 rounded-full text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-95 ${
      active
        ? "bg-celeste text-noche"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <section id="guia-compra" className="bg-noche text-white py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          <div className="lg:col-span-6 min-w-0">
            <h2 className="fep-display text-[clamp(2.5rem,5.5vw,4.5rem)] text-white mb-4">
              Pedila por WhatsApp
            </h2>
            <p className="text-white/70 mb-10 max-w-[46ch]">
              No hay carrito ni pago online: hablás con nosotros, confirmamos
              todo y recién ahí pagás.
            </p>

            <ol className="flex flex-col gap-7">
              {steps.map((step, idx) => (
                <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 items-start">
                  <span
                    aria-hidden="true"
                    className="fep-display text-[3.25rem] leading-[0.8] text-celeste"
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1 [font-family:var(--font-body)] tracking-normal">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed max-w-[48ch]">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-10 text-sm text-white/60 max-w-[52ch]">
              Si la camiseta tiene una falla o nos equivocamos nosotros, el
              cambio no te cuesta el envío. La prenda tiene que estar sin uso y
              con la etiqueta.
            </p>
          </div>

          <div className="lg:col-span-6 rounded-[22px] bg-noche-2 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              <div>
                <label
                  htmlFor="wa-modelo"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  ¿Qué camiseta buscás?
                </label>
                <input
                  id="wa-modelo"
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "wa-modelo-error" : undefined}
                  placeholder="Uruguay 2026 titular, Peñarol retro 1998…"
                  className="w-full h-12 px-4 rounded-[12px] bg-noche border border-white/25 text-white placeholder:text-white/40 transition-colors focus:border-celeste focus-visible:outline-2 focus-visible:outline-celeste focus-visible:outline-offset-2"
                />
                {error && (
                  <p
                    id="wa-modelo-error"
                    role="alert"
                    className="mt-2 text-sm font-medium text-[#FF9C94]"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div>
                <span
                  id="wa-talle-label"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Talle
                </span>
                <div
                  role="group"
                  aria-labelledby="wa-talle-label"
                  className="grid grid-cols-4 gap-2"
                >
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={talle === size}
                      onClick={() => setTalle(size)}
                      className={`min-h-11 rounded-full text-sm font-semibold border transition-[background-color,border-color,color,transform] duration-200 active:scale-95 ${
                        talle === size
                          ? "bg-celeste border-celeste text-noche"
                          : "bg-transparent border-white/30 text-white hover:border-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span
                  id="wa-zona-label"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  ¿Dónde la recibís?
                </span>
                <div
                  role="group"
                  aria-labelledby="wa-zona-label"
                  className="grid grid-cols-2 gap-1 p-1 rounded-full bg-noche border border-white/20"
                >
                  <button
                    type="button"
                    aria-pressed={zona === "montevideo"}
                    onClick={() => setZona("montevideo")}
                    className={segment(zona === "montevideo")}
                  >
                    Montevideo
                  </button>
                  <button
                    type="button"
                    aria-pressed={zona === "interior"}
                    onClick={() => setZona("interior")}
                    className={segment(zona === "interior")}
                  >
                    Interior
                  </button>
                </div>
              </div>

              <button type="submit" className="fep-btn w-full">
                Enviar consulta por WhatsApp
              </button>

              <Link
                href="/checkout"
                className="self-center text-sm text-celeste underline-offset-4 hover:underline"
              >
                ¿Querés varias camisetas? Armá un pedido completo
              </Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
