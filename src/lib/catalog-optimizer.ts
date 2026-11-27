import type { ValidatedProductInput } from './product-validation';

export interface RawCatalogItem {
  id_origen: string | null;
  slug_normalizado: string;
  titulo: string;
  equipo_o_seleccion: string;
  temporada_o_anio: string | null;
  dorsal: string | null;
  categoria: string | null;
  deporte: string | null;
  version: string | null;
  modalidad: string | null;
  precio_uyu: number | null;
  imagenes_ordenadas: string[];
  fuente: string | null;
  tipo: string | null;
  activo: boolean;
  portada: string | null;
}

export interface RawCatalogJson {
  productos: RawCatalogItem[];
}

export interface OptimizedCatalogProduct {
  sku: string;
  slug: string;
  titulo: string;
  descripcion: string;
  equipo: string;
  temporada: string | null;
  dorsal: string | null;
  marca: string;
  categoria: string;
  deporte: string;
  version: string;
  estilo: string;
  modalidad: 'entrega_inmediata' | 'pendiente_verificacion';
  disponibilidad: 'in stock' | '';
  condicion: 'new';
  talle: string;
  precio_uyu: number | null;
  grupo_variante: string;
  etiquetas: string[];
  portada: string;
  imagenes: string[];
  fuentes: string[];
  activo: boolean;
}

export interface OptimizedCatalogJson {
  version_esquema: string;
  generado_desde: string;
  resumen: {
    total_origen: number;
    productos_activos_optimizados: number;
    duplicados_fusionados: number;
    anuncios_descartados: number;
    total_imagenes_unicas: number;
  };
  productos: OptimizedCatalogProduct[];
}

const KNOWN_BRAND_BY_SLUG: Record<string, string> = {
  'manchester-united-1993-1995-cantona-7': 'Umbro',
  'noruega-2026-braut-haaland-9': 'Nike',
  'como-2026': 'Adidas',
  'manchester-united-1996-cantona-7': 'Umbro',
  'uruguay-2026': 'Nike',
  'espana-1996-luis-enrique-21': 'Adidas',
  'manchester-united-2002-reversible-centenario-1902-2002-beckham-7': 'Umbro',
  'liverpool-1995-mcmanaman-17': 'Adidas',
  'manchester-united-1988': 'Adidas',
  'arsenal-1993': 'Adidas',
  boca: 'Adidas',
  'penarol-curcc-2026-aniversario-1891': 'Puma',
  'penarol-1998-10': 'Umbro',
  'alemania-2024-kroos-8': 'Adidas',
  'manchester-united-2026-ugarte-25': 'Adidas',
  'noruega-2026-odegaard-10': 'Nike',
  'nacional-2026': 'Umbro',
  'italia-1994-r-baggio-10': 'Diadora',
  'colombia-1990-valderrama-10': 'Adidas',
  'real-madrid-2026-valverde-8': 'Adidas',
  'argentina-2026-messi-10': 'Adidas',
  'brasil-1994-romario-11': 'Umbro',
  'argentina-2006-messi-19': 'Adidas',
  'barcelona-1991': 'Meyba',
  'camerun-1998-eto-o-11': 'Puma',
  'alemania-2026': 'Adidas',
  'penarol-2026': 'Puma',
  'manchester-united-1999': 'Umbro',
  'real-madrid-2003-ronaldo-9': 'Adidas',
  'liverpool-2026-araujo-33': '',
  'barcelona-2009-a-iniesta-8': 'Nike',
  'barcelona-2011-messi-10': 'Nike',
  'espana-2026-lamine-yamal-19': 'Adidas',
  'cabo-verde-2026-lopes-cabral-13': '',
  'nacional-2026-golero': 'Umbro',
  'escocia-2026': 'Adidas',
  'espana-2026-pedro-porro-12': 'Adidas',
  'marruecos-2026-hakimi-2': 'Puma',
  'real-madrid-2017-ronaldo-7': 'Adidas',
  'inter-miami-2026-suarez-9': 'Adidas',
  'liverpool-edicion-especial': 'Adidas',
  'portugal-2026-ronaldo-7': 'Puma',
  'boca-2026-paredes-5': 'Adidas',
};

