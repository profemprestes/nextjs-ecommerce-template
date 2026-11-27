export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB por archivo
export const MAX_FILES_PER_BATCH = 25;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/webp',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/avif',
]);

/**
 * Inspecciona la cabecera binaria (magic bytes) del archivo para determinar su
 * tipo real y bloquear archivos falsificados o SVG/HTML con riesgo XSS.
 */
export function detectImageMimeFromMagicBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }

  // GIF: GIF87a / GIF89a
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return 'image/gif';
  }

  // WEBP: RIFF....WEBP
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp';
  }

  // AVIF / HEIF: ....ftypavif o ....ftypavis
  if (
    buf[4] === 0x66 &&
    buf[5] === 0x74 &&
    buf[6] === 0x79 &&
    buf[7] === 0x70
  ) {
    const brand = buf.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis' || brand === 'mif1') {
      return 'image/avif';
    }
  }

  return null;
}

export function sanitizeFileName(rawName: string): string {
  const base = rawName.split(/[\\/]/).pop() || 'imagen';
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 200);
  return cleaned || 'imagen';
}

export function extractFileNameFromUrl(url: string): string {
  const clean = url.trim().split(/[?#]/)[0] || '';
  const base = clean.split('/').pop() || '';
  return sanitizeFileName(base);
}

export function buildBinaryImageUrl(id: string, sizeBytes?: number | null): string {
  return sizeBytes ? `/api/images/${encodeURIComponent(id)}?v=${sizeBytes}` : `/api/images/${encodeURIComponent(id)}`;
}

export interface ValidatedBinaryImage {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
}

export async function validateUploadedImage(
  file: File
): Promise<{ ok: true; image: ValidatedBinaryImage } | { ok: false; error: string }> {
  const fileName = sanitizeFileName(file.name || 'imagen');

  if (file.size === 0) {
    return { ok: false, error: `"${fileName}" está vacío.` };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `"${fileName}" supera el límite de 5 MB por imagen.`,
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detectedMime = detectImageMimeFromMagicBytes(buffer);

  if (!detectedMime || !ALLOWED_IMAGE_MIME_TYPES.has(detectedMime)) {
    return {
      ok: false,
      error: `"${fileName}" no es una imagen válida (solo WebP, JPG, PNG, GIF o AVIF).`,
    };
  }

  return {
    ok: true,
    image: {
      buffer,
      mimeType: detectedMime,
      fileName,
      sizeBytes: buffer.length,
    },
  };
}
