import { z } from 'zod';
import {
  generateSku,
  isSafeImageUrl,
  validateWebpImageUrl,
} from './catalog-schema';

function isSafeUrlOrEmpty(value: string): boolean {
  return isSafeImageUrl(value);
}

export function validateIncomingProductImagesWebp(
  imageLink: string,
  images?: string[],
  existingAllowedUrls?: Set<string>
): string | null {
  const cleanCover = imageLink.trim();
  if (cleanCover) {
    const check = validateWebpImageUrl(cleanCover);
    if (!check.valid) {
      const allowedLegacy =
        check.isSafeUrl && existingAllowedUrls?.has(cleanCover);
      if (!allowedLegacy) {
        return (
          check.error ||
          'La URL de imagen principal debe estar en formato WebP compatible (.webp).'
        );
      }
    }
  }

  if (Array.isArray(images)) {
    for (const rawUrl of images) {
      const clean = rawUrl.trim();
      if (!clean) continue;
      const check = validateWebpImageUrl(clean);
      if (!check.valid) {
        const allowedLegacy =
          check.isSafeUrl && existingAllowedUrls?.has(clean);
        if (!allowedLegacy) {
          return (
            check.error ||
            'Todas las URLs de imagen nuevas deben estar en formato WebP compatible (.webp).'
          );
        }
      }
    }
  }

  return null;
}

const safeUrlField = z
  .string()
  .max(2048)
  .default('')
  .refine(isSafeUrlOrEmpty, {
    message: 'Solo se permiten enlaces http://, https:// o rutas relativas válidas.',
  });

const safeImageUrlItem = z
  .string()
  .min(1)
  .max(2048)
  .refine(isSafeUrlOrEmpty, {
    message: 'Todas las URLs de galería deben ser http://, https:// o rutas relativas válidas.',
  });

export const productInputSchema = z.object({
  id: z.string().max(100).default(''),
  slug: z.string().max(160).optional().nullable(),
  title: z.string().max(200).default(''),
  description: z.string().max(9999).default(''),
  availability: z.enum(['in stock', 'out of stock', '']).default(''),
  condition: z.enum(['new', 'used', '']).default(''),
  price: z.string().max(64).default(''),
  price_uyu: z.number().int().nonnegative().max(100_000_000).optional().nullable(),
  link: safeUrlField,
  image_link: safeUrlField,
  brand: z.string().max(100).default(''),
  team: z.string().max(120).optional().default(''),
  season: z.string().max(40).optional().default(''),
  player_number: z.string().max(100).optional().default(''),
  category: z.string().max(60).optional().default(''),
  sport: z.string().max(60).optional().default('futbol'),
  kit_version: z.string().max(60).optional().default(''),
  delivery_mode: z.string().max(60).optional().default(''),
  active: z.boolean().optional().default(true),
  source_ref: z.string().max(2000).optional().default(''),
  google_product_category: z.string().max(255).default(''),
  fb_product_category: z.string().max(255).default(''),
  quantity_to_sell_on_facebook: z
    .string()
    .max(32)
    .default('')
    .refine((v) => v === '' || /^\d+$/.test(v.trim()), {
      message: 'La cantidad debe ser un número entero positivo o vacío.',
    }),
  sale_price: z.string().max(64).default(''),
  sale_price_effective_date: z.string().max(120).default(''),
  item_group_id: z.string().max(100).default(''),
  gender: z.enum(['unisex', 'male', 'female', '']).default(''),
  color: z.string().max(200).default(''),
  size: z.string().max(200).default(''),
  age_group: z
    .enum(['adult', 'all ages', 'teen', 'kids', 'toddler', 'infant', 'newborn', ''])
    .default(''),
  material: z.string().max(200).default(''),
  pattern: z.string().max(100).default(''),
  shipping: z.string().max(1000).default(''),
  shipping_weight: z.string().max(64).default(''),
  offer_disclaimer: z.string().max(2000).default(''),
  offer_disclaimer_url: safeUrlField,
  video_url: safeUrlField,
  video_tag: z.string().max(200).default(''),
  gtin: z.string().max(64).default(''),
  product_tags: z.array(z.string().max(110)).max(50).default([]),
  style: z.string().max(120).default(''),
  images: z.array(safeImageUrlItem).max(60).optional(),
});

