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
    <div className="group rounded-lg bg-white shadow-1 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="shadow-list relative overflow-hidden flex items-center justify-center sm:max-w-[270px] w-full h-[240px] shrink-0">
          <Link
            href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
            onClick={handleProductDetails}
            className="relative w-full h-full block"
          >
            <Image
              src={item.imgs.previews[0]}
              alt={item.title}
              fill
              sizes="(min-width: 640px) 270px, 100vw"
              className="object-cover"
            />
          </Link>

          <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-4 ease-linear duration-200 group-hover:translate-y-0">
            <button
              onClick={() => {
                openModal();
                handleQuickViewUpdate();
              }}
              aria-label="Vista rápida"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
            >
              +
            </button>

            <button
              onClick={handleAddToCart}
              className="inline-flex font-medium text-custom-sm py-[7px] px-4 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
            >
              Sumar a consulta
            </button>

            <button
              onClick={handleItemToWishList}
              aria-label="Agregar a favoritos"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
            >
              ♡
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-center justify-between py-5 px-5 sm:px-7.5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block text-custom-xs font-medium text-blue bg-blue-light-5 px-2.5 py-0.5 rounded">
                {item.version === "Retro"
                  ? "Edición Retro"
                  : item.version === "A confirmar"
                  ? "Versión a confirmar"
                  : `Versión ${item.version}`}
              </span>
              {item.modalidad === "entrega_inmediata" && (
                <span className="inline-block text-custom-xs font-medium bg-green-light-6 text-green-dark px-2.5 py-0.5 rounded">
                  Entrega inmediata
                </span>
              )}
            </div>

            <h3
              className="font-medium text-dark text-lg ease-out duration-200 hover:text-blue mb-1.5"
              onClick={handleProductDetails}
            >
              <Link href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}>{item.title}</Link>
            </h3>

            <p className="text-custom-sm text-body">
              {item.imgs.previews.length}{" "}
              {item.imgs.previews.length === 1 ? "foto" : "fotos"} disponibles
              {item.dorsal ? ` · ${item.dorsal}` : ""}
            </p>
          </div>

          <div className="shrink-0 sm:text-right">
            <span className="block font-semibold text-lg text-dark mb-2">
              {formatProductPrice(item.discountedPrice)}
            </span>
            <Link
              href={item.slug ? `/shop-details?slug=${encodeURIComponent(item.slug)}` : "/shop-details"}
              onClick={handleProductDetails}
              className="inline-flex text-custom-sm font-medium text-blue hover:underline"
            >
              Ver galería y talles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
