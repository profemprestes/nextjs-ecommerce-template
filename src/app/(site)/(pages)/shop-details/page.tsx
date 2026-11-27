import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { getCachedStorefrontProducts } from "@/lib/storefront-catalog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle de Camiseta | Fútbol en la Piel",
  description:
    "Galería, talles y consulta directa por WhatsApp en Fútbol en la Piel.",
};

type ShopDetailsPageProps = {
  searchParams?: Promise<{ slug?: string }>;
};

const ShopDetailsPage = async ({ searchParams }: ShopDetailsPageProps) => {
  const resolvedSearch = searchParams ? await searchParams : {};
  const requestedSlug = (resolvedSearch?.slug ?? "").trim();
  const products = await getCachedStorefrontProducts();

  const matchedBySlug = requestedSlug
    ? products.find((p) => p.slug === requestedSlug) ?? null
    : null;

  const initialProduct = requestedSlug
    ? matchedBySlug
    : products[0] ?? null;

  const notFoundSlug =
    requestedSlug && !matchedBySlug ? requestedSlug : null;

  const relatedProducts = products
    .filter((p) => p.slug !== initialProduct?.slug)
    .slice(0, 8);

  return (
    <main>
      <ShopDetails
        initialProduct={initialProduct}
        relatedProducts={relatedProducts}
        hasExplicitSlug={Boolean(requestedSlug)}
        notFoundSlug={notFoundSlug}
      />
    </main>
  );
};

export default ShopDetailsPage;
