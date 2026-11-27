import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import {
  PRODUCT_INCLUDE_IMAGES,
  buildImageCreatePayload,
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

export async function GET() {
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
    const prisma = await ensureDatabaseReady();
    const rows = await prisma.product.findMany({
      where: { active: true },
      include: PRODUCT_INCLUDE_IMAGES,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      products: rows.map(serializeProduct),
      storage: 'database',
    });
  } catch (error) {
    const code =
      error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'UNKNOWN';
    console.error(`[GET /api/products] Error Prisma (${code})`);
    return NextResponse.json(
      {
        error: 'No se pudo consultar la base de datos. Verificá DATABASE_URL.',
        code: 'DB_QUERY_FAILED',
      },
      { status: 500 }
    );
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
    const parsed = productInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de producto inválidos.',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const webpError = validateIncomingProductImagesWebp(
      parsed.data.image_link,
      parsed.data.images
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

    const prisma = await ensureDatabaseReady();
    const { productData, imageUrls } = normalizeProductForDb(parsed.data);

    const created = await prisma.product.create({
      data: {
        ...productData,
        ...(imageUrls.length > 0
          ? { images: { create: buildImageCreatePayload(imageUrls) } }
          : {}),
      },
      include: PRODUCT_INCLUDE_IMAGES,
    });

    invalidateCatalogCache();
    return NextResponse.json(
      { product: serializeProduct(created) },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        {
          error: 'Ya existe un producto con ese mismo SKU o slug en la base de datos.',
          code: 'DUPLICATE_SKU',
        },
        { status: 409 }
      );
    }

    console.error('[POST /api/products] Error al crear producto:', error);
    return NextResponse.json(
      {
        error: 'No se pudo guardar el producto en la base de datos.',
        code: 'DB_WRITE_FAILED',
      },
      { status: 500 }
    );
  }
}
