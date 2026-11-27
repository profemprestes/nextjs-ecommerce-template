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

interface BestSellerProps {
  initialProducts?: Product[];
}

const BestSeller = ({ initialProducts }: BestSellerProps) => {
  const catalogProducts = initialProducts ?? shopData;
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"all" | ProductCategory>("all");

  const items = useMemo(() => {
    const filtered =
      activeTab === "all"
        ? catalogProducts
        : catalogProducts.filter((item) => item.category === activeTab);
    return filtered.slice(0, 8);
  }, [activeTab, catalogProducts]);

  const handleSelect = (item: Product) => {
    dispatch(updateproductDetails({ ...item }));
  };

  const handleAdd = (item: Product) => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
  };

  return (
    <section className="bg-[#F5F5F7] text-[#1D1D1F] py-14 lg:py-20">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="min-w-0">
            <span className="font-mono-cl text-xs uppercase text-[#6E6E73] block mb-2">
              Colección verificada
            </span>
            <h2 className="sport-display text-[#1D1D1F] mb-2">
              Catálogo en stock
            </h2>
            <p className="text-[#6E6E73]">
              {catalogProducts.length} modelos verificados con entrega inmediata o
              disponibilidad a confirmar.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filtrar colección"
            className="flex flex-wrap gap-2"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-9 px-4 rounded-[980px] border text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#0071E3] border-[#0071E3] text-[#FFFFFF]"
                      : "bg-[#FFFFFF] border-black/15 text-[#1D1D1F] hover:border-[#0071E3] hover:text-[#0066CC]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hairline catalog list */}
        <div className="border-t border-black/15">
          {items.map((item) => (
            <div
              key={item.slug ?? item.id}
              className="border-b border-black/10 py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              <div className="md:col-span-6 flex items-center gap-4 min-w-0">
                <Link
                  href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
                  onClick={() => handleSelect(item)}
                  className="relative w-20 aspect-[4/3] shrink-0 rounded-none overflow-hidden border border-black/10 bg-[#FFFFFF]"
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
                    href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
                    onClick={() => handleSelect(item)}
                    className="font-semibold text-base text-[#1D1D1F] hover:text-[#0066CC] transition-colors block truncate"
                  >
                    {item.title}
                  </Link>
                  <span className="font-mono-cl text-xs text-[#6E6E73]">
                    {item.version === "Retro"
                      ? "Edición Retro"
                      : item.version === "A confirmar"
                      ? "Versión a confirmar"
                      : `Versión ${item.version}`}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 font-mono-cl text-xs uppercase text-[#6E6E73]">
                {item.modalidad === "entrega_inmediata"
                  ? "Entrega inmediata"
                  : "A confirmar"}
              </div>

              <div className="md:col-span-2 font-mono-cl text-base text-[#1D1D1F]">
                {formatProductPrice(item.discountedPrice)}
              </div>

              <div className="md:col-span-2 flex md:justify-end items-center gap-3">
                <Link
                  href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
                  onClick={() => handleSelect(item)}
                  className="text-xs font-medium text-[#0066CC] hover:underline whitespace-nowrap"
                >
                  Ver ficha
                </Link>
                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className="inline-flex items-center justify-center h-9 px-4 text-xs font-medium bg-[#0071E3] text-[#FFFFFF] rounded-[980px] hover:bg-[#0076DF] transition-colors"
                >
                  Sumar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 flex justify-between items-center flex-wrap gap-4">
          <p className="font-mono-cl text-xs uppercase text-[#6E6E73]">
            Mostrando {items.length} de {catalogProducts.length} modelos disponibles
          </p>
          <Link href="/shop-with-sidebar" className="sport-btn-secondary">
            Ver las {catalogProducts.length} camisetas
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
