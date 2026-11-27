import {
  AgeGroupValue,
  AvailabilityValue,
  ConditionValue,
  GenderValue,
  META_CSV_COMMENTS,
  META_CSV_HEADERS,
  SportProduct,
  createEmptyProduct,
  generateSku,
} from './catalog-schema';

/**
 * Parsea texto CSV compatible con RFC 4180 (comillas escapadas, comas y saltos de línea dentro de campos).
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const cleanText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    const next = cleanText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function escapeCsvCell(value: string): string {
  const str = value ?? '';
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function normalizeAvailability(val: string): AvailabilityValue {
  const lower = val.trim().toLowerCase();
  if (lower === 'in stock' || lower === 'en stock' || lower === 'disponible') return 'in stock';
  if (lower === 'out of stock' || lower === 'sin stock' || lower === 'agotado') return 'out of stock';
  return '';
}

function normalizeCondition(val: string): ConditionValue {
  const lower = val.trim().toLowerCase();
  if (lower === 'new' || lower === 'nuevo' || lower === 'nueva') return 'new';
  if (lower === 'used' || lower === 'usado' || lower === 'usada') return 'used';
  return '';
}

function normalizeGender(val: string): GenderValue {
  const lower = val.trim().toLowerCase();
  if (lower === 'unisex') return 'unisex';
  if (lower === 'male' || lower === 'hombre' || lower === 'masculino') return 'male';
  if (lower === 'female' || lower === 'mujer' || lower === 'femenino') return 'female';
  return '';
}

function normalizeAgeGroup(val: string): AgeGroupValue {
  const lower = val.trim().toLowerCase();
  const valid: AgeGroupValue[] = [
    'adult',
    'all ages',
    'teen',
    'kids',
    'toddler',
    'infant',
    'newborn',
  ];
  if ((valid as string[]).includes(lower)) return lower as AgeGroupValue;
  if (lower === 'adulto') return 'adult';
  if (lower === 'niños' || lower === 'ninos') return 'kids';
  if (lower === 'juvenil') return 'teen';
  return '';
}

export interface CsvImportResult {
  products: SportProduct[];
  skippedRows: number;
  warnings: string[];
}

export function parseMetaCatalogCsv(csvText: string): CsvImportResult {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    return { products: [], skippedRows: 0, warnings: ['El archivo o texto CSV está vacío.'] };
  }

  let headerRowIndex = 0;
  // Detecta si la primera fila es la fila de comentarios de Meta (# Obligatorio | ...)
  if (rows[0][0]?.trim().startsWith('#')) {
    headerRowIndex = 1;
  }

  if (headerRowIndex >= rows.length) {
    return {
      products: [],
      skippedRows: 0,
      warnings: ['Solo se encontró la fila de comentarios, sin encabezados ni datos.'],
    };
  }

  const rawHeaders = rows[headerRowIndex].map((h) => h.trim().toLowerCase());
  const looksLikeHeader =
    rawHeaders.includes('id') ||
    rawHeaders.includes('title') ||
    rawHeaders.includes('brand') ||
    rawHeaders.includes('description');

  const headers = looksLikeHeader
    ? rawHeaders
    : META_CSV_HEADERS.map((h) => h.toLowerCase());
  const dataStartIndex = looksLikeHeader ? headerRowIndex + 1 : headerRowIndex;

  const products: SportProduct[] = [];
  const warnings: string[] = [];
  let skippedRows = 0;

  for (let i = dataStartIndex; i < rows.length; i++) {
    const row = rows[i];
    if (row[0]?.trim().startsWith('#')) {
      skippedRows++;
      continue;
    }

    const getCol = (name: string): string => {
      const idx = headers.indexOf(name.toLowerCase());
      if (idx === -1) return '';
      return (row[idx] ?? '').trim();
    };

    // Recopila todas las columnas product_tags[N]
    const tags: string[] = [];
    headers.forEach((h, idx) => {
      if (h.startsWith('product_tags')) {
        const val = (row[idx] ?? '').trim();
        if (val && !tags.includes(val)) tags.push(val);
      }
    });

    const base = createEmptyProduct();
    const brand = getCol('brand');
    const rawId = getCol('id');

    const product: SportProduct = {
      ...base,
      id: rawId || generateSku(brand),
      title: getCol('title'),
      description: getCol('description'),
      availability: normalizeAvailability(getCol('availability')),
      condition: normalizeCondition(getCol('condition')),
      price: getCol('price'),
      link: getCol('link'),
      image_link: getCol('image_link'),
      brand,
      google_product_category: getCol('google_product_category'),
      fb_product_category: getCol('fb_product_category'),
      quantity_to_sell_on_facebook: getCol('quantity_to_sell_on_facebook'),
      sale_price: getCol('sale_price'),
      sale_price_effective_date: getCol('sale_price_effective_date'),
      item_group_id: getCol('item_group_id'),
      gender: normalizeGender(getCol('gender')),
      color: getCol('color'),
      size: getCol('size'),
      age_group: normalizeAgeGroup(getCol('age_group')),
      material: getCol('material'),
      pattern: getCol('pattern'),
      shipping: getCol('shipping'),
      shipping_weight: getCol('shipping_weight'),
      offer_disclaimer: getCol('offer_disclaimer'),
      offer_disclaimer_url: getCol('offer_disclaimer_url'),
      video_url: getCol('video[0].url') || getCol('video_url'),
      video_tag: getCol('video[0].tag[0]') || getCol('video_tag'),
      gtin: getCol('gtin'),
      product_tags: tags,
      style: getCol('style[0]') || getCol('style'),
    };

    if (!rawId) {
      warnings.push(`Fila ${i + 1}: sin SKU explícito, se asignó ${product.id}.`);
    }

    products.push(product);
  }

  return { products, skippedRows, warnings };
}

export function exportMetaCatalogCsv(
  products: SportProduct[],
  options?: { includeCommentsRow?: boolean }
): string {
  const lines: string[] = [];

  if (options?.includeCommentsRow) {
    lines.push(META_CSV_COMMENTS.map(escapeCsvCell).join(','));
  }

  lines.push(META_CSV_HEADERS.map(escapeCsvCell).join(','));

  for (const p of products) {
    const row = [
      p.id,
      p.title,
      p.description,
      p.availability,
      p.condition,
      p.price,
      p.link,
      p.image_link,
      p.brand,
      p.google_product_category,
      p.fb_product_category,
      p.quantity_to_sell_on_facebook,
      p.sale_price,
      p.sale_price_effective_date,
      p.item_group_id,
      p.gender,
      p.color,
      p.size,
      p.age_group,
      p.material,
      p.pattern,
      p.shipping,
      p.shipping_weight,
      p.offer_disclaimer,
      p.offer_disclaimer_url,
      p.video_url,
      p.video_tag,
      p.gtin,
      p.product_tags[0] ?? '',
      p.product_tags[1] ?? '',
      p.style,
    ];
    lines.push(row.map(escapeCsvCell).join(','));
  }

  // Prefijo BOM UTF-8 para compatibilidad directa con Excel y caracteres en español
  return '\uFEFF' + lines.join('\r\n');
}

export const SAMPLE_META_CSV_SNIPPET = `id,title,description,availability,condition,price,link,image_link,brand,google_product_category,fb_product_category,quantity_to_sell_on_facebook,sale_price,sale_price_effective_date,item_group_id,gender,color,size,age_group,material,pattern,shipping,shipping_weight,offer_disclaimer,offer_disclaimer_url,video[0].url,video[0].tag[0],gtin,product_tags[0],product_tags[1],style[0]
FEL-Df8Wz_Nkafr,Camiseta Manchester United Retro 1993-95 Negra - Cantona 7 - Umbro,"Camiseta retro Manchester United 1993-95 negra con detalles amarillos, marca Umbro, sponsor SHARP VIEWCAM, dorsal CANTONA 7 en espalda. Presentada sobre cesped artificial, nueva con etiquetas. Venta en @futbolenlapieluy1. Consultar talles y precio por DM.",in stock,new,,https://www.instagram.com/p/Df8Wz_Nkafr/,/images/jersey_manutd_retro_93_1795726301156.jpg,Umbro,Apparel & Accessories > Clothing,Clothing & Accessories > Clothing,,,,,unisex,black,,adult,,,,,,,,,,futbolenlapieluy1,camiseta futbol,Retro`;
