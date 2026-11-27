import { NextRequest, NextResponse } from 'next/server';
import {
  PRODUCT_INCLUDE_IMAGES,
  ensureDatabaseReady,
  invalidateCatalogCache,
  isDatabaseConfigured,
  serializeProduct,
  withDbRetry,
} from '@/lib/prisma';
import {
  MAX_FILES_PER_BATCH,
  type ValidatedBinaryImage,
  buildBinaryImageUrl,
  validateUploadedImage,
} from '@/lib/image-storage';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ uid: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
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
    const { uid } = await context.params;
    const product = await withDbRetry((db) =>
      db.product.findUnique({
        where: { uid },
        include: PRODUCT_INCLUDE_IMAGES,
      })
    );
    const prisma = await ensureDatabaseReady();

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const rawFiles = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File);

    const singleFile = formData.get('file');
    if (rawFiles.length === 0 && singleFile instanceof File) {
      rawFiles.push(singleFile);
    }

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { error: 'Seleccioná al menos una imagen para subir.' },
        { status: 400 }
      );
    }

    if (rawFiles.length > MAX_FILES_PER_BATCH) {
      return NextResponse.json(
        {
          error: `Podés subir hasta ${MAX_FILES_PER_BATCH} imágenes por tanda.`,
        },
        { status: 400 }
      );
    }

    const setCover = formData.get('setCover') === 'true';
    const existingImages = product.images ?? [];
    const hasBinaryCover = existingImages.some(
      (img) => img.isCover && typeof img.sizeBytes === 'number' && img.sizeBytes > 0
    );

    const validated: ValidatedBinaryImage[] = [];
    const errors: string[] = [];

    for (const file of rawFiles) {
      const check = await validateUploadedImage(file);
      if ('error' in check) {
        errors.push(check.error);
      } else {
        validated.push(check.image);
      }
    }

    if (validated.length === 0) {
      return NextResponse.json(
        { error: errors[0] || 'Ningún archivo era una imagen válida.', errors },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      let nextPos =
        existingImages.length > 0
          ? Math.max(...existingImages.map((img) => img.position)) + 1
          : 0;

      const shouldPromoteFirstToCover = setCover || !hasBinaryCover;
      let firstCreated: { id: string; sizeBytes: number } | null = null;

      for (let i = 0; i < validated.length; i++) {
        const img = validated[i];

        // Si ya existía una fila con el mismo nombre de archivo en este producto, la rellena con el binario
        const existingMatch = existingImages.find(
          (row) => row.fileName.toLowerCase() === img.fileName.toLowerCase()
        );

        let savedId: string;
        if (existingMatch) {
          const updatedImg = await tx.productImage.update({
            where: { id: existingMatch.id },
            data: {
              fileName: img.fileName,
              mimeType: img.mimeType,
              sizeBytes: img.sizeBytes,
              data: new Uint8Array(img.buffer),
            },
            select: { id: true },
          });
          savedId = updatedImg.id;
        } else {
          const uniqueUrl = `/db-uploads/${encodeURIComponent(uid)}/${Date.now()}-${i}-${img.fileName}`;
          const createdImg = await tx.productImage.create({
            data: {
              productId: uid,
              url: uniqueUrl,
              fileName: img.fileName,
              mimeType: img.mimeType,
              sizeBytes: img.sizeBytes,
              data: new Uint8Array(img.buffer),
              position: nextPos++,
              isCover: false,
            },
            select: { id: true },
          });
          savedId = createdImg.id;
        }

        if (i === 0) {
          firstCreated = { id: savedId, sizeBytes: img.sizeBytes };
        }
      }

      if (shouldPromoteFirstToCover && firstCreated) {
        await tx.productImage.updateMany({
          where: { productId: uid },
          data: { isCover: false },
        });
        await tx.productImage.update({
          where: { id: firstCreated.id },
          data: { isCover: true, position: 0 },
        });

        // Reindexar el resto manteniendo el orden
        const remaining = await tx.productImage.findMany({
          where: { productId: uid, id: { not: firstCreated.id } },
          orderBy: { position: 'asc' },
          select: { id: true },
        });
        for (let idx = 0; idx < remaining.length; idx++) {
          await tx.productImage.update({
            where: { id: remaining[idx].id },
            data: { position: idx + 1 },
          });
        }

        await tx.product.update({
          where: { uid },
          data: {
            image_link: buildBinaryImageUrl(firstCreated.id, firstCreated.sizeBytes),
          },
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { uid },
        include: PRODUCT_INCLUDE_IMAGES,
      });
    });

    invalidateCatalogCache();
    return NextResponse.json(
      {
        uploadedCount: validated.length,
        errors,
        product: serializeProduct(updatedProduct),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/products/[uid]/images] Error:', error);
    return NextResponse.json(
      { error: 'No se pudieron guardar las imágenes en la base de datos.' },
      { status: 500 }
    );
  }
}
