import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/lib/catalog-schema';
import {
  type OptimizedCatalogJson,
  type RawCatalogJson,
  optimizeRawCatalog,
  optimizedProductToInput,
} from '@/lib/catalog-optimizer';
import {
  PRODUCT_INCLUDE_IMAGES,
  buildImageCreatePayload,
  ensureDatabaseReady,
  invalidateCatalogCache,
  isDatabaseConfigured,
  serializeProduct,
} from '@/lib/prisma';
import {
  bulkActionSchema,
  normalizeProductForDb,
  productInputSchema,
} from '@/lib/product-validation';

export const dynamic = 'force-dynamic';

async function loadOptimizedCatalogFromDisk(): Promise<OptimizedCatalogJson> {
  const optimizedPath = path.join(
    process.cwd(),
    'public',
    'assets',
    'aistudio',
    'catalogo_optimizado.json'
  );
  try {
    const rawOptimized = await readFile(optimizedPath, 'utf-8');
    return JSON.parse(rawOptimized) as OptimizedCatalogJson;
  } catch {
    const sourcePath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'catalogo_bb8c37ef.json'
    );
    const rawSource = await readFile(sourcePath, 'utf-8');
    return optimizeRawCatalog(JSON.parse(rawSource) as RawCatalogJson);
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error: 'DATABASE_URL no está configurada en las variables de entorno.',
        code: 'DB_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = bulkActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Solicitud masiva inválida.',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const prisma = await ensureDatabaseReady();
    const payload = parsed.data;

    if (payload.action === 'availability') {
      const result = await prisma.product.updateMany({
        where: { uid: { in: payload.uids } },
        data: { availability: payload.availability },
      });
      invalidateCatalogCache();
      return NextResponse.json({ updatedCount: result.count });
    }

    if (payload.action === 'delete') {
      const result = await prisma.product.deleteMany({
        where: { uid: { in: payload.uids } },
      });
      invalidateCatalogCache();
      return NextResponse.json({ deletedCount: result.count });
    }

    if (payload.action === 'import') {
      let added = 0;
      let updated = 0;
      let skipped = 0;

      const existingRows = await prisma.product.findMany({
        select: { uid: true, id: true },
      });
      const existingBySku = new Map<string, string>();
      existingRows.forEach((row) =>
        existingBySku.set(row.id.trim().toLowerCase(), row.uid)
      );

      for (const rawItem of payload.products) {
        const { productData, imageUrls } = normalizeProductForDb(rawItem);
        const key = productData.id.toLowerCase();
        const existingUid = existingBySku.get(key);

        if (existingUid) {
          if (payload.strategy === 'merge') {
            await prisma.product.update({
              where: { uid: existingUid },
              data: {
                ...productData,
                images: {
                  deleteMany: {},
                  ...(imageUrls.length > 0
                    ? { create: buildImageCreatePayload(imageUrls) }
                    : {}),
                },
              },
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          const created = await prisma.product.create({
            data: {
              ...productData,
              ...(imageUrls.length > 0
                ? { images: { create: buildImageCreatePayload(imageUrls) } }
                : {}),
            },
          });
          existingBySku.set(key, created.uid);
          added++;
        }
      }

      const allRows = await prisma.product.findMany({
        where: { active: true },
        include: PRODUCT_INCLUDE_IMAGES,
        orderBy: { updatedAt: 'desc' },
      });

      return NextResponse.json({
        added,
        updated,
        skipped,
        products: allRows.map(serializeProduct),
      });
    }

    if (payload.action === 'restore') {
      const restored = await prisma.$transaction(async (tx) => {
        await tx.product.deleteMany();
        for (const item of payload.products) {
          const { productData, imageUrls } = normalizeProductForDb(item);
          await tx.product.create({
            data: {
              ...productData,
              ...(imageUrls.length > 0
                ? { images: { create: buildImageCreatePayload(imageUrls) } }
                : {}),
            },
          });
        }
        return tx.product.findMany({
          where: { active: true },
          include: PRODUCT_INCLUDE_IMAGES,
          orderBy: { updatedAt: 'desc' },
        });
      });

      return NextResponse.json({
        products: restored.map(serializeProduct),
      });
    }

    if (payload.action === 'clear') {
      const deleted = await prisma.product.deleteMany();
      await prisma.$executeRaw`
        DO $$
        BEGIN
          IF to_regclass('sport_products') IS NOT NULL THEN
            DELETE FROM "sport_products";
          END IF;
        END $$;
      `;
      return NextResponse.json({
        deletedCount: deleted.count,
        products: [],
      });
    }

    if (payload.action === 'import_optimized_json') {
      const optimized = await loadOptimizedCatalogFromDisk();
      let importedImages = 0;

      const importedRows = await prisma.$transaction(
        async (tx) => {
          for (const optItem of optimized.productos) {
            const rawInput = optimizedProductToInput(optItem);
            const validated = productInputSchema.parse(rawInput);
            const { productData, imageUrls } = normalizeProductForDb(validated);
            importedImages += imageUrls.length;

            const savedProduct = await tx.product.upsert({
              where: { id: productData.id },
              update: {
                ...productData,
                // No sobrescribir image_link si ya apunta a un binario subido en BD
                image_link: undefined,
              },
              create: productData,
              select: { uid: true, image_link: true },
            });

            if (!savedProduct.image_link) {
              await tx.product.update({
                where: { uid: savedProduct.uid },
                data: { image_link: productData.image_link },
              });
            }

            const imagePayloads = buildImageCreatePayload(imageUrls);
            for (const imgPayload of imagePayloads) {
              await tx.productImage.upsert({
                where: {
                  productId_url: {
                    productId: savedProduct.uid,
                    url: imgPayload.url,
                  },
                },
                update: {
                  fileName: imgPayload.fileName,
                  position: imgPayload.position,
                },
                create: {
                  productId: savedProduct.uid,
                  ...imgPayload,
                },
              });
            }
          }

          return tx.product.findMany({
            where: { active: true },
            include: PRODUCT_INCLUDE_IMAGES,
            orderBy: { updatedAt: 'desc' },
          });
        },
        { timeout: 30000 }
      );

      return NextResponse.json({
        resumen: optimized.resumen,
        importedProducts: optimized.productos.length,
        importedImages,
        products: importedRows.map(serializeProduct),
      });
    }

    // action === 'reset': carga o sincroniza el catálogo de ejemplo
    const seeded = await prisma.$transaction(async (tx) => {
      for (const item of INITIAL_PRODUCTS) {
        const validated = productInputSchema.parse(item);
        const { productData, imageUrls } = normalizeProductForDb(validated);
        await tx.product.upsert({
          where: { id: productData.id },
          update: {
            ...productData,
            images: {
              deleteMany: {},
              ...(imageUrls.length > 0
                ? { create: buildImageCreatePayload(imageUrls) }
                : {}),
            },
          },
          create: {
            ...productData,
            ...(imageUrls.length > 0
              ? { images: { create: buildImageCreatePayload(imageUrls) } }
              : {}),
          },
        });
      }
      return tx.product.findMany({
        where: { active: true },
        include: PRODUCT_INCLUDE_IMAGES,
        orderBy: { updatedAt: 'desc' },
      });
    });

    invalidateCatalogCache();
    return NextResponse.json({
      products: seeded.map(serializeProduct),
    });
  } catch (error) {
    console.error('[POST /api/products/bulk] Error en operación masiva:', error);
    return NextResponse.json(
      {
        error: 'No se pudo completar la operación masiva en la base de datos.',
        code: 'DB_WRITE_FAILED',
      },
      { status: 500 }
    );
  }
}
