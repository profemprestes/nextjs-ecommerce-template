'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  LayoutList,
  LayoutGrid,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Upload,
  Download,
  Package,
  Tags,
  Layers,
  FileSpreadsheet,
  Menu,
  X,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
  ArrowUpDown,
  ArrowLeftRight,
} from 'lucide-react';
import {
  AVAILABILITY_LABELS,
  AvailabilityValue,
  CONDITION_LABELS,
  ConditionValue,
  GENDER_LABELS,
  INITIAL_PRODUCTS,
  SportProduct,
  createEmptyProduct,
  generateSku,
  getProductPath,
} from '@/lib/catalog-schema';
import { exportMetaCatalogCsv } from '@/lib/csv-utils';
import { ProductImage } from './ProductImage';
import { ProductFormDrawer } from './ProductFormDrawer';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CsvWorkspace } from './CsvWorkspace';

const STORAGE_KEY = 'fichasport_catalog_v2';
const CATALOG_EVENT = 'fichasport_catalog_change';
const EMPTY_CATALOG: SportProduct[] = [];

let cachedRaw: string | null = null;
let cachedParsed: SportProduct[] = EMPTY_CATALOG;

function getCatalogSnapshot(): SportProduct[] {
  if (typeof window === 'undefined') return EMPTY_CATALOG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return EMPTY_CATALOG;
    if (raw === cachedRaw) return cachedParsed;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedRaw = raw;
      cachedParsed = parsed as SportProduct[];
      return cachedParsed;
    }
  } catch {
    // fallback to empty catalog
  }
  return EMPTY_CATALOG;
}

function getCatalogServerSnapshot(): SportProduct[] {
  return EMPTY_CATALOG;
}

function subscribeCatalog(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) callback();
  };
  const onLocalChange = () => callback();
  window.addEventListener('storage', onStorage);
  window.addEventListener(CATALOG_EVENT, onLocalChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CATALOG_EVENT, onLocalChange);
  };
}

function persistCatalog(next: SportProduct[]) {
  try {
    const serialized = JSON.stringify(next);
    cachedRaw = serialized;
    cachedParsed = next;
    window.localStorage.setItem(STORAGE_KEY, serialized);
    window.dispatchEvent(new Event(CATALOG_EVENT));
  } catch {
    // ignore storage quota errors
  }
}

type WorkspaceView = 'catalogo' | 'marcas' | 'variantes' | 'csv';
type DisplayMode = 'table' | 'grid';
type SortOption = 'updated_desc' | 'title_asc' | 'brand_asc' | 'sku_asc';

interface ToastState {
  message: string;
  undoSnapshot?: SportProduct[];
}

