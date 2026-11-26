export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  category?: "actuales" | "retros" | "uruguay" | "clubes";
  version?: "Jugador" | "Fan" | "Retro";
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
