import { revalidatePath, revalidateTag } from "next/cache";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  Prisma,
  PrismaClient,
  type Product as PrismaProduct,
} from "@/generated/prisma/client";
import {
  type AgeGroupValue,
  type AvailabilityValue,
  type ConditionValue,
  type GenderValue,
  type ProductImageItem,
  type SportProduct,
} from "./catalog-schema";
import {
  buildBinaryImageUrl,
  extractFileNameFromUrl,
} from "./image-storage";

declare global {
  var __fichasportPrisma: PrismaClient | undefined;
  var __fichasportPool: Pool | undefined;
  var __fichasportDbReady: Promise<void> | undefined;
}

/**
 * Selecciona únicamente los metadatos livianos de cada imagen (nunca el blob BYTEA `data`)
 * para mantener rápidas las consultas de catálogo y fichas.
 */
export const PRODUCT_INCLUDE_IMAGES = {
  images: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      productId: true,
      url: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      position: true,
      isCover: true,
      createdAt: true,
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductImageMeta = {
  id: string;
  productId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number | null;
  position: number;
  isCover: boolean;
  createdAt: Date;
};

export type ProductWithImages = PrismaProduct & {
  images?: ProductImageMeta[];
};

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  if (url.includes("johndoe:randompassword@localhost")) return false;
  return true;
}

function createPool(): Pool {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    idleTimeoutMillis: 15_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    allowExitOnIdle: true,
  });
  pool.on("error", () => {
    // Evita crashes por sockets inactivos cerrados por el pooler remoto (P1017).
  });
  return pool;
}

export async function resetPrismaPool(): Promise<void> {
  const oldPool = global.__fichasportPool;
  global.__fichasportPrisma = undefined;
  global.__fichasportPool = undefined;
  if (oldPool) {
    await oldPool.end().catch(() => {});
  }
}

export function isConnectionClosedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "P1017" ||
    (typeof err.message === "string" &&
      (err.message.includes("Server has closed the connection") ||
        err.message.includes("ConnectionClosed")))
  );
}

export async function withDbRetry<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    const prisma = await ensureDatabaseReady();
    return await operation(prisma);
  } catch (error) {
    if (!isConnectionClosedError(error)) {
      throw error;
    }
    await resetPrismaPool();
    const prisma = await ensureDatabaseReady();
    return await operation(prisma);
  }
}

export function getPrisma(): PrismaClient {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL_NOT_CONFIGURED");
  }

  if (!global.__fichasportPrisma) {
    const pool = global.__fichasportPool ?? createPool();
    global.__fichasportPool = pool;
    const adapter = new PrismaPg(pool);
    global.__fichasportPrisma = new PrismaClient({
      adapter,
      log: ["warn"],
    });
  }

  return global.__fichasportPrisma;
}

