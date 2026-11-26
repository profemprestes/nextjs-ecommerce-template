"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";

const Contact = () => {
  const [nombre, setNombre] = useState("");
  const [consulta, setConsulta] = useState("");

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola Fútbol en la Piel! Soy ${
      nombre.trim() || "un cliente"
    }. ${consulta.trim()}`;
    window.open(
      `https://wa.me/59899760998?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <Breadcrumb title={"Contacto"} pages={["contacto"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="font-medium text-xl text-dark">
                  Canales directos
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-5 text-custom-sm">
                  <div>
                    <span className="block font-medium text-dark mb-1">
                      WhatsApp comercial
                    </span>
                    <a
                      href="https://wa.me/59899760998"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue hover:underline font-medium"
                    >
                      +598 99 760 998
                    </a>
                  </div>

                  <div>
                    <span className="block font-medium text-dark mb-1">
                      Instagram oficial
                    </span>
                    <a
                      href="https://www.instagram.com/futbolenlapieluy1/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue hover:underline font-medium"
                    >
                      @futbolenlapieluy1
                    </a>
                  </div>

                  <div>
                    <span className="block font-medium text-dark mb-1">
                      Cobertura y envíos
                    </span>
                    <p className="text-body">
                      Montevideo (entrega o retiro a coordinar) e Interior en
                      los 19 departamentos por DAC, Mirtrans y Correo Uruguayo.
                    </p>
                  </div>

                  <div>
                    <span className="block font-medium text-dark mb-1">
                      Medios de pago
                    </span>
                    <p className="text-body">
                      Transferencia bancaria, Mercado Pago y efectivo (a
                      coordinar según entrega).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <h2 className="font-semibold text-xl text-dark mb-2">
                Escribinos directo por WhatsApp
              </h2>
              <p className="text-custom-sm text-body mb-6">
                Consultanos por stock inmediato, talles o modelos por encargo.
              </p>

              <form onSubmit={handleWhatsAppSubmit}>
                <div className="mb-5">
                  <label htmlFor="contactName" className="block mb-2.5">
                    Tu nombre <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Lucas"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                  />
                </div>

                <div className="mb-7.5">
                  <label htmlFor="message" className="block mb-2.5">
                    Tu consulta <span className="text-red">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                    placeholder="Contanos qué camiseta, versión (Jugador/Fan/Retro) y talle estás buscando..."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Abrir chat en WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
