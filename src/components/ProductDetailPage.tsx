'use client';

import React, { useState, useMemo, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Info,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Upload,
  Star,
  ImagePlus,
} from 'lucide-react';
import {
  AGE_GROUP_LABELS,
  AVAILABILITY_LABELS,
  CONDITION_LABELS,
  GENDER_LABELS,
  ProductImageItem,
  SportProduct,
  generateSku,
  getCatalogCoverage,
  getProductPath,
} from '@/lib/catalog-schema';
import { ProductImage } from './ProductImage';
import { ProductFormDrawer } from './ProductFormDrawer';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const STORAGE_KEY = 'fichasport_catalog_v2';
const EMPTY_LIST: SportProduct[] = [];
let cachedLocalRaw: string | null = null;
let cachedLocalParsed: SportProduct[] = EMPTY_LIST;

function getLocalProductsSnapshot(): SportProduct[] {
  if (typeof window === 'undefined') return EMPTY_LIST;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_LIST;
    if (raw === cachedLocalRaw) return cachedLocalParsed;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedLocalRaw = raw;
      cachedLocalParsed = parsed as SportProduct[];
      return cachedLocalParsed;
    }
  } catch {
    // ignore storage read error
  }
  return EMPTY_LIST;
}

function getServerSnapshot(): SportProduct[] {
  return EMPTY_LIST;
}