async function ensureOptimizedSchema(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "products" (
      "uid" TEXT NOT NULL,
      "id" VARCHAR(100) NOT NULL,
      "slug" VARCHAR(160),
      "title" VARCHAR(200) NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "availability" VARCHAR(32) NOT NULL DEFAULT '',
      "condition" VARCHAR(32) NOT NULL DEFAULT '',
      "price" VARCHAR(64) NOT NULL DEFAULT '',
      "price_uyu" INTEGER,
      "link" TEXT NOT NULL DEFAULT '',
      "image_link" TEXT NOT NULL DEFAULT '',
      "brand" VARCHAR(100) NOT NULL DEFAULT '',
      "team" VARCHAR(120) NOT NULL DEFAULT '',
      "season" VARCHAR(40) NOT NULL DEFAULT '',
      "player_number" VARCHAR(100) NOT NULL DEFAULT '',
      "category" VARCHAR(60) NOT NULL DEFAULT '',
      "sport" VARCHAR(60) NOT NULL DEFAULT 'futbol',
      "kit_version" VARCHAR(60) NOT NULL DEFAULT '',
      "delivery_mode" VARCHAR(60) NOT NULL DEFAULT '',
      "active" BOOLEAN NOT NULL DEFAULT true,
      "source_ref" TEXT NOT NULL DEFAULT '',
      "google_product_category" VARCHAR(255) NOT NULL DEFAULT '',
      "fb_product_category" VARCHAR(255) NOT NULL DEFAULT '',
      "quantity_to_sell_on_facebook" VARCHAR(32) NOT NULL DEFAULT '',
      "sale_price" VARCHAR(64) NOT NULL DEFAULT '',
      "sale_price_effective_date" VARCHAR(120) NOT NULL DEFAULT '',
      "item_group_id" VARCHAR(100) NOT NULL DEFAULT '',
      "gender" VARCHAR(32) NOT NULL DEFAULT '',
      "color" VARCHAR(200) NOT NULL DEFAULT '',
      "size" VARCHAR(200) NOT NULL DEFAULT '',
      "age_group" VARCHAR(32) NOT NULL DEFAULT '',
      "material" VARCHAR(200) NOT NULL DEFAULT '',
      "pattern" VARCHAR(100) NOT NULL DEFAULT '',
      "shipping" TEXT NOT NULL DEFAULT '',
      "shipping_weight" VARCHAR(64) NOT NULL DEFAULT '',
      "offer_disclaimer" TEXT NOT NULL DEFAULT '',
      "offer_disclaimer_url" TEXT NOT NULL DEFAULT '',
      "video_url" TEXT NOT NULL DEFAULT '',
      "video_tag" VARCHAR(200) NOT NULL DEFAULT '',
      "gtin" VARCHAR(64) NOT NULL DEFAULT '',
      "product_tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "style" VARCHAR(120) NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "products_pkey" PRIMARY KEY ("uid")
    )
  `;

  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(160)`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_uyu" INTEGER`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "team" VARCHAR(120) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "season" VARCHAR(40) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "player_number" VARCHAR(100) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category" VARCHAR(60) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sport" VARCHAR(60) NOT NULL DEFAULT 'futbol'`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "kit_version" VARCHAR(60) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "delivery_mode" VARCHAR(60) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true`;
  await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_ref" TEXT NOT NULL DEFAULT ''`;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "product_images" (
      "id" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "fileName" VARCHAR(255) NOT NULL DEFAULT '',
      "mimeType" VARCHAR(64) NOT NULL DEFAULT '',
      "sizeBytes" INTEGER,
      "data" BYTEA,
      "position" INTEGER NOT NULL DEFAULT 0,
      "isCover" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "product_images_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "product_images_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("uid")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `;

  await prisma.$executeRaw`ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "fileName" VARCHAR(255) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "mimeType" VARCHAR(64) NOT NULL DEFAULT ''`;
  await prisma.$executeRaw`ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER`;
  await prisma.$executeRaw`ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "data" BYTEA`;

  await prisma.$executeRaw`
    UPDATE "product_images"
    SET "fileName" = regexp_replace(split_part("url", '?', 1), '^.*/', '')
    WHERE "fileName" = '' AND "url" <> ''
  `;

  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "products_id_key" ON "products"("id")`;
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key" ON "products"("slug")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "products_active_updatedAt_idx" ON "products"("active", "updatedAt" DESC)`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "products_brand_availability_idx" ON "products"("brand", "availability")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "products_category_active_idx" ON "products"("category", "active")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "products_team_idx" ON "products"("team")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "products_item_group_id_idx" ON "products"("item_group_id")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "products_price_uyu_idx" ON "products"("price_uyu")`;
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "product_images_productId_url_key" ON "product_images"("productId", "url")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "product_images_productId_position_idx" ON "product_images"("productId", "position")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "product_images_fileName_idx" ON "product_images"("fileName")`;
}

export async function ensureDatabaseReady(): Promise<PrismaClient> {
  const prisma = getPrisma();
  if (!global.__fichasportDbReady) {
    global.__fichasportDbReady = ensureOptimizedSchema(prisma).catch((err) => {
      global.__fichasportDbReady = undefined;
      throw err;
    });
  }
  await global.__fichasportDbReady;
  return prisma;
}

export function invalidateCatalogCache(): void {
  try {
    revalidateTag("catalog-products", "max");
    revalidatePath("/");
    revalidatePath("/shop-with-sidebar");
    revalidatePath("/shop-without-sidebar");
    revalidatePath("/shop-details");
  } catch {
    // Ignora si se llama fuera del contexto de request de Next.js (ej. CLI).
  }
}

export function buildImageCreatePayload(imageUrls: string[]) {
  return imageUrls.map((url, index) => ({
    url,
    fileName: extractFileNameFromUrl(url),
    position: index,
    isCover: index === 0,
  }));
}

export function serializeProduct(row: ProductWithImages): SportProduct {
  const gallery: ProductImageItem[] = Array.isArray(row.images)
    ? row.images.map((img) => {
        const hasBinary = typeof img.sizeBytes === "number" && img.sizeBytes > 0;
        return {
          id: img.id,
          url: hasBinary ? buildBinaryImageUrl(img.id, img.sizeBytes) : img.url,
          originalUrl: img.url,
          fileName: img.fileName || extractFileNameFromUrl(img.url),
          mimeType: img.mimeType || "",
          sizeBytes: img.sizeBytes ?? null,
          hasBinary,
          position: img.position,
          isCover: img.isCover,
        };
      })
    : [];

  const orderedImages =
    gallery.length > 0
      ? gallery.map((g) => g.url)
      : row.image_link
        ? [row.image_link]
        : [];

  const coverItem =
    gallery.find((g) => g.isCover) ||
    gallery.find((g) => g.hasBinary) ||
    gallery[0];

  const resolvedCover = coverItem?.hasBinary
    ? coverItem.url
    : row.image_link || coverItem?.url || "";

  return {
    uid: row.uid,
    id: row.id,
    slug: row.slug ?? "",
    title: row.title,
    description: row.description,
    availability: (row.availability as AvailabilityValue) || "",
    condition: (row.condition as ConditionValue) || "",
    price: row.price,
    price_uyu: row.price_uyu ?? null,
    link: row.link,
    image_link: resolvedCover,
    brand: row.brand,
    team: row.team,
    season: row.season,
    player_number: row.player_number,
    category: row.category,
    sport: row.sport,
    kit_version: row.kit_version,
    delivery_mode: row.delivery_mode,
    active: row.active,
    source_ref: row.source_ref,
    google_product_category: row.google_product_category,
    fb_product_category: row.fb_product_category,
    quantity_to_sell_on_facebook: row.quantity_to_sell_on_facebook,
    sale_price: row.sale_price,
    sale_price_effective_date: row.sale_price_effective_date,
    item_group_id: row.item_group_id,
    gender: (row.gender as GenderValue) || "",
    color: row.color,
    size: row.size,
    age_group: (row.age_group as AgeGroupValue) || "",
    material: row.material,
    pattern: row.pattern,
    shipping: row.shipping,
    shipping_weight: row.shipping_weight,
    offer_disclaimer: row.offer_disclaimer,
    offer_disclaimer_url: row.offer_disclaimer_url,
    video_url: row.video_url,
    video_tag: row.video_tag,
    gtin: row.gtin,
    product_tags: Array.isArray(row.product_tags) ? row.product_tags : [],
    style: row.style,
    images: orderedImages,
    gallery,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
