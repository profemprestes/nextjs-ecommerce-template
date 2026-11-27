'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  SearchCheck,
  Wand2,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import type { SportProduct } from '@/lib/catalog-schema';
import type {
  AssistantMode,
  AutofillSuggestions,
  ProductAssistantResult,
} from '@/lib/ai/product-assistant';

interface ProductAiAssistantPanelProps {
  form: SportProduct;
  existingSlugs?: string[];
  onApplyFields: (patch: Partial<SportProduct>) => void;
}

type AutofillFieldKey = keyof AutofillSuggestions;

const FIELD_LABELS: Record<AutofillFieldKey, string> = {
  title: 'Título',
  slug: 'Slug URL',
  brand: 'Marca',
  team: 'Equipo / Selección',
  season: 'Temporada',
  player_number: 'Jugador / Dorsal',
  category: 'Categoría tienda',
  kit_version: 'Versión',
  style: 'Estilo',
  color: 'Color',
  size: 'Talle',
  gender: 'Género',
  age_group: 'Grupo etario',
  material: 'Material',
  pattern: 'Trama / Diseño',
  condition: 'Condición',
  availability: 'Disponibilidad',
  google_product_category: 'Categoría Google',
  fb_product_category: 'Categoría Meta/FB',
  product_tags: 'Etiquetas',
};

function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return typeof value === 'string' ? value.trim() : '';
}

function getCurrentFieldValue(form: SportProduct, key: AutofillFieldKey): string {
  const val = form[key as keyof SportProduct];
  if (Array.isArray(val)) return val.join(', ');
  return typeof val === 'string' ? val.trim() : '';
}

function buildTypedPatch(
  keys: AutofillFieldKey[],
  autofill: AutofillSuggestions
): Partial<SportProduct> {
  const patch: Partial<SportProduct> = {};
  for (const key of keys) {
    switch (key) {
      case 'product_tags':
        patch.product_tags = autofill.product_tags;
        break;
      case 'availability':
        patch.availability = autofill.availability;
        break;
      case 'condition':
        patch.condition = autofill.condition;
        break;
      case 'gender':
        patch.gender = autofill.gender;
        break;
      case 'age_group':
        patch.age_group = autofill.age_group;
        break;
      default:
        patch[key] = autofill[key];
        break;
    }
  }
  return patch;
}

