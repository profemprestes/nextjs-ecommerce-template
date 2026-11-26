import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ProductCategory,
  ProductModalidad,
  ProductType,
  ProductVersion,
} from "@prisma/client";

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
  tipo?: "producto" | "anuncio";
  activo?: boolean;
  portada?: string | null;
  imagenes_ordenadas: string[];
  fuente: string;
};

function mapCategory(raw: string | null): ProductCategory {
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

function mapVersion(raw: string | null): ProductVersion {
  if (raw === "Jugador" || raw === "Fan" || raw === "Retro") {
    return raw;
  }
  return "a_confirmar";
}

function mapModalidad(raw: string | null): ProductModalidad {
  if (raw === "entrega_inmediata") return "entrega_inmediata";
  if (raw === "por_encargo") return "por_encargo";
  return "pendiente_verificacion";
}

function mapType(item: CatalogoEntry): ProductType {
  if (item.tipo === "anuncio" || item.slug_normalizado.startsWith("sin-descripcion")) {
    return "anuncio";
  }
  return "producto";
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
      const tipo = mapType(item);
      const activo = item.activo ?? tipo === "producto";
      const cover = item.portada ?? item.imagenes_ordenadas[0] ?? "";
      const category = mapCategory(item.categoria);
      const version = mapVersion(item.version);
      const modalidad = mapModalidad(item.modalidad);

      await prisma.$transaction(async (tx) => {
        const product = await tx.product.upsert({
          where: { slug },
          create: {
            id: item.id_origen ?? slug,
            slug,
            tipo,
            activo,
            title: item.titulo,
            team: item.equipo_o_seleccion ?? "",
            season: item.temporada_o_anio,
            dorsal: item.dorsal,
            category,
            sport: item.deporte ?? "futbol",
            version,
            modalidad,
            price_uyu: item.precio_uyu,
            cover_image: cover,
            image_link: cover,
            source_ref: item.fuente,
            availability:
              modalidad === "entrega_inmediata" ? "in stock" : "out of stock",
            condition: "new",
            gender: "unisex",
            age_group: "adult",
            product_tags: ["futbolenlapieluy1", "camiseta futbol"],
          },
          update: {
            tipo,
            activo,
            title: item.titulo,
            team: item.equipo_o_seleccion ?? "",
            season: item.temporada_o_anio,
            dorsal: item.dorsal,
            category,
            sport: item.deporte ?? "futbol",
            version,
            modalidad,
            price_uyu: item.precio_uyu,
            cover_image: cover,
            image_link: cover,
            source_ref: item.fuente,
            availability:
              modalidad === "entrega_inmediata" ? "in stock" : "out of stock",
          },
        });

        await tx.productImage.deleteMany({
          where: { productUid: product.uid },
        });

        if (item.imagenes_ordenadas.length > 0) {
          await tx.productImage.createMany({
            data: item.imagenes_ordenadas.map((url, index) => ({
              productUid: product.uid,
              url,
              position: index,
              format: url.endsWith(".webp") ? "webp" : "jpg",
              isCover: index === 0,
            })),
          });
        }

        upsertedProducts += 1;
        totalImages += item.imagenes_ordenadas.length;
      });
    }

    console.log(
      `[db:seed] Sincronizados ${upsertedProducts} productos/anuncios y ${totalImages} imágenes en PostgreSQL.`
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
