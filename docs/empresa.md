# Fútbol en la Piel — Dossier Completo de Empresa y Guía de Adaptación

> **Propósito del documento:** Fuente única de verdad comercial, operativa, visual y técnica de **Fútbol en la Piel** (`@futbolenlapieluy1`) para que cualquier agente o desarrollador pueda adaptar otro proyecto o repositorio con los datos reales de la marca sin inventar información.

---

## 1. Identidad de marca y contacto

| Campo | Valor verificado |
| --- | --- |
| **Nombre comercial** | Fútbol en la Piel |
| **Lema / Tagline** | La pasión se lleva puesta. |
| **País / Mercado** | Uruguay (cobertura en los 19 departamentos) |
| **Instagram (canal principal)** | `@futbolenlapieluy1` (`https://www.instagram.com/futbolenlapieluy1/`) |
| **WhatsApp comercial** | `+598 99 760 998` (`https://wa.me/59899760998`) |
| **Dominio web configurado** | `https://futbolenlapiel.uy` (`NEXT_PUBLIC_SITE_URL`) |
| **Idioma y tono** | Español rioplatense con voseo uruguayo (*Elegí, Consultá, Pedí, Deslizá*) |

### Activos de marca (Logos)
- **Logo horizontal:** `/logos/futbolenlapiel_horizontal_transparente.png`
- **Emblema circular:** `/logos/futbol_logo_mejorado_v2.png`
- **Emblema SVG (uso 3D):** `https://ynqvddgxxtmflpouursq.supabase.co/storage/v1/object/public/marifertiendauy/futbol_logo_mejorado_v2.svg`
- **Favicons / Manifest:** `/favicon-16x16.png`, `/favicon-32x32.png`, `/apple-touch-icon.png`, `/site.webmanifest`

---

## 2. Modelo de negocio y flujo de venta

**Fútbol en la Piel** comercializa indumentaria deportiva de fútbol y básquetbol (camisetas, shorts y remeras) en Uruguay bajo un modelo **conversacional asistido por WhatsApp**:

1. **Sin checkout ni cobro automático en la web:** La tienda web funciona como vidriera y preparador de consultas. Nada en el sitio cobra ni reserva stock de forma automática.
2. **Dos modalidades de disponibilidad:**
   - **Entrega inmediata (stock en Uruguay):** Habitualmente en talles **S a XL** en modelos seleccionados.
   - **Por encargo:** Se consiguen **todos los talles** y modelos puntuales que no figuren en stock inmediato (clubes, selecciones o retros específicas).
3. **Flujo de compra en 3 pasos:**
   - **Paso 1:** El cliente explora el catálogo y define modelo, versión (`Jugador`, `Fan` o `Retro`) y talle.
   - **Paso 2:** Envía la consulta prearmada por WhatsApp con un código identificador (`FEP-XXXX`). El equipo confirma disponibilidad inmediata (o plazo de ingreso) y precio final.
   - **Paso 3:** Se acuerda el medio de pago y la entrega en Montevideo o el despacho por agencia al Interior.

---

## 3. Catálogo, versiones y precios de referencia

### Versiones trabajadas
- **Versión Jugador:** Calidad muy alta, corte entallado (*slim fit* en pecho y cintura), tela técnica respirable y liviana, escudo y marca termosellados. *Recomendación:* si el cliente duda entre dos talles o la prefiere holgada, pedir un talle más.
- **Versión Fan:** Calce clásico (*regular fit*, igual a una remera habitual), tela resistente para uso urbano/estadio y escudo/logos bordados.
- **Edición Retro:** Clásicos históricos (`1988–2018`) con etiquetas y dorsales icónicos.
- **A confirmar según stock:** Opción abierta en formularios cuando el cliente prioriza disponibilidad.

> **Transparencia de calidad (FAQ oficial):** En Versión Jugador no son prendas originales de tienda oficial, sino confecciones de calidad muy alta con telas técnicas, escudos y detalles fieles.

### Precios de referencia (UYU — Pesos Uruguayos)
> Nota: Los precios exactos varían según modelo y temporada y se confirman por WhatsApp. Los valores de referencia publicados son:

