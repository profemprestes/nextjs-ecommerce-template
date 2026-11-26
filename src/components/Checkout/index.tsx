"use client";
import React, { useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";

const DEPARTAMENTOS = [
  "Montevideo",
  "Canelones",
  "Maldonado",
  "Salto",
  "Paysandú",
  "Rivera",
  "Colonia",
  "Rocha",
  "San José",
  "Tacuarembó",
  "Cerro Largo",
  "Soriano",
  "Artigas",
  "Durazno",
  "Florida",
  "Lavalleja",
  "Río Negro",
  "Treinta y Tres",
  "Flores",
];

const VERSIONES = [
  "Jugador",
  "Fan",
  "Retro",
  "A confirmar según stock",
] as const;

const TALLES = ["S", "M", "L", "XL", "Otro (por encargo)"] as const;

function buildConsultaCode(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  const code = String((hash % 9000) + 1000);
  return `FEP-${code}`;
}

const Checkout = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  const defaultModelo =
    cartItems.length > 0
      ? cartItems.map((i) => `${i.title} (x${i.quantity})`).join(", ")
      : "Uruguay Alternativa 2026 — Nike";

  const [nombre, setNombre] = useState("");
  const [modelo, setModelo] = useState(defaultModelo);
  const [version, setVersion] = useState<string>("Jugador");
  const [talle, setTalle] = useState<string>("M");
  const [departamento, setDepartamento] = useState<string>("Montevideo");
  const [modalidadEntrega, setModalidadEntrega] = useState<"envio" | "coordinar">(
    "envio"
  );

  const camisetaTexto =
    cartItems.length > 0
      ? cartItems.map((i) => `${i.title} (x${i.quantity})`).join(", ")
      : modelo;

  const codigoConsulta = useMemo(() => {
    const seed = `${nombre.trim()}|${camisetaTexto.trim()}|${talle}|${departamento}`;
    return buildConsultaCode(seed);
  }, [nombre, camisetaTexto, talle, departamento]);

  const entregaTexto =
    modalidadEntrega === "envio"
      ? `Envío a ${departamento}`
      : `Coordinar entrega (${departamento})`;

  const mensajeWhatsApp = [
    `Hola Fútbol en la Piel! Consulta ${codigoConsulta}:`,
    `• Nombre: ${nombre.trim() || "Sin especificar"}`,
    `• Camiseta: ${camisetaTexto.trim() || "A definir"}`,
    `• Versión: ${version}`,
    `• Talle: ${talle}`,
    `• Entrega: ${entregaTexto}`,
    "Quedo atento para confirmar stock, precio y envío.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/59899760998?text=${encodeURIComponent(
    mensajeWhatsApp
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Breadcrumb title={"Consultar por WhatsApp"} pages={["consulta"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* Formulario de consulta */}
              <div className="lg:max-w-[670px] w-full bg-white shadow-1 rounded-[10px] p-6 sm:p-8.5">
                <h2 className="font-semibold text-xl text-dark mb-2">
                  Prepará tu consulta sin cobro automático
                </h2>
                <p className="text-custom-sm text-body mb-7">
                  Completá tus datos para generar el mensaje prearmado con tu
                  código de consulta. Confirmamos stock y precio final por
                  WhatsApp antes de coordinar el pago.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block mb-2 text-custom-sm font-medium text-dark"
                    >
                      Tu nombre <span className="text-red">*</span>
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Martín"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="departamento"
                      className="block mb-2 text-custom-sm font-medium text-dark"
                    >
                      Departamento <span className="text-red">*</span>
                    </label>
                    <select
                      id="departamento"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-4 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                    >
                      {DEPARTAMENTOS.map((dep) => (
                        <option key={dep} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {cartItems.length === 0 && (
                  <div className="mb-5">
                    <label
                      htmlFor="modelo"
                      className="block mb-2 text-custom-sm font-medium text-dark"
                    >
                      Camiseta o modelo de interés{" "}
                      <span className="text-red">*</span>
                    </label>
                    <input
                      id="modelo"
                      type="text"
                      required
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Ej. Uruguay 2026 o Manchester United 1996"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="version"
                      className="block mb-2 text-custom-sm font-medium text-dark"
                    >
                      Versión
                    </label>
                    <select
                      id="version"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-4 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                    >
                      {VERSIONES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="talle"
                      className="block mb-2 text-custom-sm font-medium text-dark"
                    >
                      Talle
                    </label>
                    <select
                      id="talle"
                      value={talle}
                      onChange={(e) => setTalle(e.target.value)}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-4 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                    >
                      {TALLES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block mb-2 text-custom-sm font-medium text-dark">
                    Modalidad de entrega
                  </span>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2.5 cursor-pointer text-custom-sm text-dark">
                      <input
                        type="radio"
                        name="entrega"
                        checked={modalidadEntrega === "envio"}
                        onChange={() => setModalidadEntrega("envio")}
                      />
                      Envío a domicilio / agencia ({departamento})
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-custom-sm text-dark">
                      <input
                        type="radio"
                        name="entrega"
                        checked={modalidadEntrega === "coordinar"}
                        onChange={() => setModalidadEntrega("coordinar")}
                      />
                      Coordinar entrega ({departamento})
                    </label>
                  </div>
                </div>
              </div>

              {/* Resumen de consulta */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-6 sm:px-8.5 flex items-center justify-between">
                    <h3 className="font-medium text-xl text-dark">
                      Tu consulta
                    </h3>
                    <span className="text-custom-xs font-semibold text-blue bg-blue-light-5 px-3 py-1 rounded">
                      {codigoConsulta}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8.5">
                    {cartItems.length > 0 && (
                      <div className="mb-5 pb-4 border-b border-gray-3">
                        <p className="text-custom-xs text-dark-4 mb-2">
                          Camisetas seleccionadas:
                        </p>
                        <ul className="space-y-2 text-custom-sm text-dark">
                          {cartItems.map((item) => (
                            <li
                              key={item.id}
                              className="flex justify-between gap-3"
                            >
                              <span>
                                {item.title} × {item.quantity}
                              </span>
                              <span className="shrink-0 font-medium">
                                Desde ${" "}
                                {(
                                  item.discountedPrice * item.quantity
                                ).toLocaleString("es-UY")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <pre className="whitespace-pre-wrap text-custom-xs bg-gray-1 border border-gray-3 rounded-md p-4 text-dark mb-4 font-euclid-circular-a">
                      {mensajeWhatsApp}
                    </pre>

                    <p className="text-custom-xs text-body mb-6">
                      Nota: <strong>{codigoConsulta}</strong> es un
                      identificador de consulta y no representa un pedido
                      confirmado ni reserva de stock.
                    </p>

                    <button
                      type="submit"
                      className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Enviar consulta por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