function subscribeLocal(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ProductDetailPageProps {
  identifier: string;
  initialProduct: SportProduct | null;
  relatedVariants: SportProduct[];
  allProductsForValidation: SportProduct[];
  storageMode: 'database' | 'local';
  backHref?: string;
}

export function ProductDetailPage({
  identifier,
  initialProduct,
  relatedVariants,
  allProductsForValidation,
  storageMode,
  backHref = '/admin',
}: ProductDetailPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localCatalog = useSyncExternalStore(
    subscribeLocal,
    getLocalProductsSnapshot,
    getServerSnapshot
  );

  const [dbProduct, setDbProduct] = useState<SportProduct | null>(initialProduct);
  const [variants, setVariants] = useState<SportProduct[]>(relatedVariants);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedSku, setCopiedSku] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isMutatingImage, setIsMutatingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const localResolved = useMemo(() => {
    if (storageMode === 'database') return null;
    const decoded = decodeURIComponent(identifier).trim().toLowerCase();
    return (
      localCatalog.find(
        (p) =>
          p.slug?.toLowerCase() === decoded ||
          p.uid.toLowerCase() === decoded ||
          p.id.toLowerCase() === decoded
      ) ?? null
    );
  }, [storageMode, identifier, localCatalog]);

  const product = storageMode === 'database' ? dbProduct : localResolved;

  const existingProducts =
    storageMode === 'database' ? allProductsForValidation : localCatalog;

  const galleryItems: ProductImageItem[] = useMemo(() => {
    if (!product) return [];
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery;
    }
    const list: string[] = [];
    const seen = new Set<string>();
    const add = (url?: string) => {
      const clean = url?.trim();
      if (!clean || seen.has(clean)) return;
      seen.add(clean);
      list.push(clean);
    };
    add(product.image_link);
    product.images?.forEach(add);
    return list.map((url, idx) => ({
      id: '',
      url,
      originalUrl: url,
      fileName: url.split(/[?#]/)[0]?.split('/').pop() || '',
      mimeType: '',
      sizeBytes: null,
      hasBinary: false,
      position: idx,
      isCover: idx === 0,
    }));
  }, [product]);

  const safeImageIdx =
    galleryItems.length > 0
      ? Math.min(activeImageIdx, galleryItems.length - 1)
      : 0;
  const activeItem = galleryItems[safeImageIdx] ?? null;
  const activeImageUrl = activeItem?.url || product?.image_link || '';
  const storedBinaryCount = galleryItems.filter((g) => g.hasBinary).length;

  if (!product) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col">
        <header className="h-16 bg-paper-2 border-b border-rule px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-ink"
            >
              FichaSport
            </Link>
            <span className="text-ink-2" aria-hidden="true">
              /
            </span>
            <span className="text-ink-2">Artículo no encontrado</span>
          </div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px"
          >
            <ArrowLeft size={14} />
            Volver al catálogo
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-paper-2 border border-rule rounded-xl p-8 text-center">
            <Package size={32} strokeWidth={1.5} className="mx-auto text-ink-2" />
            <h1 className="mt-3 font-display text-lg font-semibold text-ink">
              Producto no encontrado
            </h1>
            <p className="mt-1.5 text-sm text-ink-2">
              El artículo solicitado no existe o fue eliminado del catálogo.
            </p>
            <Link
              href={backHref}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px"
            >
              <ArrowLeft size={14} />
              Ir al catálogo
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const coverage = getCatalogCoverage(product);

  const deliveryLabel =
    product.delivery_mode === 'entrega_inmediata'
      ? 'Entrega inmediata'
      : product.delivery_mode === 'pendiente_verificacion'
        ? 'Pendiente de verificación'
        : product.delivery_mode || '—';

  const specs: { label: string; value: string; mono?: boolean }[] = [
    { label: 'SKU / ID', value: product.id || '—', mono: true },
    ...(product.slug ? [{ label: 'Slug', value: product.slug, mono: true }] : []),
    { label: 'Marca', value: product.brand || '—' },
    ...(product.team ? [{ label: 'Equipo / Selección', value: product.team }] : []),
    ...(product.season
      ? [{ label: 'Temporada / Año', value: product.season, mono: true }]
      : []),
    ...(product.player_number
      ? [{ label: 'Jugador / Dorsal', value: product.player_number }]
      : []),
    ...(product.category ? [{ label: 'Categoría', value: product.category }] : []),
    ...(product.kit_version ? [{ label: 'Versión', value: product.kit_version }] : []),
    ...(product.delivery_mode ? [{ label: 'Modalidad', value: deliveryLabel }] : []),
    { label: 'Disponibilidad', value: AVAILABILITY_LABELS[product.availability] },
    { label: 'Condición', value: CONDITION_LABELS[product.condition] },
    {
      label: 'Precio',
      value: product.price || 'Consultar (sin precio)',
      mono: Boolean(product.price),
    },
    {
      label: 'Precio oferta',
      value: product.sale_price || '—',
      mono: Boolean(product.sale_price),
    },
    {
      label: 'Vigencia oferta',
      value: product.sale_price_effective_date || '—',
      mono: Boolean(product.sale_price_effective_date),
    },
    {
      label: 'Cantidad stock',
      value: product.quantity_to_sell_on_facebook || '—',
      mono: Boolean(product.quantity_to_sell_on_facebook),
    },
    { label: 'Talle', value: product.size || '—' },
    { label: 'Color', value: product.color || '—' },
    { label: 'Género', value: GENDER_LABELS[product.gender] },
    { label: 'Grupo etario', value: AGE_GROUP_LABELS[product.age_group] },
    { label: 'Estilo', value: product.style || '—' },
    { label: 'Material', value: product.material || '—' },
    { label: 'Estampado / Trama', value: product.pattern || '—' },
    {
      label: 'Grupo variantes',
      value: product.item_group_id || '—',
      mono: Boolean(product.item_group_id),
    },
    { label: 'GTIN / Código', value: product.gtin || '—', mono: Boolean(product.gtin) },
    {
      label: 'Categoría Google',
      value: product.google_product_category || '—',
    },
    {
      label: 'Categoría Facebook',
      value: product.fb_product_category || '—',
    },
    { label: 'Envío', value: product.shipping || '—', mono: Boolean(product.shipping) },
    {
      label: 'Peso de envío',
      value: product.shipping_weight || '—',
      mono: Boolean(product.shipping_weight),
    },
    { label: 'Aviso legal', value: product.offer_disclaimer || '—' },
    { label: 'Video URL', value: product.video_url || '—' },
  ];

  const handleCopySku = () => {
    navigator.clipboard?.writeText(product.id);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 1600);
  };

  const handleUploadFiles = async (fileList: FileList | File[]) => {
    if (storageMode !== 'database') {
      setToast('Conectá DATABASE_URL para guardar imágenes binarias en PostgreSQL.');
      return;
    }
    const files = Array.from(fileList).filter((f) => f.size > 0);
    if (files.length === 0 || isUploadingImages) return;

    setIsUploadingImages(true);
    try {
      let totalUploaded = 0;
      const errors: string[] = [];
      let latestProduct: SportProduct | null = null;

      // Subir en tandas de 8 archivos para no superar límites de tamaño HTTP
      const batchSize = 8;
      for (let i = 0; i < files.length; i += batchSize) {
        const chunk = files.slice(i, i + batchSize);
        const formData = new FormData();
        chunk.forEach((f) => formData.append('files', f));

        const res = await fetch(
          `/api/products/${encodeURIComponent(product.uid)}/images`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = (await res.json()) as {
          uploadedCount?: number;
          errors?: string[];
          error?: string;
          product?: SportProduct;
        };

        if (!res.ok) {
          errors.push(data.error || 'Error al subir lote de imágenes.');
        } else {
          totalUploaded += data.uploadedCount ?? 0;
          if (data.errors?.length) errors.push(...data.errors);
          if (data.product) latestProduct = data.product;
        }
      }

      if (latestProduct) {
        setDbProduct(latestProduct);
        setActiveImageIdx(0);
        router.refresh();
      }

      if (totalUploaded > 0) {
        setToast(
          `${totalUploaded} ${totalUploaded === 1 ? 'imagen guardada' : 'imágenes guardadas'} en PostgreSQL.${
            errors.length > 0 ? ` (${errors.length} omitidas)` : ''
          }`
        );
      } else if (errors.length > 0) {
        setToast(errors[0]);
      }
    } catch {
      setToast('Error de conexión al subir las imágenes.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageAction = async (
    imageId: string,
    action: 'set_cover' | 'move_left' | 'move_right' | 'delete'
  ) => {
    if (storageMode !== 'database' || !imageId || isMutatingImage) return;
    setIsMutatingImage(true);
    try {
      const endpoint = `/api/products/${encodeURIComponent(
        product.uid
      )}/images/${encodeURIComponent(imageId)}`;
      const res =
        action === 'delete'
          ? await fetch(endpoint, { method: 'DELETE' })
          : await fetch(endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action }),
            });
      const data = (await res.json()) as { product?: SportProduct; error?: string };
      if (!res.ok || !data.product) {
        setToast(data.error || 'No se pudo actualizar la imagen.');
        return;
      }
      setDbProduct(data.product);
      if (action === 'set_cover') {
        setActiveImageIdx(0);
        setToast('Portada actualizada.');
      } else if (action === 'move_left') {
        setActiveImageIdx((prev) => Math.max(0, prev - 1));
      } else if (action === 'move_right') {
        setActiveImageIdx((prev) =>
          Math.min((data.product?.gallery?.length ?? 1) - 1, prev + 1)
        );
      } else if (action === 'delete') {
        setActiveImageIdx((prev) =>
          Math.max(0, Math.min(prev, (data.product?.gallery?.length ?? 1) - 1))
        );
        setToast('Imagen eliminada de la base de datos.');
      }
      router.refresh();
    } catch {
      setToast('Error de conexión al actualizar la galería.');
    } finally {
      setIsMutatingImage(false);
    }
  };

  const handleSaveEdit = async (saved: SportProduct) => {
    if (storageMode === 'database') {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(saved.uid)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved),
        });
        const data = (await res.json()) as { product?: SportProduct; error?: string };
        if (!res.ok || !data.product) {
          setToast(data.error || 'No se pudieron guardar los cambios.');
          return;
        }
        setDbProduct(data.product);
        setEditOpen(false);
        setToast('Cambios guardados en la base de datos.');
        const nextPath = getProductPath(data.product);
        if (nextPath !== `/productos/${encodeURIComponent(identifier)}`) {
          router.replace(nextPath);
        } else {
          router.refresh();
        }
      } catch {
        setToast('Error de conexión al guardar los cambios.');
      }
      return;
    }

    const updatedList = localCatalog.map((item) =>
      item.uid === saved.uid ? saved : item
    );
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
    setEditOpen(false);
    setToast('Cambios guardados localmente.');
  };

  const handleDuplicate = async () => {
    const now = new Date().toISOString();
    const copy: SportProduct = {
      ...product,
      uid: crypto.randomUUID
        ? crypto.randomUUID()
        : `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      id: generateSku(product.brand),
      slug: '',
      title: product.title ? `${product.title} (Copia)` : '',
      product_tags: [...product.product_tags],
      images: product.images ? [...product.images] : [],
      createdAt: now,
      updatedAt: now,
    };

    if (storageMode === 'database') {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(copy),
        });
        const data = (await res.json()) as { product?: SportProduct; error?: string };
        if (!res.ok || !data.product) {
          setToast(data.error || 'No se pudo duplicar el producto.');
          return;
        }
        router.push(getProductPath(data.product));
      } catch {
        setToast('Error de conexión al duplicar.');
      }
      return;
    }

    const nextList = [copy, ...localCatalog];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
    router.push(getProductPath(copy));
  };

  const handleConfirmDelete = async () => {
    if (storageMode === 'database') {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(product.uid)}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          setToast('No se pudo eliminar el producto.');
          return;
        }
        setVariants((prev) => prev.filter((v) => v.uid !== product.uid));
        router.push(backHref);
        router.refresh();
      } catch {
        setToast('Error de conexión al eliminar el producto.');
      }
      return;
    }

    const nextList = localCatalog.filter((p) => p.uid !== product.uid);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
    router.push(backHref);
  };

  const renderAvailability = () => {
    if (product.availability === 'in stock') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent whitespace-nowrap">
          <CheckCircle2 size={14} className="shrink-0" />
          En stock
        </span>
      );
    }
    if (product.availability === 'out of stock') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger whitespace-nowrap">
          <XCircle size={14} className="shrink-0" />
          Sin stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-2 whitespace-nowrap">
        <MinusCircle size={14} className="shrink-0" />
        Sin definir
      </span>
    );
  };

  const siblingVariants = variants.filter((v) => v.uid !== product.uid);

  const metaLine = [
    product.brand || 'Marca sin definir',
    CONDITION_LABELS[product.condition],
    product.style || null,
    product.category || null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      {/* Barra superior fija */}
      <header className="sticky top-0 z-20 h-16 bg-paper-2 border-b border-rule px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-1 text-xs font-medium text-ink-2 hover:text-ink hover:bg-paper-3 rounded-lg transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">
              {backHref === '/mauricio' ? 'Espacio Mauricio' : 'Catálogo'}
            </span>
          </Link>
          <span className="text-ink-2 hidden sm:inline" aria-hidden="true">
            /
          </span>
          <nav
            aria-label="Ruta del producto"
            className="flex items-center gap-2 text-sm min-w-0"
          >
            <span className="font-medium text-ink truncate">
              {product.title || product.id}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDuplicate}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <Copy size={14} />
            Duplicar
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-danger bg-paper-2 border border-danger/30 rounded-lg hover:bg-danger/15 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            aria-label="Eliminar producto"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormKey((k) => k + 1);
              setEditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <Pencil size={14} />
            Editar ficha
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna izquierda: Galería e imágenes en PostgreSQL */}
          <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div
              onDragOver={(e) => {
                if (storageMode !== 'database') return;
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                if (storageMode !== 'database') return;
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.length) {
                  void handleUploadFiles(e.dataTransfer.files);
                }
              }}
              className={`bg-paper-2 border rounded-xl overflow-hidden transition-colors active:translate-y-px ${
                isDragOver ? 'border-emerald-700 ring-2 ring-emerald-700/20' : 'border-rule'
              }`}
            >
              <div className="relative aspect-square w-full bg-[#F1F3F5]">
                <ProductImage
                  src={activeImageUrl}
                  alt={product.title || product.id}
                  brand={product.brand}
                  size="lg"
                  className="w-full h-full border-0"
                />
                {galleryItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === 0 ? galleryItems.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-paper-2/90 border border-rule text-ink hover:bg-paper-2 shadow-xs transition-colors active:translate-y-px"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === galleryItems.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-paper-2/90 border border-rule text-ink hover:bg-paper-2 shadow-xs transition-colors active:translate-y-px"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              <div className="px-4 py-3 border-t border-rule bg-paper-3 space-y-2.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-[11px] text-ink-2 truncate">
                    {activeItem?.fileName || activeImageUrl || 'Sin imagen cargada'}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-ink-2 shrink-0">
                    {activeItem?.hasBinary && activeItem.sizeBytes
                      ? `${formatBytes(activeItem.sizeBytes)} · `
                      : ''}
                    {galleryItems.length > 0
                      ? `${safeImageIdx + 1} / ${galleryItems.length}`
                      : '0'}
                  </span>
                </div>

                {/* Controles de la imagen activa */}
                {storageMode === 'database' && activeItem?.id && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rule/80">
                    <div className="flex items-center gap-1.5">
                      {!activeItem.isCover ? (
                        <button
                          type="button"
                          disabled={isMutatingImage}
                          onClick={() => void handleImageAction(activeItem.id, 'set_cover')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-ink bg-paper-2 border border-rule rounded-md hover:bg-paper-3 disabled:opacity-50 transition-colors active:translate-y-px"
                        >
                          <Star size={12} />
                          Usar de portada
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                          <Star size={12} className="fill-emerald-700" />
                          Portada actual
                        </span>
                      )}

                      {galleryItems.length > 1 && (
                        <>
                          <button
                            type="button"
                            disabled={isMutatingImage || safeImageIdx === 0}
                            onClick={() =>
                              void handleImageAction(activeItem.id, 'move_left')
                            }
                            className="p-1 text-ink-2 hover:text-ink bg-paper-2 border border-rule rounded-md disabled:opacity-35 transition-colors active:translate-y-px"
                            title="Mover hacia la izquierda"
                            aria-label="Mover imagen a la izquierda"
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={
                              isMutatingImage ||
                              safeImageIdx === galleryItems.length - 1
                            }
                            onClick={() =>
                              void handleImageAction(activeItem.id, 'move_right')
                            }
                            className="p-1 text-ink-2 hover:text-ink bg-paper-2 border border-rule rounded-md disabled:opacity-35 transition-colors active:translate-y-px"
                            title="Mover hacia la derecha"
                            aria-label="Mover imagen a la derecha"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isMutatingImage}
                      onClick={() => void handleImageAction(activeItem.id, 'delete')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-danger hover:bg-danger/15 rounded-md disabled:opacity-50 transition-colors active:translate-y-px"
                    >
                      <Trash2 size={12} />
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Subida directa de imágenes a PostgreSQL */}
            {storageMode === 'database' && (
              <div className="bg-paper-2 border border-rule rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold text-ink">
                      Galería en base de datos
                    </h2>
                    <p className="text-[11px] text-ink-2 mt-0.5 tabular-nums">
                      {storedBinaryCount} de {galleryItems.length} fotos guardadas como archivo
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isUploadingImages}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep disabled:opacity-50 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                  >
                    <ImagePlus size={14} />
                    {isUploadingImages ? 'Subiendo...' : 'Subir fotos'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/webp,image/jpeg,image/png,image/gif,image/avif"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        void handleUploadFiles(e.target.files);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </div>

                {galleryItems.length > 0 ? (
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {galleryItems.map((item, idx) => {
                      const isActive = idx === safeImageIdx;
                      return (
                        <button
                          key={item.id || `${item.url}-${idx}`}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative aspect-square rounded-lg overflow-hidden border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                            isActive
                              ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                              : 'border-rule hover:border-rule-2'
                          }`}
                          title={
                            item.hasBinary
                              ? `${item.fileName} (guardada en BD · ${formatBytes(item.sizeBytes)})`
                              : `${item.fileName} (pendiente de subir archivo)`
                          }
                          aria-label={`Ver imagen ${idx + 1}`}
                        >
                          <ProductImage
                            src={item.url}
                            alt={`${product.title || product.id} - ${idx + 1}`}
                            brand={product.brand}
                            size="sm"
                            className="w-full h-full border-0"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/65 text-[9px] font-mono tabular-nums text-ink leading-none">
                            {idx + 1}
                          </span>
                          {item.hasBinary && (
                            <span
                              className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"
                              aria-label="Guardada en base de datos"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 border border-dashed border-rule-2 rounded-lg text-xs text-ink-2 hover:border-emerald-700 hover:text-accent flex flex-col items-center justify-center gap-1.5 transition-colors active:translate-y-px"
                  >
                    <Upload size={16} />
                    <span>Arrastrá imágenes aquí o hacé clic para subir (WebP, JPG, PNG)</span>
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Columna derecha: Información completa y ficha técnica */}
          <section className="lg:col-span-7 space-y-6">
            {/* Encabezado del producto */}
            <div className="bg-paper-2 border border-rule rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-ink-2">{metaLine}</p>
                {renderAvailability()}
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">
                  {product.title || 'Producto sin título'}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-2">
                  <span className="font-mono text-ink">{product.id}</span>
                  <button
                    type="button"
                    onClick={handleCopySku}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px"
                    title="Copiar SKU"
                  >
                    {copiedSku ? (
                      <Check size={12} className="text-accent" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedSku ? 'Copiado' : 'Copiar SKU'}</span>
                  </button>
                  {product.slug && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-ink-2">
                        /{product.slug}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Bloque de precio y métricas clave */}
              <div className="pt-4 border-t border-rule/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[11px] text-ink-2">Precio</p>
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    {product.sale_price ? (
                      <>
                        <span className="font-mono text-base font-semibold text-accent tabular-nums">
                          {product.sale_price}
                        </span>
                        {product.price && (
                          <span className="font-mono text-xs text-ink-2 line-through tabular-nums">
                            {product.price}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-mono text-base font-medium text-ink tabular-nums">
                        {product.price || 'Consultar'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-ink-2">Talle</p>
                  <p className="mt-1 font-mono text-sm font-medium text-ink">
                    {product.size || 'Sin definir'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-ink-2">Versión</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {product.kit_version || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-ink-2">Modalidad</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {deliveryLabel}
                  </p>
                </div>
              </div>

              {/^https?:\/\//i.test(product.link.trim()) && (
                <div className="pt-3 border-t border-rule">
                  <a
                    href={product.link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent hover:underline"
                  >
                    Abrir publicación externa
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Descripción y etiquetas */}
            {(product.description || product.product_tags.length > 0) && (
              <div className="bg-paper-2 border border-rule rounded-xl p-6 space-y-5">
                {product.description && (
                  <div>
                    <h2 className="text-xs font-semibold text-ink mb-2">
                      Descripción
                    </h2>
                    <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.product_tags.length > 0 && (
                  <div
                    className={
                      product.description ? 'pt-4 border-t border-rule' : ''
                    }
                  >
                    <h2 className="text-xs font-semibold text-ink mb-1.5">
                      Etiquetas de catálogo
                    </h2>
                    <p className="text-sm text-ink-2">
                      {product.product_tags.join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Variantes relacionadas del mismo grupo */}
            {siblingVariants.length > 0 && (
              <div className="bg-paper-2 border border-rule rounded-xl overflow-hidden">
                <div className="px-6 py-3.5 bg-paper-3 border-b border-rule flex items-center justify-between gap-3">
                  <h2 className="text-xs font-semibold text-ink">
                    Otras variantes del grupo{' '}
                    <span className="font-mono text-ink-2">
                      {product.item_group_id}
                    </span>
                  </h2>
                  <span className="font-mono text-[11px] tabular-nums text-ink-2">
                    {siblingVariants.length}
                  </span>
                </div>
                <div className="divide-y divide-rule">
                  {siblingVariants.map((variant) => (
                    <Link
                      key={variant.uid}
                      href={getProductPath(variant)}
                      className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-paper-3 transition-colors active:translate-y-px"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ProductImage
                          src={variant.image_link}
                          alt={variant.title || variant.id}
                          brand={variant.brand}
                          size="sm"
                          className="w-10 h-10 rounded-md shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {variant.title || variant.id}
                          </p>
                          <p className="text-xs text-ink-2 truncate">
                            <span className="font-mono text-[11px]">{variant.id}</span>
                            {variant.size ? ` · Talle ${variant.size}` : ''}
                            {variant.player_number ? ` · ${variant.player_number}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-ink shrink-0">
                        {variant.sale_price || variant.price || 'Consultar'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cobertura informativa Meta Commerce */}
            <div className="p-4 rounded-xl bg-paper-2 border border-rule flex items-start gap-3">
              <Info size={16} className="text-ink-2 shrink-0 mt-0.5" />
              <div className="text-xs text-ink-2 leading-relaxed">
                <span className="font-medium text-ink tabular-nums">
                  {coverage.filledCount} de {coverage.totalFields}
                </span>{' '}
                atributos del esquema Meta completados.
                {coverage.missingMetaStandard.length > 0 ? (
                  <span className="block mt-0.5 text-ink-2">
                    Opcionales aquí (requeridos solo si subís directo a Meta Ads):{' '}
                    {coverage.missingMetaStandard.join(', ')}.
                  </span>
                ) : (
                  <span className="block mt-0.5 text-accent">
                    Listo con todos los campos estándar de Meta Commerce.
                  </span>
                )}
              </div>
            </div>

            {/* Ficha técnica tabular completa */}
            <div className="bg-paper-2 border border-rule rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 bg-paper-3 border-b border-rule">
                <h2 className="text-xs font-semibold text-ink">
                  Ficha técnica completa
                </h2>
              </div>
              <dl className="divide-y divide-rule px-6">
                {specs.map((item) => (
                  <div
                    key={item.label}
                    className="py-3 grid grid-cols-12 gap-4 text-xs"
                  >
                    <dt className="col-span-5 sm:col-span-4 text-ink-2">
                      {item.label}
                    </dt>
                    <dd
                      className={`col-span-7 sm:col-span-8 text-ink break-words ${
                        item.mono ? 'font-mono tabular-nums' : ''
                      }`}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      </main>

      {/* Drawer de edición directa desde la página del producto */}
      <ProductFormDrawer
        key={formKey}
        open={editOpen}
        mode="edit"
        initialProduct={{
          ...product,
          product_tags: [...product.product_tags],
          images: product.images ? [...product.images] : [],
        }}
        existingProducts={existingProducts}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Modal confirmación de baja */}
      <ConfirmDeleteModal
        open={deleteOpen}
        count={1}
        productTitle={product.title || product.id}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-paper-2 text-ink text-xs rounded-xl shadow-lg border border-neutral-800 max-w-md"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
