"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import shopData, { formatProductPrice } from "../Shop/shopData";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

const TALLES = ["S", "M", "L", "XL", "Otro (por encargo)"] as const;

const ShopDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const productFromRedux = useAppSelector(
    (state) => state.productDetailsReducer.value
  ) as Partial<Product>;

  const [product, setProduct] = useState<Product>(shopData[0]);
  const [previewImg, setPreviewImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [activeTab, setActiveTab] = useState<"tabOne" | "tabTwo" | "tabThree">(
    "tabOne"
  );

  useEffect(() => {
    if (productFromRedux && productFromRedux.title) {
      const matched =
        shopData.find((p) => p.title === productFromRedux.title) ??
        (productFromRedux as Product);
      setProduct(matched);
      setPreviewImg(0);
      localStorage.setItem("productDetails", JSON.stringify(matched));
      return;
    }
    const stored = localStorage.getItem("productDetails");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Product;
        if (parsed?.title && parsed?.imgs?.previews?.length) {
          setProduct(parsed);
        }
      } catch {
        // fallback to shopData[0]
      }
    }
  }, [productFromRedux]);

  const images =
    product?.imgs?.previews?.length > 0
      ? product.imgs.previews
      : [shopData[0].imgs.previews[0]];

  const activeImg = images[Math.min(previewImg, images.length - 1)];

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...product,
        quantity: 1,
      })
    );
    toast.success("Agregada a tu consulta");
  };

  const whatsappText = [
    `Hola Fútbol en la Piel! Quiero consultar por:`,
    `• Camiseta: ${product.title}`,
    `• Versión: ${product.version ?? "A confirmar"}`,
    `• Talle: ${selectedSize}`,
    "Quedo atento para confirmar stock, precio y envío.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/59899760998?text=${encodeURIComponent(
    whatsappText
  )}`;

  const tabs = [
    { id: "tabOne" as const, title: "Detalles y versión" },
    { id: "tabTwo" as const, title: "Guía de talles (S–XL)" },
    { id: "tabThree" as const, title: "Envíos y cambios" },
  ];

  return (
    <>
      <Breadcrumb title={"Ficha de camiseta"} pages={["tienda", "/", "detalle"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-24">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-14">
            {/* Galería */}
            <div className="lg:max-w-[570px] w-full">
              <div className="h-[420px] sm:h-[500px] rounded-lg shadow-1 bg-gray-2 overflow-hidden relative flex items-center justify-center">
                <Image
                  src={activeImg}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 570px, 100vw"
                  loading="eager"
                  className="object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex flex-wrap sm:flex-nowrap overflow-x-auto gap-3 mt-5 pb-2">
                  {images.map((img, idx) => (
                    <button
                      type="button"
                      onClick={() => setPreviewImg(idx)}
                      key={img + idx}
                      className={`relative shrink-0 flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-2 border-2 ease-out duration-200 hover:border-blue ${
                        previewImg === idx ? "border-blue" : "border-transparent"
                      }`}
                    >
                      <Image
                        fill
                        sizes="80px"
                        src={img}
                        alt={`${product.title} vista ${idx + 1}`}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info producto */}
            <div className="max-w-[540px] w-full">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex text-custom-xs font-medium text-blue bg-blue-light-5 px-3 py-1 rounded">
                  {product.version === "Retro"
                    ? "Edición Retro"
                    : product.version === "A confirmar"
                    ? "Versión a confirmar"
                    : `Versión ${product.version}`}
                </span>

                {product.modalidad === "entrega_inmediata" ? (
                  <span className="inline-flex text-custom-xs font-medium bg-green-light-6 text-green-dark px-3 py-1 rounded">
                    Entrega inmediata
                  </span>
                ) : (
                  <span className="inline-flex text-custom-xs font-medium bg-gray-2 text-dark-3 px-3 py-1 rounded">
                    Disponibilidad a confirmar
                  </span>
                )}
              </div>

              <h1 className="font-semibold text-xl sm:text-2xl xl:text-custom-2 text-dark mb-3">
                {product.title}
              </h1>

              <p className="font-semibold text-xl text-blue mb-5">
                {formatProductPrice(product.discountedPrice)}
              </p>

              <p className="text-custom-sm text-body mb-6 leading-relaxed">
                Confirmamos stock real de talle y precio final por WhatsApp
                antes de coordinar el pago. Envíos a Montevideo y los 19
                departamentos por DAC, Mirtrans y Correo Uruguayo.
              </p>

              {/* Metadatos */}
              <div className="border-y border-gray-3 py-4 mb-6 grid grid-cols-2 gap-3 text-custom-sm">
                <div>
                  <span className="text-dark-4 block text-custom-xs">
                    Equipo / Selección
                  </span>
                  <span className="font-medium text-dark">{product.team}</span>
                </div>
                <div>
                  <span className="text-dark-4 block text-custom-xs">
                    Temporada
                  </span>
                  <span className="font-medium text-dark">
                    {product.season ?? "Clásica / Especial"}
                  </span>
                </div>
                {product.dorsal && (
                  <div>
                    <span className="text-dark-4 block text-custom-xs">
                      Dorsal
                    </span>
                    <span className="font-medium text-dark">
                      {product.dorsal}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-dark-4 block text-custom-xs">
                    Imágenes
                  </span>
                  <span className="font-medium text-dark">
                    {images.length} {images.length === 1 ? "foto" : "fotos"}
                  </span>
                </div>
              </div>

              {/* Selector de talle */}
              <div className="mb-7">
                <p className="font-medium text-dark text-custom-sm mb-2.5">
                  Talle de interés
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {TALLES.map((talle) => (
                    <button
                      type="button"
                      key={talle}
                      onClick={() => setSelectedSize(talle)}
                      className={`px-4 py-2 rounded-md border text-custom-sm font-medium ease-out duration-200 ${
                        selectedSize === talle
                          ? "bg-blue text-white border-blue"
                          : "bg-white text-dark border-gray-3 hover:border-blue"
                      }`}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Consultar por WhatsApp
                </a>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex justify-center font-medium text-white bg-dark py-3 px-7 rounded-md ease-out duration-200 hover:bg-dark-2"
                >
                  Sumar a consulta
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs de información */}
      <section className="overflow-hidden bg-gray-2 py-16">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6 mb-7.5">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative ${
                  activeTab === item.id ? "text-blue" : "text-dark"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {activeTab === "tabOne" && (
            <div className="bg-white rounded-[10px] shadow-1 p-6 sm:p-8 text-custom-sm text-body space-y-3">
              <p>
                <strong className="text-dark">Versión Jugador:</strong> corte
                entallado (slim fit en pecho y cintura), tela técnica respirable
                y escudo termosellado. Si dudás entre dos talles o la preferís
                holgada, pedí un talle más.
              </p>
              <p>
                <strong className="text-dark">Versión Fan:</strong> calce
                clásico (regular fit), tela resistente y escudo bordado.
              </p>
              <p>
                <strong className="text-dark">Edición Retro:</strong> clásicos
                históricos (1988–2018) con etiquetas y dorsales icónicos.
              </p>
            </div>
          )}

          {activeTab === "tabTwo" && (
            <div className="bg-white rounded-[10px] shadow-1 p-6 sm:p-8 text-custom-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-3 text-dark">
                      <th className="py-2.5 px-4">Talle</th>
                      <th className="py-2.5 px-4">Ancho (axila a axila)</th>
                      <th className="py-2.5 px-4">Largo aproximado</th>
                      <th className="py-2.5 px-4">Altura orientativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-3">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-dark">S</td>
                      <td className="py-2.5 px-4">48–50 cm</td>
                      <td className="py-2.5 px-4">70–72 cm</td>
                      <td className="py-2.5 px-4">1.65–1.73 m</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-dark">M</td>
                      <td className="py-2.5 px-4">51–53 cm</td>
                      <td className="py-2.5 px-4">72–74 cm</td>
                      <td className="py-2.5 px-4">1.73–1.80 m</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-dark">L</td>
                      <td className="py-2.5 px-4">54–56 cm</td>
                      <td className="py-2.5 px-4">75–77 cm</td>
                      <td className="py-2.5 px-4">1.80–1.86 m</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-dark">XL</td>
                      <td className="py-2.5 px-4">57–59 cm</td>
                      <td className="py-2.5 px-4">77–79 cm</td>
                      <td className="py-2.5 px-4">1.86+ m</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tabThree" && (
            <div className="bg-white rounded-[10px] shadow-1 p-6 sm:p-8 text-custom-sm text-body space-y-3">
              <p>
                <strong className="text-dark">Envíos:</strong> Montevideo
                (entrega o retiro a coordinar) e Interior en los 19
                departamentos por DAC, Mirtrans y Correo Uruguayo.
              </p>
              <p>
                <strong className="text-dark">Cambios:</strong> Sujeto a
                disponibilidad de talle en stock, con prenda sin uso, sin lavar
                y etiqueta intacta. Las camisetas personalizadas con nombre y
                número a pedido no tienen cambio por talle.
              </p>
            </div>
          )}
        </div>
      </section>

      <RecentlyViewdItems />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
