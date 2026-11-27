"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { menuData } from "./menuData";
import { useAppSelector } from "@/redux/store";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { openCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavigationOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigationOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-300 bg-[rgba(245,245,247,0.92)] backdrop-blur-[20px] backdrop-saturate-[1.8] border-b border-black/10">
        <div className="container relative h-11 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 flex items-center min-h-[44px] text-[#1D1D1F] hover:text-[#0066CC] transition-colors"
          >
            <span className="font-brand text-[13px] tracking-[0.02em] whitespace-nowrap">
              FUTBOL EN LA PIEL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-1"
          >
            {menuData.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.path}
                  className="inline-flex items-center min-h-[36px] px-3 text-xs font-medium text-[#1D1D1F] hover:text-[#0066CC] transition-colors"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              className="hidden sm:inline-flex items-center min-h-[36px] px-3 text-xs font-medium text-[#424245] hover:text-[#0066CC] transition-colors"
            >
              Favoritos
            </Link>

            <button
              type="button"
              onClick={openCartModal}
              className="inline-flex items-center justify-center h-8 px-3.5 rounded-[980px] bg-[#0071E3] text-[#FFFFFF] font-medium text-xs hover:bg-[#0066CC] transition-colors whitespace-nowrap"
            >
              Consulta ({cartItems.length})
            </button>

            <button
              type="button"
              aria-label={navigationOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={navigationOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="lg:hidden inline-flex items-center justify-center h-8 px-3 rounded-[980px] border border-[#0066CC] text-xs font-medium text-[#0066CC] hover:bg-[#0066CC]/8 transition-colors"
            >
              {navigationOpen ? "Cerrar" : "Menú"}
            </button>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none block h-[2px] bg-[#0071E3] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </header>

      {/* Mobile Drawer (< 1024px) */}
      {navigationOpen && (
        <div
          className="lg:hidden fixed inset-0 z-400 flex justify-end bg-black/35 backdrop-blur-sm"
          onClick={() => setNavigationOpen(false)}
        >
          <aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú móvil"
            className="w-[min(340px,88vw)] h-full bg-[#FFFFFF] border-l border-black/10 p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-black/10">
                <span className="font-brand text-sm text-[#1D1D1F]">
                  FUTBOL EN LA PIEL
                </span>
                <button
                  type="button"
                  onClick={() => setNavigationOpen(false)}
                  className="min-h-[36px] px-3.5 rounded-[980px] border border-[#0071E3] text-xs font-medium text-[#0071E3]"
                >
                  Cerrar
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {menuData.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={() => setNavigationOpen(false)}
                    className="min-h-[44px] px-4 rounded-none flex items-center text-base font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#0066CC] transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
                <Link
                  href="/wishlist"
                  onClick={() => setNavigationOpen(false)}
                  className="min-h-[44px] px-4 rounded-none flex items-center text-base font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
                >
                  Favoritos
                </Link>
              </nav>
            </div>

            <div className="pt-5 border-t border-black/10 flex flex-col gap-3">
              <Link
                href="/checkout"
                onClick={() => setNavigationOpen(false)}
                className="sport-btn-primary w-full text-center"
              >
                Consultar por WhatsApp
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
