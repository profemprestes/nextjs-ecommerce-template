import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

type CatalogoEntry = {
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
  price?: string | null;
  sale_price?: string | null;
  brand?: string | null;
  color?: string | null;
  size?: string | null;
  style?: string | null;
  quantity_to_sell_on_facebook?: string | null;
  item_group_id?: string | null;
  description?: string | null;
  product_tags?: string[];
  tipo?: "producto" | "anuncio";
  activo?: boolean;
  portada?: string | null;
  imagenes_ordenadas: string[];
  fuente: string;
};

function mapCategory(raw: string | null): string {
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

function mapVersion(raw: string | null): string {
  if (raw === "Jugador" || raw === "Fan" || raw === "Retro") {
    return raw;
  }
  return "A confirmar";
}

function mapModalidad(raw: string | null): string {
  if (raw === "entrega_inmediata") return "entrega_inmediata";
  if (raw === "por_encargo") return "por_encargo";
  return "pendiente_verificacion";
}

function isRelativeCatalogPath(url: string): boolean {
  return (
    url.startsWith("/nuevas/") ||
    url.startsWith("/catalogo/") ||
    (!url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("/api/"))
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL en las variables de entorno.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const jsonPath = path.join(process.cwd(), "docs", "catalogo.json");
    const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
      productos: CatalogoEntry[];
    };

    let upsertedProducts = 0;
    let totalImages = 0;

    for (const item of raw.productos) {
      const slug = item.slug_normalizado;
      const isAnuncio =
        item.tipo === "anuncio" || slug.startsWith("sin-descripcion");
      const active = item.activo ?? !isAnuncio;
      const rawCover = item.portada ?? item.imagenes_ordenadas[0] ?? "";
      const cover = isRelativeCatalogPath(rawCover) ? "" : rawCover;
      const nonRelativeImages = item.imagenes_ordenadas.filter(
        (url) => !isRelativeCatalogPath(url)
      );
      const category = mapCategory(item.categoria);
      const kitVersion = mapVersion(item.version);
      const deliveryMode = mapModalidad(item.modalidad);
      const priceText =
        item.price ?? (item.precio_uyu ? `${item.precio_uyu} UYU` : "");
      const salePriceText = item.sale_price ?? "";
      const availability =
        deliveryMode === "entrega_inmediata" ? "in stock" : "out of stock";
      const fbCategory = "Sports & Outdoors > Team Sports > Soccer";
      const googleCategory = "Apparel & Accessories > Clothing > Activewear";
      const material = "Poliéster deportivo";
      const shippingWeight = "250 g";
      const itemGroupId =
        item.item_group_id ??
        `GRP-${(item.equipo_o_seleccion ?? slug)
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}${
          item.temporada_o_anio ? `-${item.temporada_o_anio}` : ""
        }`;
      const description =
        item.description ??
        `${item.titulo}${item.brand ? `, marca ${item.brand}` : ""}${
          kitVersion !== "A confirmar" ? `, versión ${kitVersion}` : ""
        }. ${
          deliveryMode === "entrega_inmediata"
            ? "Disponible para entrega inmediata."
            : "Disponibilidad y stock a confirmar."
        } Consultar precio y talles disponibles.`;
      const productTags =
        item.product_tags && item.product_tags.length > 0
          ? item.product_tags
          : ["futbolenlapieluy1", "camiseta futbol", category];

      await prisma.$transaction(async (tx) => {
        const product = await tx.product.upsert({
          where: { slug },
          create: {
            id: item.id_origen ?? slug,
            slug,
            active,
            title: item.titulo,
            team: item.equipo_o_seleccion ?? "",
            season: item.temporada_o_anio ?? "",
            player_number: item.dorsal ?? "",
            category,
            sport: item.deporte ?? "futbol",
            kit_version: kitVersion,
            delivery_mode: deliveryMode,
            price_uyu: item.precio_uyu,
            price: priceText,
            sale_price: salePriceText,
            brand: item.brand ?? "",
            color: item.color ?? "",
            size: item.size ?? "",
            style: item.style ?? "",
            quantity_to_sell_on_facebook:
              item.quantity_to_sell_on_facebook ?? "",
            item_group_id: itemGroupId,
            description,
            google_product_category: googleCategory,
            fb_product_category: fbCategory,
            material,
            shipping_weight: shippingWeight,
            image_link: cover,
            source_ref: item.fuente,
            availability,
            condition: "new",
            gender: "unisex",
            age_group: "adult",
            product_tags: productTags,
          },
          update: {
            id: item.id_origen ?? slug,
            active,
            title: item.titulo,
            team: item.equipo_o_seleccion ?? "",
            season: item.temporada_o_anio ?? "",
            player_number: item.dorsal ?? "",
            category,
            sport: item.deporte ?? "futbol",
            kit_version: kitVersion,
            delivery_mode: deliveryMode,
            price_uyu: item.precio_uyu,
            price: priceText,
            sale_price: salePriceText,
            brand: item.brand ?? "",
            color: item.color ?? "",
            size: item.size ?? "",
            style: item.style ?? "",
            quantity_to_sell_on_facebook:
              item.quantity_to_sell_on_facebook ?? "",
            item_group_id: itemGroupId,
            description,
            google_product_category: googleCategory,
            fb_product_category: fbCategory,
            material,
            shipping_weight: shippingWeight,
            ...(cover ? { image_link: cover } : {}),
            source_ref: item.fuente,
            availability,
            product_tags: productTags,
          },
        });

        await tx.productImage.deleteMany({
          where: {
            productId: product.uid,
            OR: [
              { url: { startsWith: "/nuevas/" } },
              { url: { startsWith: "/catalogo/" } },
            ],
          },
        });

        if (nonRelativeImages.length > 0) {
          await tx.productImage.createMany({
            data: nonRelativeImages.map((url, index) => ({
              productId: product.uid,
              url,
              position: index,
              isCover: index === 0,
            })),
            skipDuplicates: true,
          });
        }

        upsertedProducts += 1;
        totalImages += nonRelativeImages.length;
      });
    }

    process.stdout.write(
      `[db:seed] Sincronizados ${upsertedProducts} productos/anuncios y ${totalImages} imágenes en PostgreSQL.\n`
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[db:seed] Error:", err);
  process.exit(1);
});
