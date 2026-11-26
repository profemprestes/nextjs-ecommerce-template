import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fútbol en la Piel | Camisetas de Fútbol y Básquetbol en Uruguay",
  description:
    "La pasión se lleva puesta. Camisetas actuales, Mundial 2026, ediciones retro y clubes en Uruguay. Entrega inmediata y por encargo con envíos a los 19 departamentos.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
