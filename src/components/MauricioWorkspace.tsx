'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Check,
  CheckCircle2,
  XCircle,
  Save,
  Trash2,
  Copy,
  ExternalLink,
  Upload,
  ClipboardPaste,
  AlertCircle,
  AlertTriangle,
  Star,
  Minus,
  X,
  ArrowLeftRight,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ConditionValue,
  CURRENCIES,
  GenderValue,
  SportProduct,
  buildPriceString,
  createEmptyProduct,
  generateSku,
  getProductPath,
  parsePriceParts,
  validateProductSoft,
  validateWebpImageUrl,
} from '@/lib/catalog-schema';
import { ProductImage } from './ProductImage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const QUICK_BRANDS = ['Umbro', 'Adidas', 'Nike', 'Puma', 'Kappa', 'Reebok', 'New Balance'] as const;
const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Único'] as const;
const QUICK_STYLES = ['Retro', 'Titular', 'Alternativa', 'Entrenamiento', 'Urbano'] as const;

interface PendingUploadFile {
  id: string;
  file: File;
  previewUrl: string;
}

type StockFilter = 'all' | 'in stock' | 'out of stock';

export function MauricioWorkspace() {
  const [products, setProducts] = useState<SportProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [mobileListOpen, setMobileListOpen] = useState(false);

  // Estado del editor en una sola ventana
  const [mode, setMode] = useState<'edit' | 'create'>('create');
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<SportProduct>(() =>
    createEmptyProduct()
  );
  const [form, setForm] = useState<SportProduct>(() => createEmptyProduct());

  // Estados auxiliares de precio para edición rápida
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('UYU');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleCurrency, setSaleCurrency] = useState('UYU');

  // Imágenes y acciones
  const [pendingFiles, setPendingFiles] = useState<PendingUploadFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageBusyId, setImageBusyId] = useState<string | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [clipboardNote, setClipboardNote] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<{
    url: string;
    status: 'loaded' | 'error';
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Limpia object URLs pendientes al desmontar
  const pendingFilesRef = useRef<PendingUploadFile[]>([]);
  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }, []);

  const hydrateEditor = useCallback(
    (product: SportProduct, nextMode: 'edit' | 'create') => {
      clearPendingFiles();
      const parsedPrice = parsePriceParts(product.price);
      const parsedSale = parsePriceParts(product.sale_price);
      setMode(nextMode);
      setSelectedUid(nextMode === 'edit' ? product.uid : null);
      setInitialSnapshot(product);
      setForm(product);
      setPriceAmount(parsedPrice.amount);
      setPriceCurrency(parsedPrice.currency);
      setSaleAmount(parsedSale.amount);
      setSaleCurrency(parsedSale.currency);
      setClipboardNote(null);
      setPreviewStatus(null);
    },
    [clearPendingFiles]
  );

  // Carga inicial desde PostgreSQL
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!active) return;
        const data = (await res.json()) as { products?: SportProduct[]; error?: string };
        if (!res.ok || !Array.isArray(data.products)) {
          setLoadError(data.error || 'No se pudo cargar el catálogo.');
          setLoading(false);
          return;
        }
        setProducts(data.products);
        if (data.products.length > 0) {
          hydrateEditor(data.products[0], 'edit');
        } else {
          hydrateEditor(createEmptyProduct(), 'create');
        }
      } catch {
        if (active) setLoadError('Error de conexión con el servidor.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [hydrateEditor]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (stockFilter !== 'all' && p.availability !== stockFilter) return false;
      if (!q) return true;
      const hay = [
        p.title,
        p.brand,
        p.team,
        p.size,
        p.color,
        p.id,
        p.season,
        p.player_number,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, searchQuery, stockFilter]);

  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.availability === 'in stock').length;
    const outOfStock = products.filter((p) => p.availability === 'out of stock').length;
    return { total: products.length, inStock, outOfStock };
  }, [products]);

  const issues = useMemo(
    () =>
      validateProductSoft(form, products, {
        initialImageLink: mode === 'edit' ? initialSnapshot.image_link : '',
        initialImages: mode === 'edit' ? initialSnapshot.images : [],
      }),
    [form, products, mode, initialSnapshot.image_link, initialSnapshot.images]
  );

  const blockingErrors = issues.filter((i) => i.severity === 'error');
  const imageValidation = useMemo(
    () => validateWebpImageUrl(form.image_link),
    [form.image_link]
  );

  const isUntouchedLegacyImage =
    mode === 'edit' &&
    !imageValidation.valid &&
    imageValidation.isSafeUrl &&
    form.image_link.trim() !== '' &&
    form.image_link.trim() === initialSnapshot.image_link.trim();

  const hasImageBlockingError = !imageValidation.valid && !isUntouchedLegacyImage;
  const currentPreviewStatus =
    previewStatus?.url === form.image_link.trim() ? previewStatus.status : null;

  const isDirty = useMemo(() => {
    if (pendingFiles.length > 0) return true;
    const keys: (keyof SportProduct)[] = [
      'title',
      'brand',
      'team',
      'season',
      'player_number',
      'description',
      'price',
      'sale_price',
      'availability',
      'quantity_to_sell_on_facebook',
      'condition',
      'size',
      'color',
      'style',
      'gender',
      'material',
      'image_link',
      'id',
    ];
    return keys.some((k) => (form[k] ?? '') !== (initialSnapshot[k] ?? ''));
  }, [form, initialSnapshot, pendingFiles.length]);

  const updateField = <K extends keyof SportProduct>(key: K, value: SportProduct[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceAmountChange = (nextAmount: string, nextCurrency: string) => {
    setPriceAmount(nextAmount);
    setPriceCurrency(nextCurrency);
    updateField('price', buildPriceString(nextAmount, nextCurrency));
  };

  const handleSaleAmountChange = (nextAmount: string, nextCurrency: string) => {
    setSaleAmount(nextAmount);
    setSaleCurrency(nextCurrency);
    updateField('sale_price', buildPriceString(nextAmount, nextCurrency));
  };

  const adjustQuantity = (delta: number) => {
    const currentNum = parseInt(form.quantity_to_sell_on_facebook || '0', 10);
    const safeCurrent = Number.isNaN(currentNum) ? 0 : currentNum;
    const nextNum = Math.max(0, safeCurrent + delta);
    setForm((prev) => ({
      ...prev,
      quantity_to_sell_on_facebook: String(nextNum),
      availability:
        nextNum > 0
          ? 'in stock'
          : delta < 0 && nextNum === 0
            ? 'out of stock'
            : prev.availability,
    }));
  };

  const handleStartNewProduct = () => {
    hydrateEditor(createEmptyProduct(), 'create');
    setMobileListOpen(false);
  };

  const handleSelectProduct = (product: SportProduct) => {
    hydrateEditor(product, 'edit');
    setMobileListOpen(false);
  };

  const handlePasteImageUrl = async () => {
    setClipboardNote(null);
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      setClipboardNote('Pegá la URL con Ctrl+V o Cmd+V directamente en el campo.');
      return;
    }
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setClipboardNote('El portapapeles está vacío.');
        return;
      }
      updateField('image_link', text);
    } catch {
      setClipboardNote('El navegador bloqueó el acceso al portapapeles. Usá Ctrl+V o Cmd+V.');
    }
  };

  const uploadFilesToProduct = async (uid: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await fetch(`/api/products/${encodeURIComponent(uid)}/images`, {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as {
      product?: SportProduct;
      uploadedCount?: number;
      error?: string;
    };
    if (!res.ok || !data.product) {
      throw new Error(data.error || 'No se pudieron subir las fotos.');
    }
    return { product: data.product, uploadedCount: data.uploadedCount ?? files.length };
  };

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.size > 0);
    if (files.length === 0) return;

    if (mode === 'create') {
      const staged: PendingUploadFile[] = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setPendingFiles((prev) => [...prev, ...staged]);
      showToast(
        `${files.length} ${files.length === 1 ? 'foto lista' : 'fotos listas'}: se guardarán al crear el producto.`
      );
      return;
    }

    if (!selectedUid) return;
    setUploadingImages(true);
    try {
      const { product: updated, uploadedCount } = await uploadFilesToProduct(
        selectedUid,
        files
      );
      setProducts((prev) =>
        prev.map((p) => (p.uid === updated.uid ? updated : p))
      );
      setForm((prev) => ({
        ...prev,
        image_link: updated.image_link,
        images: updated.images,
        gallery: updated.gallery,
        updatedAt: updated.updatedAt,
      }));
      setInitialSnapshot((prev) => ({
        ...prev,
        image_link: updated.image_link,
        images: updated.images,
        gallery: updated.gallery,
        updatedAt: updated.updatedAt,
      }));
      showToast(
        `${uploadedCount} ${uploadedCount === 1 ? 'foto guardada' : 'fotos guardadas'} en la base de datos.`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al subir las imágenes.',
        'error'
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSetGalleryCover = async (imageId: string) => {
    if (!selectedUid) return;
    setImageBusyId(imageId);
    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(selectedUid)}/images/${encodeURIComponent(imageId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_cover' }),
        }
      );
      const data = (await res.json()) as { product?: SportProduct; error?: string };
      if (!res.ok || !data.product) {
        showToast(data.error || 'No se pudo cambiar la portada.', 'error');
        return;
      }
      const updated = data.product;
      setProducts((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
      setForm((prev) => ({
        ...prev,
        image_link: updated.image_link,
        images: updated.images,
        gallery: updated.gallery,
      }));
      setInitialSnapshot((prev) => ({
        ...prev,
        image_link: updated.image_link,
        images: updated.images,
        gallery: updated.gallery,
      }));
      showToast('Imagen principal actualizada.');
    } catch {
      showToast('Error de conexión al actualizar la portada.', 'error');
    } finally {
      setImageBusyId(null);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!selectedUid) return;
    setImageBusyId(imageId);
    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(selectedUid)}/images/${encodeURIComponent(imageId)}`,
        { method: 'DELETE' }
      );
      const data = (await res.json()) as { product?: SportProduct; error?: string };
      if (!res.ok || !data.product) {
        showToast(data.error || 'No se pudo eliminar la foto.', 'error');
        return;
      }
      const updated = data.product;
      setProducts((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
      setForm((prev) => ({
        ...prev,
        image_link: updated.image_link,
        images: updated.images,
        gallery: updated.gallery,
      }));
      setInitialSnapshot((prev) => ({
        ...prev,
        image_link: updated.image_link,
        images: updated.images,
        gallery: updated.gallery,
      }));
      showToast('Foto eliminada.');
    } catch {
      showToast('Error de conexión al eliminar la foto.', 'error');
    } finally {
      setImageBusyId(null);
    }
  };

  const handleRemovePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockingErrors.length > 0 || saving) return;

    setSaving(true);
    try {
      const payload: SportProduct = {
        ...form,
        id: form.id.trim() || generateSku(form.brand),
        image_link: form.image_link.trim(),
      };

      if (mode === 'create') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { product?: SportProduct; error?: string };
        if (!res.ok || !data.product) {
          showToast(data.error || 'No se pudo crear el producto.', 'error');
          return;
        }

        let finalProduct = data.product;
        const filesToUpload = pendingFiles.map((p) => p.file);

        if (filesToUpload.length > 0) {
          try {
            const uploaded = await uploadFilesToProduct(finalProduct.uid, filesToUpload);
            finalProduct = uploaded.product;
          } catch (uploadErr) {
            showToast(
              uploadErr instanceof Error
                ? `Producto creado, pero falló la subida de fotos: ${uploadErr.message}`
                : 'Producto creado, pero falló la subida de fotos.',
              'error'
            );
          }
        }

        setProducts((prev) => [finalProduct, ...prev]);
        hydrateEditor(finalProduct, 'edit');
        showToast('Producto creado y guardado correctamente.');
      } else if (selectedUid) {
        const res = await fetch(`/api/products/${encodeURIComponent(selectedUid)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { product?: SportProduct; error?: string };
        if (!res.ok || !data.product) {
          showToast(data.error || 'No se pudieron guardar los cambios.', 'error');
          return;
        }
        const updated = data.product;
        setProducts((prev) =>
          prev.map((p) => (p.uid === updated.uid ? updated : p))
        );
        hydrateEditor(updated, 'edit');
        showToast('Cambios guardados en la base de datos.');
      }
    } catch {
      showToast('Error de conexión al guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (mode !== 'edit' || saving) return;
    setSaving(true);
    try {
      const copy: SportProduct = {
        ...form,
        uid: '',
        id: generateSku(form.brand),
        slug: '',
        title: form.title ? `${form.title} (Copia)` : '',
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      });
      const data = (await res.json()) as { product?: SportProduct; error?: string };
      if (!res.ok || !data.product) {
        showToast(data.error || 'No se pudo duplicar el producto.', 'error');
        return;
      }
      setProducts((prev) => [data.product!, ...prev]);
      hydrateEditor(data.product, 'edit');
      showToast('Producto duplicado. Ya podés editar la copia.');
    } catch {
      showToast('Error de conexión al duplicar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUid) return;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(selectedUid)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        showToast('No se pudo eliminar el producto.', 'error');
        return;
      }
      const remaining = products.filter((p) => p.uid !== selectedUid);
      setProducts(remaining);
      setDeleteOpen(false);
      if (remaining.length > 0) {
        hydrateEditor(remaining[0], 'edit');
      } else {
        hydrateEditor(createEmptyProduct(), 'create');
      }
      showToast('Producto eliminado del catálogo.');
    } catch {
      showToast('Error de conexión al eliminar.', 'error');
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm bg-paper-2 border border-rule rounded-xl text-ink placeholder:text-ink-2 focus:outline-none focus:border-focus focus:ring-2 focus:ring-focus/15 transition-colors active:translate-y-px';
  const labelClass = 'block text-xs font-medium text-ink mb-1.5';

  const activeGallery = form.gallery ?? [];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      {/* Barra superior (3 zonas limpias) */}
      <header className="sticky top-0 z-30 h-16 bg-paper-2 border-b border-rule px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-ink whitespace-nowrap shrink-0 hover:text-accent transition-colors active:translate-y-px"
          >
            FichaSport
          </Link>
          <span className="text-ink-2" aria-hidden="true">
            /
          </span>
          <span className="text-sm font-medium text-accent truncate">
            Espacio Mauricio
          </span>
        </div>

        <nav
          aria-label="Cambiar perfil"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-ink-2"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-ink transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <ArrowLeftRight size={13} />
            Cambiar perfil
          </Link>
          <Link
            href="/admin"
            className="hover:text-ink transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            Ir a panel Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="md:hidden px-2.5 py-2 text-xs font-medium text-ink-2 hover:text-ink border border-rule rounded-lg whitespace-nowrap shrink-0"
          >
            Perfiles
          </Link>
          <button
            type="button"
            onClick={handleStartNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
          >
            <Plus size={15} />
            Nuevo producto
          </button>
        </div>
      </header>

      {/* Selector móvil colapsable */}
      <div className="lg:hidden bg-paper-2 border-b border-rule px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileListOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <p className="text-[11px] text-ink-2">
              {mode === 'create'
                ? 'Creando artículo nuevo'
                : `Catálogo (${stats.total} productos)`}
            </p>
            <p className="text-sm font-semibold text-ink truncate">
              {mode === 'create'
                ? form.title || 'Nuevo producto sin título'
                : form.title || form.id || 'Seleccionar producto'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent shrink-0">
            {mobileListOpen ? 'Ocultar lista' : 'Elegir otro'}
            {mobileListOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>

        {mobileListOpen && (
          <div className="mt-3 pt-3 border-t border-rule space-y-2.5">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto, marca o talle..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-paper border border-rule rounded-lg focus:outline-none focus:bg-paper-2 focus:border-focus"
              />
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-rule border border-rule rounded-xl bg-paper-2">
              {filteredProducts.map((p) => {
                const selected = mode === 'edit' && selectedUid === p.uid;
                return (
                  <button
                    key={p.uid}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors active:translate-y-px ${
                      selected ? 'bg-accent/15/70' : 'hover:bg-paper-3'
                    }`}
                  >
                    <ProductImage
                      src={p.image_link}
                      alt={p.title || p.id}
                      size="sm"
                      className="w-10 h-10 rounded-lg shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink truncate">
                        {p.title || p.id}
                      </p>
                      <p className="text-[11px] text-ink-2 font-mono tabular-nums truncate">
                        {p.price || 'Consultar'} ·{' '}
                        {p.availability === 'in stock' ? 'En stock' : 'Sin stock'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cuerpo principal: Lista izquierda + Editor completo en una sola ventana */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex items-start">
        {/* Lista lateral de productos (escritorio) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 shrink-0 bg-paper-2 border-r border-rule sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-rule space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-2">
              <span className="font-medium text-ink">Productos</span>
              <span>
                <span className="font-mono tabular-nums">{stats.inStock}</span> en stock ·{' '}
                <span className="font-mono tabular-nums">{stats.total}</span> total
              </span>
            </div>

            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, marca o talle..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-paper border border-rule rounded-lg text-ink placeholder:text-ink-2 focus:outline-none focus:bg-paper-2 focus:border-focus"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-paper-3 rounded-lg">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'in stock', label: 'En stock' },
                  { id: 'out of stock', label: 'Sin stock' },
                ] as { id: StockFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStockFilter(tab.id)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors active:translate-y-px whitespace-nowrap ${
                    stockFilter === tab.id
                      ? 'bg-paper-2 text-ink shadow-xs'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-rule">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 motion-safe:animate-pulse motion-reduce:animate-none">
                    <div className="w-12 h-12 rounded-lg bg-paper-3 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-paper-3 rounded w-3/4" />
                      <div className="h-3 bg-paper-3 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-danger">{loadError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs text-ink-2">
                  No se encontraron productos con ese filtro.
                </p>
                <button
                  type="button"
                  onClick={handleStartNewProduct}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/15 border border-rule-2 rounded-lg hover:bg-emerald-100"
                >
                  <Plus size={14} />
                  Crear nuevo producto
                </button>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const selected = mode === 'edit' && selectedUid === p.uid;
                const isInStock = p.availability === 'in stock';
                return (
                  <button
                    key={p.uid}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus ${
                      selected
                        ? 'bg-accent/15/75'
                        : 'hover:bg-paper-3'
                    }`}
                  >
                    <ProductImage
                      src={p.image_link}
                      alt={p.title || p.id}
                      brand={p.brand}
                      size="sm"
                      className="w-12 h-12 rounded-lg shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm truncate ${
                          selected
                            ? 'font-semibold text-emerald-950'
                            : 'font-medium text-ink'
                        }`}
                      >
                        {p.title || 'Producto sin título'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-ink-2 mt-0.5 truncate">
                        <span className="font-mono tabular-nums text-ink">
                          {p.price || 'Consultar'}
                        </span>
                        {p.size && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Talle {p.size}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1 text-[11px]">
                        <span className="text-ink-2 truncate">
                          {p.brand || 'Sin marca'}
                        </span>
                        <span
                          className={`font-medium shrink-0 ${
                            isInStock ? 'text-accent' : 'text-danger'
                          }`}
                        >
                          {isInStock
                            ? p.quantity_to_sell_on_facebook
                              ? `En stock (${p.quantity_to_sell_on_facebook})`
                              : 'En stock'
                            : 'Sin stock'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Ventana única de edición y carga rápida */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-28">
          <form
            onSubmit={handleSave}
            className="max-w-4xl mx-auto bg-paper-2 border border-rule rounded-2xl overflow-hidden"
          >
            {/* Cabecera del editor */}
            <div className="px-6 py-5 border-b border-rule flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-ink-2">
                  <span>
                    {mode === 'create' ? 'Nuevo artículo' : 'Editando producto'}
                  </span>
                  {mode === 'edit' && form.id && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-ink">{form.id}</span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink truncate mt-0.5">
                  {mode === 'create'
                    ? form.title.trim() || 'Cargar nuevo producto'
                    : form.title.trim() || 'Producto sin título'}
                </h1>
              </div>

              {mode === 'edit' && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`${getProductPath(form)}?from=mauricio`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap"
                  >
                    <ExternalLink size={14} />
                    Ver ficha
                  </Link>
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap"
                  >
                    <Copy size={14} />
                    Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    disabled={saving}
                    aria-label="Eliminar producto"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-danger bg-paper-2 border border-danger/30 rounded-lg hover:bg-danger/15 transition-colors active:translate-y-px whitespace-nowrap"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Alertas bloqueantes globales si existen */}
            {blockingErrors.length > 0 && (
              <div className="px-6 pt-4 space-y-2">
                {blockingErrors.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-danger/15 border border-danger/30 text-xs text-danger"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{err.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* SECCIÓN 1: Información principal */}
            <section className="p-6 space-y-5 border-b border-rule/80">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-base font-semibold text-ink">
                  1. Producto
                </h2>
                <span className="text-xs text-ink-2">
                  Todos los campos son opcionales
                </span>
              </div>

              <div>
                <label htmlFor="m-title" className={labelClass}>
                  Nombre del producto
                </label>
                <input
                  id="m-title"
                  type="text"
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ej. Camiseta Uruguay Retro 1995 Titular - Umbro"
                  className={`${inputClass} text-base font-medium`}
                />
              </div>

              <div>
                <label htmlFor="m-brand" className={labelClass}>
                  Marca
                </label>
                <input
                  id="m-brand"
                  type="text"
                  maxLength={100}
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="Ej. Umbro, Adidas, Nike..."
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_BRANDS.map((brand) => {
                    const active =
                      form.brand.trim().toLowerCase() === brand.toLowerCase();
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => updateField('brand', active ? '' : brand)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors active:translate-y-px whitespace-nowrap ${
                          active
                            ? 'bg-accent text-accent-ink border-emerald-700'
                            : 'bg-paper-2 text-ink border-rule hover:border-rule-2'
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-team" className={labelClass}>
                    Equipo o selección
                  </label>
                  <input
                    id="m-team"
                    type="text"
                    maxLength={120}
                    value={form.team ?? ''}
                    onChange={(e) => updateField('team', e.target.value)}
                    placeholder="Ej. Peñarol, Nacional, Uruguay, Argentina"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="m-season" className={labelClass}>
                    Temporada / Año
                  </label>
                  <input
                    id="m-season"
                    type="text"
                    maxLength={40}
                    value={form.season ?? ''}
                    onChange={(e) => updateField('season', e.target.value)}
                    placeholder="Ej. 2026, 1994-1995"
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="m-desc" className={labelClass}>
                  Descripción
                </label>
                <textarea
                  id="m-desc"
                  rows={3}
                  maxLength={9999}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Detalles del modelo, sponsor, tela, etiquetas o comentarios para compradores..."
                  className={`${inputClass} resize-y leading-relaxed`}
                />
              </div>
            </section>

            {/* SECCIÓN 2: Precio, Stock y Disponibilidad */}
            <section className="p-6 space-y-5 border-b border-rule/80 bg-paper-2">
              <h2 className="font-display text-base font-semibold text-ink">
                2. Precio, stock y disponibilidad
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-price" className={labelClass}>
                    Precio
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="m-price"
                      type="text"
                      inputMode="decimal"
                      value={priceAmount}
                      onChange={(e) =>
                        handlePriceAmountChange(e.target.value, priceCurrency)
                      }
                      placeholder="Ej. 2490"
                      className={`${inputClass} font-mono text-base tabular-nums`}
                    />
                    <select
                      aria-label="Moneda"
                      value={priceCurrency}
                      onChange={(e) =>
                        handlePriceAmountChange(priceAmount, e.target.value)
                      }
                      className="px-3 py-2 text-xs font-mono font-medium bg-paper-2 border border-rule rounded-xl text-ink focus:outline-none focus:border-focus"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-ink-2 mt-1">
                    {form.price ? (
                      <>
                        Se guarda como{' '}
                        <span className="font-mono text-ink">{form.price}</span>
                      </>
                    ) : (
                      'Dejalo vacío si el precio es a consultar por mensaje.'
                    )}
                  </p>
                </div>

                <div>
                  <label htmlFor="m-sale-price" className={labelClass}>
                    Precio oferta <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="m-sale-price"
                      type="text"
                      inputMode="decimal"
                      value={saleAmount}
                      onChange={(e) =>
                        handleSaleAmountChange(e.target.value, saleCurrency)
                      }
                      placeholder="Ej. 1990"
                      className={`${inputClass} font-mono text-base tabular-nums`}
                    />
                    <select
                      aria-label="Moneda de oferta"
                      value={saleCurrency}
                      onChange={(e) =>
                        handleSaleAmountChange(saleAmount, e.target.value)
                      }
                      className="px-3 py-2 text-xs font-mono font-medium bg-paper-2 border border-rule rounded-xl text-ink focus:outline-none focus:border-focus"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Disponibilidad con 2 botones claros */}
                <div>
                  <span className={labelClass}>Disponibilidad</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('availability', 'in stock')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl border transition-colors active:translate-y-px whitespace-nowrap ${
                        form.availability === 'in stock'
                          ? 'bg-accent text-accent-ink border-emerald-700'
                          : 'bg-paper-2 text-ink border-rule hover:border-rule-2'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      En stock
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('availability', 'out of stock')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl border transition-colors active:translate-y-px whitespace-nowrap ${
                        form.availability === 'out of stock'
                          ? 'bg-danger text-ink border-red-600'
                          : 'bg-paper-2 text-ink border-rule hover:border-danger/40'
                      }`}
                    >
                      <XCircle size={15} />
                      Sin stock
                    </button>
                  </div>
                </div>

                {/* Cantidad en stock con botones - / + */}
                <div>
                  <label htmlFor="m-stock-qty" className={labelClass}>
                    Cantidad en stock
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(-1)}
                      aria-label="Restar 1 al stock"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-paper-2 border border-rule text-ink hover:bg-paper-3 transition-colors active:translate-y-px shrink-0"
                    >
                      <Minus size={15} />
                    </button>
                    <input
                      id="m-stock-qty"
                      type="number"
                      min={0}
                      step={1}
                      value={form.quantity_to_sell_on_facebook}
                      onChange={(e) =>
                        updateField('quantity_to_sell_on_facebook', e.target.value)
                      }
                      placeholder="0"
                      className={`${inputClass} text-center font-mono tabular-nums`}
                    />
                    <button
                      type="button"
                      onClick={() => adjustQuantity(1)}
                      aria-label="Sumar 1 al stock"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-paper-2 border border-rule text-ink hover:bg-paper-3 transition-colors active:translate-y-px shrink-0"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* Condición */}
                <div>
                  <span className={labelClass}>Condición</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: 'new', label: 'Nuevo' },
                        { value: 'used', label: 'Usado' },
                      ] as { value: ConditionValue; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField('condition', opt.value)}
                        className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-colors active:translate-y-px whitespace-nowrap ${
                          form.condition === opt.value
                            ? 'bg-accent text-accent-ink border-accent'
                            : 'bg-paper-2 text-ink border-rule hover:border-rule-2'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECCIÓN 3: Características del producto */}
            <section className="p-6 space-y-5 border-b border-rule/80">
              <h2 className="font-display text-base font-semibold text-ink">
                3. Características del producto
              </h2>

              {/* Talle con botones grandes de un clic */}
              <div>
                <label htmlFor="m-size" className={labelClass}>
                  Talle / Medida
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_SIZES.map((sz) => {
                    const active =
                      form.size.trim().toUpperCase() === sz.toUpperCase();
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateField('size', active ? '' : sz)}
                        className={`min-w-[44px] px-3 py-2 text-xs font-mono font-medium rounded-lg border transition-colors active:translate-y-px whitespace-nowrap ${
                          active
                            ? 'bg-accent text-accent-ink border-emerald-700'
                            : 'bg-paper-2 text-ink border-rule hover:border-rule-2'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                <input
                  id="m-size"
                  type="text"
                  maxLength={200}
                  value={form.size}
                  onChange={(e) => updateField('size', e.target.value)}
                  placeholder="O escribí otro talle (ej. S, M, L o calzado 42)"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-color" className={labelClass}>
                    Color
                  </label>
                  <input
                    id="m-color"
                    type="text"
                    maxLength={200}
                    value={form.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    placeholder="Ej. celeste y blanco, negro y amarillo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="m-player" className={labelClass}>
                    Jugador / Dorsal <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="m-player"
                    type="text"
                    maxLength={100}
                    value={form.player_number ?? ''}
                    onChange={(e) => updateField('player_number', e.target.value)}
                    placeholder="Ej. Cantona #7, Messi #10"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Estilo con accesos rápidos */}
              <div>
                <label htmlFor="m-style" className={labelClass}>
                  Estilo
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_STYLES.map((st) => {
                    const active =
                      form.style.trim().toLowerCase() === st.toLowerCase();
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField('style', active ? '' : st)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors active:translate-y-px whitespace-nowrap ${
                          active
                            ? 'bg-accent text-accent-ink border-emerald-700'
                            : 'bg-paper-2 text-ink border-rule hover:border-rule-2'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
                <input
                  id="m-style"
                  type="text"
                  maxLength={120}
                  value={form.style}
                  onChange={(e) => updateField('style', e.target.value)}
                  placeholder="Ej. Retro, Titular, Entrenamiento..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className={labelClass}>Género</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { value: 'unisex', label: 'Unisex' },
                        { value: 'male', label: 'Hombre' },
                        { value: 'female', label: 'Mujer' },
                      ] as { value: GenderValue; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField('gender', opt.value)}
                        className={`py-2.5 px-2 text-xs font-medium rounded-xl border transition-colors active:translate-y-px whitespace-nowrap ${
                          form.gender === opt.value
                            ? 'bg-accent text-accent-ink border-accent'
                            : 'bg-paper-2 text-ink border-rule hover:border-rule-2'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="m-material" className={labelClass}>
                    Material / Tela
                  </label>
                  <input
                    id="m-material"
                    type="text"
                    maxLength={200}
                    value={form.material}
                    onChange={(e) => updateField('material', e.target.value)}
                    placeholder="Ej. Poliéster 100%, Algodón, Dry-FIT"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* SECCIÓN 4: Imágenes fáciles (subir fotos + pegar URL WebP) */}
            <section className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
                  <ImageIcon size={17} className="text-accent" />
                  4. Imágenes del producto
                </h2>
                <span className="text-xs text-ink-2 font-mono tabular-nums">
                  {activeGallery.length + pendingFiles.length}{' '}
                  {activeGallery.length + pendingFiles.length === 1
                    ? 'imagen'
                    : 'imágenes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Portada actual */}
                <div className="md:col-span-4">
                  <ProductImage
                    src={
                      imageValidation.isSafeUrl && form.image_link.trim()
                        ? form.image_link
                        : pendingFiles[0]?.previewUrl || ''
                    }
                    alt={form.title || 'Vista previa del producto'}
                    brand={form.brand}
                    size="lg"
                    className="w-full aspect-square rounded-xl"
                    onStatusChange={(status) =>
                      setPreviewStatus({ url: form.image_link.trim(), status })
                    }
                  />
                </div>

                {/* Subir archivos + Pegar URL WebP */}
                <div className="md:col-span-8 space-y-4">
                  {/* Zona drag & drop de fotos */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(true);
                    }}
                    onDragLeave={() => setIsDraggingFiles(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(false);
                      if (e.dataTransfer.files.length > 0) {
                        void handleFilesSelected(e.dataTransfer.files);
                      }
                    }}
                    className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors active:translate-y-px ${
                      isDraggingFiles
                        ? 'border-accent bg-accent/15/60'
                        : 'border-rule bg-paper-3 hover:border-rule-2'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/webp,image/jpeg,image/png,image/gif,image/avif"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          void handleFilesSelected(e.target.files);
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={20} className="text-accent" />
                      <p className="text-sm font-medium text-ink">
                        Arrastrá fotos aquí o seleccionalas desde tu equipo
                      </p>
                      <p className="text-xs text-ink-2">
                        WebP, JPG, PNG o AVIF (hasta 5 MB por foto). Se guardan directo en la base de datos.
                      </p>
                      <button
                        type="button"
                        disabled={uploadingImages}
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent bg-paper-2 border border-rule-2 rounded-lg hover:bg-accent/15 transition-colors active:translate-y-px disabled:opacity-50 whitespace-nowrap"
                      >
                        {uploadingImages ? (
                          <>
                            <Loader2 size={14} className="motion-safe:animate-spin motion-reduce:animate-none" />
                            Subiendo fotos…
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            Elegir fotos
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pegar URL directa .webp */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label htmlFor="m-image-url" className="text-xs font-medium text-ink">
                        O pegá una URL de imagen directa (WebP)
                      </label>
                      <span className="text-[11px] font-medium text-ink-2">.webp</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="m-image-url"
                        type="text"
                        inputMode="url"
                        value={form.image_link}
                        onChange={(e) => {
                          setClipboardNote(null);
                          updateField('image_link', e.target.value);
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text');
                          if (pasted) {
                            e.preventDefault();
                            setClipboardNote(null);
                            updateField('image_link', pasted.trim());
                          }
                        }}
                        placeholder="https://cdn.ejemplo.com/camiseta.webp"
                        aria-invalid={hasImageBlockingError}
                        className={`${inputClass} font-mono text-xs ${
                          hasImageBlockingError
                            ? 'border-red-400 focus:border-red-600 focus:ring-red-600/15'
                            : !imageValidation.isEmpty && imageValidation.valid
                              ? 'border-rule-2'
                              : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handlePasteImageUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-xl hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                      >
                        <ClipboardPaste size={14} />
                        Pegar
                      </button>
                      {form.image_link.trim() && (
                        <button
                          type="button"
                          onClick={() => updateField('image_link', '')}
                          aria-label="Limpiar URL de imagen"
                          className="p-2.5 text-ink-2 hover:text-ink bg-paper-2 border border-rule rounded-xl hover:bg-paper-3 transition-colors active:translate-y-px shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {hasImageBlockingError ? (
                      <p className="flex items-start gap-1.5 text-xs text-danger mt-1.5">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{imageValidation.error}</span>
                      </p>
                    ) : isUntouchedLegacyImage ? (
                      <p className="flex items-start gap-1.5 text-xs text-accent mt-1.5">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>
                          Imagen existente en formato anterior. Podés subir una foto nueva o pegar una URL .webp.
                        </span>
                      </p>
                    ) : !imageValidation.isEmpty && imageValidation.valid ? (
                      <p className="flex items-center gap-1.5 text-xs text-accent mt-1.5">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>
                          {imageValidation.isInternalBinary
                            ? 'Imagen guardada en PostgreSQL'
                            : currentPreviewStatus === 'error'
                              ? 'Formato WebP válido (la vista previa remota no respondió)'
                              : 'Formato WebP compatible'}
                        </span>
                      </p>
                    ) : null}

                    {clipboardNote && (
                      <p className="text-xs text-ink-2 mt-1">{clipboardNote}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Galería actual en BD + cola de subida para productos nuevos */}
              {(activeGallery.length > 0 || pendingFiles.length > 0) && (
                <div className="pt-4 border-t border-rule space-y-2.5">
                  <p className="text-xs font-medium text-ink">
                    Galería del producto
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeGallery.map((img) => {
                      const busy = imageBusyId === img.id;
                      return (
                        <div
                          key={img.id}
                          className={`rounded-xl border overflow-hidden bg-paper-2 ${
                            img.isCover ? 'border-accent' : 'border-rule'
                          }`}
                        >
                          <ProductImage
                            src={img.url}
                            alt={img.fileName || form.title || 'Imagen'}
                            size="sm"
                            className="w-full aspect-square border-0 rounded-none"
                          />
                          <div className="p-2 flex items-center justify-between gap-1 border-t border-rule">
                            {img.isCover ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                                <Check size={12} />
                                Portada
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleSetGalleryCover(img.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-2 hover:text-accent"
                              >
                                <Star size={11} />
                                Portada
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDeleteGalleryImage(img.id)}
                              aria-label="Eliminar foto"
                              className="p-1 text-ink-2 hover:text-danger transition-colors active:translate-y-px"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingFiles.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-dashed border-emerald-400 overflow-hidden bg-accent/15/30"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-2 flex items-center justify-between gap-1 border-t border-rule-2/70">
                          <span className="text-[11px] text-accent truncate">
                            Lista para subir
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(item.id)}
                            aria-label="Quitar foto pendiente"
                            className="p-1 text-ink-2 hover:text-danger"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Barra de guardado fija en el fondo de la ventana */}
            <div className="sticky bottom-0 z-20 px-6 py-4 bg-paper-2/95 backdrop-blur-xs border-t border-rule flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-ink-2">
                {blockingErrors.length > 0 ? (
                  <span className="text-danger font-medium">
                    Corregí el formato marcado antes de guardar.
                  </span>
                ) : isDirty ? (
                  <span className="text-accent font-medium">
                    Tenés cambios sin guardar
                  </span>
                ) : mode === 'edit' ? (
                  <span className="text-accent">Todo guardado</span>
                ) : (
                  <span>Completá lo que tengas y guardá</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {isDirty && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => hydrateEditor(initialSnapshot, mode)}
                    className="px-4 py-2.5 text-sm font-medium text-ink bg-paper-2 border border-rule rounded-xl hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap"
                  >
                    Descartar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving || blockingErrors.length > 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-accent-ink bg-accent rounded-xl hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:translate-y-px whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="motion-safe:animate-spin motion-reduce:animate-none" />
                      Guardando…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Confirmación de eliminación */}
      <ConfirmDeleteModal
        open={deleteOpen}
        count={1}
        productTitle={form.title || form.id || 'este producto'}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Aviso flotante de acción */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-danger/15 border-danger/30 text-red-800'
              : 'bg-accent border-neutral-800 text-ink'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-accent shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Cerrar aviso"
            className="ml-1 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
