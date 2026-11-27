'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  LayoutDashboard,
  Sparkles,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface RoleEntryPageProps {
  totalProducts: number;
  inStockCount: number;
  totalImages: number;
}

export function RoleEntryPage({
  totalProducts,
  inStockCount,
  totalImages,
}: RoleEntryPageProps) {
  return (
    <div className="min-h-screen bg-[#F7F8F9] text-[#111315] flex flex-col">
      {/* Top Bar Contract: 3 zones */}
      <header className="h-16 bg-white border-b border-neutral-200 px-6 lg:px-10 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0"
        >
          FichaSport
        </Link>

        <nav
          aria-label="Accesos directos"
          className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-600"
        >
          <Link
            href="/mauricio"
            className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
          >
            Espacio Mauricio
          </Link>
          <Link
            href="/admin"
            className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
          >
            Panel Admin
          </Link>
        </nav>

        <div className="flex items-center shrink-0">
          <Link
            href="/mauricio"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
          >
            Carga rápida
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Centered Selection Area */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-5xl mx-auto px-6 py-12 lg:py-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium text-emerald-800 mb-2">
            Acceso al catálogo deportivo
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 text-balance">
            Elegí cómo querés ingresar
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-3 leading-relaxed">
            Ambos perfiles trabajan sobre el mismo catálogo en tiempo real. Elegí el modo simplificado de Mauricio o el panel completo de Administración.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Mauricio (Carga fácil en una sola ventana) */}
          <section
            className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
                  <UserCheck size={22} />
                </div>
                <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                  <Sparkles size={13} />
                  Carga simplificada
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Ingresar como Mauricio
              </h2>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Todo dentro de la misma ventana, sin pestañas ni configuraciones técnicas. Pensado para cargar y actualizar productos en segundos.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm text-neutral-700 border-t border-neutral-100 pt-5">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Precio regular y oferta en un solo bloque</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Stock y disponibilidad con botones rápidos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Talles, marca, color, estilo y detalles a la vista</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Subida de fotos y pegado de URL WebP directo</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/mauricio"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                Entrar como Mauricio
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Card 2: Admin (Vista completa actual) */}
          <section
            className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <ShieldCheck size={22} />
                </div>
                <span className="text-xs font-medium text-neutral-500 inline-flex items-center gap-1">
                  <LayoutDashboard size={13} />
                  Vista completa
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Ingresar como Admin
              </h2>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                El panel completo actual con tabla avanzada, directorio de marcas, grupos de variantes y herramientas de importación y exportación CSV.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm text-neutral-700 border-t border-neutral-100 pt-5">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-neutral-500 shrink-0 mt-0.5" />
                  <span>Vista de tabla, grilla y filtros avanzados</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-neutral-500 shrink-0 mt-0.5" />
                  <span>Importar y exportar catálogo Meta Commerce CSV</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-neutral-500 shrink-0 mt-0.5" />
                  <span>Carga masiva de imágenes y respaldo de catálogo</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-neutral-500 shrink-0 mt-0.5" />
                  <span>Edición completa de los 31 atributos del esquema</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/admin"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-neutral-900 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                Entrar como Admin
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>

        {/* Quiet unboxed catalog summary */}
        <div className="mt-10 pt-6 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono tabular-nums text-neutral-800 font-medium">
              {totalProducts}
            </span>
            <span>productos en catálogo</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-neutral-800 font-medium">
              {inStockCount}
            </span>
            <span>en stock</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-neutral-800 font-medium">
              {totalImages}
            </span>
            <span>imágenes registradas</span>
          </div>
          <span>Podés cambiar de perfil en cualquier momento desde la barra superior.</span>
        </div>
      </main>
    </div>
  );
}
