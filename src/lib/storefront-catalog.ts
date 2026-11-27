import { unstable_cache } from "next/cache";
import catalogoRaw from "../../docs/catalogo.json";
import { buildBinaryImageUrl } from "./image-storage";
import { isDatabaseConfigured, withDbRetry } from "./prisma";
import {
  Product,
  ProductCategory,
  ProductModalidad,
  ProductVersion,
} from "@/types/product";

export const CATALOG_CACHE_TAG = "catalog-products";
export const PLACEHOLDER_JERSEY_IMAGE = "/images/placeholder-jersey.svg";

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
  tipo?: "producto" | "anuncio";
  activo?: boolean;
  portada?: string | null;
  imagenes_ordenadas: string[];
};

const rawItems = (catalogoRaw as { productos: RawCatalogoItem[] }).productos;

const fallbackImagesBySlug = new Map<string, string[]>();
const fallbackImagesById = new Map<string, string[]>();
for (const item of rawItems) {
  if (item.imagenes_ordenadas?.length > 0) {
    fallbackImagesBySlug.set(item.slug_normalizado, item.imagenes_ordenadas);
    if (item.id_origen) {
      fallbackImagesById.set(item.id_origen, item.imagenes_ordenadas);
    }
  }
}

function hashSlugToId(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return (hash % 900000) + 100000;
}

function normalizeCategory(raw: string | null | undefined): ProductCategory {
  const val = (raw ?? "").trim().toLowerCase();
  if (
    val === "actuales" ||
    val === "retros" ||
    val === "uruguay" ||
    val === "clubes"
  ) {
    return val;
  }
  return "clubes";
}

function normalizeVersion(raw: string | null | undefined): ProductVersion {
  const val = (raw ?? "").trim().toLowerCase();
  if (val === "jugador") return "Jugador";
  if (val === "fan") return "Fan";
  if (val === "retro") return "Retro";
  return "A confirmar";
}

function normalizeModalidad(raw: string | null | undefined): ProductModalidad {
  const val = (raw ?? "").trim().toLowerCase();
  if (val === "entrega_inmediata") return "entrega_inmediata";
  return "PENDIENTE_VERIFICACION";
}

function getReferencePrice(
  precioUyu: number | null | undefined,
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

function buildStaticCatalogFallback(): Product[] {
  return rawItems
    .filter(
      (item) =>
        item.activo !== false &&
        item.tipo !== "anuncio" &&
        !item.slug_normalizado.startsWith("sin-descripcion")
    )
    .map((item) => {
      const version = normalizeVersion(item.version);
      const refPrice = getReferencePrice(item.precio_uyu, version);
      const imgs =
        item.imagenes_ordenadas.length > 0
          ? item.imagenes_ordenadas
          : [PLACEHOLDER_JERSEY_IMAGE];
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
}

async function fetchStorefrontProductsFromDb(): Promise<Product[]> {
  if (!isDatabaseConfigured()) {
    return buildStaticCatalogFallback();
  }

  try {
    const rows = await withDbRetry((prisma) =>
      prisma.product.findMany({
        where: { active: true },
        orderBy: [{ updatedAt: "desc" }],
        select: {
          uid: true,
          id: true,
          slug: true,
          title: true,
          team: true,
          season: true,
          player_number: true,
          category: true,
          kit_version: true,
          delivery_mode: true,
          price_uyu: true,
          image_link: true,
          images: {
            orderBy: [{ isCover: "desc" }, { position: "asc" }],
            select: {
              id: true,
              url: true,
              sizeBytes: true,
            },
          },
        },
      })
    );

    if (rows.length === 0) {
      return buildStaticCatalogFallback();
    }

    return rows
      .filter((row) => !(row.slug ?? "").startsWith("sin-descripcion"))
      .map((row) => {
        const slug = row.slug || row.id || row.uid;
        const version = normalizeVersion(row.kit_version);
        const refPrice = getReferencePrice(row.price_uyu, version);

        const dbImages = row.images
          .map((img) =>
            typeof img.sizeBytes === "number" && img.sizeBytes > 0
              ? buildBinaryImageUrl(img.id, img.sizeBytes)
              : img.url
          )
          .filter(Boolean);

        let resolvedImages: string[] = [];
        if (dbImages.length > 0) {
          resolvedImages = dbImages;
        } else if (row.image_link && row.image_link.trim()) {
          resolvedImages = [row.image_link.trim()];
        } else {
          const jsonMatch =
            fallbackImagesBySlug.get(slug) ??
            fallbackImagesById.get(row.id) ??
            [];
          resolvedImages =
            jsonMatch.length > 0 ? jsonMatch : [PLACEHOLDER_JERSEY_IMAGE];
        }

        return {
          id: hashSlugToId(slug),
          slug,
          title: row.title || row.id,
          team: row.team || "Fútbol en la Piel",
          season: row.season || null,
          dorsal: row.player_number || null,
          category: normalizeCategory(row.category),
          version,
          modalidad: normalizeModalidad(row.delivery_mode),
          reviews: 0,
          price: refPrice,
          discountedPrice: refPrice,
          imgs: {
            thumbnails: resolvedImages,
            previews: resolvedImages,
          },
        };
      });
  } catch (error) {
    console.error("[StorefrontCatalog] Fallback a catalogo.json por error DB:", error);
    return buildStaticCatalogFallback();
  }
}

export const getCachedStorefrontProducts = unstable_cache(
  fetchStorefrontProductsFromDb,
  ["storefront-catalog-products"],
  {
    tags: [CATALOG_CACHE_TAG],
    revalidate: 300,
  }
);
