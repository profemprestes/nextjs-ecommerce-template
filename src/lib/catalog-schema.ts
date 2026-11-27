export type AvailabilityValue = 'in stock' | 'out of stock' | '';
export type ConditionValue = 'new' | 'used' | '';
export type GenderValue = 'unisex' | 'male' | 'female' | '';
export type AgeGroupValue =
  | 'adult'
  | 'all ages'
  | 'teen'
  | 'kids'
  | 'toddler'
  | 'infant'
  | 'newborn'
  | '';

export interface ProductImageItem {
  id: string;
  url: string;
  originalUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number | null;
  hasBinary: boolean;
  position: number;
  isCover: boolean;
}

/**
 * Producto deportivo adaptado al esquema de Catálogo de Meta/Facebook Commerce,
 * con todos los campos flexibles (sin obligatoriedad estricta de carga).
 */
export interface SportProduct {
  /** Identificador interno estable para operaciones CRUD */
  uid: string;
  /** SKU o identificador único de contenido (máx. 100 caracteres) */
  id: string;
  /** Título del producto deportivo (máx. 200 caracteres) */
  title: string;
  /** Descripción detallada sin mayúsculas sostenidas (máx. 9999 caracteres) */
  description: string;
  /** Disponibilidad actual: in stock | out of stock | vacío */
  availability: AvailabilityValue;
  /** Condición del artículo: new | used | vacío */
  condition: ConditionValue;
  /** Precio en formato "2490.00 UYU" (opcional, vacío = Consultar) */
  price: string;
  /** URL de la publicación o página del producto (opcional) */
  link: string;
  /** URL de la imagen principal en formato WebP compatible (opcional) */
  image_link: string;
  /** Marca deportiva (Umbro, Nike, Adidas, Puma, etc., máx. 100) */
  brand: string;
  /** Categoría de productos de Google */
  google_product_category: string;
  /** Categoría de productos de Facebook */
  fb_product_category: string;
  /** Cantidad disponible para checkout (número o vacío) */
  quantity_to_sell_on_facebook: string;
  /** Precio promocional con código ISO 4217 (ej. "1990.00 UYU") */
  sale_price: string;
  /** Intervalo de oferta ISO 8601: YYYY-MM-DDTHH:MM+TZ/YYYY-MM-DDTHH:MM+TZ */
  sale_price_effective_date: string;
  /** ID de grupo para agrupar variantes de talle/color (máx. 100) */
  item_group_id: string;
  /** Género destinatario */
  gender: GenderValue;
  /** Color en palabras descriptivas, sin hexadecimal (máx. 200) */
  color: string;
  /** Talle o medida (ej. S, M, L, XL, 42, máx. 200) */
  size: string;
  /** Grupo etario destinatario */
  age_group: AgeGroupValue;
  /** Material principal (ej. Poliéster 100%, Algodón, máx. 200) */
  material: string;
  /** Estampado o trama gráfica (máx. 100) */
  pattern: string;
  /** Detalles de envío: País:Región:Servicio:Precio */
  shipping: string;
  /** Peso de envío con unidad (g, kg, lb, oz) */
  shipping_weight: string;
  /** Aviso legal de la oferta */
  offer_disclaimer: string;
  /** URL a términos y condiciones de la oferta */
  offer_disclaimer_url: string;
  /** video[0].url - Enlace directo al archivo de video */
  video_url: string;
  /** video[0].tag[0] - Etiqueta descriptiva del video */
  video_tag: string;
  /** Código comercial global GTIN / EAN / UPC */
  gtin: string;
  /** Etiquetas de conjunto de producto (product_tags[0], product_tags[1], ...) */
  product_tags: string[];
  /** style[0] - Estilo deportivo (Retro, Titular, Entrenamiento, Urbano, etc.) */
  style: string;
  /** Slug único normalizado del catálogo */
  slug?: string;
  /** Club o selección nacional */
  team?: string;
  /** Temporada o año (ej. 2026, 1993-1995) */
  season?: string;
  /** Jugador y dorsal (ej. Cantona #7, Messi #10) */
  player_number?: string;
  /** Categoría deportiva (retros, actuales, clubes, uruguay) */
  category?: string;
  /** Deporte (futbol, etc.) */
  sport?: string;
  /** Versión de camiseta (Jugador, Fan, Retro, A confirmar) */
  kit_version?: string;
  /** Modalidad de entrega (entrega_inmediata, pendiente_verificacion) */
  delivery_mode?: string;
  /** Precio numérico en UYU para filtrado/ordenamiento indexado */
  price_uyu?: number | null;
  /** Estado activo en catálogo */
  active?: boolean;
  /** Referencia de origen normalizada */
  source_ref?: string;
  /** Galería ordenada y deduplicada de URLs de imágenes */
  images?: string[];
  /** Metadatos enriquecidos de la galería en PostgreSQL */
  gallery?: ProductImageItem[];
  /** Marca de tiempo interna */
  createdAt: string;
  updatedAt: string;
}

