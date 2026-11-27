'use client';

import React, { useEffect } from 'react';
import {
  X,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Info,
} from 'lucide-react';
import {
  AGE_GROUP_LABELS,
  AVAILABILITY_LABELS,
  CONDITION_LABELS,
  GENDER_LABELS,
  SportProduct,
  getCatalogCoverage,
} from '@/lib/catalog-schema';
import { ProductImage } from './ProductImage';

interface ProductDetailDrawerProps {
  product: SportProduct | null;
  onClose: () => void;
  onEdit: (product: SportProduct) => void;
  onDuplicate: (product: SportProduct) => void;
  onDelete: (product: SportProduct) => void;
}

export function ProductDetailDrawer({
  product,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductDetailDrawerProps) {
  const [copiedSku, setCopiedSku] = React.useState(false);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const coverage = getCatalogCoverage(product);

  const handleCopySku = () => {
    navigator.clipboard?.writeText(product.id);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 1600);
  };

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
    {
      label: 'Disponibilidad',
      value: AVAILABILITY_LABELS[product.availability],
    },
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
    {
      label: 'Aviso legal',
      value: product.offer_disclaimer || '—',
    },
    {
      label: 'Video URL',
      value: product.video_url || '—',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-drawer-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 flex flex-col w-full max-w-xl h-full bg-paper-2 border-l border-rule shadow-2xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs text-ink-2 truncate">
              {product.id}
            </span>
            <button
              type="button"
              onClick={handleCopySku}
              className="p-1 rounded text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px"
              title="Copiar SKU"
            >
              {copiedSku ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px"
            aria-label="Cerrar ficha"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <ProductImage
              src={product.image_link}
              alt={product.title || product.id}
              brand={product.brand}
              size="lg"
              className="w-36 h-36 rounded-lg shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-ink-2">
                <span>{product.brand || 'Marca sin definir'}</span>
                <span aria-hidden="true">·</span>
                <span>{CONDITION_LABELS[product.condition]}</span>
                {product.style && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{product.style}</span>
                  </>
                )}
              </div>
              <h2
                id="detail-drawer-title"
                className="mt-1 font-display text-lg font-semibold text-ink leading-snug"
              >
                {product.title || 'Producto sin título'}
              </h2>
              <div className="mt-3 flex items-baseline gap-3">
                {product.sale_price ? (
                  <>
                    <span className="font-mono text-lg font-semibold text-accent tabular-nums">
                      {product.sale_price}
                    </span>
                    {product.price && (
                      <span className="font-mono text-sm text-ink-2 line-through tabular-nums">
                        {product.price}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-mono text-base font-medium text-ink tabular-nums">
                    {product.price || 'Consultar precio'}
                  </span>
                )}
              </div>
              {/^https?:\/\//i.test(product.link.trim()) && (
                <a
                  href={product.link.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent hover:underline"
                >
                  Abrir publicación externa
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {product.description && (
            <div className="pt-4 border-t border-rule/80">
              <h3 className="text-xs font-semibold text-ink mb-1.5">
                Descripción
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.product_tags.length > 0 && (
            <div className="pt-4 border-t border-rule/80">
              <h3 className="text-xs font-semibold text-ink mb-1.5">
                Etiquetas de catálogo
              </h3>
              <p className="text-sm text-ink-2">
                {product.product_tags.join(' · ')}
              </p>
            </div>
          )}

          {product.images && product.images.length > 1 && (
            <div className="pt-4 border-t border-rule/80">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-ink">
                  Galería ordenada
                </h3>
                <span className="font-mono text-[11px] tabular-nums text-ink-2">
                  {product.images.length} imágenes
                </span>
              </div>
              <ol className="space-y-1 max-h-40 overflow-y-auto pr-1 text-[11px] font-mono text-ink-2">
                {product.images.map((url, idx) => (
                  <li key={url} className="flex items-center gap-2 truncate">
                    <span className="text-ink-2 tabular-nums w-5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{url}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-sans font-medium text-accent shrink-0">
                        Portada
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Cobertura informativa Meta CSV */}
          <div className="p-3.5 rounded-lg bg-paper-3 border border-rule/80 flex items-start gap-2.5">
            <Info size={15} className="text-ink-2 shrink-0 mt-0.5" />
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

          {/* Ficha técnica tabular */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-ink mb-2">
              Atributos completos
            </h3>
            <dl className="divide-y divide-rule border-t border-b border-rule/80">
              {specs.map((item) => (
                <div
                  key={item.label}
                  className="py-2.5 grid grid-cols-12 gap-3 text-xs"
                >
                  <dt className="col-span-5 text-ink-2">{item.label}</dt>
                  <dd
                    className={`col-span-7 text-ink break-words ${
                      item.mono ? 'font-mono tabular-nums' : ''
                    }`}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-rule bg-paper-3">
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-danger bg-paper-2 border border-danger/30 rounded-lg hover:bg-danger/15 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(product)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Copy size={14} />
              Duplicar
            </button>
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors active:translate-y-px whitespace-nowrap shrink-0"
            >
              <Pencil size={14} />
              Editar ficha
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