function stripVersionSuffix(slug: string): string {
  return slug.trim().toLowerCase().replace(/-v\d+$/, '');
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .trim()
    .replace(/\bEdicion especial\b/gi, 'Edición especial')
    .replace(/\s+/g, ' ');
}

function cleanSeason(rawSeason: string | null): string | null {
  if (!rawSeason) return null;
  const cleaned = rawSeason.trim().replace('/', '-');
  return cleaned || null;
}

function detectSizeFromImages(images: string[]): string {
  for (const url of images) {
    const match = url.match(/talle-([a-z0-9]+)/i);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }
  return '';
}

function mergeSources(existing: string[], incoming: string | null): string[] {
  const set = new Set(existing);
  if (incoming) {
    for (const part of incoming.split(';')) {
      const clean = part.trim();
      if (clean) set.add(clean);
    }
  }
  return Array.from(set);
}

function sortAndDedupeImages(images: string[], preferredCover: string | null): string[] {
  const unique = Array.from(new Set(images.map((img) => img.trim()).filter(Boolean)));

  const webp = unique.filter((u) => u.toLowerCase().endsWith('.webp'));
  const others = unique.filter((u) => !u.toLowerCase().endsWith('.webp'));
  const ordered = [...webp, ...others];

  if (preferredCover && ordered.includes(preferredCover)) {
    const coverIsWebp = preferredCover.toLowerCase().endsWith('.webp');
    if (coverIsWebp || webp.length === 0) {
      return [preferredCover, ...ordered.filter((u) => u !== preferredCover)];
    }
  }
  return ordered;
}

function resolveVersion(current: string, incoming: string | null): string {
  const cleanIncoming = (incoming || '').trim();
  if (!cleanIncoming || cleanIncoming === 'A confirmar') {
    return current || 'A confirmar';
  }
  return cleanIncoming;
}

function resolveModality(
  current: 'entrega_inmediata' | 'pendiente_verificacion',
  incoming: string | null
): 'entrega_inmediata' | 'pendiente_verificacion' {
  if (current === 'entrega_inmediata' || incoming === 'entrega_inmediata') {
    return 'entrega_inmediata';
  }
  return 'pendiente_verificacion';
}

function inferStyle(slug: string, category: string, version: string): string {
  if (slug.includes('golero')) return 'Golero';
  if (slug.includes('edicion-especial')) return 'Edición especial';
  if (category === 'retros' || version.toLowerCase() === 'retro') return 'Retro';
  if (version.toLowerCase() === 'jugador') return 'Jugador';
  if (version.toLowerCase() === 'fan') return 'Fan';
  return 'Titular';
}

function buildGroupId(team: string, season: string | null, category: string): string {
  const teamKey = team
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/^PENAROL-CURCC$/i, 'PENAROL')
    .toUpperCase();

  if (category === 'retros') {
    return `GRP-${teamKey}-RETRO`.slice(0, 100);
  }
  if (season) {
    return `GRP-${teamKey}-${season}`.slice(0, 100);
  }
  return `GRP-${teamKey}`.slice(0, 100);
}

function buildSku(slug: string): string {
  return `CAM-${slug.toUpperCase()}`.slice(0, 100);
}

function buildDescription(item: {
  titulo: string;
  equipo: string;
  temporada: string | null;
  dorsal: string | null;
  marca: string;
  categoria: string;
  version: string;
  modalidad: 'entrega_inmediata' | 'pendiente_verificacion';
  talle: string;
}): string {
  const parts: string[] = [item.titulo];
  if (item.marca) {
    parts.push(`marca ${item.marca}`);
  }
  if (item.version && item.version !== 'A confirmar') {
    parts.push(`versión ${item.version}`);
  } else if (item.categoria === 'retros') {
    parts.push('edición retro de colección');
  }
  if (item.dorsal) {
    parts.push(`con dorsal ${item.dorsal}`);
  }
  if (item.talle) {
    parts.push(`última unidad en talle ${item.talle}`);
  }
  const availabilityNote =
    item.modalidad === 'entrega_inmediata'
      ? 'Disponible para entrega inmediata.'
      : 'Disponibilidad y stock a confirmar.';
  return `${parts.join(', ')}. ${availabilityNote} Consultar precio y talles disponibles.`;
}

