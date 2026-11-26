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

  return (
    <>
      <header className="fixed top-3 left-1/2 -translate-x-1/2 w-[min(1220px,calc(100%-24px))] z-300">
        <div className="relative overflow-hidden rounded-full glass-panel px-4 lg:px-6 h-12 lg:h-[52px] flex items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 flex items-center min-h-[44px] text-[#F5EAD6] hover:text-[#A8D6F0] transition-colors"
          >
            <span className="font-brand text-[13px] lg:text-[14px] tracking-[0.02em] whitespace-nowrap">
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
                  className="inline-flex items-center min-h-[36px] px-3.5 rounded-full text-sm font-medium text-[#F5EAD6] hover:bg-[#F5EAD6]/10 hover:text-[#A8D6F0] transition-colors"
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
              className="hidden sm:inline-flex items-center min-h-[36px] px-3.5 rounded-full text-sm font-medium text-[#B8C7DC] hover:bg-[#F5EAD6]/10 hover:text-[#F5EAD6] transition-colors"
            >
              Favoritos
            </Link>

            <button
              type="button"
              onClick={openCartModal}
              className="inline-flex items-center justify-center min-h-[36px] lg:min-h-[38px] px-4 rounded-full bg-[#A8D6F0] text-[#0A1B33] font-semibold text-xs lg:text-sm hover:bg-[#8ECBF5] transition-colors whitespace-nowrap"
            >
              Consulta ({cartItems.length})
            </button>

            <button
              type="button"
              aria-label={navigationOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="lg:hidden inline-flex items-center justify-center min-h-[40px] min-w-[44px] px-3 rounded-full border border-[rgba(245,234,214,0.22)] text-xs font-semibold text-[#F5EAD6] hover:border-[#A8D6F0] transition-colors"
            >
              {navigationOpen ? "Cerrar" : "Menú"}
            </button>
          </div>

          {/* 2px Celeste Sky scroll-progress underline */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-[#A8D6F0] transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Mobile Drawer (< 1024px) */}
      {navigationOpen && (
        <div
          className="lg:hidden fixed inset-0 z-400 flex justify-end bg-[#070F1C]/75 backdrop-blur-sm"
          onClick={() => setNavigationOpen(false)}
        >
          <aside
            aria-label="Menú móvil"
            className="w-[min(340px,88vw)] h-full bg-[#0A1B33] border-l border-[rgba(245,234,214,0.18)] p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-[rgba(245,234,214,0.18)]">
                <span className="font-brand text-sm text-[#F5EAD6]">
                  FUTBOL EN LA PIEL
                </span>
                <button
                  type="button"
                  onClick={() => setNavigationOpen(false)}
                  className="min-h-[44px] min-w-[44px] px-3 rounded-full border border-[rgba(245,234,214,0.22)] text-xs font-semibold text-[#F5EAD6]"
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
                    className="min-h-[44px] px-4 rounded-xl flex items-center text-base font-medium text-[#F5EAD6] hover:bg-[#132C52] hover:text-[#A8D6F0] transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
                <Link
                  href="/wishlist"
                  onClick={() => setNavigationOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl flex items-center text-base font-medium text-[#B8C7DC] hover:bg-[#132C52] hover:text-[#F5EAD6] transition-colors"
                >
                  Favoritos
                </Link>
              </nav>
            </div>

            <div className="pt-5 border-t border-[rgba(245,234,214,0.18)] flex flex-col gap-3">
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
