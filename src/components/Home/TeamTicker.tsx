import React from "react";
import { Product } from "@/types/product";

const Star = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    className="shrink-0 fill-current opacity-70"
  >
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z" />
  </svg>
);

/** Stadium LED ribbon listing the teams that are really in the catalog. */
const TeamTicker = ({ products }: { products: Product[] }) => {
  const teams = Array.from(
    new Set(
      products
        .map((p) => (p.team ?? "").trim())
        .filter((t) => t && t !== "Fútbol en la Piel")
    )
  );

  if (teams.length < 4) return null;

  const run = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {teams.map((team) => (
        <li key={team} className="flex items-center">
          <span className="fep-display px-5 lg:px-7 py-3 lg:py-4 text-[clamp(1.375rem,2.4vw,2.125rem)] whitespace-nowrap">
            {team}
          </span>
          <Star />
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Equipos y selecciones en el catálogo"
      className="fep-ticker"
      style={
        {
          "--ticker-duration": `${Math.max(30, teams.length * 3.2)}s`,
        } as React.CSSProperties
      }
    >
      <div className="fep-ticker-track">
        {run(false)}
        {run(true)}
      </div>
    </section>
  );
};

export default TeamTicker;
