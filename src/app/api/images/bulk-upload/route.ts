import { NextRequest, NextResponse } from 'next/server';
import {
  ensureDatabaseReady,
  invalidateCatalogCache,
  isDatabaseConfigured,
} from '@/lib/prisma';
import {
  MAX_FILES_PER_BATCH,
  buildBinaryImageUrl,
  extractFileNameFromUrl,
  validateUploadedImage,
} from '@/lib/image-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL no está configurada.', code: 'DB_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  try {
    const prisma = await ensureDatabaseReady();
    const [totalImages, storedInDb] = await Promise.all([
      prisma.productImage.count(),
      prisma.productImage.count({ where: { sizeBytes: { gt: 0 } } }),
    ]);

    return NextResponse.json({
      totalImages,
      storedInDb,
      pendingBinary: Math.max(0, totalImages - storedInDb),
    });
  } catch (error) {
    console.error('[GET /api/images/bulk-upload] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo consultar el estado de imágenes.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL no está configurada.', code: 'DB_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const rawFiles = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File);

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron archivos de imagen.' },
        { status: 400 }
      );
    }

    if (rawFiles.length > MAX_FILES_PER_BATCH) {
      return NextResponse.json(
        {
          error: `Enviá como máximo ${MAX_FILES_PER_BATCH} archivos por lote.`,
        },
        { status: 400 }
      );
    }

    const prisma = await ensureDatabaseReady();

    // Índice en memoria (sin blobs BYTEA) para emparejar rápido por nombre de archivo
    const allImageRows = await prisma.productImage.findMany({
      select: {
        id: true,
        productId: true,
        url: true,
        fileName: true,
        isCover: true,
        position: true,
      },
    });

    const rowsByFileName = new Map<
      string,
      Array<{
        id: string;
        productId: string;
        isCover: boolean;
        position: number;
      }>
    >();

    for (const row of allImageRows) {
      const key = (row.fileName || extractFileNameFromUrl(row.url)).toLowerCase();
      if (!key) continue;
      const list = rowsByFileName.get(key) ?? [];
      list.push(row);
      rowsByFileName.set(key, list);
    }

    let matched = 0;
    const unmatched: string[] = [];
    const errors: string[] = [];
    const touchedProductIds = new Set<string>();

    for (const file of rawFiles) {
      const check = await validateUploadedImage(file);
      if ('error' in check) {
        errors.push(check.error);
        continue;
      }

      const { buffer, mimeType, fileName, sizeBytes } = check.image;
      const targets = rowsByFileName.get(fileName.toLowerCase());

      if (!targets || targets.length === 0) {
        unmatched.push(fileName);
        continue;
      }

      for (const target of targets) {
        await prisma.productImage.update({
          where: { id: target.id },
          data: {
            fileName,
            mimeType,
            sizeBytes,
            data: new Uint8Array(buffer),
          },
        });
        matched++;
        touchedProductIds.add(target.productId);

        if (target.isCover || target.position === 0) {
          await prisma.product.update({
            where: { uid: target.productId },
            data: {
              image_link: buildBinaryImageUrl(target.id, sizeBytes),
            },
          });
        }
      }
    }

    const [totalImages, storedInDb] = await Promise.all([
      prisma.productImage.count(),
      prisma.productImage.count({ where: { sizeBytes: { gt: 0 } } }),
    ]);

    invalidateCatalogCache();
    return NextResponse.json({
      matched,
      unmatched,
      errors,
      updatedProducts: touchedProductIds.size,
      stats: {
        totalImages,
        storedInDb,
        pendingBinary: Math.max(0, totalImages - storedInDb),
      },
    });
  } catch (error) {
    console.error('[POST /api/images/bulk-upload] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo procesar la carga masiva de imágenes.' },
      { status: 500 }
    );
  }
}
