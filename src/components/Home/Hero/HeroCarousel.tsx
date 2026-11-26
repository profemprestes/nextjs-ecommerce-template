"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

import "swiper/css/pagination";
import "swiper/css";

const slides = [
  {
    badge: "La Celeste · Mundial 2026",
    price: "Desde $ 1.990",
    title: "Camiseta Uruguay Alternativa 2026 — Nike",
    description:
      "Versión Jugador en tela técnica respirable, corte entallado y escudo termosellado. Consultá talle disponible o encargala.",
    image: "/camisetas/uruguay-away-2026-nike-jugador.jpeg",
    ctaHref: "/shop-with-sidebar",
    ctaLabel: "Ver catálogo",
  },
  {
    badge: "Edición Retro · 1996",
    price: "Desde $ 1.890",
    title: "Manchester United 1996 Blanca — Cantona #7",
    description:
      "Clásico histórico Umbro con etiquetas y dorsal icónico. Entrega inmediata en talles seleccionados o por encargo.",
    image: "/camisetas/manchest3er_united.jpeg",
    ctaHref: "/shop-with-sidebar",
    ctaLabel: "Explorar retros",
  },
];

const HeroCarousel = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slides.map((slide, idx) => (
        <SwiperSlide key={idx}>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row justify-between gap-6">
            <div className="max-w-[400px] py-8 sm:py-14 lg:py-20 pl-4 sm:pl-7.5 lg:pl-12.5 pr-4">
              <div className="mb-5">
                <span className="inline-block text-custom-xs font-medium text-blue bg-blue-light-5 px-3 py-1 rounded-full mb-3">
                  {slide.badge}
                </span>
                <p className="font-semibold text-2xl sm:text-heading-5 text-blue">
                  {slide.price}
                </p>
              </div>

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3 leading-tight">
                <Link href={slide.ctaHref} className="hover:text-blue">
                  {slide.title}
                </Link>
              </h1>

              <p className="text-body text-custom-sm leading-relaxed">
                {slide.description}
              </p>

              <Link
                href={slide.ctaHref}
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-8 ease-out duration-200 hover:bg-blue mt-8"
              >
                {slide.ctaLabel}
              </Link>
            </div>

            <div className="p-4 sm:pr-8 lg:pr-10 shrink-0">
              <Image
                src={slide.image}
                alt={slide.title}
                width={320}
                height={340}
                className="w-[260px] sm:w-[300px] h-[280px] sm:h-[330px] object-cover rounded-lg shadow-1"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousel;
