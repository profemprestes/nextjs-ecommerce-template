import Home from "@/components/Home";
import { getCachedStorefrontProducts } from "@/lib/storefront-catalog";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Fútbol en la Piel | Camisetas de Fútbol y Básquetbol en Uruguay",
  description:
    "La pasión se lleva puesta. Camisetas actuales, Mundial 2026, ediciones retro y clubes en Uruguay. Entrega inmediata y por encargo con envíos a los 19 departamentos.",
};

export default async function HomePage() {
  const products = await getCachedStorefrontProducts();

  return (
    <>
      <Home initialProducts={products} />
    </>
  );
}
