import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getCachedStorefrontProducts } from "@/lib/storefront-catalog";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo completo | Fútbol en la Piel",
  description:
    "Catálogo completo de camisetas de fútbol actuales, retros, Uruguay y clubes internacionales en Fútbol en la Piel.",
};

const ShopWithoutSidebarPage = async () => {
  const products = await getCachedStorefrontProducts();

  return (
    <main>
      <ShopWithoutSidebar initialProducts={products} />
    </main>
  );
};

export default ShopWithoutSidebarPage;
