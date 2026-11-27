import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  title: string;
  pages?: string[];
}

const Breadcrumb = ({ title, pages = [] }: BreadcrumbProps) => {
  const trail = pages.filter((p) => p.trim() && p.trim() !== "/");

  return (
    <div className="bg-tiza border-b border-[var(--border)] pt-14">
      <div className="container pt-10 pb-8 lg:pt-14 lg:pb-10">
        <nav aria-label="Ruta de navegación" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-grada">
            <li>
              <Link href="/" className="hover:text-noche transition-colors">
                Inicio
              </Link>
            </li>
            {trail.map((page, idx) => (
              <li key={`${page}-${idx}`} className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                <span
                  aria-current={idx === trail.length - 1 ? "page" : undefined}
                  className="first-letter:uppercase aria-[current=page]:text-noche"
                >
                  {page}
                </span>
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="fep-display text-[clamp(2.5rem,6vw,4.5rem)] text-noche">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default Breadcrumb;