export const META_CSV_HEADERS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'link',
  'image_link',
  'brand',
  'google_product_category',
  'fb_product_category',
  'quantity_to_sell_on_facebook',
  'sale_price',
  'sale_price_effective_date',
  'item_group_id',
  'gender',
  'color',
  'size',
  'age_group',
  'material',
  'pattern',
  'shipping',
  'shipping_weight',
  'offer_disclaimer',
  'offer_disclaimer_url',
  'video[0].url',
  'video[0].tag[0]',
  'gtin',
  'product_tags[0]',
  'product_tags[1]',
  'style[0]',
] as const;

export const META_CSV_COMMENTS = [
  '# Opcional (adaptado) | Identificador único o SKU del artículo. Límite: 100 caracteres.',
  '# Opcional (adaptado) | Título específico del producto deportivo. Límite: 200 caracteres.',
  '# Opcional (adaptado) | Descripción breve y relevante. Sin mayúsculas sostenidas. Límite: 9999.',
  '# Opcional (adaptado) | Disponibilidad actual. Valores: in stock; out of stock.',
  '# Opcional (adaptado) | Condición del artículo. Valores: new; used.',
  '# Opcional | Precio con código de divisa ISO 4217 y punto decimal (ej. 2490.00 UYU).',
  '# Opcional (adaptado) | URL de la publicación o página del producto.',
  '# Opcional (adaptado) | URL de imagen principal en formato WebP compatible (.webp).',
  '# Opcional (adaptado) | Marca deportiva del artículo. Límite: 100 caracteres.',
  '# Opcional | Categoría de productos de Google.',
  '# Opcional | Categoría de productos de Facebook.',
  '# Opcional | Cantidad disponible para venta directa.',
  '# Opcional | Precio de oferta con código de divisa ISO 4217.',
  '# Opcional | Intervalo de oferta: YYYY-MM-DDTHH:MM+00:00/YYYY-MM-DDTHH:MM+00:00.',
  '# Opcional | ID de grupo para variantes del mismo artículo. Límite: 100.',
  '# Opcional | Género: female; male; unisex.',
  '# Opcional | Color en texto descriptivo (no hexadecimal). Límite: 200.',
  '# Opcional | Talle o tamaño (ej. M, XL, 42). Límite: 200.',
  '# Opcional | Grupo de edad: adult; all ages; infant; kids; newborn; teen; toddler.',
  '# Opcional | Material de fabricación (ej. Poliéster, Algodón). Límite: 200.',
  '# Opcional | Estampado o diseño gráfico. Límite: 100.',
  '# Opcional | Envío: País:Región:Servicio:Precio (ej. UY::Envío estándar:0.00 UYU).',
  '# Opcional | Peso de envío con unidad (g/kg/lb/oz).',
  '# Opcional | Aviso legal de la oferta.',
  '# Opcional | URL del aviso legal completo.',
  '# Opcional | URL directa de archivo de video (.mp4, .mov, etc.).',
  '# Opcional | Etiqueta del video.',
  '# Opcional | Número mundial de artículo comercial (GTIN/EAN/UPC).',
  '# Opcional | Etiqueta de conjunto de productos 1 (máx. 110 caracteres).',
  '# Opcional | Etiqueta de conjunto de productos 2 (máx. 110 caracteres).',
  '# Opcional | Estilo del artículo.',
] as const;

export const SPORT_BRANDS = [
  'Umbro',
  'Adidas',
  'Nike',
  'Puma',
  'Kappa',
  'Reebok',
  'New Balance',
  'Salomon',
  'Lotto',
  'Mizuno',
  'Under Armour',
  'Joma',
  'Kelme',
  'Topper',
  'Le Coq Sportif',
  'Asics',
  'Diadora',
  'Fila',
  'Macron',
  'Hummel',
  'Meyba',
] as const;

export const COMMON_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  'Único',
] as const;

