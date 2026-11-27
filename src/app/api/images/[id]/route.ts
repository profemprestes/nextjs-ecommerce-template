import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseReady, isDatabaseConfigured } from '@/lib/prisma';
import { ALLOWED_IMAGE_MIME_TYPES } from '@/lib/image-storage';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Base de datos no configurada.', code: 'DB_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();
    if (!cleanId || cleanId.length > 128) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const prisma = await ensureDatabaseReady();
    const row = await prisma.productImage.findUnique({
      where: { id: cleanId },
      select: {
        data: true,
        mimeType: true,
        sizeBytes: true,
      },
    });

    if (!row || !row.data || row.data.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada en la base de datos.' },
        { status: 404 }
      );
    }

    const mimeType = ALLOWED_IMAGE_MIME_TYPES.has(row.mimeType)
      ? row.mimeType
      : 'application/octet-stream';

    return new NextResponse(new Uint8Array(row.data), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(row.data.length),
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[GET /api/images/[id]] Error:', error);
    return NextResponse.json(
      { error: 'No se pudo obtener la imagen.' },
      { status: 500 }
    );
  }
}
