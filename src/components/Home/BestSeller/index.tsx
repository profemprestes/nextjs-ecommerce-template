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
    <section className="bg-[#0A1B33] text-[#F5EAD6] py-16 lg:py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="min-w-0">
            <span className="font-mono-cl text-xs uppercase text-[#A8D6F0] block mb-2">
              Colección verificada
            </span>
            <h2 className="sport-display text-[#F5EAD6] mb-2">
              Catálogo en stock
            </h2>
            <p className="text-[#B8C7DC]">
              {shopData.length} modelos verificados con entrega inmediata o
              disponibilidad a confirmar.
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
                  className={`min-h-[44px] px-4 rounded-full border text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#A8D6F0] border-[#A8D6F0] text-[#0A1B33] font-semibold"
                      : "bg-[#102442] border-[rgba(245,234,214,0.18)] text-[#F5EAD6] hover:border-[#A8D6F0]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hairline catalog list */}
        <div className="border-t border-[rgba(142,203,245,0.4)]">
          {items.map((item) => (
            <div
              key={item.slug ?? item.id}
              className="border-b border-[rgba(245,234,214,0.18)] py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              <div className="md:col-span-6 flex items-center gap-4 min-w-0">
                <Link
                  href="/shop-details"
                  onClick={() => handleSelect(item)}
                  className="relative w-20 aspect-[4/3] shrink-0 rounded-lg overflow-hidden border border-[rgba(245,234,214,0.18)] bg-[#102442]"
                >
                  <Image
                    src={item.imgs?.previews[0] ?? "/camisetas/noruega.jpeg"}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    href="/shop-details"
                    onClick={() => handleSelect(item)}
                    className="font-semibold text-base text-[#F5EAD6] hover:text-[#A8D6F0] transition-colors block truncate"
                  >
                    {item.title}
                  </Link>
                  <span className="font-mono-cl text-xs text-[#B8C7DC]">
                    {item.version === "Retro"
                      ? "Edición Retro"
                      : item.version === "A confirmar"
                      ? "Versión a confirmar"
                      : `Versión ${item.version}`}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 font-mono-cl text-xs uppercase text-[#B8C7DC]">
                {item.modalidad === "entrega_inmediata"
                  ? "Entrega inmediata"
                  : "A confirmar"}
              </div>

              <div className="md:col-span-2 font-mono-cl text-base text-[#A8D6F0]">
                {formatProductPrice(item.discountedPrice)}
              </div>

              <div className="md:col-span-2 flex md:justify-end gap-2.5">
                <Link
                  href="/shop-details"
                  onClick={() => handleSelect(item)}
                  className="inline-flex items-center justify-center min-h-[40px] px-3.5 text-xs font-medium border border-[rgba(245,234,214,0.22)] rounded-full text-[#F5EAD6] hover:border-[#A8D6F0] hover:text-[#A8D6F0] transition-colors"
                >
                  Ver ficha
                </Link>
                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className="inline-flex items-center justify-center min-h-[40px] px-4 text-xs font-semibold bg-[#A8D6F0] text-[#0A1B33] rounded-full hover:bg-[#8ECBF5] transition-colors"
                >
                  Sumar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 flex justify-between items-center flex-wrap gap-4">
          <p className="font-mono-cl text-xs uppercase text-[#B8C7DC]">
            Mostrando {items.length} de {shopData.length} modelos disponibles
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
