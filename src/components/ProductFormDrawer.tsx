'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  RefreshCw,
  Plus,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import {
  AGE_GROUP_LABELS,
  AgeGroupValue,
  AVAILABILITY_LABELS,
  AvailabilityValue,
  COMMON_SIZES,
  CONDITION_LABELS,
  ConditionValue,
  CURRENCIES,
  FB_CATEGORY_SUGGESTIONS,
  GENDER_LABELS,
  GenderValue,
  GOOGLE_CATEGORY_SUGGESTIONS,
  SPORT_BRANDS,
  STYLE_SUGGESTIONS,
  SportProduct,
  buildPriceString,
  buildSaleDateRange,
  generateSku,
  parsePriceParts,
  parseSaleDateRange,
  validateProductSoft,
  validateWebpImageUrl,
} from '@/lib/catalog-schema';
import { ProductImage } from './ProductImage';

interface ProductFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialProduct: SportProduct;
  existingProducts: SportProduct[];
  onClose: () => void;
  onSave: (product: SportProduct) => void;
}

type FormSection = 'esencial' | 'precio' | 'indumentaria' | 'media' | 'logistica';

const SECTION_TABS: { id: FormSection; label: string }[] = [
  { id: 'esencial', label: 'Esencial' },
  { id: 'precio', label: 'Precio y oferta' },
  { id: 'indumentaria', label: 'Indumentaria' },
  { id: 'media', label: 'Media y links' },
  { id: 'logistica', label: 'Categorías y envío' },
];