function buildTags(item: {
  categoria: string;
  equipo: string;
  temporada: string | null;
  version: string;
  modalidad: 'entrega_inmediata' | 'pendiente_verificacion';
}): string[] {
  const tags = new Set<string>(['camiseta futbol']);
  if (item.categoria) tags.add(item.categoria);
  if (item.equipo) tags.add(item.equipo.toLowerCase());
  if (item.temporada) tags.add(item.temporada);
  if (item.version && item.version !== 'A confirmar') {
    tags.add(`version ${item.version.toLowerCase()}`);
  }
  if (item.modalidad === 'entrega_inmediata') {
    tags.add('entrega inmediata');
  }
  return Array.from(tags).slice(0, 8);
}

export function optimizeRawCatalog(raw: RawCatalogJson): OptimizedCatalogJson {
  const items = Array.isArray(raw.productos) ? raw.productos : [];
  let anunciosDescartados = 0;
  let duplicadosFusionados = 0;

  interface MergeBucket {
    slug: string;
    titulo: string;
    equipo: string;
    temporada: string | null;
    dorsal: string | null;
    categoria: string;
    deporte: string;
    version: string;
    modalidad: 'entrega_inmediata' | 'pendiente_verificacion';
    precio_uyu: number | null;
    imagenes: string[];
    portada: string | null;
    fuentes: string[];
  }

  const buckets = new Map<string, MergeBucket>();

  for (const item of items) {
    const isAdOrInactive =
      !item.activo ||
      item.tipo !== 'producto' ||
      item.titulo === 'PENDIENTE_VERIFICACION' ||
      item.equipo_o_seleccion === 'PENDIENTE_VERIFICACION';

    if (isAdOrInactive) {
      anunciosDescartados++;
      continue;
    }

    const canonicalSlug = stripVersionSuffix(item.slug_normalizado);
    const existing = buckets.get(canonicalSlug);
    const incomingModality: 'entrega_inmediata' | 'pendiente_verificacion' =
      item.modalidad === 'entrega_inmediata'
        ? 'entrega_inmediata'
        : 'pendiente_verificacion';

    if (existing) {
      duplicadosFusionados++;
      existing.imagenes.push(...(item.imagenes_ordenadas || []));
      if (item.portada) existing.imagenes.push(item.portada);
      if (!existing.portada && item.portada) existing.portada = item.portada;
      existing.version = resolveVersion(existing.version, item.version);
      existing.modalidad = resolveModality(existing.modalidad, item.modalidad);
      if (existing.precio_uyu === null && typeof item.precio_uyu === 'number') {
        existing.precio_uyu = item.precio_uyu;
      }
      existing.fuentes = mergeSources(existing.fuentes, item.fuente);
    } else {
      const initialImages = [...(item.imagenes_ordenadas || [])];
      if (item.portada) initialImages.unshift(item.portada);

      buckets.set(canonicalSlug, {
        slug: canonicalSlug,
        titulo: cleanTitle(item.titulo),
        equipo: item.equipo_o_seleccion.trim(),
        temporada: cleanSeason(item.temporada_o_anio),
        dorsal: item.dorsal ? item.dorsal.trim() : null,
        categoria: (item.categoria || 'clubes').trim().toLowerCase(),
        deporte: (item.deporte || 'futbol').trim().toLowerCase(),
        version: (item.version || 'A confirmar').trim(),
        modalidad: incomingModality,
        precio_uyu: typeof item.precio_uyu === 'number' ? item.precio_uyu : null,
        imagenes: initialImages,
        portada: item.portada,
        fuentes: mergeSources([], item.fuente),
      });
    }
  }

  let totalImagenesUnicas = 0;
  const productos: OptimizedCatalogProduct[] = [];

  for (const bucket of Array.from(buckets.values())) {
    const imagenes = sortAndDedupeImages(bucket.imagenes, bucket.portada);
    totalImagenesUnicas += imagenes.length;
    const portada = imagenes[0] || '';
    const marca = KNOWN_BRAND_BY_SLUG[bucket.slug] ?? '';
    const talle = detectSizeFromImages(imagenes);
    const estilo = inferStyle(bucket.slug, bucket.categoria, bucket.version);
    const grupo_variante = buildGroupId(bucket.equipo, bucket.temporada, bucket.categoria);
    const descripcion = buildDescription({
      titulo: bucket.titulo,
      equipo: bucket.equipo,
      temporada: bucket.temporada,
      dorsal: bucket.dorsal,
      marca,
      categoria: bucket.categoria,
      version: bucket.version,
      modalidad: bucket.modalidad,
      talle,
    });

    productos.push({
      sku: buildSku(bucket.slug),
      slug: bucket.slug,
      titulo: bucket.titulo,
      descripcion,
      equipo: bucket.equipo,
      temporada: bucket.temporada,
      dorsal: bucket.dorsal,
      marca,
      categoria: bucket.categoria,
      deporte: bucket.deporte,
      version: bucket.version,
      estilo,
      modalidad: bucket.modalidad,
      disponibilidad: bucket.modalidad === 'entrega_inmediata' ? 'in stock' : '',
      condicion: 'new',
      talle,
      precio_uyu: bucket.precio_uyu,
      grupo_variante,
      etiquetas: buildTags({
        categoria: bucket.categoria,
        equipo: bucket.equipo,
        temporada: bucket.temporada,
        version: bucket.version,
        modalidad: bucket.modalidad,
      }),
      portada,
      imagenes,
      fuentes: bucket.fuentes,
      activo: true,
    });
  }

  return {
    version_esquema: '2.0-optimizado',
    generado_desde: '/assets/aistudio/catalogo_bb8c37ef.json',
    resumen: {
      total_origen: items.length,
      productos_activos_optimizados: productos.length,
      duplicados_fusionados: duplicadosFusionados,
      anuncios_descartados: anunciosDescartados,
      total_imagenes_unicas: totalImagenesUnicas,
    },
    productos,
  };
}

