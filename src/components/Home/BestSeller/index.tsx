"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToCart } from "@/redux/features/cart-slice";
import shopData, { formatProductPrice } from "@/components/Shop/shopData";
import { Product, ProductCategory } from "@/types/product";

const TABS: { key: "all" | ProductCategory; label: string }[] = [
  { key: "all", label: "Destacadas" },
  { key: "uruguay", label: "La Celeste y Uruguay" },
  { key: "actuales", label: "Actuales 2026" },
  { key: "retros", label: "Retros" },
  { key: "clubes", label: "Clubes" },
];

const BestSeller = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"all" | ProductCategory>("all");

  const items = useMemo(() => {
    const filtered =
      activeTab === "all"
        ? shopData
        : shopData.filter((item) => item.category === activeTab);
    return filtered.slice(0, 8);
  }, [activeTab]);

  const handleSelect = (item: Product) => {
    dispatch(updateproductDetails({ ...item }));
  };

  const handleAdd = (item: Product) => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
  };

  return (
    <section className="bg-[var(--color-paper)] py-16 lg:py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="min-w-0">
            <h2 className="sport-display text-[var(--color-ink)] mb-2">
              Catálogo en stock
            </h2>
            <p className="text-[var(--color-ink-2)]">
              49 modelos verificados con entrega inmediata o disponibilidad a
              confirmar.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar colección"
            className="flex flex-wrap gap-2"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.key)}
                  className={`min-h-[40px] px-3.5 rounded-[4px] border text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-accent-ink)]"
                      : "bg-[var(--color-paper)] border-[var(--color-rule)] text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sport index list */}
        <div className="sport-rule-bar">
          {items.map((item) => (
            <div
              key={item.slug ?? item.id}
              className="sport-rule-hair py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              <div className="md:col-span-6 flex items-center gap-4 min-w-0">
                <Link
                  href="/shop-details"
                  onClick={() => handleSelect(item)}
                  className="relative w-16 h-16 shrink-0 sport-photo overflow-hidden bg-[var(--color-paper-2)]"
                >
                  <Image
                    src={item.imgs?.previews[0] ?? "/camisetas/noruega.jpeg"}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    href="/shop-details"
                    onClick={() => handleSelect(item)}
                    className="font-medium text-base text-[var(--color-ink)] hover:underline hover:decoration-[var(--color-accent-deep)] block truncate"
                  >
                    {item.title}
                  </Link>
                  <span className="text-sm text-[var(--color-muted)]">
                    {item.version === "Retro"
                      ? "Edición Retro"
                      : item.version === "A confirmar"
                      ? "Versión a confirmar"
                      : `Versión ${item.version}`}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 text-sm text-[var(--color-ink-2)]">
                {item.modalidad === "entrega_inmediata"
                  ? "Entrega inmediata"
                  : "A confirmar"}
              </div>

              <div className="md:col-span-2 sport-mono text-base text-[var(--color-ink)]">
                {formatProductPrice(item.discountedPrice)}
              </div>

              <div className="md:col-span-2 flex md:justify-end gap-3">
                <Link
                  href="/shop-details"
                  onClick={() => handleSelect(item)}
                  className="inline-flex items-center min-h-[40px] px-3 text-sm font-medium border border-[var(--color-rule)] rounded-[4px] text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
                >
                  Ver ficha
                </Link>
                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className="inline-flex items-center min-h-[40px] px-3 text-sm font-medium bg-[var(--color-ink)] text-[var(--color-paper)] rounded-[4px] hover:bg-[var(--color-ink-2)]"
                >
                  Sumar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sport-rule-bar pt-8 flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-[var(--color-muted)]">
            Mostrando {items.length} modelos de la colección.
          </p>
          <Link href="/shop-with-sidebar" className="sport-btn-secondary">
            Ver las {shopData.length} camisetas
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