export function CatalogApp() {
  const localProducts = useSyncExternalStore(
    subscribeCatalog,
    getCatalogSnapshot,
    getCatalogServerSnapshot
  );

  const [dbProducts, setDbProducts] = useState<SportProduct[] | null>(null);
  const [useDatabase, setUseDatabase] = useState(false);

  const products = useDatabase && dbProducts !== null ? dbProducts : localProducts;

  const setLocalProducts = useCallback(
    (updater: SportProduct[] | ((prev: SportProduct[]) => SportProduct[])) => {
      const current = getCatalogSnapshot();
      const next = typeof updater === 'function' ? updater(current) : updater;
      persistCatalog(next);
    },
    []
  );

  const refreshFromDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { products?: SportProduct[] };
        if (Array.isArray(data.products)) {
          setDbProducts(data.products);
          setUseDatabase(true);
        }
      }
    } catch {
      // Mantiene respaldo local si el endpoint no está disponible
    }
  }, []);

  // Sincroniza con Prisma (/api/products) cuando DATABASE_URL está configurada
  useEffect(() => {
    let active = true;
    async function loadFromDatabase() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { products?: SportProduct[] };
          if (Array.isArray(data.products)) {
            setDbProducts(data.products);
            setUseDatabase(true);
          }
        }
      } catch {
        // Mantiene respaldo local si el endpoint no está disponible
      }
    }
    loadFromDatabase();
    return () => {
      active = false;
    };
  }, []);

  // Navegación y filtros
  const [activeView, setActiveView] = useState<WorkspaceView>('catalogo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | AvailabilityValue>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | ConditionValue>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');

  // Selección masiva
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());

  // Drawers y modales CRUD
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    product: SportProduct;
    formKey: number;
  }>({
    open: false,
    mode: 'create',
    product: createEmptyProduct(),
    formKey: 0,
  });
  const [deleteTarget, setDeleteTarget] = useState<{
    uids: string[];
    title?: string;
  } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Autocierre de notificaciones
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, undoSnapshot?: SportProduct[]) => {
    setToast({ message, undoSnapshot });
  };

  // Estadísticas reales derivadas del catálogo
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.availability === 'in stock').length;
    const withoutPrice = products.filter((p) => !p.price.trim()).length;
    const onSale = products.filter((p) => Boolean(p.sale_price.trim())).length;
    const uniqueBrands = new Set(
      products.map((p) => p.brand.trim()).filter(Boolean)
    ).size;
    return { total, inStock, withoutPrice, onSale, uniqueBrands };
  }, [products]);

  const brandSummaries = useMemo(() => {
    const map = new Map<
      string,
      { brand: string; total: number; inStock: number; onSale: number; noPrice: number }
    >();
    for (const p of products) {
      const key = p.brand.trim() || 'Sin marca';
      const current = map.get(key) || {
        brand: key,
        total: 0,
        inStock: 0,
        onSale: 0,
        noPrice: 0,
      };
      current.total += 1;
      if (p.availability === 'in stock') current.inStock += 1;
      if (p.sale_price.trim()) current.onSale += 1;
      if (!p.price.trim()) current.noPrice += 1;
      map.set(key, current);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [products]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand.trim()) set.add(p.brand.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const variantGroups = useMemo(() => {
    const grouped = new Map<string, SportProduct[]>();
    const ungrouped: SportProduct[] = [];
    for (const p of products) {
      const gid = p.item_group_id.trim();
      if (gid) {
        const list = grouped.get(gid) || [];
        list.push(p);
        grouped.set(gid, list);
      } else {
        ungrouped.push(p);
      }
    }
    return {
      groups: Array.from(grouped.entries()).sort((a, b) => b[1].length - a[1].length),
      ungrouped,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (brandFilter !== 'all') {
        const pBrand = p.brand.trim() || 'Sin marca';
        if (pBrand !== brandFilter) return false;
      }
      if (availabilityFilter !== 'all' && p.availability !== availabilityFilter) {
        return false;
      }
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        p.id,
        p.slug || '',
        p.title,
        p.brand,
        p.team || '',
        p.season || '',
        p.player_number || '',
        p.category || '',
        p.kit_version || '',
        p.description,
        p.color,
        p.size,
        p.style,
        p.item_group_id,
        p.material,
        p.product_tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return (a.title || a.id).localeCompare(b.title || b.id);
        case 'brand_asc':
          return (a.brand || 'zzz').localeCompare(b.brand || 'zzz');
        case 'sku_asc':
          return a.id.localeCompare(b.id);
        case 'updated_desc':
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });
  }, [
    products,
    searchQuery,
    brandFilter,
    availabilityFilter,
    conditionFilter,
    sortBy,
  ]);

  // Acciones CRUD
  const openCreateForm = (prefill?: Partial<SportProduct>) => {
    const base = createEmptyProduct();
    setFormState((prev) => ({
      open: true,
      mode: 'create',
      product: { ...base, ...prefill },
      formKey: prev.formKey + 1,
    }));
  };

  const openEditForm = (product: SportProduct) => {
    setFormState((prev) => ({
      open: true,
      mode: 'edit',
      product: {
        ...product,
        product_tags: [...product.product_tags],
        images: product.images ? [...product.images] : [],
      },
      formKey: prev.formKey + 1,
    }));
  };

  const handleSaveProduct = async (saved: SportProduct) => {
    if (useDatabase) {
      try {
        const endpoint =
          formState.mode === 'create'
            ? '/api/products'
            : `/api/products/${encodeURIComponent(saved.uid)}`;
        const method = formState.mode === 'create' ? 'POST' : 'PATCH';
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved),
        });
        const data = (await res.json()) as { product?: SportProduct; error?: string };
        if (!res.ok || !data.product) {
          showToast(data.error || 'No se pudo guardar el producto.');
          return;
        }
        const persisted = data.product;
        if (formState.mode === 'create') {
          setDbProducts((prev) => [persisted, ...(prev ?? [])]);
          showToast(`Producto "${persisted.title || persisted.id}" agregado al catálogo.`);
        } else {
          setDbProducts((prev) =>
            (prev ?? []).map((item) => (item.uid === persisted.uid ? persisted : item))
          );
          showToast(`Cambios guardados en "${persisted.title || persisted.id}".`);
        }
        setFormState((prev) => ({ ...prev, open: false }));
      } catch {
        showToast('Error de conexión al guardar en la base de datos.');
      }
      return;
    }

    if (formState.mode === 'create') {
      setLocalProducts((prev) => [saved, ...prev]);
      showToast(`Producto "${saved.title || saved.id}" agregado al catálogo.`);
    } else {
      setLocalProducts((prev) =>
        prev.map((item) => (item.uid === saved.uid ? saved : item))
      );
      showToast(`Cambios guardados en "${saved.title || saved.id}".`);
    }
    setFormState((prev) => ({ ...prev, open: false }));
  };

  const handleDuplicateProduct = async (source: SportProduct) => {
    const now = new Date().toISOString();
    const copy: SportProduct = {
      ...source,
      uid: crypto.randomUUID
        ? crypto.randomUUID()
        : `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      id: generateSku(source.brand),
      slug: '',
      title: source.title ? `${source.title} (Copia)` : '',
      product_tags: [...source.product_tags],
      images: source.images ? [...source.images] : [],
      createdAt: now,
      updatedAt: now,
    };

    if (useDatabase) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(copy),
        });
        const data = (await res.json()) as { product?: SportProduct; error?: string };
        if (!res.ok || !data.product) {
          showToast(data.error || 'No se pudo duplicar el producto.');
          return;
        }
        setDbProducts((prev) => [data.product!, ...(prev ?? [])]);
        showToast(`Producto duplicado con SKU ${data.product.id}.`);
      } catch {
        showToast('Error de conexión al duplicar el producto.');
      }
      return;
    }

    setLocalProducts((prev) => [copy, ...prev]);
    showToast(`Producto duplicado con SKU ${copy.id}.`);
  };

  const handleCreateVariantFrom = (source: SportProduct) => {
    const groupId = source.item_group_id.trim() || `GRP-${source.id.slice(0, 12)}`;
    openCreateForm({
      brand: source.brand,
      title: source.title,
      description: source.description,
      price: source.price,
      sale_price: source.sale_price,
      sale_price_effective_date: source.sale_price_effective_date,
      image_link: source.image_link,
      link: source.link,
      google_product_category: source.google_product_category,
      fb_product_category: source.fb_product_category,
      gender: source.gender,
      age_group: source.age_group,
      material: source.material,
      pattern: source.pattern,
      style: source.style,
      color: source.color,
      size: '',
      item_group_id: groupId,
      product_tags: [...source.product_tags],
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const snapshot = products;
    const uidsToDelete = deleteTarget.uids;
    const uidSet = new Set(uidsToDelete);

    if (useDatabase) {
      try {
        if (uidsToDelete.length === 1) {
          const res = await fetch(
            `/api/products/${encodeURIComponent(uidsToDelete[0])}`,
            { method: 'DELETE' }
          );
          if (!res.ok) {
            showToast('No se pudo eliminar el producto en la base de datos.');
            return;
          }
        } else {
          const res = await fetch('/api/products/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', uids: uidsToDelete }),
          });
          if (!res.ok) {
            showToast('No se pudieron eliminar los productos seleccionados.');
            return;
          }
        }
        setDbProducts((prev) => (prev ?? []).filter((p) => !uidSet.has(p.uid)));
      } catch {
        showToast('Error de conexión al eliminar en la base de datos.');
        return;
      }
    } else {
      setLocalProducts((prev) => prev.filter((p) => !uidSet.has(p.uid)));
    }

    setSelectedUids((prev) => {
      const next = new Set(prev);
      uidsToDelete.forEach((u) => next.delete(u));
      return next;
    });
    const count = uidsToDelete.length;
    setDeleteTarget(null);
    showToast(
      count > 1
        ? `${count} productos eliminados del catálogo.`
        : `Producto eliminado del catálogo.`,
      snapshot
    );
  };

  const handleBulkAvailability = async (nextAvailability: AvailabilityValue) => {
    if (selectedUids.size === 0) return;
    const uids = Array.from(selectedUids);
    const now = new Date().toISOString();

    if (useDatabase) {
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'availability',
            uids,
            availability: nextAvailability,
          }),
        });
        if (!res.ok) {
          showToast('No se pudo actualizar la disponibilidad.');
          return;
        }
        setDbProducts((prev) =>
          (prev ?? []).map((p) =>
            selectedUids.has(p.uid)
              ? { ...p, availability: nextAvailability, updatedAt: now }
              : p
          )
        );
      } catch {
        showToast('Error de conexión al actualizar la disponibilidad.');
        return;
      }
    } else {
      setLocalProducts((prev) =>
        prev.map((p) =>
          selectedUids.has(p.uid)
            ? { ...p, availability: nextAvailability, updatedAt: now }
            : p
        )
      );
    }

    showToast(
      `${uids.length} productos marcados como "${AVAILABILITY_LABELS[nextAvailability]}".`
    );
    setSelectedUids(new Set());
  };

  const handleExportSelectedCsv = () => {
    const subset = products.filter((p) => selectedUids.has(p.uid));
    if (subset.length === 0) return;
    const csv = exportMetaCatalogCsv(subset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seleccion-catalogo-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`CSV exportado con ${subset.length} productos seleccionados.`);
  };

  const handleImportProducts = async (
    incoming: SportProduct[],
    strategy: 'merge' | 'skip'
  ) => {
    if (useDatabase) {
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'import',
            strategy,
            products: incoming,
          }),
        });
        const data = (await res.json()) as {
          added?: number;
          updated?: number;
          skipped?: number;
          products?: SportProduct[];
          error?: string;
        };
        if (!res.ok) {
          showToast(data.error || 'No se pudo completar la importación CSV.');
          return { added: 0, updated: 0, skipped: incoming.length };
        }
        if (Array.isArray(data.products)) {
          setDbProducts(data.products);
        }
        return {
          added: data.added ?? 0,
          updated: data.updated ?? 0,
          skipped: data.skipped ?? 0,
        };
      } catch {
        showToast('Error de conexión durante la importación CSV.');
        return { added: 0, updated: 0, skipped: incoming.length };
      }
    }

    let added = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    setLocalProducts((prev) => {
      const bySku = new Map<string, number>();
      const next = [...prev];
      next.forEach((p, idx) => bySku.set(p.id.trim().toLowerCase(), idx));

      for (const item of incoming) {
        const key = item.id.trim().toLowerCase();
        const existingIdx = bySku.get(key);
        if (existingIdx !== undefined) {
          if (strategy === 'merge') {
            next[existingIdx] = {
              ...item,
              uid: next[existingIdx].uid,
              createdAt: next[existingIdx].createdAt,
              updatedAt: now,
            };
            updated++;
          } else {
            skipped++;
          }
        } else {
          next.unshift({ ...item, createdAt: now, updatedAt: now });
          bySku.set(key, 0);
          added++;
        }
      }
      return next;
    });

    return { added, updated, skipped };
  };

  const handleResetSampleCatalog = async () => {
    const snapshot = products;
    if (useDatabase) {
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' }),
        });
        const data = (await res.json()) as { products?: SportProduct[] };
        if (res.ok && Array.isArray(data.products)) {
          setDbProducts(data.products);
          setSelectedUids(new Set());
          showToast('Se cargaron los 6 productos deportivos de ejemplo.', snapshot);
          return;
        }
        showToast('No se pudieron cargar los productos de ejemplo.');
      } catch {
        showToast('Error de conexión al cargar los ejemplos.');
      }
      return;
    }

    setLocalProducts(INITIAL_PRODUCTS);
    setSelectedUids(new Set());
    showToast('Se restauraron los 6 productos deportivos de ejemplo.', snapshot);
  };

  const handleClearCatalog = async () => {
    const snapshot = products;
    if (useDatabase) {
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear' }),
        });
        if (!res.ok) {
          showToast('No se pudo vaciar la base de datos.');
          return;
        }
        setDbProducts([]);
        setSelectedUids(new Set());
        showToast('Se eliminaron todos los registros de la base de datos.', snapshot);
      } catch {
        showToast('Error de conexión al vaciar la base de datos.');
      }
      return;
    }

    setLocalProducts([]);
    setSelectedUids(new Set());
    showToast('Se eliminaron todos los registros del catálogo.', snapshot);
  };

  const handleImportOptimizedJson = async () => {
    const snapshot = products;
    if (useDatabase) {
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import_optimized_json' }),
        });
        const data = (await res.json()) as {
          products?: SportProduct[];
          importedProducts?: number;
          importedImages?: number;
          error?: string;
        };
        if (res.ok && Array.isArray(data.products)) {
          setDbProducts(data.products);
          setSelectedUids(new Set());
          showToast(
            `Catálogo JSON optimizado sincronizado (${data.importedProducts ?? data.products.length} productos y ${data.importedImages ?? 0} imágenes).`,
            snapshot
          );
          return;
        }
        showToast(data.error || 'No se pudo importar el catálogo JSON optimizado.');
      } catch {
        showToast('Error de conexión al importar el catálogo JSON optimizado.');
      }
      return;
    }
    showToast('La importación del JSON optimizado requiere la base de datos conectada.');
  };

  const handleUndoSnapshot = async (snapshot: SportProduct[]) => {
    setToast(null);
    if (useDatabase) {
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore', products: snapshot }),
        });
        const data = (await res.json()) as { products?: SportProduct[] };
        if (res.ok && Array.isArray(data.products)) {
          setDbProducts(data.products);
        }
      } catch {
        showToast('No se pudo deshacer la operación.');
      }
      return;
    }
    setLocalProducts(snapshot);
  };

  const toggleSelectOne = (uid: string) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedUids.has(p.uid));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedUids((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p.uid));
        return next;
      });
    } else {
      setSelectedUids((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.add(p.uid));
        return next;
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setBrandFilter('all');
    setAvailabilityFilter('all');
    setConditionFilter('all');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    brandFilter !== 'all' ||
    availabilityFilter !== 'all' ||
    conditionFilter !== 'all';

  const navItems: { id: WorkspaceView; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'catalogo',
      label: 'Catálogo',
      icon: <Package size={16} />,
      count: stats.total,
    },
    {
      id: 'marcas',
      label: 'Marcas',
      icon: <Tags size={16} />,
      count: stats.uniqueBrands,
    },
    {
      id: 'variantes',
      label: 'Variantes',
      icon: <Layers size={16} />,
      count: variantGroups.groups.length,
    },
    {
      id: 'csv',
      label: 'Importar / Exportar',
      icon: <FileSpreadsheet size={16} />,
    },
  ];

  const breadcrumbSection: Record<WorkspaceView, string> = {
    catalogo: 'Productos deportivos',
    marcas: 'Directorio de marcas',
    variantes: 'Grupos de variantes',
    csv: 'Importación y exportación CSV',
  };

  const renderAvailabilityStatus = (availability: AvailabilityValue) => {
    if (availability === 'in stock') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent whitespace-nowrap">
          <CheckCircle2 size={13} className="shrink-0" />
          En stock
        </span>
      );
    }
    if (availability === 'out of stock') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger whitespace-nowrap">
          <XCircle size={13} className="shrink-0" />
          Sin stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-2 whitespace-nowrap">
        <MinusCircle size={13} className="shrink-0" />
        Sin definir
      </span>
    );
  };

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      {/* Sidebar escritorio */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-paper-2 border-r border-rule sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-rule">
          <button
            type="button"
            onClick={() => setActiveView('catalogo')}
            className="font-display text-lg font-bold tracking-tight text-ink whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          >
            FichaSport
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegación principal">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  active
                    ? 'bg-accent/15/80 text-accent font-medium'
                    : 'text-ink-2 hover:bg-paper-3/80 hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={active ? 'text-accent' : 'text-ink-2'}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className="font-mono text-xs tabular-nums text-ink-2">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-rule space-y-2 text-xs">
          <div className="flex items-center justify-between text-ink-2">
            <span>En stock</span>
            <span className="font-mono tabular-nums text-ink font-medium">
              {stats.inStock} / {stats.total}
            </span>
          </div>
          <div className="flex items-center justify-between text-ink-2">
            <span>Sin precio (DM)</span>
            <span className="font-mono tabular-nums text-ink font-medium">
              {stats.withoutPrice}
            </span>
          </div>
          <p className="pt-2 text-[11px] text-ink-2 leading-relaxed border-t border-rule">
            Esquema Meta Commerce adaptado sin obligatoriedad estricta.
          </p>
          <div className="pt-2 border-t border-rule flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2 hover:text-ink transition-colors active:translate-y-px"
            >
              <ArrowLeftRight size={13} />
              Cambiar perfil
            </Link>
            <Link
              href="/mauricio"
              className="text-xs font-medium text-accent hover:text-accent transition-colors active:translate-y-px"
            >
              Modo Mauricio
            </Link>
          </div>
        </div>
      </aside>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/35"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-paper-2 h-full border-r border-rule flex flex-col">
            <div className="h-14 flex items-center justify-between px-5 border-b border-rule">
              <span className="font-display text-base font-bold text-ink">
                FichaSport
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md text-ink-2 hover:bg-paper-3"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors active:translate-y-px ${
                      active
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-ink-2 hover:bg-paper-3'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon}
                      {item.label}
                    </span>
                    {item.count !== undefined && (
                      <span className="font-mono text-xs tabular-nums text-ink-2">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="px-4 py-3 border-t border-rule flex items-center justify-between text-xs">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 font-medium text-ink-2 hover:text-ink"
              >
                <ArrowLeftRight size={13} />
                Cambiar perfil
              </Link>
              <Link
                href="/mauricio"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-accent hover:text-accent"
              >
                Modo Mauricio
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract (Breadcrumb a la izquierda, 1-2 acciones a la derecha) */}
        <header className="sticky top-0 z-20 h-16 bg-paper-2 border-b border-rule px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-ink-2 hover:bg-paper-3"
              aria-label="Abrir navegación"
            >
              <Menu size={18} />
            </button>
            <nav
              aria-label="Ruta actual"
              className="flex items-center gap-2 text-sm min-w-0"
            >
              <span className="text-ink-2 hidden sm:inline whitespace-nowrap">
                FichaSport
              </span>
              <span className="text-ink-2 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-ink truncate">
                {breadcrumbSection[activeView]}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeView !== 'csv' && (
              <button
                type="button"
                onClick={() => setActiveView('csv')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Upload size={14} />
                Importar CSV
              </button>
            )}
            <button
              type="button"
              onClick={() => openCreateForm()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            >
              <Plus size={15} />
              Nuevo producto
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Vista 1: Catálogo CRUD */}
          {activeView === 'catalogo' && (
            <>
              {/* Franja KPI plana con divisores de 1px */}
              <section
                aria-label="Resumen del catálogo"
                className="bg-paper-2 border border-rule rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-rule"
              >
                <div className="px-5 py-4">
                  <p className="text-xs text-ink-2">Total artículos</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums">
                    {stats.total}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-ink-2">En stock</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-accent tabular-nums">
                    {stats.inStock}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-ink-2">Sin precio (Consultar DM)</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums">
                    {stats.withoutPrice}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-ink-2">Con oferta activa</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums">
                    {stats.onSale}
                  </p>
                </div>
              </section>

              {/* Barra de búsqueda, filtros y cambio de vista */}
              <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por SKU, título, marca, color, talle o etiqueta..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-paper-2 border border-rule rounded-lg text-ink placeholder:text-ink-2 focus:outline-none focus:border-focus focus:ring-2 focus:ring-focus/15"
                    />
                  </div>

                  {/* Filtro segmentado de disponibilidad */}
                  <div
                    className="inline-flex items-center p-1 bg-paper-3/60 rounded-lg overflow-x-auto max-w-full"
                    role="group"
                    aria-label="Filtrar por disponibilidad"
                  >
                    {(
                      [
                        ['all', 'Todos'],
                        ['in stock', 'En stock'],
                        ['out of stock', 'Sin stock'],
                        ['', 'Sin definir'],
                      ] as const
                    ).map(([val, label]) => {
                      const active = availabilityFilter === val;
                      return (
                        <button
                          key={val || 'empty'}
                          type="button"
                          onClick={() => setAvailabilityFilter(val)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-paper-2 text-ink shadow-xs'
                              : 'text-ink-2 hover:text-ink'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Filtrar por marca"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium bg-paper-2 border border-rule rounded-lg text-ink focus:outline-none focus:border-focus"
                  >
                    <option value="all">Todas las marcas</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Sin marca">Sin marca</option>
                  </select>

                  <select
                    aria-label="Filtrar por condición"
                    value={conditionFilter}
                    onChange={(e) =>
                      setConditionFilter(e.target.value as 'all' | ConditionValue)
                    }
                    className="px-3 py-2 text-xs font-medium bg-paper-2 border border-rule rounded-lg text-ink focus:outline-none focus:border-focus"
                  >
                    <option value="all">Condición: Todas</option>
                    <option value="new">Nuevo</option>
                    <option value="used">Usado</option>
                    <option value="">Sin definir</option>
                  </select>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs bg-paper-2 border border-rule rounded-lg text-ink">
                    <ArrowUpDown size={13} className="text-ink-2" />
                    <select
                      aria-label="Ordenar catálogo"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent font-medium focus:outline-none"
                    >
                      <option value="updated_desc">Recientes</option>
                      <option value="title_asc">Título (A a Z)</option>
                      <option value="brand_asc">Marca (A a Z)</option>
                      <option value="sku_asc">SKU (A a Z)</option>
                    </select>
                  </div>

                  {/* Selector Tabla / Grilla */}
                  <div className="inline-flex p-1 bg-paper-3/60 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDisplayMode('table')}
                      className={`p-1.5 rounded-md transition-colors active:translate-y-px ${
                        displayMode === 'table'
                          ? 'bg-paper-2 text-ink shadow-xs'
                          : 'text-ink-2 hover:text-ink'
                      }`}
                      aria-label="Vista de tabla"
                      title="Vista de tabla"
                    >
                      <LayoutList size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode('grid')}
                      className={`p-1.5 rounded-md transition-colors active:translate-y-px ${
                        displayMode === 'grid'
                          ? 'bg-paper-2 text-ink shadow-xs'
                          : 'text-ink-2 hover:text-ink'
                      }`}
                      aria-label="Vista de grilla"
                      title="Vista de grilla"
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-2.5 py-2 text-xs font-medium text-accent hover:text-accent hover:underline whitespace-nowrap shrink-0"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </section>

              {/* Barra de acciones masivas */}
              {selectedUids.size > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-paper-2 border border-rule text-ink rounded-xl">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium">
                      <span className="font-mono tabular-nums">{selectedUids.size}</span>{' '}
                      seleccionados
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedUids(new Set())}
                      className="text-ink-2 hover:text-ink underline"
                    >
                      Deseleccionar
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkAvailability('in stock')}
                      className="px-3 py-1.5 text-xs font-medium bg-paper border border-rule hover:bg-paper-3 rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                    >
                      Marcar en stock
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkAvailability('out of stock')}
                      className="px-3 py-1.5 text-xs font-medium bg-paper border border-rule hover:bg-paper-3 rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                    >
                      Marcar sin stock
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSelectedCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-paper border border-rule hover:bg-paper-3 rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                    >
                      <Download size={13} />
                      Exportar CSV
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ uids: Array.from(selectedUids) })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-danger text-white hover:bg-danger/90 rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {filteredProducts.length === 0 ? (
                <div className="bg-paper-2 border border-rule rounded-xl px-6 py-16 text-center">
                  <Package
                    size={32}
                    strokeWidth={1.5}
                    className="mx-auto text-ink-2"
                  />
                  <h2 className="mt-3 font-display text-base font-semibold text-ink">
                    {products.length === 0
                      ? 'Todavía no hay productos en el catálogo'
                      : 'No hay resultados para los filtros actuales'}
                  </h2>
                  <p className="mt-1 text-sm text-ink-2 max-w-md mx-auto">
                    {products.length === 0
                      ? 'Creá tu primer artículo deportivo o importá tu planilla CSV de Meta Commerce.'
                      : 'Probá limpiando la búsqueda o cambiando la marca y disponibilidad seleccionadas.'}
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2.5">
                    {products.length === 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openCreateForm()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px"
                        >
                          <Plus size={14} />
                          Agregar primer producto
                        </button>
                        <button
                          type="button"
                          onClick={handleResetSampleCatalog}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px"
                        >
                          <RotateCcw size={14} />
                          Cargar ejemplos
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px"
                      >
                        Restablecer filtros
                      </button>
                    )}
                  </div>
                </div>
              ) : displayMode === 'table' ? (
                /* Tabla de alta densidad */
                <div className="bg-paper-2 border border-rule rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-paper-3 border-b border-rule text-[12px] font-medium text-ink-2">
                          <th className="w-10 py-3 pl-4 pr-2">
                            <input
                              type="checkbox"
                              checked={allFilteredSelected}
                              onChange={toggleSelectAllFiltered}
                              aria-label="Seleccionar todos los productos visibles"
                              className="h-4 w-4 rounded border-rule-2 text-accent focus:ring-focus"
                            />
                          </th>
                          <th className="py-3 px-3">Producto / SKU</th>
                          <th className="py-3 px-3">Marca</th>
                          <th className="py-3 px-3">Talle / Color</th>
                          <th className="py-3 px-3 text-right">Precio</th>
                          <th className="py-3 px-3">Estado</th>
                          <th className="py-3 pl-3 pr-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rule text-sm">
                        {filteredProducts.map((product) => {
                          const isSelected = selectedUids.has(product.uid);
                          const secondaryMeta = [
                            CONDITION_LABELS[product.condition],
                            product.gender ? GENDER_LABELS[product.gender] : null,
                            product.style || null,
                          ]
                            .filter(Boolean)
                            .join(' · ');

                          return (
                            <tr
                              key={product.uid}
                              className={`group transition-colors active:translate-y-px ${
                                isSelected
                                  ? 'bg-accent/15/40'
                                  : 'hover:bg-paper-3/80'
                              }`}
                            >
                              <td className="py-3 pl-4 pr-2 align-middle">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOne(product.uid)}
                                  aria-label={`Seleccionar ${product.title || product.id}`}
                                  className="h-4 w-4 rounded border-rule-2 text-accent focus:ring-focus"
                                />
                              </td>
                              <td className="py-3 px-3 align-middle">
                                <div className="flex items-center gap-3 min-w-[260px] max-w-md">
                                  <Link
                                    href={getProductPath(product)}
                                    className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                  >
                                    <ProductImage
                                      src={product.image_link}
                                      alt={product.title || product.id}
                                      brand={product.brand}
                                      size="sm"
                                      className="w-11 h-11 rounded-md"
                                    />
                                  </Link>
                                  <div className="min-w-0">
                                    <Link
                                      href={getProductPath(product)}
                                      className="block text-left text-sm font-medium text-ink hover:text-accent truncate max-w-full"
                                    >
                                      {product.title || 'Producto sin título'}
                                    </Link>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-2 truncate">
                                      <span className="font-mono text-[11px] text-ink-2">
                                        {product.id}
                                      </span>
                                      {secondaryMeta && (
                                        <>
                                          <span aria-hidden="true">·</span>
                                          <span className="truncate">{secondaryMeta}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 align-middle whitespace-nowrap text-xs font-medium text-ink">
                                {product.brand || (
                                  <span className="text-ink-2 font-normal">Sin marca</span>
                                )}
                              </td>
                              <td className="py-3 px-3 align-middle text-xs text-ink-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-ink">
                                    {product.size || '—'}
                                  </span>
                                  <span className="text-ink-2" aria-hidden="true">
                                    /
                                  </span>
                                  <span className="truncate max-w-[130px]">
                                    {product.color || '—'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                                {product.sale_price ? (
                                  <div className="flex flex-col items-end">
                                    <span className="font-mono text-xs font-semibold text-accent tabular-nums">
                                      {product.sale_price}
                                    </span>
                                    {product.price && (
                                      <span className="font-mono text-[11px] text-ink-2 line-through tabular-nums">
                                        {product.price}
                                      </span>
                                    )}
                                  </div>
                                ) : product.price ? (
                                  <span className="font-mono text-xs font-medium text-ink tabular-nums">
                                    {product.price}
                                  </span>
                                ) : (
                                  <span className="text-xs text-ink-2">
                                    Consultar
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 align-middle whitespace-nowrap">
                                <div>
                                  {renderAvailabilityStatus(product.availability)}
                                  {product.quantity_to_sell_on_facebook && (
                                    <div className="text-[11px] text-ink-2 mt-0.5">
                                      Stock:{' '}
                                      <span className="font-mono tabular-nums">
                                        {product.quantity_to_sell_on_facebook}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1">
                                  <Link
                                    href={getProductPath(product)}
                                    className="p-1.5 rounded-md text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px"
                                    title="Abrir página del producto"
                                    aria-label={`Ver ${product.title || product.id}`}
                                  >
                                    <Eye size={15} />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => openEditForm(product)}
                                    className="p-1.5 rounded-md text-ink-2 hover:text-accent hover:bg-accent/15 transition-colors active:translate-y-px"
                                    title="Editar producto"
                                    aria-label={`Editar ${product.title || product.id}`}
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateProduct(product)}
                                    className="p-1.5 rounded-md text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px"
                                    title="Duplicar producto"
                                    aria-label={`Duplicar ${product.title || product.id}`}
                                  >
                                    <Copy size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget({
                                        uids: [product.uid],
                                        title: product.title || product.id,
                                      })
                                    }
                                    className="p-1.5 rounded-md text-ink-2 hover:text-danger hover:bg-danger/15 transition-colors active:translate-y-px"
                                    title="Eliminar producto"
                                    aria-label={`Eliminar ${product.title || product.id}`}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 bg-paper-3 border-t border-rule flex items-center justify-between text-xs text-ink-2">
                    <span className="tabular-nums">
                      Mostrando {filteredProducts.length} de {products.length} artículos
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveView('csv')}
                      className="text-accent hover:text-accent font-medium hover:underline"
                    >
                      Exportar catálogo CSV
                    </button>
                  </div>
                </div>
              ) : (
                /* Vista en grilla visual */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.uid}
                      className="bg-paper-2 border border-rule rounded-xl overflow-hidden flex flex-col hover:border-rule-2 transition-colors active:translate-y-px"
                    >
                      <Link
                        href={getProductPath(product)}
                        className="relative aspect-square w-full overflow-hidden text-left block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                      >
                        <ProductImage
                          src={product.image_link}
                          alt={product.title || product.id}
                          brand={product.brand}
                          size="lg"
                          className="w-full h-full border-0"
                        />
                      </Link>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2 text-xs text-ink-2">
                          <span className="truncate">
                            {product.brand || 'Sin marca'}
                            {product.size ? ` · Talle ${product.size}` : ''}
                          </span>
                          <span className="font-mono text-[11px] text-ink-2 shrink-0">
                            {product.id}
                          </span>
                        </div>

                        <Link
                          href={getProductPath(product)}
                          className="mt-1.5 text-left font-medium text-sm text-ink hover:text-accent line-clamp-2 leading-snug"
                        >
                          {product.title || 'Producto sin título'}
                        </Link>

                        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-rule">
                          <div>
                            {product.sale_price ? (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-sm font-semibold text-accent tabular-nums">
                                  {product.sale_price}
                                </span>
                                {product.price && (
                                  <span className="font-mono text-[11px] text-ink-2 line-through tabular-nums">
                                    {product.price}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-sm font-medium text-ink tabular-nums">
                                {product.price || 'Consultar'}
                              </span>
                            )}
                            <div className="mt-0.5">
                              {renderAvailabilityStatus(product.availability)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              className="p-2 rounded-lg text-ink-2 hover:text-accent hover:bg-accent/15 transition-colors active:translate-y-px"
                              title="Editar"
                              aria-label={`Editar ${product.title || product.id}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  uids: [product.uid],
                                  title: product.title || product.id,
                                })
                              }
                              className="p-2 rounded-lg text-ink-2 hover:text-danger hover:bg-danger/15 transition-colors active:translate-y-px"
                              title="Eliminar"
                              aria-label={`Eliminar ${product.title || product.id}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Vista 2: Directorio de Marcas */}
          {activeView === 'marcas' && (
            <section className="space-y-4">
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">
                  Marcas deportivas en catálogo
                </h1>
                <p className="text-sm text-ink-2 mt-0.5">
                  Seleccioná una marca para filtrar sus artículos directamente en el catálogo.
                </p>
              </div>

              <div className="bg-paper-2 border border-rule rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-paper-3 border-b border-rule text-xs font-medium text-ink-2">
                      <th className="py-3 px-5">Marca</th>
                      <th className="py-3 px-4 text-right">Artículos</th>
                      <th className="py-3 px-4 text-right">En stock</th>
                      <th className="py-3 px-4 text-right">En oferta</th>
                      <th className="py-3 px-4 text-right">Sin precio</th>
                      <th className="py-3 px-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {brandSummaries.map((b) => (
                      <tr key={b.brand} className="hover:bg-paper-3/70">
                        <td className="py-3.5 px-5 font-medium text-ink">
                          {b.brand}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-ink">
                          {b.total}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-accent">
                          {b.inStock}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-ink">
                          {b.onSale}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-ink-2">
                          {b.noPrice}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setBrandFilter(b.brand);
                                setActiveView('catalogo');
                              }}
                              className="font-medium text-accent hover:text-accent hover:underline"
                            >
                              Ver productos
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openCreateForm({
                                  brand: b.brand === 'Sin marca' ? '' : b.brand,
                                })
                              }
                              className="text-ink-2 hover:text-ink hover:underline"
                            >
                              + Alta
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Vista 3: Variantes por item_group_id */}
          {activeView === 'variantes' && (
            <section className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">
                  Grupos de variantes (item_group_id)
                </h1>
                <p className="text-sm text-ink-2 mt-0.5">
                  Agrupá distintos talles o colores de un mismo modelo compartiendo el mismo identificador de grupo.
                </p>
              </div>

              {variantGroups.groups.length === 0 ? (
                <div className="bg-paper-2 border border-rule rounded-xl px-6 py-12 text-center text-sm text-ink-2">
                  Todavía no hay grupos definidos. Asigná un <span className="font-mono text-ink">item_group_id</span> al editar un producto para vincular sus variantes.
                </div>
              ) : (
                <div className="space-y-4">
                  {variantGroups.groups.map(([groupId, items]) => (
                    <div
                      key={groupId}
                      className="bg-paper-2 border border-rule rounded-xl overflow-hidden"
                    >
                      <div className="px-5 py-3.5 bg-paper-3 border-b border-rule flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="font-mono font-semibold text-ink">
                            {groupId}
                          </span>
                          <span className="text-ink-2" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-ink-2">
                            {items[0].brand || 'Sin marca'}
                          </span>
                          <span className="text-ink-2" aria-hidden="true">
                            ·
                          </span>
                          <span className="tabular-nums text-ink-2">
                            {items.length} {items.length === 1 ? 'variante' : 'variantes'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCreateVariantFrom(items[0])}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-paper-2 border border-rule rounded-lg hover:bg-accent/15 hover:border-rule-2 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                        >
                          <Plus size={13} />
                          Agregar variante
                        </button>
                      </div>

                      <div className="divide-y divide-rule">
                        {items.map((item) => (
                          <div
                            key={item.uid}
                            className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-paper-3/60"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <ProductImage
                                src={item.image_link}
                                alt={item.title || item.id}
                                brand={item.brand}
                                size="sm"
                                className="w-10 h-10 rounded-md shrink-0"
                              />
                              <div className="min-w-0">
                                <Link
                                  href={getProductPath(item)}
                                  className="block text-left text-sm font-medium text-ink hover:text-accent truncate"
                                >
                                  {item.title || 'Sin título'}
                                </Link>
                                <div className="text-xs text-ink-2 flex items-center gap-2">
                                  <span className="font-mono text-[11px]">{item.id}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>Talle: {item.size || 'Sin definir'}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>Color: {item.color || 'Sin definir'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <span className="font-mono text-xs tabular-nums text-ink hidden sm:inline">
                                {item.sale_price || item.price || 'Consultar'}
                              </span>
                              {renderAvailabilityStatus(item.availability)}
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="p-1.5 rounded-md text-ink-2 hover:text-accent hover:bg-accent/15"
                                title="Editar variante"
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {variantGroups.ungrouped.length > 0 && (
                <p className="text-xs text-ink-2">
                  Además hay{' '}
                  <span className="font-mono tabular-nums font-medium text-ink">
                    {variantGroups.ungrouped.length}
                  </span>{' '}
                  productos individuales sin grupo de variantes asignado.
                </p>
              )}
            </section>
          )}

          {/* Vista 4: Importación / Exportación CSV */}
          {activeView === 'csv' && (
            <CsvWorkspace
              products={products}
              onImportProducts={handleImportProducts}
              onResetSampleCatalog={handleResetSampleCatalog}
              onClearCatalog={handleClearCatalog}
              onImportOptimizedJson={handleImportOptimizedJson}
              onRefreshCatalog={refreshFromDatabase}
            />
          )}
        </main>
      </div>

      {/* Drawer Alta / Edición */}
      <ProductFormDrawer
        key={formState.formKey}
        open={formState.open}
        mode={formState.mode}
        initialProduct={formState.product}
        existingProducts={products}
        onClose={() => setFormState((prev) => ({ ...prev, open: false }))}
        onSave={handleSaveProduct}
      />

      {/* Modal confirmación de baja */}
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        count={deleteTarget?.uids.length ?? 0}
        productTitle={deleteTarget?.title}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Notificación flotante con opción Deshacer */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-paper-2 text-ink text-xs rounded-xl shadow-lg border border-neutral-800 max-w-md"
        >
          <span>{toast.message}</span>
          {toast.undoSnapshot && (
            <button
              type="button"
              onClick={() => {
                if (toast.undoSnapshot) {
                  void handleUndoSnapshot(toast.undoSnapshot);
                }
              }}
              className="font-semibold text-accent hover:text-emerald-300 underline whitespace-nowrap shrink-0"
            >
              Deshacer
            </button>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-ink-2 hover:text-ink ml-1"
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
