"use client";
import React, { useState } from "react";

const sizeGuide = [
  { size: "S", width: "48–50 cm", length: "70–72 cm", height: "1,65–1,73 m", below: 173 },
  { size: "M", width: "51–53 cm", length: "72–74 cm", height: "1,73–1,80 m", below: 180 },
  { size: "L", width: "54–56 cm", length: "75–77 cm", height: "1,80–1,86 m", below: 186 },
  { size: "XL", width: "57–59 cm", length: "77–79 cm", height: "1,86 m o más", below: Infinity },
];

const MIN_CM = 155;
const MAX_CM = 200;

const Testimonials = () => {
  const [altura, setAltura] = useState(176);

  const recIndex = sizeGuide.findIndex((row) => altura < row.below);
  const rec = sizeGuide[recIndex === -1 ? sizeGuide.length - 1 : recIndex];
  const next = sizeGuide[Math.min(sizeGuide.indexOf(rec) + 1, sizeGuide.length - 1)];
  const metros = (altura / 100).toFixed(2).replace(".", ",");

  return (
    <section id="talles" className="bg-tiza text-noche py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 min-w-0">
            <h2 className="fep-display text-[clamp(2.5rem,5.5vw,4.5rem)] text-noche mb-4">
              ¿Qué talle te va?
            </h2>
            <p className="text-grada mb-8 max-w-[44ch]">
              Mové la barra hasta tu altura. Las medidas son aproximadas y en
              plano; por encargo hacemos todos los talles y te pasamos las
              medidas exactas.
            </p>

            <label htmlFor="altura" className="block text-sm font-medium mb-1">
              Tu altura: <span className="tabular-nums">{metros} m</span>
            </label>
            <input
              id="altura"
              type="range"
              min={MIN_CM}
              max={MAX_CM}
              step={1}
              value={altura}
              onChange={(e) => setAltura(Number(e.target.value))}
              className="fep-range"
              aria-valuetext={`${metros} metros`}
            />

            <div
              aria-live="polite"
              className="mt-5 rounded-[18px] bg-white p-5 flex items-center gap-5"
            >
              <span
                key={rec.size}
                className="fep-bump fep-display text-[4rem] leading-none text-celeste-hondo w-[2.2ch] text-center"
              >
                {rec.size}
              </span>
              <p className="text-sm text-grada leading-relaxed">
                Te va el <strong className="text-noche">{rec.size}</strong>.
                {rec.size !== next.size
                  ? ` En Versión Jugador, si la querés holgada, pedí ${next.size}.`
                  : " En Versión Jugador, si la querés holgada, pedila por encargo un talle más."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="visually-hidden">
                Medidas aproximadas por talle
              </caption>
              <thead>
                <tr className="text-[0.8125rem] text-grada">
                  <th scope="col" className="py-3 px-4 font-medium border-b border-[var(--border)]">
                    Talle
                  </th>
                  <th scope="col" className="py-3 px-4 font-medium border-b border-[var(--border)]">
                    Ancho, de axila a axila
                  </th>
                  <th scope="col" className="py-3 px-4 font-medium border-b border-[var(--border)]">
                    Largo
                  </th>
                  <th scope="col" className="py-3 px-4 font-medium border-b border-[var(--border)]">
                    Altura orientativa
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeGuide.map((row) => {
                  const isRec = row.size === rec.size;
                  return (
                    <tr
                      key={row.size}
                      aria-current={isRec ? "true" : undefined}
                      className={`tabular-nums text-sm transition-colors duration-300 ${
                        isRec ? "bg-celeste/30" : ""
                      }`}
                    >
                      <th
                        scope="row"
                        className="py-4 px-4 border-b border-[var(--border)] fep-display text-2xl text-noche"
                      >
                        {row.size}
                      </th>
                      <td className="py-4 px-4 border-b border-[var(--border)]">{row.width}</td>
                      <td className="py-4 px-4 border-b border-[var(--border)]">{row.length}</td>
                      <td className="py-4 px-4 border-b border-[var(--border)]">{row.height}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
