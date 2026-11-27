import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PRODUCT_INCLUDE_IMAGES,
  ensureDatabaseReady,
  invalidateCatalogCache,
  isDatabaseConfigured,
  serializeProduct,
} from '@/lib/prisma';
import { buildBinaryImageUrl } from '@/lib/image-storage';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ uid: string; imageId: string }>;
};

const imagePatchSchema = z.object({
  action: z.enum(['set_cover', 'move_left', 'move_right']),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL no está configurada.', code: 'DB_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  try {
    const { uid, imageId } = await context.params;
    const body = await req.json();
    const parsed = imagePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
    }

    const prisma = await ensureDatabaseReady();

    const existing = await prisma.productImage.findMany({
      where: { productId: uid },
      orderBy: { position: 'asc' },
      select: { id: true, url: true, sizeBytes: true, position: true, isCover: true },
    });

    const targetIndex = existing.findIndex((img) => img.id === imageId);
    if (targetIndex === -1) {
      return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
    }

    const reordered = [...existing];
    if (parsed.data.action === 'set_cover') {
      const [chosen] = reordered.splice(targetIndex, 1);
      reordered.unshift(chosen);
    } else if (parsed.data.action === 'move_left' && targetIndex > 0) {
      const temp = reordered[targetIndex - 1];
      reordered[targetIndex - 1] = reordered[targetIndex];
      reordered[targetIndex] = temp;
    } else if (
      parsed.data.action === 'move_right' &&
      targetIndex < reordered.length - 1
    ) {
      const temp = reordered[targetIndex + 1];
      reordered[targetIndex + 1] = reordered[targetIndex];
      reordered[targetIndex] = temp;
    }

    const updated = await prisma.$transaction(async (tx) => {
      for (let idx = 0; idx < reordered.length; idx++) {
        await tx.productImage.update({
          where: { id: reordered[idx].id },
          data: {
            position: idx,
            isCover: idx === 0,
          },
        });
      }

      const cover = reordered[0];
      const coverUrl =
        cover.sizeBytes && cover.sizeBytes > 0
          ? buildBinaryImageUrl(cover.id, cover.sizeBytes)
          : cover.url;

      await tx.product.update({
        where: { uid },
        data: { image_link: coverUrl },
      });

      return tx.product.findUniqueOrThrow({
        where: { uid },
        include: PRODUCT_INCLUDE_IMAGES,
      });
    });

    invalidateCatalogCache();
    return NextResponse.json({ product: serializeProduct(updated) });
  } catch (error) {
    console.error('[PATCH /api/products/[uid]/images/[imageId]] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo actualizar el orden de la imagen.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL no está configurada.', code: 'DB_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  try {
    const { uid, imageId } = await context.params;
    const prisma = await ensureDatabaseReady();

    const target = await prisma.productImage.findFirst({
      where: { id: imageId, productId: uid },
      select: { id: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: imageId } });

      const remaining = await tx.productImage.findMany({
        where: { productId: uid },
        orderBy: { position: 'asc' },
        select: { id: true, url: true, sizeBytes: true },
      });

      for (let idx = 0; idx < remaining.length; idx++) {
        await tx.productImage.update({
          where: { id: remaining[idx].id },
          data: {
            position: idx,
            isCover: idx === 0,
          },
        });
      }

      const nextCover = remaining[0];
      const nextCoverUrl = nextCover
        ? nextCover.sizeBytes && nextCover.sizeBytes > 0
          ? buildBinaryImageUrl(nextCover.id, nextCover.sizeBytes)
          : nextCover.url
        : '';

      await tx.product.update({
        where: { uid },
        data: { image_link: nextCoverUrl },
      });

      return tx.product.findUniqueOrThrow({
        where: { uid },
        include: PRODUCT_INCLUDE_IMAGES,
      });
    });

    invalidateCatalogCache();
    return NextResponse.json({ product: serializeProduct(updated) });
  } catch (error) {
    console.error('[DELETE /api/products/[uid]/images/[imageId]] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar la imagen.' },
      { status: 500 }
    );
  }
}