export function ProductAiAssistantPanel({
  form,
  existingSlugs = [],
  onApplyFields,
}: ProductAiAssistantPanelProps) {
  const [loadingMode, setLoadingMode] = useState<AssistantMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductAssistantResult | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<AutofillFieldKey>>(new Set());
  const [seoExpanded, setSeoExpanded] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const latestFormRef = useRef(form);
  latestFormRef.current = form;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const existingSlugSet = useMemo(
    () => new Set(existingSlugs.map((s) => s.trim().toLowerCase()).filter(Boolean)),
    [existingSlugs]
  );

  const combinedNonWhitespace = `${form.title} ${form.description}`
    .replace(/\s+/g, '')
    .trim().length;

  const diffRows = useMemo(() => {
    if (!result?.autofill) return [];
    const entries = Object.keys(FIELD_LABELS) as AutofillFieldKey[];
    return entries
      .map((key) => {
        const suggestedRaw = result.autofill![key];
        const suggestedText = formatFieldValue(suggestedRaw);
        const currentText = getCurrentFieldValue(form, key);
        const isEmpty = currentText === '';
        const isDifferent = suggestedText !== '' && suggestedText !== currentText;

        return {
          key,
          label: FIELD_LABELS[key],
          currentText,
          suggestedRaw,
          suggestedText,
          isEmpty,
          isDifferent,
        };
      })
      .filter((row) => row.isDifferent);
  }, [result, form]);

  const emptyDiffCount = useMemo(
    () => diffRows.filter((row) => row.isEmpty).length,
    [diffRows]
  );

  const activeSelectedKeys = useMemo(
    () => diffRows.filter((row) => selectedKeys.has(row.key)).map((row) => row.key),
    [diffRows, selectedKeys]
  );

  const runAssistant = async (mode: AssistantMode) => {
    setError(null);
    if (combinedNonWhitespace < 8) {
      setError(
        'Escribí al menos una breve descripción o título (8+ caracteres) antes de consultar a la IA.'
      );
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingMode(mode);

    try {
      const response = await fetch('/api/ai/product-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode,
          product: {
            title: form.title,
            description: form.description,
            slug: form.slug ?? '',
            brand: form.brand,
            team: form.team ?? '',
            season: form.season ?? '',
            player_number: form.player_number ?? '',
            category: form.category ?? '',
            kit_version: form.kit_version ?? '',
            style: form.style,
            color: form.color,
            size: form.size,
            gender: form.gender,
            age_group: form.age_group,
            material: form.material,
            pattern: form.pattern,
            price: form.price,
            condition: form.condition,
            availability: form.availability,
            google_product_category: form.google_product_category,
            fb_product_category: form.fb_product_category,
            product_tags: form.product_tags ?? [],
            has_image_link: Boolean(form.image_link?.trim()),
          },
        }),
      });

      const rawText = await response.text();
      let payload: Record<string, unknown> = {};
      try {
        payload = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const msg =
          typeof payload.error === 'string'
            ? payload.error
            : `El servidor respondió ${response.status}.`;
        setError(msg);
        return;
      }

      const typed = payload as ProductAssistantResult;
      const safeSeo =
        typed.seo && typeof typed.seo === 'object'
          ? {
              ...typed.seo,
              suggestedTags: Array.isArray(typed.seo.suggestedTags)
                ? typed.seo.suggestedTags.filter((t): t is string => typeof t === 'string')
                : [],
              improvements: Array.isArray(typed.seo.improvements)
                ? typed.seo.improvements
                : [],
            }
          : undefined;

      setResult({
        autofill: typed.autofill,
        seo: safeSeo,
      });

      if (typed.autofill) {
        const currentLatest = latestFormRef.current;
        const defaultSelected = new Set<AutofillFieldKey>();
        (Object.keys(FIELD_LABELS) as AutofillFieldKey[]).forEach((key) => {
          const current = getCurrentFieldValue(currentLatest, key);
          const suggested = formatFieldValue(typed.autofill![key]);
          if (current === '' && suggested !== '') {
            defaultSelected.add(key);
          }
        });
        setSelectedKeys(defaultSelected);
      }

      if (safeSeo) {
        setSeoExpanded(true);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Error de red al consultar el asistente IA. Podés seguir editando manualmente.');
    } finally {
      if (abortRef.current === controller) {
        setLoadingMode(null);
      }
    }
  };

  const toggleKey = (key: AutofillFieldKey) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applySelected = (onlyEmpty = false) => {
    if (!result?.autofill) return;
    const keysToApply = onlyEmpty
      ? diffRows.filter((row) => row.isEmpty).map((row) => row.key)
      : activeSelectedKeys;

    if (keysToApply.length === 0) return;

    const patch = buildTypedPatch(keysToApply, result.autofill);
    onApplyFields(patch);

    if (onlyEmpty) {
      const appliedSet = new Set(keysToApply);
      setSelectedKeys((prev) => {
        const next = new Set<AutofillFieldKey>();
        for (const k of prev) {
          if (!appliedSet.has(k)) next.add(k);
        }
        return next;
      });
    } else {
      setResult((prev) => (prev ? { ...prev, autofill: undefined } : null));
      setSelectedKeys(new Set());
    }
  };

  const handleMergeSeoTags = (tags: string[]) => {
    const existing = (form.product_tags ?? []).map((t) => t.trim()).filter(Boolean);
    const seen = new Set<string>();
    const prioritized: string[] = [];

    for (const tag of [...tags, ...existing]) {
      const clean = tag.trim().slice(0, 110);
      if (!clean) continue;
      const lower = clean.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      prioritized.push(clean);
      if (prioritized.length >= 50) break;
    }

    onApplyFields({ product_tags: prioritized });
  };

  const seoScore = result?.seo?.score;
  const scoreBadgeClass =
    seoScore === undefined
      ? ''
      : seoScore >= 80
        ? 'bg-accent/15 text-accent border-rule-2'
        : seoScore >= 55
          ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
          : 'bg-danger/15 text-danger border-danger/30';

  const seoSlugCollision = Boolean(
    result?.seo?.suggestedSlug &&
      existingSlugSet.has(result.seo.suggestedSlug.toLowerCase())
  );

  return (
    <div className="p-3.5 rounded-xl bg-paper-3 border border-rule space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={15} className="text-accent shrink-0" />
          <div>
            <p className="text-xs font-semibold text-ink">
              Asistente IA para catálogo y SEO
            </p>
            <p className="text-[11px] text-ink-2">
              Autocompleta campos desde la descripción y sugiere mejoras SEO antes de guardar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={loadingMode !== null}
            onClick={() => runAssistant('autofill')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper transition-colors disabled:opacity-50"
          >
            {loadingMode === 'autofill' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Wand2 size={13} />
            )}
            Autocompletar
          </button>

          <button
            type="button"
            disabled={loadingMode !== null}
            onClick={() => runAssistant('seo')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper transition-colors disabled:opacity-50"
          >
            {loadingMode === 'seo' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <SearchCheck size={13} />
            )}
            Auditar SEO
          </button>

          <button
            type="button"
            disabled={loadingMode !== null}
            onClick={() => runAssistant('both')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-accent-ink bg-accent rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-50"
          >
            {loadingMode === 'both' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            Completar + SEO
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-danger/15 border border-danger/30 text-xs text-danger">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result?.autofill && (
        <div className="rounded-lg bg-paper-2 border border-rule p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-ink">
              Campos sugeridos ({diffRows.length} cambios detectados)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={emptyDiffCount === 0}
                onClick={() => applySelected(true)}
                className="px-2.5 py-1 text-[11px] font-medium text-ink bg-paper-3 border border-rule rounded-md hover:bg-paper disabled:opacity-50 transition-colors"
              >
                Solo vacíos ({emptyDiffCount})
              </button>
              <button
                type="button"
                disabled={activeSelectedKeys.length === 0}
                onClick={() => applySelected(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-accent-ink bg-accent rounded-md hover:bg-accent-deep disabled:opacity-50 transition-colors"
              >
                <Check size={12} />
                Aplicar ({activeSelectedKeys.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult((prev) => (prev ? { ...prev, autofill: undefined } : null));
                  setSelectedKeys(new Set());
                }}
                title="Descartar sugerencias"
                className="p-1 text-ink-2 hover:text-ink rounded"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {diffRows.length === 0 ? (
            <p className="text-xs text-ink-2">
              Todos los campos detectados ya coinciden con los valores actuales.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto divide-y divide-rule/70 border border-rule rounded-md">
              {diffRows.map((row) => {
                const checked = selectedKeys.has(row.key);
                const hasSlugCollision =
                  row.key === 'slug' &&
                  existingSlugSet.has(row.suggestedText.toLowerCase());
                return (
                  <label
                    key={row.key}
                    className="flex items-start gap-2.5 px-2.5 py-2 text-xs hover:bg-paper-3/60 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleKey(row.key)}
                      className="mt-0.5 accent-emerald-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-ink">{row.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border ${
                            row.isEmpty
                              ? 'bg-accent/10 text-accent border-rule-2'
                              : 'bg-paper-3 text-ink-2 border-rule'
                          }`}
                        >
                          {row.isEmpty ? 'vacío' : 'ya cargado'}
                        </span>
                        {hasSlugCollision && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-danger/15 text-danger border border-danger/30">
                            <AlertTriangle size={10} />
                            Slug ya existe
                          </span>
                        )}
                      </div>
                      {!row.isEmpty && (
                        <p className="text-[11px] text-ink-2 line-through truncate">
                          {row.currentText}
                        </p>
                      )}
                      <p className="text-[11px] text-ink break-words">
                        {row.suggestedText}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {result?.seo && (
        <div className="rounded-lg bg-paper-2 border border-rule p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink">Diagnóstico SEO</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full border ${scoreBadgeClass}`}
              >
                {result.seo.score}/100
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSeoExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] text-ink-2 hover:text-ink"
            >
              {seoExpanded ? 'Ocultar' : 'Ver detalle'}
              {seoExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          <p className="text-xs text-ink-2 leading-relaxed">{result.seo.summary}</p>

          {seoExpanded && (
            <div className="space-y-3">
              {/* Vista previa SERP Google */}
              {(result.seo.suggestedMetaTitle || result.seo.suggestedMetaDescription) && (
                <div className="p-2.5 rounded-md bg-paper-3 border border-rule space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-ink-2">
                    Vista previa en Google (SERP)
                  </p>
                  <p className="text-xs font-semibold text-accent truncate">
                    {result.seo.suggestedMetaTitle || result.seo.suggestedTitle}
                  </p>
                  <p className="text-[11px] font-mono text-ink-2 truncate">
                    futbolenlapiel.uy/shop-details?slug=
                    {result.seo.suggestedSlug || form.slug || 'producto'}
                  </p>
                  <p className="text-[11px] text-ink-2 leading-snug">
                    {result.seo.suggestedMetaDescription}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {result.seo.suggestedTitle &&
                  result.seo.suggestedTitle !== form.title.trim() && (
                    <div className="p-2.5 rounded-md bg-paper-3 border border-rule flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-ink">Título SEO sugerido</p>
                        <p className="text-xs text-ink-2 break-words">
                          {result.seo.suggestedTitle}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onApplyFields({ title: result.seo!.suggestedTitle })
                        }
                        className="px-2 py-1 text-[11px] font-medium text-accent-ink bg-accent rounded hover:bg-accent-deep shrink-0"
                      >
                        Usar título
                      </button>
                    </div>
                  )}

                {result.seo.suggestedSlug &&
                  result.seo.suggestedSlug !== (form.slug ?? '').trim() && (
                    <div className="p-2.5 rounded-md bg-paper-3 border border-rule flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-medium text-ink">Slug URL sugerido</p>
                          {seoSlugCollision && (
                            <span className="text-[10px] px-1.5 rounded bg-danger/15 text-danger border border-danger/30">
                              Colisión detectada
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-ink-2 break-all">
                          /shop-details?slug={result.seo.suggestedSlug}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onApplyFields({ slug: result.seo!.suggestedSlug })
                        }
                        className="px-2 py-1 text-[11px] font-medium text-accent-ink bg-accent rounded hover:bg-accent-deep shrink-0"
                      >
                        Usar slug
                      </button>
                    </div>
                  )}

                {result.seo.suggestedDescription &&
                  result.seo.suggestedDescription !== form.description.trim() && (
                    <div className="p-2.5 rounded-md bg-paper-3 border border-rule space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium text-ink">
                          Descripción SEO optimizada
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            onApplyFields({
                              description: result.seo!.suggestedDescription,
                            })
                          }
                          className="px-2 py-1 text-[11px] font-medium text-accent-ink bg-accent rounded hover:bg-accent-deep shrink-0"
                        >
                          Usar descripción
                        </button>
                      </div>
                      <p className="text-xs text-ink-2 leading-relaxed">
                        {result.seo.suggestedDescription}
                      </p>
                    </div>
                  )}

                {result.seo.suggestedTags.length > 0 && (
                  <div className="p-2.5 rounded-md bg-paper-3 border border-rule space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-medium text-ink flex items-center gap-1">
                        <Tag size={12} />
                        Etiquetas SEO recomendadas
                      </p>
                      <button
                        type="button"
                        onClick={() => handleMergeSeoTags(result.seo!.suggestedTags)}
                        className="px-2 py-1 text-[11px] font-medium text-ink bg-paper-2 border border-rule rounded hover:bg-paper shrink-0"
                      >
                        Priorizar etiquetas
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.seo.suggestedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[11px] rounded-full bg-paper-2 border border-rule text-ink-2"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {result.seo.improvements.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-ink">
                    Recomendaciones accionables
                  </p>
                  <ul className="space-y-1.5">
                    {result.seo.improvements.map((item, idx) => (
                      <li
                        key={`${item.field}-${idx}`}
                        className="p-2 rounded-md border border-rule bg-paper-3/60 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.2 rounded font-medium uppercase text-[10px] ${
                              item.priority === 'high'
                                ? 'bg-danger/15 text-danger'
                                : item.priority === 'medium'
                                  ? 'bg-amber-500/15 text-amber-700'
                                  : 'bg-paper-2 text-ink-2'
                            }`}
                          >
                            {item.priority === 'high'
                              ? 'Alta'
                              : item.priority === 'medium'
                                ? 'Media'
                                : 'Baja'}
                          </span>
                          <span className="font-mono text-ink-2">{item.field}</span>
                          <span className="font-medium text-ink">{item.issue}</span>
                        </div>
                        <p className="text-ink-2">{item.recommendation}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