export function optimizedProductToInput(
  item: OptimizedCatalogProduct
): ValidatedProductInput {
  return {
    id: item.sku,
    slug: item.slug,
    title: item.titulo,
    description: item.descripcion,
    availability: item.disponibilidad,
    condition: item.condicion,
    price: item.precio_uyu !== null ? `${item.precio_uyu.toFixed(2)} UYU` : '',
    price_uyu: item.precio_uyu,
    link: '',
    image_link: item.portada,
    brand: item.marca,
    team: item.equipo,
    season: item.temporada ?? '',
    player_number: item.dorsal ?? '',
    category: item.categoria,
    sport: item.deporte,
    kit_version: item.version,
    delivery_mode: item.modalidad,
    active: item.activo,
    source_ref: item.fuentes.join(' ; '),
    google_product_category: 'Apparel & Accessories > Clothing > Activewear',
    fb_product_category: 'Sports & Outdoors > Team Sports > Soccer',
    quantity_to_sell_on_facebook: item.talle ? '1' : '',
    sale_price: '',
    sale_price_effective_date: '',
    item_group_id: item.grupo_variante,
    gender: 'unisex',
    color: '',
    size: item.talle,
    age_group: 'adult',
    material: 'Poliéster deportivo',
    pattern: '',
    shipping: '',
    shipping_weight: '250 g',
    offer_disclaimer: '',
    offer_disclaimer_url: '',
    video_url: '',
    video_tag: '',
    gtin: '',
    product_tags: item.etiquetas,
    style: item.estilo,
    images: item.imagenes,
  };
}
