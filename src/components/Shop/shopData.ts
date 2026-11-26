import catalogoRaw from "../../../docs/catalogo.json";
import {
  Product,
  ProductCategory,
  ProductModalidad,
  ProductVersion,
} from "@/types/product";

type RawCatalogoItem = {
  id_origen: string | null;
  slug_normalizado: string;
  titulo: string;
  equipo_o_seleccion: string | null;
  temporada_o_anio: string | null;
  dorsal: string | null;
  categoria: string | null;
  deporte: string | null;
  version: string | null;
  modalidad: string | null;
  precio_uyu: number | null;
  imagenes_ordenadas: string[];
  fuente: string;
};

function hashSlugToId(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return (hash % 900000) + 100000;
}

function getReferencePrice(
  precioUyu: number | null,
  version: ProductVersion
): number {
  if (typeof precioUyu === "number" && precioUyu > 0) {
    return precioUyu;
  }
  switch (version) {
    case "Jugador":
      return 1990;
    case "Retro":
      return 1890;
    case "Fan":
      return 1690;
    default:
      return 0;
  }
}

function normalizeVersion(raw: string | null): ProductVersion {
  if (raw === "Jugador" || raw === "Fan" || raw === "Retro") {
    return raw;
  }
  return "A confirmar";
}

function normalizeCategory(raw: string | null): ProductCategory {
  if (
    raw === "actuales" ||
    raw === "retros" ||
    raw === "uruguay" ||
    raw === "clubes"
  ) {
    return raw;
  }
  return "clubes";
}

function normalizeModalidad(raw: string | null): ProductModalidad {
  if (raw === "entrega_inmediata") {
    return "entrega_inmediata";
  }
  return "PENDIENTE_VERIFICACION";
}

const rawItems = (catalogoRaw as { productos: RawCatalogoItem[] }).productos;

const shopData: Product[] = rawItems
  .filter((item) => !item.slug_normalizado.startsWith("sin-descripcion"))
  .map((item) => {
    const version = normalizeVersion(item.version);
    const refPrice = getReferencePrice(item.precio_uyu, version);
    const imgs = item.imagenes_ordenadas.map((file) => `/catalogo/${file}`);

    return {
      id: hashSlugToId(item.slug_normalizado),
      slug: item.slug_normalizado,
      title: item.titulo,
      team: item.equipo_o_seleccion ?? "Fútbol en la Piel",
      season: item.temporada_o_anio,
      dorsal: item.dorsal,
      category: normalizeCategory(item.categoria),
      version,
      modalidad: normalizeModalidad(item.modalidad),
      reviews: 0,
      price: refPrice,
      discountedPrice: refPrice,
      imgs: {
        thumbnails: imgs,
        previews: imgs,
      },
    };
  });

export function formatProductPrice(price: number): string {
  if (!price || price <= 0) {
    return "Consultar precio";
  }
  return `Desde $ ${price.toLocaleString("es-UY")}`;
}

export default shopData;
