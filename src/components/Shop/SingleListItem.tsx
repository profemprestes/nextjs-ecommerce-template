"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { formatProductPrice } from "./shopData";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
      })
    );
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  return (
    <article className="group rounded-none bg-[#FFFFFF] border border-black/10 overflow-hidden transition-colors hover:border-black/25">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
          onClick={handleProductDetails}
          className="relative sm:w-[270px] aspect-[4/3] sm:aspect-auto sm:h-[220px] shrink-0 overflow-hidden bg-[#F5F5F7] border-b sm:border-b-0 sm:border-r border-black/10 block"
        >
          <Image
            src={item.imgs.previews[0]}
            alt={item.title}
            fill
            sizes="(min-width: 640px) 270px, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-center justify-between py-5 px-5 sm:px-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-mono-cl text-[11px] uppercase text-[#6E6E73]">
                {item.version === "Retro"
                  ? "Edición Retro"
                  : item.version === "A confirmar"
                  ? "Versión a confirmar"
                  : `Versión ${item.version}`}
              </span>
              <span className="font-mono-cl text-[11px] uppercase text-[#1D1D1F]">
                {item.modalidad === "entrega_inmediata"
                  ? "En stock"
                  : "Por encargo"}
              </span>
            </div>

            <h3
              className="font-display text-xl font-bold text-[#1D1D1F] hover:text-[#0066CC] transition-colors mb-1.5"
              onClick={handleProductDetails}
            >
              <Link href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}>{item.title}</Link>
            </h3>

            <p className="text-xs text-[#6E6E73]">
              {item.imgs.previews.length}{" "}
              {item.imgs.previews.length === 1 ? "foto" : "fotos"} disponibles
              {item.dorsal ? ` · ${item.dorsal}` : ""}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end gap-2.5">
            <span className="font-mono-cl text-lg text-[#1D1D1F]">
              {formatProductPrice(item.discountedPrice)}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center h-9 px-4 rounded-[980px] bg-[#0071E3] text-[#FFFFFF] text-xs font-medium hover:bg-[#0076DF] transition-colors"
              >
                Sumar a consulta
              </button>
              <button
                type="button"
                onClick={() => {
                  openModal();
                  handleQuickViewUpdate();
                }}
                aria-label="Vista rápida"
                className="inline-flex items-center justify-center h-9 px-3 rounded-[980px] border border-black/15 text-xs font-medium text-[#1D1D1F] hover:border-[#0071E3] hover:text-[#0071E3] transition-colors"
              >
                Vista rápida
              </button>
              <button
                type="button"
                onClick={handleItemToWishList}
                aria-label="Agregar a favoritos"
                className="inline-flex items-center justify-center w-9 h-9 rounded-[980px] border border-black/15 text-[#1D1D1F] hover:border-[#0071E3] hover:text-[#0071E3] transition-colors"
              >
                ♡
              </button>
            </div>

            <Link
              href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
              onClick={handleProductDetails}
              className="inline-flex text-xs font-medium text-[#0066CC] hover:underline"
            >
              Ver galería y talles
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SingleListItem;