export const CURRENCIES = ['UYU', 'USD', 'ARS', 'BRL', 'EUR', 'MXN', 'CLP', 'COP'] as const;

export const AVAILABILITY_LABELS: Record<AvailabilityValue, string> = {
  'in stock': 'En stock',
  'out of stock': 'Sin stock',
  '': 'Sin definir',
};

export const CONDITION_LABELS: Record<ConditionValue, string> = {
  new: 'Nuevo',
  used: 'Usado',
  '': 'Sin definir',
};

export const GENDER_LABELS: Record<GenderValue, string> = {
  unisex: 'Unisex',
  male: 'Hombre',
  female: 'Mujer',
  '': 'Sin definir',
};

export const AGE_GROUP_LABELS: Record<AgeGroupValue, string> = {
  adult: 'Adulto',
  'all ages': 'Todas las edades',
  teen: 'Juvenil',
  kids: 'Niños',
  toddler: 'Infantil pequeño',
  infant: 'Bebé',
  newborn: 'Recién nacido',
  '': 'Sin definir',
};

export const STYLE_SUGGESTIONS = [
  'Retro',
  'Titular',
  'Alternativa',
  'Entrenamiento',
  'Urbano deportivo',
  'Trail running',
  'Running',
  'Fútbol 5 / Futsal',
  'Abrigo deportivo',
] as const;

export const GOOGLE_CATEGORY_SUGGESTIONS = [
  'Apparel & Accessories > Clothing',
  'Apparel & Accessories > Clothing > Activewear',
  'Apparel & Accessories > Clothing > Shirts & Tops',
  'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets',
  'Apparel & Accessories > Shoes > Athletic Shoes',
  'Sporting Goods > Athletics > Soccer',
] as const;

export const FB_CATEGORY_SUGGESTIONS = [
  'Clothing & Accessories > Clothing',
  'Clothing & Accessories > Clothing > Activewear',
  'Clothing & Accessories > Shoes & Footwear > Athletic Shoes',
  'Sports & Outdoors > Team Sports > Soccer',
] as const;

export const LOCAL_GALLERY_IMAGES = [
  {
    label: 'Camiseta Retro Negra (Césped)',
    url: '/images/jersey_manutd_retro_93_1795726301156.jpg',
  },
  {
    label: 'Camiseta Retro Celeste y Blanca',
    url: '/images/jersey_striped_celeste_94_1795726302487.jpg',
  },
  {
    label: 'Camiseta Retro Roja y Negra',
    url: '/images/jersey_red_black_retro_96_1795726302289.jpg',
  },
  {
    label: 'Campera Rompeviento Retro',
    url: '/images/track_jacket_retro_navy_1795726303179.jpg',
  },
  {
    label: 'Zapatillas Trail Running',
    url: '/images/sneaker_running_green_1795726304946.jpg',
  },
] as const;

