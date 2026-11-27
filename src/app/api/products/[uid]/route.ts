import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import {
  PRODUCT_INCLUDE_IMAGES,
  ensureDatabaseReady,
  invalidateCatalogCache,
  isDatabaseConfigured,
  serializeProduct,
} from '@/lib/prisma';
import {
  normalizeProductForDb,
  productInputSchema,
  validateIncomingProductImagesWebp,
} from '@/lib/product-validation';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ uid: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
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
    const prisma = await ensureDatabaseReady();
    const row = await prisma.product.findUnique({
      where: { uid },
      include: PRODUCT_INCLUDE_IMAGES,
    });

    if (!row) {
      return NextResponse.json(
        { error: 'Producto no encontrado.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: serializeProduct(row) });
  } catch (error) {
    console.error('[GET /api/products/[uid]] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo obtener el producto.', code: 'DB_QUERY_FAILED' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
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
    const body = await req.json();
    const parsed = productInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de actualización inválidos.',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const prisma = await ensureDatabaseReady();
    const existing = await prisma.product.findUnique({
      where: { uid },
      select: {
        uid: true,
        image_link: true,
        images: {
          select: {
            id: true,
            url: true,
            position: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'El producto que intentás editar no existe.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const existingAllowedUrls = new Set<string>();
    if (existing.image_link.trim()) {
      existingAllowedUrls.add(existing.image_link.trim());
    }
    for (const img of existing.images) {
      if (img.url.trim()) existingAllowedUrls.add(img.url.trim());
    }

    const webpError = validateIncomingProductImagesWebp(
      parsed.data.image_link,
      parsed.data.images,
      existingAllowedUrls
    );
    if (webpError) {
      return NextResponse.json(
        {
          error: webpError,
          code: 'INVALID_IMAGE_FORMAT',
        },
        { status: 400 }
      );
    }

    const { productData, imageUrls } = normalizeProductForDb(parsed.data);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { uid },
        data: productData,
      });

      const nextCoverUrl = productData.image_link.trim();
      const coverChanged = nextCoverUrl !== existing.image_link.trim();

      if (nextCoverUrl && nextCoverUrl.startsWith('/api/images/')) {
        const match = nextCoverUrl.match(/^\/api\/images\/([a-zA-Z0-9_-]+)/);
        const binaryId = match?.[1];
        if (binaryId && coverChanged) {
          const targetBinary = await tx.productImage.findFirst({
            where: { id: binaryId, productId: uid },
            select: { id: true },
          });
          if (targetBinary) {
            await tx.productImage.updateMany({
              where: { productId: uid },
              data: { isCover: false },
            });
            await tx.productImage.update({
              where: { id: targetBinary.id },
              data: { isCover: true, position: 0 },
            });
          }
        }
      } else if (nextCoverUrl) {
        const existingCover = await tx.productImage.findUnique({
          where: {
            productId_url: {
              productId: uid,
              url: nextCoverUrl,
            },
          },
          select: { id: true },
        });

        if (!existingCover) {
          await tx.productImage.updateMany({
            where: { productId: uid },
            data: {
              isCover: false,
              position: { increment: 1 },
            },
          });
          await tx.productImage.create({
            data: {
              productId: uid,
              url: nextCoverUrl,
              fileName: nextCoverUrl.split(/[?#]/)[0]?.split('/').pop() || '',
              position: 0,
              isCover: true,
            },
          });
        } else if (coverChanged) {
          await tx.productImage.updateMany({
            where: { productId: uid },
            data: { isCover: false },
          });
          await tx.productImage.update({
            where: { id: existingCover.id },
            data: { isCover: true, position: 0 },
          });
        }
      }

      // Agregar nuevas URLs WebP de galería sin afectar imágenes binarias existentes
      if (imageUrls.length > 0) {
        const currentImages = await tx.productImage.findMany({
          where: { productId: uid },
          select: { url: true, position: true },
          orderBy: { position: 'asc' },
        });
        const currentUrlSet = new Set(currentImages.map((img) => img.url));
        let nextPos =
          currentImages.length > 0
            ? Math.max(...currentImages.map((img) => img.position)) + 1
            : 0;

        for (const candidateUrl of imageUrls) {
          if (
            !candidateUrl ||
            candidateUrl.startsWith('/api/images/') ||
            currentUrlSet.has(candidateUrl)
          ) {
            continue;
          }
          currentUrlSet.add(candidateUrl);
          await tx.productImage.create({
            data: {
              productId: uid,
              url: candidateUrl,
              fileName: candidateUrl.split(/[?#]/)[0]?.split('/').pop() || '',
              position: nextPos,
              isCover: nextPos === 0 && !nextCoverUrl,
            },
          });
          nextPos += 1;
        }
      }

      return tx.product.findUniqueOrThrow({
        where: { uid },
        include: PRODUCT_INCLUDE_IMAGES,
      });
    });

    invalidateCatalogCache();
    return NextResponse.json({ product: serializeProduct(updated) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'El producto que intentás editar no existe.', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'Ya existe otro producto con ese mismo SKU o slug.',
            code: 'DUPLICATE_SKU',
          },
          { status: 409 }
        );
      }
    }

    console.error('[PATCH /api/products/[uid]] Error:', error);
    return NextResponse.json(
      { error: 'No se pudieron guardar los cambios.', code: 'DB_WRITE_FAILED' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
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
    const prisma = await ensureDatabaseReady();
    await prisma.product.delete({ where: { uid } });
    invalidateCatalogCache();

    return NextResponse.json({ deleted: true, uid });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'El producto ya no existe.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    console.error('[DELETE /api/products/[uid]] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar el producto.', code: 'DB_WRITE_FAILED' },
      { status: 500 }
    );
  }
}
