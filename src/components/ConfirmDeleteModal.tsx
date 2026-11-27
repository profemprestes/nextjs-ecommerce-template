'use client';

import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  open: boolean;
  count: number;
  productTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  open,
  count,
  productTitle,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const isMultiple = count > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="w-full max-w-md bg-paper-2 border border-rule rounded-xl p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger border border-danger/25">
              <Trash2 size={18} />
            </div>
            <div>
              <h2
                id="confirm-delete-title"
                className="font-display text-base font-semibold text-ink"
              >
                {isMultiple
                  ? `Eliminar ${count} productos`
                  : 'Eliminar producto'}
              </h2>
              <p className="text-xs text-ink-2 mt-0.5">
                Esta baja quitará el registro del catálogo actual.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Cerrar diálogo"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-4 text-sm text-ink-2 leading-relaxed">
          {isMultiple ? (
            <>
              Vas a dar de baja <strong className="font-semibold text-ink tabular-nums">{count}</strong>{' '}
              artículos seleccionados. Podrás deshacer la acción inmediatamente desde la notificación inferior.
            </>
          ) : (
            <>
              ¿Confirmás la baja de{' '}
              <strong className="font-semibold text-ink">
                {productTitle?.trim() || 'este producto sin título'}
              </strong>
              ? Podrás deshacer esta baja inmediatamente después si fue un error.
            </>
          )}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-ink bg-paper-2 border border-rule rounded-lg hover:bg-paper-3 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-danger/90 transition-colors active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
          >
            {isMultiple ? `Eliminar (${count})` : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
