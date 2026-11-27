"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToCart } from "@/redux/features/cart-slice";
import shopData, { formatProductPrice } from "@/components/Shop/shopData";
import {
  PLACEHOLDER_IMAGE,
  availabilityLabel,
  productHref,
  useFlash,
  versionLabel,
} from "@/components/Shop/productLabels";
import { Product, ProductCategory } from "@/types/product";

const TABS: { key: "all" | ProductCategory; label: string }[] = [
  { key: "all", label: "Destacadas" },
  { key: "uruguay", label: "La Celeste y Uruguay" },
  { key: "actuales", label: "Actuales 2026" },
  { key: "retros", label: "Retros" },
  { key: "clubes", label: "Clubes" },
];

const SHOWN = 8;

interface CardProps {
  item: Product;
  index: number;
  featured: boolean;
  onSelect: (item: Product) => void;
  onAdd: (item: Product) => void;
}

const ShowcaseCard = ({ item, index, featured, onSelect, onAdd }: CardProps) => {
  const [added, flash] = useFlash();
  const href = productHref(item);
  const [front, back] = item.imgs?.previews ?? [];

  return (
    <article
      className={`group fep-rise flex flex-col min-w-0 ${
        featured ? "col-span-2 lg:row-span-2" : ""
      }`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <Link
        href={href}
        onClick={() => onSelect(item)}
        className={`fep-swap relative block overflow-hidden bg-[var(--field-deep)] ${
          featured
            ? "rounded-[22px] aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:flex-1 lg:min-h-[420px]"
            : "rounded-[14px] aspect-[4/5]"
        }`}
      >
        <Image
          src={front ?? PLACEHOLDER_IMAGE}
          alt={item.title}
          fill
          sizes={
            featured
              ? "(min-width: 1024px) 580px, 100vw"
              : "(min-width: 1024px) 280px, 50vw"
          }
          className="fep-swap-a object-cover"
        />
        {back && (
          <Image
            src={back}
            alt=""
            aria-hidden="true"
            fill
            sizes={
              featured
                ? "(min-width: 1024px) 580px, 100vw"
                : "(min-width: 1024px) 280px, 50vw"
            }
            className="fep-swap-b object-cover"
          />
        )}
      </Link>

      <div className="pt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {featured ? (
            <h3 className="fep-display text-[clamp(1.75rem,3vw,2.75rem)] text-noche">
              <Link href={href} onClick={() => onSelect(item)}>
                {item.title}
              </Link>
            </h3>
          ) : (
            <h3 className="fep-card-title">
              <Link
                href={href}
                onClick={() => onSelect(item)}
                className="hover:text-celeste-hondo transition-colors"
              >
                {item.title}
              </Link>
            </h3>
          )}
          <p className="mt-1 text-[0.8125rem] text-grada">
            {versionLabel(item.version)}, {availabilityLabel(item.modalidad)}
          </p>
        </div>
        <p
          className={`shrink-0 tabular-nums font-semibold text-noche ${
            featured ? "text-lg" : "text-[0.9375rem]"
          }`}
        >
          {formatProductPrice(item.discountedPrice)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          onAdd(item);
          flash();
        }}
        className={`mt-3 self-start ${featured ? "fep-btn" : "fep-btn-ghost fep-btn-sm"}`}
      >
        <span aria-live="polite">
          {added ? "Sumada a tu consulta" : "Sumar a consulta"}
        </span>
      </button>
    </article>
  );
};

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
    return filtered.slice(0, SHOWN);
  }, [activeTab, catalogProducts]);

  const handleSelect = (item: Product) => {
    dispatch(updateproductDetails({ ...item }));
  };

  const handleAdd = (item: Product) => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
  };

  return (
    <section className="bg-tiza text-noche py-16 lg:py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-12">
          <div className="min-w-0">
            <h2 className="fep-display text-[clamp(2.5rem,5.5vw,4.5rem)] text-noche mb-3">
              Elegí la tuya
            </h2>
            <p className="text-grada max-w-[48ch]">
              {catalogProducts.length} modelos entre selecciones, clubes y
              retros. Tocá una camiseta para ver todas sus fotos.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filtrar camisetas"
            className="flex gap-2 overflow-x-auto no-scrollbar -mx-[var(--pad)] px-[var(--pad)] lg:mx-0 lg:px-0 lg:flex-wrap"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 min-h-11 px-4 rounded-full border text-[0.8125rem] font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-95 ${
                    active
                      ? "bg-noche border-noche text-white"
                      : "bg-white border-[var(--border)] text-noche hover:border-noche"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[22px] bg-white p-10 text-center">
            <p className="font-medium mb-4">
              Todavía no hay camisetas cargadas en esta categoría.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="fep-btn-dark"
            >
              Ver las destacadas
            </button>
          </div>
        ) : (
          <div
            key={activeTab}
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-5"
          >
            {items.map((item, idx) => (
              <ShowcaseCard
                key={item.slug ?? item.id}
                item={item}
                index={idx}
                featured={idx === 0}
                onSelect={handleSelect}
                onAdd={handleAdd}
              />
            ))}

            <Link
              href="/shop-with-sidebar"
              className="fep-rise group col-span-2 lg:col-span-1 rounded-[14px] bg-noche text-white p-6 flex flex-col justify-between gap-8 min-h-[220px] lg:min-h-0 transition-transform duration-500 ease-[var(--ease-spring)] active:scale-[0.98]"
              style={{ "--i": items.length } as React.CSSProperties}
            >
              <span className="fep-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[0.92]">
                Ver las {catalogProducts.length} camisetas
              </span>
              <span className="text-sm text-celeste max-w-[26ch]">
                Buscá por equipo, jugador o año y filtrá por versión.
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSeller;