| Versión / Categoría | Precio de referencia |
| --- | --- |
| **Versión Fan** | `Desde $ 1.690` |
| **Edición Retro** | `Desde $ 1.890` |
| **Versión Jugador** | `Desde $ 1.990` |

### Categorías del catálogo
1. **`actuales` — Actuales & Mundial 2026:** Selecciones y camisetas de la temporada vigente (ej.: Noruega Haaland #9, Argentina Messi #10, España Yamal #19, Alemania 2024/2026, Uruguay 2026).
2. **`retros` — Retros (1988–2018):** Ediciones de colección con dorsales históricos (ej.: Manchester United 1996 Cantona #7, Manchester United 1993–95 negra, España 1996 Luis Enrique #21, Italia 1994 Baggio #10, Real Madrid 2003 Ronaldo #9, Barcelona 2009/2011, Brasil 1994 Romário #11, Peñarol 1998 Parmalat).
3. **`uruguay` — La Celeste y clubes uruguayos:** Uruguay 2026 Mundial (Titular y Alternativa), Peñarol (2026 Aniversario / Local y 1998 Retro), Nacional (2026 Local blanca y Golero bordó).
4. **`clubes` — Clubes y Basket:** Clubes uruguayos, sudamericanos y europeos (Peñarol, Nacional, Boca Juniors fútbol y basket, Real Madrid Valverde #8, Liverpool, Como 1907, Arsenal, etc.).

### Modelos insignia y fotografías reales disponibles
El repositorio cuenta con **48 productos reales** catalogados en `docs/catalogo_instagram_futbolenlapiel.csv` (con `price` vacío para confirmar por WhatsApp) y **8 fotografías reales locales** en `public/camisetas/`:
- `/camisetas/uruguay-away-2026-nike-jugador.jpeg`
- `/camisetas/noruega.jpeg`
- `/camisetas/como.jpeg`
- `/camisetas/manchest3er_united.jpeg`
- `/camisetas/manchester-united-away-1993-1995-umbro.jpeg`
- `/camisetas/nacional-home-2026-umbro-blanca.jpeg`
- `/camisetas/nacional-golero-2026-umbro-bordo.jpeg`
- `/camisetas/boca-juniors-home-2026-2027-adidas.jpeg`

---

## 4. Guía de talles y política de cambios

### Tabla de talles orientativa (medidas en plano, S a XL)

| Talle | Ancho (axila a axila) | Largo aproximado | Altura orientativa |
| --- | --- | --- | --- |
| **S** | `48–50 cm` | `70–72 cm` | `1.65–1.73 m` |
| **M** | `51–53 cm` | `72–74 cm` | `1.73–1.80 m` |
| **L** | `54–56 cm` | `75–77 cm` | `1.80–1.86 m` |
| **XL** | `57–59 cm` | `77–79 cm` | `1.86+ m` |

*(Por encargo se trabajan todos los talles fuera del rango S–XL. También se ofrecen medidas exactas de cada prenda puntual por WhatsApp).*

### Política de cambios y respaldo
- Sujeto a disponibilidad de talle en stock.
- La prenda debe estar **sin uso, sin lavar y con su etiqueta original intacta**.
- El costo de envío por cambio corre por cuenta del comprador, **salvo falla o error de talle/modelo atribuible a Fútbol en la Piel** (en ese caso se cambia sin costo de envío).
- **Excepción:** Las camisetas personalizadas con nombre y número a pedido no tienen cambio por talle.

---

## 5. Logística, cobertura y medios de pago

### Medios de pago aceptados
1. **Transferencia bancaria**
2. **Mercado Pago**
3. **Efectivo** (a coordinar según entrega)

> Primero se confirma stock y talle por WhatsApp; recién después se coordina el pago. También se consultan promociones vigentes por ese medio.

### Zonas de entrega y agencias
- **Montevideo:** Entrega o retiro a coordinar; envíos por cadetería o agencia.
- **Interior (19 departamentos):** Despachos por agencias conocidas (**DAC**, **Mirtrans**, **Correo Uruguayo**). Se comparte el número de seguimiento / comprobante apenas sale el paquete.
- **Departamentos cubiertos:** Montevideo, Canelones, Maldonado, Salto, Paysandú, Rivera, Colonia, Rocha, San José, Tacuarembó, Cerro Largo, Soriano, Artigas, Durazno, Florida, Lavalleja, Río Negro, Treinta y Tres, Flores.

---

## 6. Identidad visual y sistema de diseño (`src/app/css/style.css`)

Este proyecto utiliza la paleta clara y el sistema de tokens definido en `@theme` dentro de `src/app/css/style.css` (Tailwind CSS v4). Al adaptar los componentes de `src/`, se debe respetar esta paleta y tipografía:

### Paleta de colores (`@theme` en `src/app/css/style.css`)
| Rol | Token CSS | Valor | Uso |
| --- | --- | --- | --- |
| Fondo principal claro | `--color-white` | `#ffffff` | Superficie base, tarjetas, header y modales |
| Superficie sutil / secciones | `--color-meta` / `--color-gray-1` / `--color-gray-2` | `#f7f9fc` / `#f9fafb` / `#f3f4f6` | Fondos alternos, inputs, contenedores de producto y badges suaves |
| Bordes y divisores | `--color-gray-3` / `--color-gray-4` | `#e5e7eb` / `#d1d5db` | Bordes `1px`, separadores y líneas de tablas |
| Texto principal / títulos | `--color-dark` | `#1c274c` | Encabezados, títulos de producto y botones oscuros |
| Texto secundario / cuerpo | `--color-dark-2` / `--color-dark-3` / `--color-body` | `#495270` / `#606882` / `#6c6f93` | Descripciones, párrafos, etiquetas y metadatos |
| Acento primario | `--color-blue` | `#3c50e0` | CTAs primarios, enlaces activos, foco (`--shadow-input`) y precios destacados |
| Acento primario hover / claro | `--color-blue-dark` / `--color-blue-light` / `--color-blue-light-5` | `#1c3fb7` / `#5475e5` / `#e1e8ff` | Hover de botones, estados activos y fondos de badges informativos |
| Éxito / disponibilidad | `--color-green` / `--color-green-light-6` | `#22ad5c` / `#daf8e6` | Indicadores de stock inmediato y confirmaciones |
| Alerta / descuento / error | `--color-red` / `--color-red-light-6` | `#f23030` / `#fef3f3` | Etiquetas de oferta, errores de formulario y alertas |
| Advertencia / estrellas | `--color-yellow` / `--color-orange` | `#fbbf24` / `#f27430` | Valoraciones, avisos y etiquetas destacadas |
| Acento secundario | `--color-teal` | `#02aaa4` | Insignias o estados complementarios |

### Tipografía (`src/app/css/euclid-circular-a-font.css`)
- **Fuente principal:** `Euclid Circular A` (`--font-euclid-circular-a`), aplicada globalmente en `body` (`font-euclid-circular-a font-normal text-base text-dark-3`).
- **Pesos disponibles en `src/app/fonts/`:** Light (`300`), Regular (`400`), Medium (`500`), SemiBold (`600`) y Bold (`700`), con sus variantes `Italic`.
- **Escala tipográfica en `@theme`:** Headings desde `--text-heading-1` (`60px/72px`) hasta `--text-heading-6` (`24px/30px`) y tamaños utilitarios `--text-custom-xs` (`12px`) a `--text-custom-4xl` (`36px`).

---

## 7. Especificación técnica para adaptar este proyecto (`src/`)

### Formato del enlace y mensaje de WhatsApp
Al enviar una consulta desde el carrito, checkout o formulario de contacto, construir la URL `https://wa.me/59899760998?text=<encodeURIComponent(mensaje)>` con el siguiente formato estándar:

```text
Hola Fútbol en la Piel! Consulta FEP-XXXX:
• Nombre: <nombre>
• Camiseta: <modelo>
• Versión: <versión>
• Talle: <talle>
• Entrega: <Envío a [departamento] | Coordinar entrega ([departamento])>
Quedo atento para confirmar stock, precio y envío.
```

### Generación del código de consulta (`FEP-XXXX`)
Identificador determinístico de 4 dígitos (ej. `FEP-4821`) generado a partir de un hash simple de la consulta (`nombre + camiseta + talle + departamento`). **Importante:** aclararle siempre al usuario que es un identificador de consulta y no un número de pedido confirmado ni reserva de stock.

### Mapa de rutas reales en `src/app/(site)/`
| Ruta actual | Propósito en el template | Adaptación para Fútbol en la Piel |
| --- | --- | --- |
| `/` | Portada (`Hero`, `Categories`, `NewArrivals`, `PromoBanner`, `BestSeller`, `Countdown`, `Testimonials`, `Newsletter`) | Reemplazar electrónica demo por camisetas destacadas, categorías (`actuales`, `retros`, `uruguay`, `clubes`) y testimonios reales o removidos si no hay verificados |
| `/shop-with-sidebar` y `/shop-without-sidebar` | Catálogo con filtros (categoría, talle, color, precio, género) | Cargar los productos de `docs/catalogo_instagram_futbolenlapiel.csv` y adaptar filtros a Versión (`Jugador`, `Fan`, `Retro`), Talles (`S`–`XL` + por encargo) y Categoría |
| `/shop-details` | Ficha individual de producto | Mostrar versión, guía de talles (`S`–`XL`), precios de referencia (`Desde $ 1.690`–`$ 1.990`) y botón directo de consulta por WhatsApp |
| `/cart` y `/checkout` | Carrito Redux y formulario de checkout | Mantener el carrito como **armador de consulta** y adaptar `/checkout` para generar el resumen `FEP-XXXX` y abrir WhatsApp **sin cobro automático** |
| `/wishlist` | Lista de favoritos | Conservar para guardar camisetas de interés antes de consultar |
| `/contact` | Página de contacto | Conectar con WhatsApp (`+598 99 760 998`), Instagram (`@futbolenlapieluy1`) y cobertura en los 19 departamentos |
| `/signin`, `/signup`, `/my-account`, `/blogs/*` | Cuenta de usuario y blog | Opcionales; ocultar del menú principal si no se usan en la primera etapa o adaptar `/blogs/*` a guías (talles, envíos, cómo pedir) |
| `/error` y `/mail-success` | Páginas de error y confirmación | Traducir al español rioplatense manteniendo la estética del template |

### Archivos clave de `src/` a adaptar
| Archivo / Directorio | Qué contiene hoy | Qué adaptar |
| --- | --- | --- |
| `src/app/(site)/layout.tsx` | `<html lang="en">` y layout global | Cambiar `lang="es-UY"` y verificar metadata/favicons |
| `src/app/(site)/page.tsx` | Metadata genérica `NextCommerce` | Actualizar `title` y `description` a Fútbol en la Piel |
| `src/components/Header/index.tsx` y `menuData.ts` | Logo demo, menú en inglés y buscador | Usar `/logos/futbolenlapiel_horizontal_transparente.png`, menú en español y links al catálogo/contacto |
| `src/components/Footer/index.tsx` | Dirección de Las Vegas, teléfono y links demo | Reemplazar por datos reales de Uruguay (Montevideo + 19 departamentos), WhatsApp e Instagram |
| `src/components/Shop/shopData.ts` | Productos demo de electrónica | Reemplazar por el catálogo de camisetas (`public/camisetas/` + CSV) |
| `src/components/Home/Categories/categoryData.ts` | Categorías demo (`Televisions`, `Laptop & PC`, etc.) | Adaptar a `Actuales & Mundial 2026`, `Retros (1988–2018)`, `La Celeste y clubes uruguayos`, `Clubes y Basket` |
| `src/components/Common/CartSidebarModal/` y `src/components/Checkout/` | Flujo de compra estándar | Convertir el CTA final en envío de consulta prearmada `FEP-XXXX` por WhatsApp |

---

## 8. Límites de información (Qué NO está definido en este repositorio)

Para evitar alucinaciones o datos inventados al adaptar otro proyecto, los siguientes datos **no existen** en el código actual y deben consultarse al dueño si se necesitan:
- Razón social, RUT, dirección física exacta de retiro o barrio específico en Montevideo.
- Horarios exactos de atención al cliente.
- Precios unitarios fijos por SKU (en `docs/catalogo_instagram_futbolenlapiel.csv` la columna `price` está vacía; solo existen los pisos de `PRICE_REFERENCES`).
- Plazos exactos en días hábiles para pedidos por encargo o montos de seña.
- Métricas de ventas, cantidad de clientes, reseñas o testimonios (no inventar ninguno).
