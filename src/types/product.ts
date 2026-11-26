export type ProductCategory = "actuales" | "retros" | "uruguay" | "clubes";
export type ProductVersion = "Jugador" | "Fan" | "Retro" | "A confirmar";
export type ProductModalidad = "entrega_inmediata" | "PENDIENTE_VERIFICACION";

export type Product = {
  id: number;
  slug?: string;
  title: string;
  team?: string;
  season?: string | null;
  dorsal?: string | null;
  category?: ProductCategory;
  version?: ProductVersion;
  modalidad?: ProductModalidad;
  reviews: number;
  price: number;
  discountedPrice: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