export type ValidatedProductInput = z.infer<typeof productInputSchema>;

function parseNumericPriceUyu(priceRaw: string, explicitUyu?: number | null): number | null {
  if (typeof explicitUyu === 'number' && Number.isFinite(explicitUyu)) {
    return Math.round(explicitUyu);
  }
  const match = priceRaw.trim().match(/^(\d+(?:\.\d{1,2})?)\s*UYU$/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export function normalizeImageList(imageLink: string, images?: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const pushUnique = (url: string) => {
    const clean = url.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    ordered.push(clean);
  };

  if (imageLink.trim()) {
    pushUnique(imageLink);
  }
  if (Array.isArray(images)) {
    for (const url of images) {
      pushUnique(url);
    }
  }
  return ordered;
}

export function normalizeProductForDb(input: ValidatedProductInput) {
  const brand = input.brand.trim();
  const id = input.id.trim() || generateSku(brand);
  const rawSlug = input.slug?.trim() || '';
  const price = input.price.trim();
  const imageUrls = normalizeImageList(input.image_link, input.images);
  const coverImage = input.image_link.trim() || imageUrls[0] || '';

  return {
    productData: {
      id,
      slug: rawSlug ? rawSlug.toLowerCase() : null,
      title: input.title.trim(),
      description: input.description,
      availability: input.availability,
      condition: input.condition,
      price,
      price_uyu: parseNumericPriceUyu(price, input.price_uyu),
      link: input.link.trim(),
      image_link: coverImage,
      brand,
      team: (input.team ?? '').trim(),
      season: (input.season ?? '').trim(),
      player_number: (input.player_number ?? '').trim(),
      category: (input.category ?? '').trim(),
      sport: (input.sport ?? 'futbol').trim() || 'futbol',
      kit_version: (input.kit_version ?? '').trim(),
      delivery_mode: (input.delivery_mode ?? '').trim(),
      active: input.active ?? true,
      source_ref: (input.source_ref ?? '').trim(),
      google_product_category: input.google_product_category.trim(),
      fb_product_category: input.fb_product_category.trim(),
      quantity_to_sell_on_facebook: input.quantity_to_sell_on_facebook.trim(),
      sale_price: input.sale_price.trim(),
      sale_price_effective_date: input.sale_price_effective_date.trim(),
      item_group_id: input.item_group_id.trim(),
      gender: input.gender,
      color: input.color.trim(),
      size: input.size.trim(),
      age_group: input.age_group,
      material: input.material.trim(),
      pattern: input.pattern.trim(),
      shipping: input.shipping.trim(),
      shipping_weight: input.shipping_weight.trim(),
      offer_disclaimer: input.offer_disclaimer.trim(),
      offer_disclaimer_url: input.offer_disclaimer_url.trim(),
      video_url: input.video_url.trim(),
      video_tag: input.video_tag.trim(),
      gtin: input.gtin.trim(),
      product_tags: input.product_tags
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 50),
      style: input.style.trim(),
    },
    imageUrls,
  };
}

export const bulkActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('availability'),
    uids: z.array(z.string().min(1).max(128)).min(1).max(500),
    availability: z.enum(['in stock', 'out of stock', '']),
  }),
  z.object({
    action: z.literal('delete'),
    uids: z.array(z.string().min(1).max(128)).min(1).max(500),
  }),
  z.object({
    action: z.literal('import'),
    strategy: z.enum(['merge', 'skip']),
    products: z.array(productInputSchema).min(1).max(1000),
  }),
  z.object({
    action: z.literal('restore'),
    products: z.array(productInputSchema).max(1000),
  }),
  z.object({
    action: z.literal('reset'),
  }),
  z.object({
    action: z.literal('clear'),
  }),
  z.object({
    action: z.literal('import_optimized_json'),
  }),
]);
