import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getCachedStorefrontProducts } from "@/lib/storefront-catalog";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo | Fútbol en la Piel",
  description:
    "Catálogo completo de camisetas de fútbol actuales, retros, Uruguay y clubes internacionales en Fútbol en la Piel.",
};

const ShopWithSidebarPage = async () => {
  const products = await getCachedStorefrontProducts();

  return (
    <main>
      <ShopWithSidebar initialProducts={products} />
    </main>
  );
};

export default ShopWithSidebarPage;
