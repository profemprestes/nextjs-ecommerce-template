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
      className="bg-[#0A1B33] text-[#F5EAD6] py-16 lg:py-24"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-10 lg:gap-12 items-start">
          {/* Left: numbered order rules */}
          <div className="min-w-0">
            <span className="font-mono-cl text-xs uppercase text-[#A8D6F0] block mb-3">
              Pedido directo
            </span>
            <h2 className="sport-display text-[#F5EAD6] mb-4">
              Consultá stock por WhatsApp
            </h2>
            <p className="text-[#B8C7DC] mb-8 max-w-[48ch]">
              Respondemos rápido con fotos reales, medidas exactas y opciones de
              pago por transferencia, Mercado Pago o efectivo.
            </p>

            <div className="border-t border-[rgba(142,203,245,0.4)]">
              {rules.map((rule) => (
                <div
                  key={rule.index}
                  className="border-b border-[rgba(245,234,214,0.18)] py-5 flex gap-4 items-start"
                >
                  <span className="font-mono-cl text-xs text-[#A8D6F0] pt-1 shrink-0">
                    {rule.index}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#F5EAD6] mb-1">
                      {rule.title}
                    </h3>
                    <p className="text-sm text-[#B8C7DC]">{rule.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: frosted glass WhatsApp inquiry form */}
          <div className="glass-panel rounded-[22px] p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <div>
                <label
                  htmlFor="wa-modelo"
                  className="block text-xs font-semibold text-[#F5EAD6] mb-2"
                >
                  Modelo o selección
                </label>
                <input
                  id="wa-modelo"
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ej. Uruguay 2026 Titular o Retro 1996"
                  className="w-full h-12 px-4 rounded-[14px] bg-[#070F1C]/45 border border-[rgba(245,234,214,0.22)] text-[#F5EAD6] placeholder:text-[#B8C7DC]/60 focus:border-[#F5EAD6] focus:outline-none focus:ring-3 focus:ring-[#A8D6F0]/30"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#F5EAD6] mb-2">
                  Talle
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTalle(size)}
                      className={`min-h-[44px] rounded-full font-mono-cl text-xs border transition-colors ${
                        talle === size
                          ? "bg-[#A8D6F0] border-[#A8D6F0] text-[#0A1B33]"
                          : "bg-[#070F1C]/45 border-[rgba(245,234,214,0.22)] text-[#F5EAD6] hover:border-[#A8D6F0]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#F5EAD6] mb-2">
                  Zona de entrega
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#070F1C]/40 border border-[rgba(245,234,214,0.18)]">
                  <button
                    type="button"
                    onClick={() => setZona("montevideo")}
                    className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                      zona === "montevideo"
                        ? "bg-[#F5EAD6] text-[#0A1B33]"
                        : "text-[#B8C7DC] hover:text-[#F5EAD6]"
                    }`}
                  >
                    Montevideo
                  </button>
                  <button
                    type="button"
                    onClick={() => setZona("interior")}
                    className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                      zona === "interior"
                        ? "bg-[#F5EAD6] text-[#0A1B33]"
                        : "text-[#B8C7DC] hover:text-[#F5EAD6]"
                    }`}
                  >
                    Interior del país
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-[#DC2626]">
                  {error}
                </p>
              )}

              <button type="submit" className="sport-btn-primary w-full">
                Enviar consulta por WhatsApp
              </button>

              <Link
                href="/checkout"
                className="text-center text-xs text-[#B8C7DC] hover:text-[#A8D6F0] underline"
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
