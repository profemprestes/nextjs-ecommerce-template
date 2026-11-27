"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const NAV = [
  { title: "Catálogo", path: "/shop-with-sidebar" },
  { title: "Guía de talles", path: "/#talles" },
  { title: "Cómo comprar", path: "/#guia-compra" },
  { title: "Contacto", path: "/contact" },
];

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const { openCartModal } = useCartModalContext();
  const cartCount = useAppSelector((state) => state.cartReducer.items.length);

  // Bump the counter only when the count changes after mount
  const prevCount = useRef(cartCount);
  const [bumpKey, setBumpKey] = useState(0);
  useEffect(() => {
    if (cartCount !== prevCount.current) {
      prevCount.current = cartCount;
      setBumpKey((k) => k + 1);
    }
  }, [cartCount]);

  // Scroll progress via transform, written straight to the DOM (no re-render per scroll)
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavigationOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigationOpen]);

  const isActive = (path: string) =>
    !path.includes("#") && pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-300 bg-[var(--glass)] backdrop-blur-[18px] backdrop-saturate-[1.6] border-b border-[var(--border)]">
        <div className="container relative h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 flex items-center min-h-11 text-noche"
          >
            <span className="fep-display text-[1.375rem] leading-none tracking-[0.01em] whitespace-nowrap">
              Fútbol en la Piel
            </span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-1"
          >
            {NAV.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className="relative inline-flex items-center min-h-11 px-3 text-sm font-medium text-noche/75 hover:text-noche transition-colors aria-[current=page]:text-noche after:absolute after:left-3 after:right-3 after:bottom-2 after:h-[2px] after:rounded-full after:bg-celeste after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              className="hidden sm:inline-flex items-center min-h-11 px-3 text-sm font-medium text-noche/75 hover:text-noche transition-colors"
            >
              Favoritos
            </Link>

            <button
              type="button"
              onClick={openCartModal}
              aria-label={`Ver mi consulta, ${cartCount} ${cartCount === 1 ? "camiseta" : "camisetas"}`}
              className="fep-btn-dark fep-btn-sm min-h-10! gap-2!"
            >
              Mi consulta
              <span
                key={bumpKey}
                aria-hidden="true"
                className={`inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-celeste text-noche text-xs font-bold tabular-nums ${
                  bumpKey ? "fep-bump" : ""
                }`}
              >
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              aria-label={navigationOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={navigationOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="lg:hidden fep-icon-btn"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <span
          ref={progressRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 -bottom-px h-[2px] bg-celeste origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </header>

      {navigationOpen && (
        <div
          className="fep-backdrop lg:hidden fixed inset-0 z-400 flex justify-end bg-noche/40 backdrop-blur-sm"
          onClick={() => setNavigationOpen(false)}
        >
          <aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fep-drawer w-[min(360px,88vw)] h-full bg-white p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 mb-4 border-b border-[var(--border)]">
                <span className="fep-display text-xl text-noche">
                  Fútbol en la Piel
                </span>
                <button
                  type="button"
                  onClick={() => setNavigationOpen(false)}
                  aria-label="Cerrar menú"
                  className="fep-icon-btn"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Navegación móvil" className="flex flex-col">
                {[{ title: "Inicio", path: "/" }, ...NAV, { title: "Favoritos", path: "/wishlist" }].map(
                  (item, idx) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setNavigationOpen(false)}
                      aria-current={isActive(item.path) ? "page" : undefined}
                      className="fep-rise fep-display min-h-14 flex items-center text-[2rem] text-noche/80 hover:text-noche aria-[current=page]:text-celeste-hondo border-b border-[var(--border)] transition-colors"
                      style={{ "--i": idx + 2 } as React.CSSProperties}
                    >
                      {item.title}
                    </Link>
                  )
                )}
              </nav>
            </div>

            <a
              href="https://wa.me/59899760998"
              target="_blank"
              rel="noopener noreferrer"
              className="fep-btn w-full"
            >
              Escribinos por WhatsApp
            </a>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