export function createEmptyProduct(): SportProduct {
  const now = new Date().toISOString();
  return {
    uid: crypto.randomUUID ? crypto.randomUUID() : `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: '',
    title: '',
    description: '',
    availability: 'in stock',
    condition: 'new',
    price: '',
    link: '',
    image_link: '',
    brand: '',
    google_product_category: 'Apparel & Accessories > Clothing',
    fb_product_category: 'Clothing & Accessories > Clothing',
    quantity_to_sell_on_facebook: '',
    sale_price: '',
    sale_price_effective_date: '',
    item_group_id: '',
    gender: 'unisex',
    color: '',
    size: '',
    age_group: 'adult',
    material: '',
    pattern: '',
    shipping: '',
    shipping_weight: '',
    offer_disclaimer: '',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: [],
    style: '',
    slug: '',
    team: '',
    season: '',
    player_number: '',
    category: '',
    sport: 'futbol',
    kit_version: '',
    delivery_mode: '',
    price_uyu: null,
    active: true,
    source_ref: '',
    images: [],
    gallery: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function generateSku(brand?: string): string {
  const prefix = (brand || 'SPT')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export function getProductPath(
  product: Pick<SportProduct, 'slug' | 'uid' | 'id'>
): string {
  const key = product.slug?.trim() || product.uid || product.id;
  return `/productos/${encodeURIComponent(key)}`;
}

export function parsePriceParts(raw: string): { amount: string; currency: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { amount: '', currency: 'UYU' };
  const match = trimmed.match(/^([0-9]+(?:\.[0-9]{1,2})?)\s*([A-Z]{3})?$/i);
  if (match) {
    return {
      amount: match[1],
      currency: (match[2] || 'UYU').toUpperCase(),
    };
  }
  return { amount: trimmed, currency: 'UYU' };
}

export function buildPriceString(amount: string, currency: string): string {
  const cleanAmount = amount.trim().replace(',', '.');
  if (!cleanAmount) return '';
  const cleanCurrency = (currency.trim() || 'UYU').toUpperCase().slice(0, 3);
  return `${cleanAmount} ${cleanCurrency}`;
}

export function parseSaleDateRange(raw: string): {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
} {
  const fallback = {
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    timezone: '-03:00',
  };
  if (!raw.includes('/')) return fallback;
  const [startPart, endPart] = raw.split('/');
  const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})([+-]\d{2}:\d{2})$/;
  const m1 = startPart?.trim().match(regex);
  const m2 = endPart?.trim().match(regex);
  if (!m1 || !m2) return fallback;
  return {
    startDate: m1[1],
    startTime: m1[2],
    endDate: m2[1],
    endTime: m2[2],
    timezone: m1[3],
  };
}

export function buildSaleDateRange(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  timezone: string
): string {
  if (!startDate || !endDate) return '';
  const st = startTime || '00:00';
  const et = endTime || '23:59';
  const tz = timezone || '-03:00';
  return `${startDate}T${st}${tz}/${endDate}T${et}${tz}`;
}

export interface SoftValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface WebpUrlValidationResult {
  valid: boolean;
  isEmpty: boolean;
  isSafeUrl: boolean;
  isWebp: boolean;
  isInternalBinary: boolean;
  error?: string;
}

const INTERNAL_BINARY_IMAGE_REGEX = /^\/api\/images\/[a-zA-Z0-9_-]+(?:\?[^\s#]*)?$/;
const WEBP_PATH_REGEX = /\.webp$/i;
const WEBP_QUERY_KEYS = new Set(['format', 'fm', 'ext', 'output', 'f']);

/**
 * Verifica que una URL de imagen use un esquema seguro (http/https o ruta relativa /...)
 * evitando esquemas peligrosos (javascript:, data:, //, espacios o caracteres de control).
 */
export function isSafeImageUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (/[\s\u0000-\u001F\u007F]/.test(trimmed)) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida que una URL de imagen sea segura y corresponda a un formato WebP compatible.
 * Acepta:
 *  - Cadena vacía (los campos son opcionales)
 *  - Imágenes binarias internas almacenadas en PostgreSQL (/api/images/<id>)
 *  - URLs http(s) o rutas relativas cuya ruta termine en .webp (ignorando query/hash)
 *  - URLs de CDNs con parámetro o transformación explícita de formato WebP (format=webp, fm=webp, f_webp)
 */
export function validateWebpImageUrl(raw: string): WebpUrlValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      valid: true,
      isEmpty: true,
      isSafeUrl: true,
      isWebp: true,
      isInternalBinary: false,
    };
  }

  if (!isSafeImageUrl(trimmed)) {
    return {
      valid: false,
      isEmpty: false,
      isSafeUrl: false,
      isWebp: false,
      isInternalBinary: false,
      error: 'Ingresá una URL de imagen válida (https://... o ruta relativa /...).',
    };
  }

  if (INTERNAL_BINARY_IMAGE_REGEX.test(trimmed)) {
    return {
      valid: true,
      isEmpty: false,
      isSafeUrl: true,
      isWebp: true,
      isInternalBinary: true,
    };
  }

  let pathname = '';
  let searchParams: URLSearchParams | null = null;
  try {
    const parsed = trimmed.startsWith('/')
      ? new URL(trimmed, 'https://fichasport.local')
      : new URL(trimmed);
    pathname = parsed.pathname;
    searchParams = parsed.searchParams;
  } catch {
    return {
      valid: false,
      isEmpty: false,
      isSafeUrl: false,
      isWebp: false,
      isInternalBinary: false,
      error: 'La URL de imagen no tiene un formato válido.',
    };
  }

  const decodedPath = (() => {
    try {
      return decodeURIComponent(pathname);
    } catch {
      return pathname;
    }
  })();

  const hasWebpExtension = WEBP_PATH_REGEX.test(decodedPath);
  const hasWebpPathTransform = /(?:^|[\/,])f_webp(?:[\/,]|$)/i.test(decodedPath);

  let hasWebpQueryParam = false;
  if (searchParams) {
    for (const [key, value] of Array.from(searchParams.entries())) {
      const k = key.toLowerCase();
      const v = value.trim().toLowerCase();
      if (WEBP_QUERY_KEYS.has(k) && v === 'webp') {
        hasWebpQueryParam = true;
        break;
      }
    }
  }

  if (hasWebpExtension || hasWebpPathTransform || hasWebpQueryParam) {
    return {
      valid: true,
      isEmpty: false,
      isSafeUrl: true,
      isWebp: true,
      isInternalBinary: false,
    };
  }

  return {
    valid: false,
    isEmpty: false,
    isSafeUrl: true,
    isWebp: false,
    isInternalBinary: false,
    error: 'Formato no compatible: la URL de imagen debe estar en formato WebP (.webp).',
  };
}

export interface ValidateProductSoftOptions {
  /** URL original del producto en modo edición para no bloquear imágenes legadas sin cambios */
  initialImageLink?: string;
  /** URLs originales de galería en modo edición */
  initialImages?: string[];
}

/**
 * Validación flexible: nunca bloquea por campos vacíos ("sin valores obligatorios"),
 * solo controla límites de caracteres y formato cuando el campo tiene contenido.
 */
export function validateProductSoft(
  product: SportProduct,
  existingProducts: SportProduct[],
  options?: ValidateProductSoftOptions
): SoftValidationIssue[] {
  const issues: SoftValidationIssue[] = [];

  if (product.id.length > 100) {
    issues.push({
      field: 'id',
      message: 'El SKU no puede superar los 100 caracteres.',
      severity: 'error',
    });
  }

  if (product.id.trim()) {
    const duplicate = existingProducts.find(
      (p) =>
        p.uid !== product.uid &&
        p.id.trim().toLowerCase() === product.id.trim().toLowerCase()
    );
    if (duplicate) {
      issues.push({
        field: 'id',
        message: `El SKU "${product.id}" ya existe en el catálogo.`,
        severity: 'error',
      });
    }
  }

  if (product.title.length > 200) {
    issues.push({
      field: 'title',
      message: 'El título no puede superar los 200 caracteres.',
      severity: 'error',
    });
  }

  if (product.description.length > 9999) {
    issues.push({
      field: 'description',
      message: 'La descripción no puede superar los 9999 caracteres.',
      severity: 'error',
    });
  }

  if (product.brand.length > 100) {
    issues.push({
      field: 'brand',
      message: 'La marca no puede superar los 100 caracteres.',
      severity: 'error',
    });
  }

  const trimmedImage = product.image_link.trim();
  if (trimmedImage) {
    const imageCheck = validateWebpImageUrl(trimmedImage);
    if (!imageCheck.valid) {
      const initialImg = options?.initialImageLink?.trim();
      const isUntouchedLegacy =
        imageCheck.isSafeUrl &&
        initialImg !== undefined &&
        initialImg !== '' &&
        trimmedImage === initialImg;

      if (isUntouchedLegacy) {
        issues.push({
          field: 'image_link',
          message:
            'La imagen actual no es .webp. Podés conservarla o pegar una nueva URL en formato WebP (.webp).',
          severity: 'warning',
        });
      } else {
        issues.push({
          field: 'image_link',
          message:
            imageCheck.error ||
            'La URL de imagen principal debe ser un formato WebP compatible (.webp).',
          severity: 'error',
        });
      }
    }
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const initialGallerySet = new Set(
      (options?.initialImages ?? []).map((u) => u.trim()).filter(Boolean)
    );
    const invalidNewGalleryUrl = product.images.find((rawUrl) => {
      const clean = rawUrl.trim();
      if (!clean) return false;
      const check = validateWebpImageUrl(clean);
      if (check.valid) return false;
      if (check.isSafeUrl && initialGallerySet.has(clean)) return false;
      return true;
    });
    if (invalidNewGalleryUrl) {
      issues.push({
        field: 'images',
        message: 'Todas las nuevas URLs de la galería deben estar en formato WebP compatible (.webp).',
        severity: 'error',
      });
    }
  }

  if (product.price.trim() && !/^\d+(?:\.\d{1,2})?\s+[A-Z]{3}$/.test(product.price.trim())) {
    issues.push({
      field: 'price',
      message: 'Formato sugerido para Meta: monto con punto decimal + divisa ISO (ej. 2490.00 UYU).',
      severity: 'warning',
    });
  }

  if (product.sale_price.trim() && !/^\d+(?:\.\d{1,2})?\s+[A-Z]{3}$/.test(product.sale_price.trim())) {
    issues.push({
      field: 'sale_price',
      message: 'Formato sugerido: monto con punto decimal + divisa ISO (ej. 1990.00 UYU).',
      severity: 'warning',
    });
  }

  if (product.color.trim() && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(product.color.trim())) {
    issues.push({
      field: 'color',
      message: 'Usá el nombre del color en palabras (ej. negro, azul marino) en lugar de un código hexadecimal.',
      severity: 'warning',
    });
  }

  if (
    product.quantity_to_sell_on_facebook.trim() &&
    (!/^\d+$/.test(product.quantity_to_sell_on_facebook.trim()) ||
      Number(product.quantity_to_sell_on_facebook) < 0)
  ) {
    issues.push({
      field: 'quantity_to_sell_on_facebook',
      message: 'La cantidad debe ser un número entero mayor o igual a 0.',
      severity: 'error',
    });
  }

  return issues;
}

/**
 * Diagnóstico puramente informativo sobre la cobertura de atributos estándar de Meta.
 * Nunca impide guardar ni editar un artículo.
 */
export function getCatalogCoverage(product: SportProduct): {
  filledCount: number;
  totalFields: number;
  missingMetaStandard: string[];
} {
  const checks: [string, boolean][] = [
    ['id', Boolean(product.id.trim())],
    ['title', Boolean(product.title.trim())],
    ['description', Boolean(product.description.trim())],
    ['availability', Boolean(product.availability)],
    ['condition', Boolean(product.condition)],
    ['price', Boolean(product.price.trim())],
    ['link', Boolean(product.link.trim())],
    ['image_link', Boolean(product.image_link.trim())],
    ['brand', Boolean(product.brand.trim())],
    ['google_product_category', Boolean(product.google_product_category.trim())],
    ['fb_product_category', Boolean(product.fb_product_category.trim())],
    ['quantity_to_sell_on_facebook', Boolean(product.quantity_to_sell_on_facebook.trim())],
    ['sale_price', Boolean(product.sale_price.trim())],
    ['sale_price_effective_date', Boolean(product.sale_price_effective_date.trim())],
    ['item_group_id', Boolean(product.item_group_id.trim())],
    ['gender', Boolean(product.gender)],
    ['color', Boolean(product.color.trim())],
    ['size', Boolean(product.size.trim())],
    ['age_group', Boolean(product.age_group)],
    ['material', Boolean(product.material.trim())],
    ['pattern', Boolean(product.pattern.trim())],
    ['shipping', Boolean(product.shipping.trim())],
    ['shipping_weight', Boolean(product.shipping_weight.trim())],
    ['offer_disclaimer', Boolean(product.offer_disclaimer.trim())],
    ['offer_disclaimer_url', Boolean(product.offer_disclaimer_url.trim())],
    ['video_url', Boolean(product.video_url.trim())],
    ['video_tag', Boolean(product.video_tag.trim())],
    ['gtin', Boolean(product.gtin.trim())],
    ['product_tags', product.product_tags.length > 0],
    ['style', Boolean(product.style.trim())],
  ];

  const metaStandardMap: [string, string, boolean][] = [
    ['id', 'SKU / ID', Boolean(product.id.trim())],
    ['title', 'Título', Boolean(product.title.trim())],
    ['description', 'Descripción', Boolean(product.description.trim())],
    ['availability', 'Disponibilidad', Boolean(product.availability)],
    ['condition', 'Condición', Boolean(product.condition)],
    ['link', 'Enlace', Boolean(product.link.trim())],
    ['image_link', 'Imagen', Boolean(product.image_link.trim())],
    ['brand', 'Marca', Boolean(product.brand.trim())],
  ];

  return {
    filledCount: checks.filter(([, filled]) => filled).length,
    totalFields: checks.length,
    missingMetaStandard: metaStandardMap
      .filter(([, , filled]) => !filled)
      .map(([, label]) => label),
  };
}

export const INITIAL_PRODUCTS: SportProduct[] = [
  {
    uid: 'seed-fel-001',
    id: 'FEL-Df8Wz_Nkafr',
    title: 'Camiseta Manchester United Retro 1993-95 Negra - Cantona 7 - Umbro',
    description:
      'Camiseta retro Manchester United 1993-95 negra con detalles amarillos, marca Umbro, sponsor SHARP VIEWCAM, dorsal CANTONA 7 en espalda. Presentada sobre cesped artificial, nueva con etiquetas. Venta en @futbolenlapieluy1. Consultar talles y precio por DM.',
    availability: 'in stock',
    condition: 'new',
    price: '',
    link: 'https://www.instagram.com/p/Df8Wz_Nkafr/',
    image_link: '/images/jersey_manutd_retro_93_1795726301156.jpg',
    brand: 'Umbro',
    google_product_category: 'Apparel & Accessories > Clothing',
    fb_product_category: 'Clothing & Accessories > Clothing',
    quantity_to_sell_on_facebook: '',
    sale_price: '',
    sale_price_effective_date: '',
    item_group_id: 'GRP-MU-9395',
    gender: 'unisex',
    color: 'black',
    size: '',
    age_group: 'adult',
    material: 'Poliéster jacquard',
    pattern: 'Retro detalles amarillos',
    shipping: 'UY::Envío a todo el país:0.00 UYU',
    shipping_weight: '260 g',
    offer_disclaimer: '',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: ['futbolenlapieluy1', 'camiseta futbol'],
    style: 'Retro',
    createdAt: '2026-11-20T14:00:00.000Z',
    updatedAt: '2026-11-26T10:15:00.000Z',
  },
  {
    uid: 'seed-fel-002',
    id: 'FEL-CEL-94-L',
    title: 'Camiseta Retro Celeste y Blanca Bastones 1994 - Cuello Polo - Umbro',
    description:
      'Edición clásica a bastones verticales celestes y blancos con cuello polo azul marino y puños geométricos bordados. Tejido liviano de poliéster con trama jacquard de época.',
    availability: 'in stock',
    condition: 'new',
    price: '2890.00 UYU',
    link: 'https://www.instagram.com/futbolenlapieluy1/',
    image_link: '/images/jersey_striped_celeste_94_1795726302487.jpg',
    brand: 'Umbro',
    google_product_category: 'Apparel & Accessories > Clothing',
    fb_product_category: 'Clothing & Accessories > Clothing',
    quantity_to_sell_on_facebook: '6',
    sale_price: '2490.00 UYU',
    sale_price_effective_date: '2026-11-20T00:00-03:00/2026-12-05T23:59-03:00',
    item_group_id: 'GRP-CEL-94',
    gender: 'unisex',
    color: 'celeste y blanco',
    size: 'L',
    age_group: 'adult',
    material: 'Poliéster 100%',
    pattern: 'Bastones verticales',
    shipping: 'UY::Envío estándar:180.00 UYU',
    shipping_weight: '250 g',
    offer_disclaimer: 'Válido hasta agotar stock.',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: ['futbolenlapieluy1', 'retro 90s'],
    style: 'Retro',
    createdAt: '2026-11-21T16:30:00.000Z',
    updatedAt: '2026-11-25T18:45:00.000Z',
  },
  {
    uid: 'seed-fel-003',
    id: 'FEL-CEL-94-M',
    title: 'Camiseta Retro Celeste y Blanca Bastones 1994 - Cuello Polo - Umbro (Talle M)',
    description:
      'Variante talle M de la edición clásica a bastones celestes y blancos con cuello polo marino y puños bordados. Nueva con etiquetas.',
    availability: 'in stock',
    condition: 'new',
    price: '2890.00 UYU',
    link: 'https://www.instagram.com/futbolenlapieluy1/',
    image_link: '/images/jersey_striped_celeste_94_1795726302487.jpg',
    brand: 'Umbro',
    google_product_category: 'Apparel & Accessories > Clothing',
    fb_product_category: 'Clothing & Accessories > Clothing',
    quantity_to_sell_on_facebook: '4',
    sale_price: '2490.00 UYU',
    sale_price_effective_date: '2026-11-20T00:00-03:00/2026-12-05T23:59-03:00',
    item_group_id: 'GRP-CEL-94',
    gender: 'unisex',
    color: 'celeste y blanco',
    size: 'M',
    age_group: 'adult',
    material: 'Poliéster 100%',
    pattern: 'Bastones verticales',
    shipping: 'UY::Envío estándar:180.00 UYU',
    shipping_weight: '240 g',
    offer_disclaimer: 'Válido hasta agotar stock.',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: ['futbolenlapieluy1', 'retro 90s'],
    style: 'Retro',
    createdAt: '2026-11-21T16:35:00.000Z',
    updatedAt: '2026-11-25T18:45:00.000Z',
  },
  {
    uid: 'seed-fel-004',
    id: 'KAP-ROJ-96-XL',
    title: 'Camiseta Clásica Roja y Negra a Bastones 1996 - Edición Colección',
    description:
      'Camiseta deportiva a rayas rojas y negras con cuello tipo chomba y puños blancos contrastantes. Corte holgado clásico de mediados de los noventa.',
    availability: 'out of stock',
    condition: 'new',
    price: '3150.00 UYU',
    link: '',
    image_link: '/images/jersey_red_black_retro_96_1795726302289.jpg',
    brand: 'Kappa',
    google_product_category: 'Apparel & Accessories > Clothing > Shirts & Tops',
    fb_product_category: 'Clothing & Accessories > Clothing',
    quantity_to_sell_on_facebook: '0',
    sale_price: '',
    sale_price_effective_date: '',
    item_group_id: 'GRP-ROJ-96',
    gender: 'male',
    color: 'rojo y negro',
    size: 'XL',
    age_group: 'adult',
    material: 'Poliéster microperforado',
    pattern: 'Rayas verticales',
    shipping: '',
    shipping_weight: '270 g',
    offer_disclaimer: '',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: ['camiseta futbol', 'edicion coleccion'],
    style: 'Retro',
    createdAt: '2026-11-22T09:15:00.000Z',
    updatedAt: '2026-11-24T11:20:00.000Z',
  },
  {
    uid: 'seed-fel-005',
    id: 'ADI-TRK-NVY-L',
    title: 'Campera Rompeviento Retro Colorblock Marino, Blanco y Verde',
    description:
      'Campera deportiva de nylon liviano estilo años 90 con bloques de color azul marino, blanco y verde bosque, bolsillos con cierre y puños elastizados.',
    availability: 'in stock',
    condition: 'used',
    price: '95.00 USD',
    link: '',
    image_link: '/images/track_jacket_retro_navy_1795726303179.jpg',
    brand: 'Adidas',
    google_product_category: 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets',
    fb_product_category: 'Clothing & Accessories > Clothing > Activewear',
    quantity_to_sell_on_facebook: '1',
    sale_price: '',
    sale_price_effective_date: '',
    item_group_id: '',
    gender: 'unisex',
    color: 'azul marino, blanco y verde',
    size: 'L',
    age_group: 'adult',
    material: 'Nylon arrugado con forro de malla',
    pattern: 'Colorblock',
    shipping: 'UY::Retiro o envío:0.00 USD',
    shipping_weight: '420 g',
    offer_disclaimer: 'Prenda vintage única en excelente estado.',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: ['vintage', 'abrigo deportivo'],
    style: 'Abrigo deportivo',
    createdAt: '2026-11-23T12:00:00.000Z',
    updatedAt: '2026-11-26T08:10:00.000Z',
  },
  {
    uid: 'seed-fel-006',
    id: 'SAL-SPD-GRN-42',
    title: 'Zapatillas Trail Running Malla Gris y Verde Bosque - Suela Taco Alto',
    description:
      'Calzado técnico para trail running con malla transpirable en tono piedra, refuerzos de gamuza sintética y suela de alto agarre en terreno mixto.',
    availability: 'in stock',
    condition: 'new',
    price: '165.00 USD',
    link: '',
    image_link: '/images/sneaker_running_green_1795726304946.jpg',
    brand: 'Salomon',
    google_product_category: 'Apparel & Accessories > Shoes > Athletic Shoes',
    fb_product_category: 'Clothing & Accessories > Shoes & Footwear > Athletic Shoes',
    quantity_to_sell_on_facebook: '3',
    sale_price: '145.00 USD',
    sale_price_effective_date: '2026-11-24T00:00-03:00/2026-12-10T23:59-03:00',
    item_group_id: 'GRP-SAL-TRL',
    gender: 'unisex',
    color: 'gris piedra y verde bosque',
    size: '42',
    age_group: 'adult',
    material: 'Malla sintética y suela de caucho',
    pattern: 'Liso técnico',
    shipping: 'UY::Envío gratuito:0.00 USD',
    shipping_weight: '680 g',
    offer_disclaimer: '',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '0195751284920',
    product_tags: ['trail running', 'calzado deportivo'],
    style: 'Trail running',
    createdAt: '2026-11-24T17:40:00.000Z',
    updatedAt: '2026-11-26T09:00:00.000Z',
  },
];