export function ProductFormDrawer({
  open,
  mode,
  initialProduct,
  existingProducts,
  onClose,
  onSave,
}: ProductFormDrawerProps) {
  const initialPrice = parsePriceParts(initialProduct.price);
  const initialSale = parsePriceParts(initialProduct.sale_price);
  const initialDateRange = parseSaleDateRange(
    initialProduct.sale_price_effective_date
  );

  const [form, setForm] = useState<SportProduct>(initialProduct);
  const [activeTab, setActiveTab] = useState<FormSection>('esencial');
  const [tagDraft, setTagDraft] = useState('');
  const [clipboardFeedback, setClipboardFeedback] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<{
    url: string;
    status: 'loaded' | 'error';
  } | null>(null);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState('');
  const [galleryUrlError, setGalleryUrlError] = useState<string | null>(null);

  // Estados auxiliares para precio y fechas de oferta
  const [priceAmount, setPriceAmount] = useState(initialPrice.amount);
  const [priceCurrency, setPriceCurrency] = useState(initialPrice.currency);
  const [saleAmount, setSaleAmount] = useState(initialSale.amount);
  const [saleCurrency, setSaleCurrency] = useState(initialSale.currency);
  const [saleStartDate, setSaleStartDate] = useState(initialDateRange.startDate);
  const [saleStartTime, setSaleStartTime] = useState(initialDateRange.startTime);
  const [saleEndDate, setSaleEndDate] = useState(initialDateRange.endDate);
  const [saleEndTime, setSaleEndTime] = useState(initialDateRange.endTime);
  const [saleTimezone, setSaleTimezone] = useState(initialDateRange.timezone);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const issues = useMemo(
    () =>
      validateProductSoft(form, existingProducts, {
        initialImageLink: mode === 'edit' ? initialProduct.image_link : '',
        initialImages: mode === 'edit' ? initialProduct.images : [],
      }),
    [form, existingProducts, mode, initialProduct.image_link, initialProduct.images]
  );

  const imageValidation = useMemo(
    () => validateWebpImageUrl(form.image_link),
    [form.image_link]
  );

  const isUntouchedLegacyImage =
    mode === 'edit' &&
    !imageValidation.valid &&
    imageValidation.isSafeUrl &&
    form.image_link.trim() !== '' &&
    form.image_link.trim() === initialProduct.image_link.trim();

  const hasImageBlockingError = !imageValidation.valid && !isUntouchedLegacyImage;
  const currentPreviewStatus =
    previewStatus?.url === form.image_link.trim() ? previewStatus.status : null;

  const galleryDraftValidation = useMemo(
    () => validateWebpImageUrl(galleryUrlDraft),
    [galleryUrlDraft]
  );

  const blockingErrors = issues.filter((i) => i.severity === 'error');
  const softWarnings = issues.filter((i) => i.severity === 'warning');

  if (!open) return null;

  const updateField = <K extends keyof SportProduct>(
    key: K,
    value: SportProduct[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (amount: string, currency: string) => {
    setPriceAmount(amount);
    setPriceCurrency(currency);
    updateField('price', buildPriceString(amount, currency));
  };

  const handleSalePriceChange = (amount: string, currency: string) => {
    setSaleAmount(amount);
    setSaleCurrency(currency);
    updateField('sale_price', buildPriceString(amount, currency));
  };

  const handleSaleDateChange = (
    nextStartDate: string,
    nextStartTime: string,
    nextEndDate: string,
    nextEndTime: string,
    nextTz: string
  ) => {
    setSaleStartDate(nextStartDate);
    setSaleStartTime(nextStartTime);
    setSaleEndDate(nextEndDate);
    setSaleEndTime(nextEndTime);
    setSaleTimezone(nextTz);
    updateField(
      'sale_price_effective_date',
      buildSaleDateRange(
        nextStartDate,
        nextStartTime,
        nextEndDate,
        nextEndTime,
        nextTz
      )
    );
  };

  const handleAddTag = () => {
    const clean = tagDraft.trim().slice(0, 110);
    if (!clean) return;
    if (!form.product_tags.includes(clean)) {
      updateField('product_tags', [...form.product_tags, clean]);
    }
    setTagDraft('');
  };

  const handleRemoveTag = (tag: string) => {
    updateField(
      'product_tags',
      form.product_tags.filter((t) => t !== tag)
    );
  };

  const handleImageLinkChange = (value: string) => {
    setClipboardFeedback(null);
    updateField('image_link', value);
  };

  const handleImagePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      e.preventDefault();
      handleImageLinkChange(pasted.trim());
    }
  };

  const handlePasteFromClipboard = async (target: 'primary' | 'gallery') => {
    setClipboardFeedback(null);
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      setClipboardFeedback(
        'Pegá la URL directamente en el campo usando Ctrl+V o Cmd+V.'
      );
      return;
    }
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setClipboardFeedback('El portapapeles está vacío.');
        return;
      }
      if (target === 'primary') {
        handleImageLinkChange(text);
      } else {
        setGalleryUrlDraft(text);
        setGalleryUrlError(null);
      }
    } catch {
      setClipboardFeedback(
        'El navegador bloqueó la lectura del portapapeles. Usá Ctrl+V o Cmd+V en el campo.'
      );
    }
  };

  const handleAddGalleryUrl = () => {
    const clean = galleryUrlDraft.trim();
    if (!clean) {
      setGalleryUrlError('Pegá una URL .webp para agregarla a la galería.');
      return;
    }
    const check = validateWebpImageUrl(clean);
    if (!check.valid) {
      setGalleryUrlError(
        check.error || 'Solo se admiten imágenes en formato WebP compatible (.webp).'
      );
      return;
    }

    const currentImages = Array.isArray(form.images) ? form.images : [];
    if (currentImages.includes(clean)) {
      setGalleryUrlError('Esa URL ya está incluida en la galería del producto.');
      return;
    }

    const nextImages = [...currentImages, clean];
    setForm((prev) => ({
      ...prev,
      image_link: prev.image_link.trim() ? prev.image_link : clean,
      images: nextImages,
    }));
    setGalleryUrlDraft('');
    setGalleryUrlError(null);
  };

  const handleRemoveGalleryUrl = (urlToRemove: string) => {
    const currentImages = Array.isArray(form.images) ? form.images : [];
    const nextImages = currentImages.filter((u) => u !== urlToRemove);
    updateField('images', nextImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockingErrors.length > 0) return;

    const now = new Date().toISOString();
    const finalSku = form.id.trim() || generateSku(form.brand);

    onSave({
      ...form,
      id: finalSku,
      image_link: form.image_link.trim(),
      updatedAt: now,
      createdAt: mode === 'create' ? now : form.createdAt,
    });
  };

  const inputClass =
    'w-full px-3 py-2 text-sm bg-paper-2 border border-rule rounded-lg text-ink placeholder:text-ink-2 focus:outline-none focus:border-focus focus:ring-2 focus:ring-focus/15 transition-colors active:translate-y-px';
  const labelClass = 'block text-xs font-medium text-ink mb-1.5';
  const hintClass = 'text-[11px] text-ink-2 mt-1';

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col w-full max-w-2xl h-full bg-paper-2 border-l border-rule shadow-2xl"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule">
          <div className="min-w-0">
            <h2
              id="product-form-title"
              className="font-display text-lg font-semibold text-ink truncate"
            >
              {mode === 'create' ? 'Alta de producto deportivo' : 'Editar producto'}
            </h2>
            <p className="text-xs text-ink-2 mt-0.5">
              Sin campos obligatorios: guardá lo que tengas disponible y completá el resto cuando quieras.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Cerrar panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de secciones */}
        <div className="px-6 pt-3 pb-0 border-b border-rule bg-paper-3 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {SECTION_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabHasMediaError =
                tab.id === 'media' &&
                blockingErrors.some(
                  (err) => err.field === 'image_link' || err.field === 'images'
                );
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    isActive
                      ? 'border-emerald-700 text-accent bg-paper-2 rounded-t-md'
                      : 'border-transparent text-ink-2 hover:text-ink'
                  }`}
                >
                  {tab.label}
                  {tabHasMediaError && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-danger"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alertas de validación suave */}
        {(blockingErrors.length > 0 || softWarnings.length > 0) && (
          <div className="px-6 pt-3 space-y-2">
            {blockingErrors.map((err, i) => (
              <div
                key={`err-${i}`}
                className="flex items-start gap-2 px-3 py-2 rounded-lg bg-danger/15 border border-danger/30 text-xs text-danger"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{err.message}</span>
              </div>
            ))}
            {softWarnings.map((warn, i) => (
              <div
                key={`warn-${i}`}
                className="flex items-start gap-2 px-3 py-2 rounded-lg bg-accent/15 border border-rule-2 text-xs text-accent"
              >
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{warn.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cuerpo scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {activeTab === 'esencial' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-id" className={labelClass}>
                    SKU / ID único <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="field-id"
                      type="text"
                      maxLength={100}
                      value={form.id}
                      onChange={(e) => updateField('id', e.target.value)}
                      placeholder="Ej. FEL-Df8Wz_Nkafr"
                      className={`${inputClass} font-mono text-[13px]`}
                    />
                    <button
                      type="button"
                      onClick={() => updateField('id', generateSku(form.brand))}
                      title="Autogenerar SKU"
                      className="px-2.5 py-2 border border-rule rounded-lg text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <RefreshCw size={15} />
                    </button>
                  </div>
                  <p className={hintClass}>
                    Si queda vacío, se genera automáticamente al guardar ({form.id.length}/100).
                  </p>
                </div>

                <div>
                  <label htmlFor="field-brand" className={labelClass}>
                    Marca deportiva <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="field-brand"
                    type="text"
                    list="sport-brands-list"
                    maxLength={100}
                    value={form.brand}
                    onChange={(e) => updateField('brand', e.target.value)}
                    placeholder="Ej. Umbro, Adidas, Nike, Kappa"
                    className={inputClass}
                  />
                  <datalist id="sport-brands-list">
                    {SPORT_BRANDS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  <p className={hintClass}>Elegí una sugerencia o escribí cualquier marca.</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="field-title" className={labelClass}>
                    Título del artículo <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-ink-2">
                    {form.title.length}/200
                  </span>
                </div>
                <input
                  id="field-title"
                  type="text"
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ej. Camiseta Manchester United Retro 1993-95 Negra - Cantona 7 - Umbro"
                  className={inputClass}
                />
              </div>

              {/* Bloque directo para pegar URL de imagen WebP */}
              <div className="p-3.5 rounded-xl bg-paper-3 border border-rule/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="field-image-link-esencial"
                    className="text-xs font-medium text-ink flex items-center gap-1.5"
                  >
                    <ImageIcon size={14} className="text-accent" />
                    URL de imagen principal{' '}
                    <span className="text-ink-2 font-normal">
                      (formato WebP · opcional)
                    </span>
                  </label>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-paper-2 border border-rule text-ink-2">
                    .webp
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <ProductImage
                    src={imageValidation.isSafeUrl ? form.image_link : ''}
                    alt={form.title || 'Vista previa'}
                    brand={form.brand}
                    size="md"
                    className="w-16 h-16 rounded-lg shrink-0"
                    onStatusChange={(status) =>
                      setPreviewStatus({ url: form.image_link.trim(), status })
                    }
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        id="field-image-link-esencial"
                        type="text"
                        inputMode="url"
                        value={form.image_link}
                        onChange={(e) => handleImageLinkChange(e.target.value)}
                        onPaste={handleImagePasteEvent}
                        placeholder="Pegá una URL directa (ej. https://sitio.com/camiseta.webp)"
                        aria-invalid={hasImageBlockingError}
                        className={`${inputClass} text-xs font-mono ${
                          hasImageBlockingError
                            ? 'border-red-400 focus:border-red-600 focus:ring-red-600/15'
                            : !imageValidation.isEmpty && imageValidation.valid
                              ? 'border-rule-2'
                              : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('primary')}
                        title="Pegar URL desde el portapapeles"
                        className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <ClipboardPaste size={14} />
                        Pegar
                      </button>
                      {form.image_link.trim() && (
                        <button
                          type="button"
                          onClick={() => handleImageLinkChange('')}
                          title="Quitar URL de imagen"
                          aria-label="Quitar URL de imagen"
                          className="p-2 text-ink-2 hover:text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {hasImageBlockingError ? (
                      <p className="flex items-start gap-1.5 text-[11px] text-danger">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        <span>{imageValidation.error}</span>
                      </p>
                    ) : isUntouchedLegacyImage ? (
                      <p className="flex items-start gap-1.5 text-[11px] text-accent">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                        <span>
                          Imagen existente en formato anterior. Pegá una URL{' '}
                          <span className="font-medium">.webp</span> si querés reemplazarla.
                        </span>
                      </p>
                    ) : !imageValidation.isEmpty && imageValidation.valid ? (
                      <p className="flex items-center gap-1.5 text-[11px] text-accent">
                        <CheckCircle2 size={13} className="shrink-0" />
                        <span>
                          {imageValidation.isInternalBinary
                            ? 'Imagen almacenada en PostgreSQL'
                            : currentPreviewStatus === 'error'
                              ? 'URL WebP válida (la vista previa no respondió aún)'
                              : 'Formato WebP compatible'}
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink-2">
                        Acepta enlaces directos <span className="font-medium">.webp</span> o rutas con{' '}
                        <span className="font-medium">format=webp</span>.
                      </p>
                    )}

                    {clipboardFeedback && (
                      <p className="text-[11px] text-ink-2">{clipboardFeedback}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="field-description" className={labelClass}>
                    Descripción <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-ink-2">
                    {form.description.length}/9999
                  </span>
                </div>
                <textarea
                  id="field-description"
                  rows={4}
                  maxLength={9999}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Detalles del modelo, sponsor, dorsal, tela, estado de etiquetas o canal de venta..."
                  className={`${inputClass} resize-y leading-relaxed`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label htmlFor="field-availability" className={labelClass}>
                    Disponibilidad
                  </label>
                  <select
                    id="field-availability"
                    value={form.availability}
                    onChange={(e) =>
                      updateField('availability', e.target.value as AvailabilityValue)
                    }
                    className={inputClass}
                  >
                    <option value="">{AVAILABILITY_LABELS['']}</option>
                    <option value="in stock">{AVAILABILITY_LABELS['in stock']} (in stock)</option>
                    <option value="out of stock">
                      {AVAILABILITY_LABELS['out of stock']} (out of stock)
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-condition" className={labelClass}>
                    Condición
                  </label>
                  <select
                    id="field-condition"
                    value={form.condition}
                    onChange={(e) =>
                      updateField('condition', e.target.value as ConditionValue)
                    }
                    className={inputClass}
                  >
                    <option value="">{CONDITION_LABELS['']}</option>
                    <option value="new">{CONDITION_LABELS.new} (new)</option>
                    <option value="used">{CONDITION_LABELS.used} (used)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-qty" className={labelClass}>
                    Cantidad stock
                  </label>
                  <input
                    id="field-qty"
                    type="number"
                    min={0}
                    step={1}
                    value={form.quantity_to_sell_on_facebook}
                    onChange={(e) =>
                      updateField('quantity_to_sell_on_facebook', e.target.value)
                    }
                    placeholder="Ej. 5"
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'precio' && (
            <>
              <div className="p-4 rounded-lg bg-paper-3 border border-rule/80">
                <p className="text-xs text-ink-2 leading-relaxed">
                  Dejá el precio vacío si vendés bajo consulta por DM o WhatsApp. Si lo ingresás, se formatea automáticamente con punto decimal y código ISO 4217 (ej. <span className="font-mono text-ink">2490.00 UYU</span>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-price-amount" className={labelClass}>
                    Precio regular <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="field-price-amount"
                      type="text"
                      inputMode="decimal"
                      value={priceAmount}
                      onChange={(e) => handlePriceChange(e.target.value, priceCurrency)}
                      placeholder="Ej. 2890.00"
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                    <select
                      aria-label="Moneda del precio"
                      value={priceCurrency}
                      onChange={(e) => handlePriceChange(priceAmount, e.target.value)}
                      className="px-2.5 py-2 text-xs font-mono bg-paper-2 border border-rule rounded-lg text-ink focus:outline-none focus:border-focus"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className={hintClass}>
                    Valor CSV: <span className="font-mono">{form.price || '(vacío — Consultar)'}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="field-sale-amount" className={labelClass}>
                    Precio de oferta <span className="text-ink-2 font-normal">(opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="field-sale-amount"
                      type="text"
                      inputMode="decimal"
                      value={saleAmount}
                      onChange={(e) => handleSalePriceChange(e.target.value, saleCurrency)}
                      placeholder="Ej. 2490.00"
                      className={`${inputClass} font-mono tabular-nums`}
                    />
                    <select
                      aria-label="Moneda del precio de oferta"
                      value={saleCurrency}
                      onChange={(e) => handleSalePriceChange(saleAmount, e.target.value)}
                      className="px-2.5 py-2 text-xs font-mono bg-paper-2 border border-rule rounded-lg text-ink focus:outline-none focus:border-focus"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className={hintClass}>
                    Valor CSV: <span className="font-mono">{form.sale_price || '(sin oferta)'}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rule/80 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-ink">
                    Vigencia de la oferta (sale_price_effective_date)
                  </h3>
                  <p className={hintClass}>
                    Si cargás precio de oferta sin fechas, la oferta queda activa de forma indefinida.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="field-sale-start" className={labelClass}>
                      Inicio de oferta
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="field-sale-start"
                        type="date"
                        value={saleStartDate}
                        onChange={(e) =>
                          handleSaleDateChange(
                            e.target.value,
                            saleStartTime,
                            saleEndDate,
                            saleEndTime,
                            saleTimezone
                          )
                        }
                        className={`${inputClass} font-mono text-xs`}
                      />
                      <input
                        aria-label="Hora de inicio"
                        type="time"
                        value={saleStartTime}
                        onChange={(e) =>
                          handleSaleDateChange(
                            saleStartDate,
                            e.target.value,
                            saleEndDate,
                            saleEndTime,
                            saleTimezone
                          )
                        }
                        className="w-28 px-2.5 py-2 text-xs font-mono bg-paper-2 border border-rule rounded-lg text-ink focus:outline-none focus:border-focus"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="field-sale-end" className={labelClass}>
                      Fin de oferta
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="field-sale-end"
                        type="date"
                        value={saleEndDate}
                        onChange={(e) =>
                          handleSaleDateChange(
                            saleStartDate,
                            saleStartTime,
                            e.target.value,
                            saleEndTime,
                            saleTimezone
                          )
                        }
                        className={`${inputClass} font-mono text-xs`}
                      />
                      <input
                        aria-label="Hora de fin"
                        type="time"
                        value={saleEndTime}
                        onChange={(e) =>
                          handleSaleDateChange(
                            saleStartDate,
                            saleStartTime,
                            saleEndDate,
                            e.target.value,
                            saleTimezone
                          )
                        }
                        className="w-28 px-2.5 py-2 text-xs font-mono bg-paper-2 border border-rule rounded-lg text-ink focus:outline-none focus:border-focus"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label htmlFor="field-tz" className={labelClass}>
                      Zona horaria UTC
                    </label>
                    <select
                      id="field-tz"
                      value={saleTimezone}
                      onChange={(e) =>
                        handleSaleDateChange(
                          saleStartDate,
                          saleStartTime,
                          saleEndDate,
                          saleEndTime,
                          e.target.value
                        )
                      }
                      className={`${inputClass} font-mono text-xs`}
                    >
                      <option value="-03:00">UTC -03:00 (UY / AR)</option>
                      <option value="-05:00">UTC -05:00 (CO / PE)</option>
                      <option value="-06:00">UTC -06:00 (MX)</option>
                      <option value="-08:00">UTC -08:00 (Pacífico)</option>
                      <option value="+00:00">UTC +00:00</option>
                      <option value="+01:00">UTC +01:00 (ES)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="field-sale-raw" className={labelClass}>
                      Cadena ISO resultante
                    </label>
                    <input
                      id="field-sale-raw"
                      type="text"
                      value={form.sale_price_effective_date}
                      onChange={(e) =>
                        updateField('sale_price_effective_date', e.target.value)
                      }
                      placeholder="YYYY-MM-DDTHH:MM-03:00/YYYY-MM-DDTHH:MM-03:00"
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'indumentaria' && (
            <>
              <div>
                <label htmlFor="field-size" className={labelClass}>
                  Talle / Medida <span className="text-ink-2 font-normal">(opcional)</span>
                </label>
                <input
                  id="field-size"
                  type="text"
                  maxLength={200}
                  value={form.size}
                  onChange={(e) => updateField('size', e.target.value)}
                  placeholder="Ej. M, L, XL, 42 o consultar"
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_SIZES.map((sz) => {
                    const selected = form.size.trim().toUpperCase() === sz.toUpperCase();
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateField('size', selected ? '' : sz)}
                        className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors active:translate-y-px whitespace-nowrap shrink-0 ${
                          selected
                            ? 'bg-accent text-accent-ink border-emerald-700'
                            : 'bg-paper-2 text-ink-2 border-rule hover:border-rule-2 hover:text-ink'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-color" className={labelClass}>
                    Color (en palabras)
                  </label>
                  <input
                    id="field-color"
                    type="text"
                    maxLength={200}
                    value={form.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    placeholder="Ej. negro y amarillo, celeste"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="field-style" className={labelClass}>
                    Estilo deportivo (style[0])
                  </label>
                  <input
                    id="field-style"
                    type="text"
                    list="style-suggestions-list"
                    value={form.style}
                    onChange={(e) => updateField('style', e.target.value)}
                    placeholder="Ej. Retro, Titular, Entrenamiento"
                    className={inputClass}
                  />
                  <datalist id="style-suggestions-list">
                    {STYLE_SUGGESTIONS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-gender" className={labelClass}>
                    Género
                  </label>
                  <select
                    id="field-gender"
                    value={form.gender}
                    onChange={(e) =>
                      updateField('gender', e.target.value as GenderValue)
                    }
                    className={inputClass}
                  >
                    <option value="">{GENDER_LABELS['']}</option>
                    <option value="unisex">{GENDER_LABELS.unisex} (unisex)</option>
                    <option value="male">{GENDER_LABELS.male} (male)</option>
                    <option value="female">{GENDER_LABELS.female} (female)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-age-group" className={labelClass}>
                    Grupo de edad
                  </label>
                  <select
                    id="field-age-group"
                    value={form.age_group}
                    onChange={(e) =>
                      updateField('age_group', e.target.value as AgeGroupValue)
                    }
                    className={inputClass}
                  >
                    {(Object.keys(AGE_GROUP_LABELS) as AgeGroupValue[]).map((key) => (
                      <option key={key || 'empty'} value={key}>
                        {AGE_GROUP_LABELS[key]}
                        {key ? ` (${key})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-material" className={labelClass}>
                    Material
                  </label>
                  <input
                    id="field-material"
                    type="text"
                    maxLength={200}
                    value={form.material}
                    onChange={(e) => updateField('material', e.target.value)}
                    placeholder="Ej. Poliéster 100%, Algodón, Dry-FIT"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="field-pattern" className={labelClass}>
                    Estampado / Trama (pattern)
                  </label>
                  <input
                    id="field-pattern"
                    type="text"
                    maxLength={100}
                    value={form.pattern}
                    onChange={(e) => updateField('pattern', e.target.value)}
                    placeholder="Ej. Bastones verticales, Colorblock, Liso"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rule/80">
                <div>
                  <label htmlFor="field-group-id" className={labelClass}>
                    ID de grupo de variantes (item_group_id)
                  </label>
                  <input
                    id="field-group-id"
                    type="text"
                    maxLength={100}
                    value={form.item_group_id}
                    onChange={(e) => updateField('item_group_id', e.target.value)}
                    placeholder="Ej. GRP-MU-9395"
                    className={`${inputClass} font-mono text-xs`}
                  />
                  <p className={hintClass}>
                    Usá el mismo ID para agrupar distintos talles o colores del mismo modelo.
                  </p>
                </div>

                <div>
                  <label htmlFor="field-gtin" className={labelClass}>
                    Código de barras (GTIN / EAN / UPC)
                  </label>
                  <input
                    id="field-gtin"
                    type="text"
                    value={form.gtin}
                    onChange={(e) => updateField('gtin', e.target.value)}
                    placeholder="Ej. 0195751284920"
                    className={`${inputClass} font-mono text-xs tabular-nums`}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'media' && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <ProductImage
                  src={imageValidation.isSafeUrl ? form.image_link : ''}
                  alt={form.title || 'Vista previa del producto'}
                  brand={form.brand}
                  size="lg"
                  className="w-32 h-32 rounded-lg shrink-0"
                  onStatusChange={(status) =>
                    setPreviewStatus({ url: form.image_link.trim(), status })
                  }
                />
                <div className="flex-1 w-full space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label htmlFor="field-image-link" className="text-xs font-medium text-ink">
                        URL de imagen principal <span className="text-ink-2 font-normal">(opcional)</span>
                      </label>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-paper-3 text-ink-2 border border-rule/80">
                        Solo WebP (.webp)
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        id="field-image-link"
                        type="text"
                        inputMode="url"
                        value={form.image_link}
                        onChange={(e) => handleImageLinkChange(e.target.value)}
                        onPaste={handleImagePasteEvent}
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
                        onClick={() => handlePasteFromClipboard('primary')}
                        title="Pegar URL desde el portapapeles"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <ClipboardPaste size={14} />
                        Pegar URL
                      </button>
                      {form.image_link.trim() && (
                        <button
                          type="button"
                          onClick={() => handleImageLinkChange('')}
                          title="Quitar URL"
                          aria-label="Quitar URL de imagen principal"
                          className="p-2 text-ink-2 hover:text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {hasImageBlockingError ? (
                      <p className="flex items-start gap-1.5 text-[11px] text-danger mt-1.5">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        <span>{imageValidation.error}</span>
                      </p>
                    ) : isUntouchedLegacyImage ? (
                      <p className="flex items-start gap-1.5 text-[11px] text-accent mt-1.5">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                        <span>
                          La imagen actual no es .webp. Podés conservarla o pegar una nueva URL WebP (.webp).
                        </span>
                      </p>
                    ) : !imageValidation.isEmpty && imageValidation.valid ? (
                      <p className="flex items-center gap-1.5 text-[11px] text-accent mt-1.5">
                        <CheckCircle2 size={13} className="shrink-0" />
                        <span>
                          {imageValidation.isInternalBinary
                            ? 'Imagen almacenada en PostgreSQL.'
                            : currentPreviewStatus === 'error'
                              ? 'Formato WebP validado, pero la imagen remota no pudo cargarse en la vista previa.'
                              : 'Formato WebP compatible verificado.'}
                        </span>
                      </p>
                    ) : (
                      <p className={hintClass}>
                        Pegá una URL directa en formato WebP (<span className="font-mono">.webp</span> o parámetro <span className="font-mono">format=webp</span>).
                      </p>
                    )}

                    {clipboardFeedback && (
                      <p className="text-[11px] text-ink-2 mt-1">{clipboardFeedback}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Galería de imágenes del producto + agregar URL .webp */}
              <div className="pt-3 border-t border-rule/80 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold text-ink">
                      Galería de URLs adicionales (WebP)
                    </h3>
                    <p className={hintClass}>
                      Agregá más vistas del artículo pegando URLs en formato <span className="font-mono">.webp</span>.
                    </p>
                  </div>
                  {Array.isArray(form.images) && form.images.length > 0 && (
                    <span className="text-[11px] font-mono tabular-nums text-ink-2">
                      {form.images.length} {form.images.length === 1 ? 'imagen' : 'imágenes'}
                    </span>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <input
                    id="field-gallery-webp-url"
                    type="text"
                    inputMode="url"
                    value={galleryUrlDraft}
                    onChange={(e) => {
                      setGalleryUrlDraft(e.target.value);
                      if (galleryUrlError) setGalleryUrlError(null);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted) {
                        e.preventDefault();
                        setGalleryUrlDraft(pasted.trim());
                        setGalleryUrlError(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGalleryUrl();
                      }
                    }}
                    placeholder="https://cdn.ejemplo.com/vista-espalda.webp"
                    className={`${inputClass} font-mono text-xs ${
                      galleryUrlDraft.trim() && !galleryDraftValidation.valid
                        ? 'border-red-400 focus:border-red-600 focus:ring-red-600/15'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handlePasteFromClipboard('gallery')}
                    title="Pegar URL desde el portapapeles"
                    className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                  >
                    <ClipboardPaste size={14} />
                    Pegar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                  >
                    <Plus size={14} />
                    Agregar
                  </button>
                </div>

                {(galleryUrlError ||
                  (galleryUrlDraft.trim() && !galleryDraftValidation.valid)) && (
                  <p className="flex items-start gap-1.5 text-[11px] text-danger">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>
                      {galleryUrlError || galleryDraftValidation.error}
                    </span>
                  </p>
                )}

                {Array.isArray(form.images) && form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {form.images.map((url, idx) => {
                      const isCover = form.image_link.trim() === url.trim();
                      const check = validateWebpImageUrl(url);
                      const isNewUrl = !(initialProduct.images ?? []).includes(url);
                      return (
                        <div
                          key={`${url}-${idx}`}
                          className={`group relative flex items-center gap-2 p-2 rounded-lg border transition-colors active:translate-y-px ${
                            isCover
                              ? 'border-accent bg-accent/15/40'
                              : 'border-rule bg-paper-2'
                          }`}
                        >
                          <ProductImage
                            src={check.isSafeUrl ? url : ''}
                            alt={`Imagen ${idx + 1}`}
                            size="sm"
                            className="w-10 h-10 rounded shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-[11px] font-mono text-ink truncate"
                              title={url}
                            >
                              {url.split(/[?#]/)[0]?.split('/').pop() || url}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isCover ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-accent">
                                  <Check size={10} />
                                  Portada
                                </span>
                              ) : check.valid ? (
                                <button
                                  type="button"
                                  onClick={() => handleImageLinkChange(url)}
                                  className="text-[10px] font-medium text-ink-2 hover:text-accent underline underline-offset-2"
                                >
                                  Usar de portada
                                </button>
                              ) : (
                                <span className="text-[10px] text-accent">
                                  Legada
                                </span>
                              )}
                            </div>
                          </div>
                          {isNewUrl && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryUrl(url)}
                              title="Quitar URL agregada"
                              aria-label="Quitar URL de galería"
                              className="p-1 text-ink-2 hover:text-danger transition-colors active:translate-y-px shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="field-link" className={labelClass}>
                  URL de publicación o tienda (link) <span className="text-ink-2 font-normal">(opcional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="field-link"
                    type="text"
                    value={form.link}
                    onChange={(e) => updateField('link', e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className={inputClass}
                  />
                  {form.link.trim().startsWith('http') && (
                    <a
                      href={form.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 border border-rule rounded-lg text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px shrink-0"
                      title="Abrir enlace"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rule/80">
                <div>
                  <label htmlFor="field-video-url" className={labelClass}>
                    URL de video (video[0].url)
                  </label>
                  <input
                    id="field-video-url"
                    type="text"
                    value={form.video_url}
                    onChange={(e) => updateField('video_url', e.target.value)}
                    placeholder="https://.../producto.mp4"
                    className={inputClass}
                  />
                  <p className={hintClass}>Enlace directo al archivo (.mp4, .mov, .gif, etc.).</p>
                </div>

                <div>
                  <label htmlFor="field-video-tag" className={labelClass}>
                    Etiqueta de video (video[0].tag[0])
                  </label>
                  <input
                    id="field-video-tag"
                    type="text"
                    value={form.video_tag}
                    onChange={(e) => updateField('video_tag', e.target.value)}
                    placeholder="Ej. detalle tela, dorsal"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'logistica' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-google-cat" className={labelClass}>
                    Categoría de Google
                  </label>
                  <input
                    id="field-google-cat"
                    type="text"
                    list="google-cat-list"
                    value={form.google_product_category}
                    onChange={(e) =>
                      updateField('google_product_category', e.target.value)
                    }
                    placeholder={'Apparel & Accessories > Clothing'}
                    className={inputClass}
                  />
                  <datalist id="google-cat-list">
                    {GOOGLE_CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="field-fb-cat" className={labelClass}>
                    Categoría de Facebook
                  </label>
                  <input
                    id="field-fb-cat"
                    type="text"
                    list="fb-cat-list"
                    value={form.fb_product_category}
                    onChange={(e) =>
                      updateField('fb_product_category', e.target.value)
                    }
                    placeholder={'Clothing & Accessories > Clothing'}
                    className={inputClass}
                  />
                  <datalist id="fb-cat-list">
                    {FB_CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label htmlFor="field-tag-input" className={labelClass}>
                  Etiquetas de producto (product_tags)
                </label>
                <div className="flex gap-2">
                  <input
                    id="field-tag-input"
                    type="text"
                    maxLength={110}
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ej. futbolenlapieluy1, camiseta futbol"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
                  >
                    <Plus size={14} />
                    Agregar
                  </button>
                </div>
                {form.product_tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    {form.product_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-paper-3 text-ink rounded-md border border-rule/80"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-ink-2 hover:text-ink"
                          aria-label={`Quitar etiqueta ${tag}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className={hintClass}>
                  Las primeras dos etiquetas se exportan en <span className="font-mono">product_tags[0]</span> y <span className="font-mono">product_tags[1]</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-rule/80">
                <div className="sm:col-span-2">
                  <label htmlFor="field-shipping" className={labelClass}>
                    Detalles de envío (País:Región:Servicio:Precio)
                  </label>
                  <input
                    id="field-shipping"
                    type="text"
                    value={form.shipping}
                    onChange={(e) => updateField('shipping', e.target.value)}
                    placeholder="UY::Envío estándar:0.00 UYU"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>

                <div>
                  <label htmlFor="field-weight" className={labelClass}>
                    Peso de envío
                  </label>
                  <input
                    id="field-weight"
                    type="text"
                    value={form.shipping_weight}
                    onChange={(e) => updateField('shipping_weight', e.target.value)}
                    placeholder="Ej. 260 g"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rule/80">
                <div>
                  <label htmlFor="field-disclaimer" className={labelClass}>
                    Aviso legal de oferta (offer_disclaimer)
                  </label>
                  <input
                    id="field-disclaimer"
                    type="text"
                    value={form.offer_disclaimer}
                    onChange={(e) => updateField('offer_disclaimer', e.target.value)}
                    placeholder="Válido hasta agotar stock."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="field-disclaimer-url" className={labelClass}>
                    URL de términos legales
                  </label>
                  <input
                    id="field-disclaimer-url"
                    type="text"
                    value={form.offer_disclaimer_url}
                    onChange={(e) =>
                      updateField('offer_disclaimer_url', e.target.value)
                    }
                    placeholder="https://mitienda.com/terminos"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pie fijo con acciones */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-rule bg-paper-3">
          <span className="text-xs text-ink-2 truncate">
            {blockingErrors.length > 0
              ? 'Corregí el error marcado para guardar.'
              : 'Guardado flexible activo · Todos los campos son opcionales'}
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={blockingErrors.length > 0}
              className="px-4 py-2 text-sm font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            >
              {mode === 'create' ? 'Guardar producto' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
