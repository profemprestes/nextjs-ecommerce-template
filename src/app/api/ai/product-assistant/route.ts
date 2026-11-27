import { NextRequest, NextResponse } from 'next/server';
import {
  ProductAssistantInputSchema,
  isAiConfigured,
  runProductAssistant,
} from '@/lib/ai/product-assistant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;
const MAX_RATE_BUCKETS = 2_000;
const MAX_BODY_BYTES = 32_768;
const rateBuckets = new Map<string, number[]>();

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function getTrustedClientIp(req: NextRequest): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  const realIp = req.headers.get('x-real-ip')?.trim();
  const forwarded = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim();
  return (cfIp || vercelIp || realIp || forwarded || 'local').slice(0, 64);
}

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(clientKey) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  rateBuckets.delete(clientKey);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(clientKey, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(clientKey, recent);
  if (rateBuckets.size > MAX_RATE_BUCKETS) {
    const oldestKey = rateBuckets.keys().next().value;
    if (oldestKey !== undefined) {
      rateBuckets.delete(oldestKey);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { error: 'Origen no permitido.', code: 'FORBIDDEN_ORIGIN' },
      { status: 403 }
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: 'El asistente IA no está disponible en este momento.',
        code: 'AI_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  const clientIp = getTrustedClientIp(req);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        error:
          'Demasiadas consultas al asistente IA. Esperá unos segundos antes de reintentar.',
        code: 'RATE_LIMITED',
      },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }

  let body: unknown;
  try {
    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        {
          error: 'La solicitud excede el tamaño máximo permitido.',
          code: 'PAYLOAD_TOO_LARGE',
        },
        { status: 413 }
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo JSON inválido.', code: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const parsed = ProductAssistantInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Datos de producto inválidos para el análisis.',
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  const { product, mode } = parsed.data;
  const combinedNonWhitespace = `${product.title} ${product.description}`
    .replace(/\s+/g, '')
    .trim();
  if (combinedNonWhitespace.length < 8) {
    return NextResponse.json(
      {
        error:
          'Escribí al menos una breve descripción o título (8+ caracteres) para analizar el producto.',
        code: 'INSUFFICIENT_CONTEXT',
      },
      { status: 400 }
    );
  }

  try {
    const result = await runProductAssistant({ mode, product });
    return NextResponse.json(result);
  } catch (error) {
    const errName =
      error instanceof Error
        ? error.name.replace(/[\r\n\t]/g, ' ').slice(0, 40)
        : 'UNKNOWN';
    if (error instanceof Error && error.message === 'AI_TIMEOUT') {
      return NextResponse.json(
        {
          error:
            'El asistente IA tardó demasiado en responder. Podés seguir editando manualmente o reintentar.',
          code: 'AI_TIMEOUT',
        },
        { status: 504 }
      );
    }
    console.error('[POST /api/ai/product-assistant] Failed', { type: errName });
    return NextResponse.json(
      {
        error: 'No se pudo generar la sugerencia en este momento.',
        code: 'AI_GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}
