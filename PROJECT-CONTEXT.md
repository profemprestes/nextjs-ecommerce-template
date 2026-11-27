# PROJECT-CONTEXT.md

## Project Name & Purpose
- **Fútbol en la Piel** (`nextjs-ecommerce-template`): E-commerce de camisetas de fútbol y catálogo administrativo para Uruguay.
- Storefront público en `/` (`BestSeller`), `/shop-with-sidebar`, `/shop-without-sidebar`, `/shop-details?slug=...` y `/productos/[identifier]`.
- Panel administrativo CRUD en `/admin`, `/mauricio` y APIs `/api/products/**`, `/api/images/**`.

## Tech Stack
- **Framework:** Next.js `16.4.6` (App Router + Turbopack) con React `19.3.1` y TypeScript.
- **Base de datos:** PostgreSQL (`pooled.db.prisma.io:5432`) mediante Prisma `7.10.1` (`@prisma/adapter-pg` + `pg.Pool` con `withDbRetry`).
- **Validación y UI:** Zod `4.6.7`, Tailwind CSS `4.3.5` (tokens semánticos Sport: `paper`, `paper-2`, `paper-3`, `ink`, `ink-2`, `accent`, `accent-ink`, `rule`, `focus`, `danger`), `lucide-react`.
- **IA:** Genkit (`genkit`, `@genkit-ai/google-genai`, `@genkit-ai/next`).

## Current Phase
- Esquema Prisma alineado (`Product` y `ProductImage`), catálogo sincronizado (`docs/catalogo.json`), storefront conectado a PostgreSQL con caché (`unstable_cache` + `invalidateCatalogCache()`), y CRUD administrativo rediseñado con Hallmark (`--scope app`).
- En curso: integración de asistente IA con Genkit para autocompletar campos desde la descripción y sugerir mejoras SEO por producto.

## Key Constraints
- **Human-in-the-loop:** La IA nunca escribe directo en Prisma ni sobrescribe campos curados o `slug` existentes sin aprobación explícita del editor en `ProductFormDrawer`.
- **Integridad de dominio:** Respetar validaciones Zod (`productInputSchema`), formatos de catálogo Meta/Google Shopping (`price` en UYU, `google_product_category`, `fb_product_category`) y slugs únicos.
- **Costo y rendimiento:** Ejecución bajo demanda en servidor (runtime Node.js, rate limiting, timeouts), sin bloquear el guardado manual del CRUD si el proveedor IA falla.
- **Entorno Windows:** Comandos Prisma/red y escrituras bloqueadas por sandbox requieren `BypassSandbox: true`; rutas con `[param]` deben tratarse de forma literal.

## Definition of Done
- `npx tsc --noEmit --incremental false` y `npm run build` pasan sin errores.
- Endpoints protegidos y validados con Zod, con fallback seguro si falta API key o falla el modelo.
- Revisión cruzada entre agentes (implementación + code/security/QA review) sin bloqueantes ni regresiones en `/admin` o storefront.
