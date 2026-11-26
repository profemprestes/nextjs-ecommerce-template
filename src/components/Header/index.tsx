"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "./menuData";
import { useAppSelector } from "@/redux/store";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { openCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  return (
    <header className="sticky top-0 left-0 w-full z-300 bg-[var(--color-paper)] border-b-2 border-[var(--color-rule-2)]">
      <div className="container">
        <div className="flex items-center justify-between gap-6 min-h-[72px]">
          <Link href="/" className="shrink-0 flex items-center py-2">
            <Image
              src="/logos/futbolenlapiel_horizontal_transparente.png"
              alt="Fútbol en la Piel"
              width={168}
              height={38}
              loading="eager"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Navegación principal edge-aligned */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-7"
          >
            {menuData.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className="text-sm font-medium text-[var(--color-ink)] hover:underline hover:decoration-[var(--color-accent-deep)] py-2"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Acciones derechas */}
          <div className="flex items-center gap-3">
            <Link
              href="/wishlist"
              className="hidden sm:inline-flex items-center min-h-[44px] px-3 text-sm font-medium text-[var(--color-ink-2)] hover:underline hover:decoration-[var(--color-accent-deep)]"
            >
              Favoritos
            </Link>

            <button
              type="button"
              onClick={openCartModal}
              className="sport-btn-primary text-sm px-4 py-2"
            >
              Consulta ({cartItems.length})
            </button>

            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] border border-[var(--color-rule)] rounded-[4px] text-[var(--color-ink)]"
            >
              {navigationOpen ? "Cerrar" : "Menú"}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {navigationOpen && (
          <nav
            aria-label="Menú móvil"
            className="lg:hidden border-t border-[var(--color-rule)] py-4 flex flex-col gap-3"
          >
            {menuData.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => setNavigationOpen(false)}
                className="text-base font-medium text-[var(--color-ink)] py-1.5"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setNavigationOpen(false)}
              className="text-base font-medium text-[var(--color-ink)] py-1.5"
            >
              Favoritos
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
