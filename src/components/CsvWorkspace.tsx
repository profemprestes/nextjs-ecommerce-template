'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Images,
  FolderUp,
} from 'lucide-react';
import { SportProduct, AVAILABILITY_LABELS } from '@/lib/catalog-schema';
import {
  SAMPLE_META_CSV_SNIPPET,
  exportMetaCatalogCsv,
  parseMetaCatalogCsv,
} from '@/lib/csv-utils';

interface ImageStorageStats {
  totalImages: number;
  storedInDb: number;
  pendingBinary: number;
}

interface BulkUploadSummary {
  matched: number;
  unmatchedCount: number;
  updatedProducts: number;
  errors: string[];
}

interface CsvWorkspaceProps {
  products: SportProduct[];
  onImportProducts: (
    incoming: SportProduct[],
    strategy: 'merge' | 'skip'
  ) => Promise<{ added: number; updated: number; skipped: number }>;
  onResetSampleCatalog: () => Promise<void> | void;
  onClearCatalog: () => Promise<void> | void;
  onImportOptimizedJson?: () => Promise<void> | void;
  onRefreshCatalog?: () => Promise<void> | void;
}

export function CsvWorkspace({
  products,
  onImportProducts,
  onResetSampleCatalog,
  onClearCatalog,
  onImportOptimizedJson,
  onRefreshCatalog,
}: CsvWorkspaceProps) {
  const [csvInput, setCsvInput] = useState('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'merge' | 'skip'>('merge');
  const [includeCommentsRow, setIncludeCommentsRow] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carga masiva de imágenes binarias a PostgreSQL
  const bulkFilesInputRef = useRef<HTMLInputElement>(null);
  const bulkFolderInputRef = useRef<HTMLInputElement>(null);
  const [imageStats, setImageStats] = useState<ImageStorageStats | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    processed: number;
    total: number;
  } | null>(null);
  const [bulkImageResult, setBulkImageResult] = useState<BulkUploadSummary | null>(null);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const res = await fetch('/api/images/bulk-upload', { cache: 'no-store' });
        if (!active || !res.ok) return;
        const data = (await res.json()) as ImageStorageStats;
        if (typeof data.totalImages === 'number') {
          setImageStats(data);
        }
      } catch {
        // ignore if database not connected
      }
    }
    loadStats();
    return () => {
      active = false;
    };
  }, [products.length]);

  const setFolderInputAttributes = (node: HTMLInputElement | null) => {
    bulkFolderInputRef.current = node;
    if (node) {
      node.setAttribute('webkitdirectory', '');
      node.setAttribute('directory', '');
    }
  };

  const handleBulkImageUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || isUploadingImages) return;
    const files = Array.from(fileList).filter((f) => f.size > 0);
    if (files.length === 0) return;

    setIsUploadingImages(true);
    setBulkImageResult(null);
    setUploadProgress({ processed: 0, total: files.length });

    let totalMatched = 0;
    let totalUnmatched = 0;
    let totalUpdatedProducts = 0;
    const collectedErrors: string[] = [];

    try {
      const batchSize = 8;
      for (let i = 0; i < files.length; i += batchSize) {
        const chunk = files.slice(i, i + batchSize);
        const formData = new FormData();
        chunk.forEach((f) => formData.append('files', f));

        const res = await fetch('/api/images/bulk-upload', {
          method: 'POST',
          body: formData,
        });
        const data = (await res.json()) as {
          matched?: number;
          unmatched?: string[];
          errors?: string[];
          updatedProducts?: number;
          stats?: ImageStorageStats;
          error?: string;
        };

        if (!res.ok) {
          collectedErrors.push(data.error || 'Error en lote de subida.');
        } else {
          totalMatched += data.matched ?? 0;
          totalUnmatched += data.unmatched?.length ?? 0;
          totalUpdatedProducts += data.updatedProducts ?? 0;
          if (data.errors?.length) {
            collectedErrors.push(...data.errors);
          }
          if (data.stats) {
            setImageStats(data.stats);
          }
        }

        setUploadProgress({
          processed: Math.min(i + chunk.length, files.length),
          total: files.length,
        });
      }

      setBulkImageResult({
        matched: totalMatched,
        unmatchedCount: totalUnmatched,
        updatedProducts: totalUpdatedProducts,
        errors: collectedErrors,
      });

      if (totalMatched > 0 && onRefreshCatalog) {
        await onRefreshCatalog();
      }
    } catch {
      setBulkImageResult({
        matched: totalMatched,
        unmatchedCount: totalUnmatched,
        updatedProducts: totalUpdatedProducts,
        errors: ['Error de conexión durante la carga masiva de imágenes.'],
      });
    } finally {
      setIsUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const parsedPreview = useMemo(() => {
    if (!csvInput.trim()) return null;
    return parseMetaCatalogCsv(csvInput);
  }, [csvInput]);

  const existingSkuSet = useMemo(
    () => new Set(products.map((p) => p.id.trim().toLowerCase())),
    [products]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setCsvInput(content);
      setImportFeedback(null);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleExecuteImport = async () => {
    if (!parsedPreview || parsedPreview.products.length === 0 || isImporting) return;
    setIsImporting(true);
    try {
      const result = await onImportProducts(parsedPreview.products, duplicateStrategy);
      const parts: string[] = [];
      if (result.added > 0) parts.push(`${result.added} agregados`);
      if (result.updated > 0) parts.push(`${result.updated} actualizados`);
      if (result.skipped > 0) parts.push(`${result.skipped} omitidos`);
      setImportFeedback(`Importación completada: ${parts.join(', ') || 'sin cambios'}.`);
      setCsvInput('');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadCsv = (onlyInStock: boolean) => {
    const subset = onlyInStock
      ? products.filter((p) => p.availability === 'in stock')
      : products;
    const csvContent = exportMetaCatalogCsv(subset, {
      includeCommentsRow,
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = onlyInStock
      ? `catalogo-deportivo-en-stock-${dateStamp}.csv`
      : `catalogo-deportivo-meta-${dateStamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Bloque 1: Carga masiva de imágenes binarias en PostgreSQL */}
      <section className="bg-paper-2 border border-rule rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-lg font-semibold text-ink">
              Subir imágenes a la base de datos (PostgreSQL)
            </h2>
            <p className="mt-1 text-sm text-ink-2 leading-relaxed">
              Seleccioná tus archivos o carpetas locales (<span className="font-mono text-xs">/nuevas</span>, <span className="font-mono text-xs">/catalogo</span>) en formato WebP, JPG, PNG o AVIF. El sistema vincula cada imagen automáticamente por nombre de archivo con sus productos y guarda los archivos directamente en PostgreSQL.
            </p>
            {imageStats && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-2">
                <span>
                  Guardadas en BD:{' '}
                  <strong className="font-mono tabular-nums text-accent">
                    {imageStats.storedInDb}
                  </strong>{' '}
                  / <span className="font-mono tabular-nums">{imageStats.totalImages}</span>
                </span>
                <span aria-hidden="true" className="text-ink-2">
                  ·
                </span>
                <span>
                  Pendientes de archivo:{' '}
                  <strong className="font-mono tabular-nums text-ink">
                    {imageStats.pendingBinary}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isUploadingImages}
              onClick={() => bulkFilesInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 disabled:opacity-50 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Images size={14} />
              Seleccionar archivos
            </button>
            <button
              type="button"
              disabled={isUploadingImages}
              onClick={() => bulkFolderInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep disabled:opacity-50 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <FolderUp size={14} />
              {isUploadingImages ? 'Subiendo lote...' : 'Subir carpeta completa'}
            </button>
            <input
              ref={bulkFilesInputRef}
              type="file"
              multiple
              accept="image/webp,image/jpeg,image/png,image/gif,image/avif"
              onChange={(e) => {
                void handleBulkImageUpload(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
            <input
              ref={setFolderInputAttributes}
              type="file"
              multiple
              accept="image/webp,image/jpeg,image/png,image/gif,image/avif"
              onChange={(e) => {
                void handleBulkImageUpload(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        </div>

        {uploadProgress && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-ink-2">
              <span>Subiendo y vinculando imágenes en PostgreSQL...</span>
              <span className="font-mono tabular-nums">
                {uploadProgress.processed} / {uploadProgress.total}
              </span>
            </div>
            <div className="h-2 w-full bg-paper-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-200"
                style={{
                  width: `${Math.round(
                    (uploadProgress.processed / Math.max(1, uploadProgress.total)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {bulkImageResult && (
          <div
            className={`px-4 py-3 rounded-lg border text-xs space-y-1 ${
              bulkImageResult.matched > 0
                ? 'bg-accent/15 border-rule-2 text-accent'
                : 'bg-accent/15 border-rule-2 text-amber-900'
            }`}
          >
            <p className="font-medium flex items-center gap-2">
              {bulkImageResult.matched > 0 ? (
                <CheckCircle2 size={15} className="text-accent shrink-0" />
              ) : (
                <AlertTriangle size={15} className="text-accent shrink-0" />
              )}
              <span>
                {bulkImageResult.matched} imágenes guardadas y vinculadas
                {bulkImageResult.unmatchedCount > 0
                  ? ` · ${bulkImageResult.unmatchedCount} sin coincidencia de nombre en el catálogo`
                  : ''}
                .
              </span>
            </p>
            {bulkImageResult.errors.length > 0 && (
              <p className="text-[11px] opacity-85">
                {bulkImageResult.errors.slice(0, 3).join(' · ')}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Bloque 2: Exportación CSV Meta */}
      <section className="bg-paper-2 border border-rule rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-lg font-semibold text-ink">
              Exportar catálogo en formato Meta Commerce CSV
            </h2>
            <p className="mt-1 text-sm text-ink-2 leading-relaxed">
              Genera un archivo CSV con las 31 columnas estándar del catálogo de Facebook e Instagram (<span className="font-mono text-xs text-ink">id, title, description, availability, condition, price, brand...</span>), listo para abrir en Excel o subir a Commerce Manager.
            </p>
            <label className="mt-4 inline-flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCommentsRow}
                onChange={(e) => setIncludeCommentsRow(e.target.checked)}
                className="h-4 w-4 rounded border-rule-2 text-accent focus:ring-focus"
              />
              Incluir primera fila de notas descriptivas (# Opcional | ...)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={products.length === 0}
              onClick={() => handleDownloadCsv(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 disabled:opacity-50 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Download size={14} />
              Solo en stock (
              <span className="tabular-nums">
                {products.filter((p) => p.availability === 'in stock').length}
              </span>
              )
            </button>
            <button
              type="button"
              disabled={products.length === 0}
              onClick={() => handleDownloadCsv(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep disabled:opacity-50 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Download size={14} />
              Descargar todo (
              <span className="tabular-nums">{products.length}</span>)
            </button>
          </div>
        </div>
      </section>

      {/* Bloque 3: Importación masiva desde CSV */}
      <section className="bg-paper-2 border border-rule rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Importar productos desde CSV
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              Subí un archivo <span className="font-mono text-xs">.csv</span> o pegá filas de tu planilla Meta/Excel. Se omiten automáticamente las líneas de comentarios con <span className="font-mono text-xs">#</span> y se aceptan columnas vacías.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCsvInput(SAMPLE_META_CSV_SNIPPET);
                setImportFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet size={14} />
              Cargar ejemplo
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-3 border border-rule rounded-lg hover:bg-paper-3/70 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Upload size={14} />
              Elegir archivo CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {importFeedback && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent/15 border border-rule-2 text-xs font-medium text-accent">
            <CheckCircle2 size={15} className="text-accent shrink-0" />
            <span>{importFeedback}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="csv-paste-area"
            className="block text-xs font-medium text-ink mb-1.5"
          >
            Contenido CSV
          </label>
          <textarea
            id="csv-paste-area"
            rows={6}
            value={csvInput}
            onChange={(e) => {
              setCsvInput(e.target.value);
              setImportFeedback(null);
            }}
            placeholder="Pegá aquí el contenido de tu CSV (incluyendo la fila de encabezados id,title,description,... o con la fila # Obligatorio arriba)..."
            className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper-3 border border-rule rounded-lg text-ink placeholder:text-ink-2 focus:outline-none focus:bg-paper-2 focus:border-focus focus:ring-2 focus:ring-focus/15"
          />
        </div>

        {parsedPreview && (
          <div className="space-y-4 pt-2 border-t border-rule/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-ink">
                Se detectaron{' '}
                <strong className="font-semibold text-ink tabular-nums">
                  {parsedPreview.products.length}
                </strong>{' '}
                productos listos para importar.
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-2">Si el SKU ya existe:</span>
                <div className="inline-flex p-0.5 bg-paper-3 rounded-lg border border-rule/80">
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy('merge')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0 ${
                      duplicateStrategy === 'merge'
                        ? 'bg-paper-2 text-ink shadow-xs'
                        : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy('skip')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors active:translate-y-px whitespace-nowrap shrink-0 ${
                      duplicateStrategy === 'skip'
                        ? 'bg-paper-2 text-ink shadow-xs'
                        : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    Omitir
                  </button>
                </div>
              </div>
            </div>

            {parsedPreview.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-accent/15 border border-rule-2 space-y-1">
                {parsedPreview.warnings.slice(0, 5).map((w, idx) => (
                  <p key={idx} className="flex items-center gap-1.5 text-xs text-accent">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}

            {parsedPreview.products.length > 0 && (
              <div className="overflow-x-auto border border-rule rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-paper-3 border-b border-rule text-ink-2">
                      <th className="py-2 px-3 font-medium">SKU</th>
                      <th className="py-2 px-3 font-medium">Título</th>
                      <th className="py-2 px-3 font-medium">Marca</th>
                      <th className="py-2 px-3 font-medium">Precio</th>
                      <th className="py-2 px-3 font-medium">Estado</th>
                      <th className="py-2 px-3 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {parsedPreview.products.slice(0, 8).map((item) => {
                      const exists = existingSkuSet.has(item.id.trim().toLowerCase());
                      return (
                        <tr key={item.uid} className="hover:bg-paper-3/70">
                          <td className="py-2 px-3 font-mono text-ink whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="py-2 px-3 text-ink max-w-xs truncate">
                            {item.title || 'Sin título'}
                          </td>
                          <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                            {item.brand || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono tabular-nums text-ink whitespace-nowrap">
                            {item.price || 'Consultar'}
                          </td>
                          <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                            {AVAILABILITY_LABELS[item.availability]}
                          </td>
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            <span
                              className={
                                exists
                                  ? duplicateStrategy === 'merge'
                                    ? 'text-accent font-medium'
                                    : 'text-ink-2'
                                  : 'text-accent font-medium'
                              }
                            >
                              {exists
                                ? duplicateStrategy === 'merge'
                                  ? 'Actualizar'
                                  : 'Omitir'
                                : 'Nuevo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {parsedPreview.products.length > 8 && (
                  <div className="px-3 py-2 bg-paper-3 border-t border-rule text-[11px] text-ink-2">
                    Mostrando 8 de {parsedPreview.products.length} filas detectadas.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCsvInput('')}
                className="px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px"
              >
                Limpiar
              </button>
              <button
                type="button"
                disabled={parsedPreview.products.length === 0 || isImporting}
                onClick={handleExecuteImport}
                className="px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep disabled:opacity-50 transition-colors active:translate-y-px"
              >
                {isImporting
                  ? 'Importando...'
                  : `Importar ${parsedPreview.products.length} productos`}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bloque 4: Mantenimiento del catálogo */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 bg-paper-2 border border-rule rounded-xl">
        <div>
          <h3 className="text-sm font-medium text-ink">
            Mantenimiento de datos
          </h3>
          <p className="text-xs text-ink-2 mt-0.5">
            Sincronizá el catálogo optimizado, vaciá los registros o cargá los 6 productos de ejemplo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onImportOptimizedJson && (
            <button
              type="button"
              onClick={onImportOptimizedJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-accent bg-accent/15 border border-rule-2 rounded-lg hover:bg-emerald-100/70 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Upload size={14} />
              Sincronizar JSON optimizado
            </button>
          )}
          <button
            type="button"
            disabled={products.length === 0}
            onClick={onClearCatalog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-danger bg-paper-2 border border-danger/30 rounded-lg hover:bg-danger/15 disabled:opacity-40 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <Trash2 size={14} />
            Vaciar catálogo (0)
          </button>
          <button
            type="button"
            onClick={onResetSampleCatalog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <RotateCcw size={14} />
            Cargar ejemplos
          </button>
        </div>
      </section>
    </div>
  );
}
