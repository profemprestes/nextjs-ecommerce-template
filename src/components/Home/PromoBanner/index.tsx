"use client";
import React, { useState } from "react";
import Link from "next/link";

const rules = [
  {
    index: "01",
    title: "Elegís modelo y talle",
    detail:
      "Confirmamos disponibilidad inmediata o fecha de ingreso antes de coordinar el pago.",
  },
  {
    index: "02",
    title: "Envíos a los 19 departamentos",
    detail:
      "Entregas en Montevideo y despachos al Interior por DAC, Mirtrans y Correo Uruguayo.",
  },
  {
    index: "03",
    title: "Garantía y cambios",
    detail:
      "Cambios sin costo de envío ante falla o error nuestro, con prenda sin uso y etiqueta intacta.",
  },
];

const PromoBanner = () => {
  const [modelo, setModelo] = useState("");
  const [talle, setTalle] = useState("M");
  const [zona, setZona] = useState<"montevideo" | "interior">("montevideo");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo.trim()) {
      setError("Indicá el modelo o selección que estás buscando.");
      return;
    }
    setError("");
    const zonaLabel = zona === "montevideo" ? "Montevideo" : "Interior (DAC/Mirtrans)";
    const text = encodeURIComponent(
      `Hola Fútbol en la Piel! Quiero consultar por:\n- Modelo: ${modelo.trim()}\n- Talle: ${talle}\n- Envío: ${zonaLabel}`
    );
    window.open(`https://wa.me/59899760998?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="guia-compra"
      className="bg-[#000000] text-[#FFFFFF] py-14 lg:py-20"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-10 lg:gap-12 items-start">
          {/* Left: numbered order rules */}
          <div className="min-w-0">
            <span className="font-mono-cl text-xs uppercase text-[#A1A1A6] block mb-3">
              Pedido directo
            </span>
            <h2 className="sport-display text-[#FFFFFF] mb-4">
              Consultá stock por WhatsApp
            </h2>
            <p className="text-[#A1A1A6] mb-8 max-w-[48ch]">
              Respondemos rápido con fotos reales, medidas exactas y opciones de
              pago por transferencia, Mercado Pago o efectivo.
            </p>

            <div className="border-t border-white/20">
              {rules.map((rule) => (
                <div
                  key={rule.index}
                  className="border-b border-white/15 py-5 flex gap-4 items-start"
                >
                  <span className="font-mono-cl text-xs text-[#A1A1A6] pt-1 shrink-0">
                    {rule.index}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#FFFFFF] mb-1">
                      {rule.title}
                    </h3>
                    <p className="text-sm text-[#A1A1A6]">{rule.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: flat dark inquiry panel */}
          <div className="bg-[#1D1D1F] border border-white/15 rounded-none p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <div>
                <label
                  htmlFor="wa-modelo"
                  className="block text-xs font-semibold text-[#FFFFFF] mb-2"
                >
                  Modelo o selección
                </label>
                <input
                  id="wa-modelo"
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "wa-modelo-error" : undefined}
                  placeholder="Ej. Uruguay 2026 Titular o Retro 1996"
                  className="w-full h-11 px-4 rounded-none bg-[#000000] border border-white/40 text-[#FFFFFF] placeholder:text-[#A1A1A6] focus:border-[#2997FF] focus-visible:outline-2 focus-visible:outline-[#2997FF] focus-visible:outline-offset-2"
                />
              </div>

              <div>
                <span id="wa-talle-label" className="block text-xs font-semibold text-[#FFFFFF] mb-2">
                  Talle
                </span>
                <div role="group" aria-labelledby="wa-talle-label" className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={talle === size}
                      onClick={() => setTalle(size)}
                      className={`min-h-[40px] rounded-[980px] font-mono-cl text-xs border transition-colors ${
                        talle === size
                          ? "bg-[#F5F5F7] border-[#F5F5F7] text-[#000000]"
                          : "bg-transparent border-white/35 text-[#FFFFFF] hover:border-[#F5F5F7]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span id="wa-zona-label" className="block text-xs font-semibold text-[#FFFFFF] mb-2">
                  Zona de entrega
                </span>
                <div role="group" aria-labelledby="wa-zona-label" className="grid grid-cols-2 gap-1 p-1 rounded-[980px] bg-[#000000] border border-white/25">
                  <button
                    type="button"
                    aria-pressed={zona === "montevideo"}
                    onClick={() => setZona("montevideo")}
                    className={`min-h-[36px] rounded-[980px] text-xs font-semibold transition-colors ${
                      zona === "montevideo"
                        ? "bg-[#F5F5F7] text-[#000000]"
                        : "text-[#A1A1A6] hover:text-[#FFFFFF]"
                    }`}
                  >
                    Montevideo
                  </button>
                  <button
                    type="button"
                    aria-pressed={zona === "interior"}
                    onClick={() => setZona("interior")}
                    className={`min-h-[36px] rounded-[980px] text-xs font-semibold transition-colors ${
                      zona === "interior"
                        ? "bg-[#F5F5F7] text-[#000000]"
                        : "text-[#A1A1A6] hover:text-[#FFFFFF]"
                    }`}
                  >
                    Interior del país
                  </button>
                </div>
              </div>

              {error && (
                <p id="wa-modelo-error" role="alert" className="text-xs font-medium text-[#FF6961]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center w-full h-11 px-5 rounded-[980px] bg-[#F5F5F7] text-[#000000] text-sm font-medium hover:bg-[#FFFFFF] transition-colors"
              >
                Enviar consulta por WhatsApp
              </button>

              <Link
                href="/checkout"
                className="text-center text-xs text-[#2997FF] hover:underline"
              >
                O ir al armador completo de pedido FEP-XXXX
              </Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
