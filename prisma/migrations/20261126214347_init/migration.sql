-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('producto', 'anuncio');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('actuales', 'retros', 'uruguay', 'clubes');

-- CreateEnum
CREATE TYPE "ProductVersion" AS ENUM ('Jugador', 'Fan', 'Retro', 'a_confirmar');

-- CreateEnum
CREATE TYPE "ProductModalidad" AS ENUM ('entrega_inmediata', 'por_encargo', 'pendiente_verificacion');

-- CreateTable
CREATE TABLE "products" (
    "uid" TEXT NOT NULL,
    "id" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "tipo" "ProductType" NOT NULL DEFAULT 'producto',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "title" VARCHAR(200) NOT NULL DEFAULT '',
    "team" VARCHAR(120) NOT NULL DEFAULT '',
    "season" VARCHAR(32),
    "dorsal" VARCHAR(80),
    "category" "ProductCategory" NOT NULL DEFAULT 'clubes',
    "sport" VARCHAR(32) NOT NULL DEFAULT 'futbol',
    "version" "ProductVersion" NOT NULL DEFAULT 'a_confirmar',
    "modalidad" "ProductModalidad" NOT NULL DEFAULT 'pendiente_verificacion',
    "price_uyu" INTEGER,
    "cover_image" TEXT NOT NULL DEFAULT '',
    "source_ref" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "availability" VARCHAR(32) NOT NULL DEFAULT '',
    "condition" VARCHAR(32) NOT NULL DEFAULT 'new',
    "price" VARCHAR(64) NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "image_link" TEXT NOT NULL DEFAULT '',
    "brand" VARCHAR(100) NOT NULL DEFAULT '',
    "google_product_category" VARCHAR(255) NOT NULL DEFAULT '',
    "fb_product_category" VARCHAR(255) NOT NULL DEFAULT '',
    "quantity_to_sell_on_facebook" VARCHAR(32) NOT NULL DEFAULT '',
    "sale_price" VARCHAR(64) NOT NULL DEFAULT '',
    "sale_price_effective_date" VARCHAR(120) NOT NULL DEFAULT '',
    "item_group_id" VARCHAR(100) NOT NULL DEFAULT '',
    "gender" VARCHAR(32) NOT NULL DEFAULT 'unisex',
    "color" VARCHAR(200) NOT NULL DEFAULT '',
    "size" VARCHAR(200) NOT NULL DEFAULT '',
    "age_group" VARCHAR(32) NOT NULL DEFAULT 'adult',
    "material" VARCHAR(200) NOT NULL DEFAULT '',
    "pattern" VARCHAR(100) NOT NULL DEFAULT '',
    "shipping" TEXT NOT NULL DEFAULT '',
    "shipping_weight" VARCHAR(64) NOT NULL DEFAULT '',
    "offer_disclaimer" TEXT NOT NULL DEFAULT '',
    "offer_disclaimer_url" TEXT NOT NULL DEFAULT '',
    "video_url" TEXT NOT NULL DEFAULT '',
    "video_tag" VARCHAR(200) NOT NULL DEFAULT '',
    "gtin" VARCHAR(64) NOT NULL DEFAULT '',
    "product_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "style" VARCHAR(120) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "productUid" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "format" VARCHAR(10) NOT NULL DEFAULT 'jpg',
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_activo_tipo_category_idx" ON "products"("activo", "tipo", "category");

-- CreateIndex
CREATE INDEX "products_activo_version_modalidad_idx" ON "products"("activo", "version", "modalidad");

-- CreateIndex
CREATE INDEX "products_team_idx" ON "products"("team");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_availability_idx" ON "products"("availability");

-- CreateIndex
CREATE INDEX "products_item_group_id_idx" ON "products"("item_group_id");

-- CreateIndex
CREATE INDEX "product_images_productUid_isCover_idx" ON "product_images"("productUid", "isCover");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_productUid_position_key" ON "product_images"("productUid", "position");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productUid_fkey" FOREIGN KEY ("productUid") REFERENCES "products"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
