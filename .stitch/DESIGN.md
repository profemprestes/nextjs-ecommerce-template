---
name: Fútbol en la Piel
colors:
  background: '#0A1B33'
  on-background: '#F5EAD6'
  surface: '#0A1B33'
  surface-dim: '#070F1C'
  surface-bright: '#132C52'
  surface-container-lowest: '#070F1C'
  surface-container-low: '#0D203B'
  surface-container: '#102442'
  surface-container-high: '#132C52'
  surface-container-highest: '#1E5AA8'
  surface-variant: '#132C52'
  on-surface: '#F5EAD6'
  on-surface-variant: '#B8C7DC'
  inverse-surface: '#F5EAD6'
  inverse-on-surface: '#0A1B33'
  outline: '#8ECBF5'
  outline-variant: 'rgba(245, 234, 214, 0.18)'
  surface-tint: '#A8D6F0'
  primary: '#A8D6F0'
  on-primary: '#0A1B33'
  primary-container: '#132C52'
  on-primary-container: '#F5EAD6'
  inverse-primary: '#1E5AA8'
  secondary: '#132C52'
  on-secondary: '#F5EAD6'
  secondary-container: '#102442'
  on-secondary-container: '#B8C7DC'
  tertiary: '#1E5AA8'
  on-tertiary: '#F5EAD6'
  error: '#DC2626'
  on-error: '#F5EAD6'
typography:
  display-lg:
    fontFamily: Barlow Condensed
    fontSize: 78px
    fontWeight: '900'
    lineHeight: 70px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  brand-mark:
    fontFamily: Archivo Black
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  body-base:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-bold:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  stat-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.04em
rounded:
  sm: 0.375rem
  DEFAULT: 0.625rem
  md: 0.875rem
  lg: 1.375rem
  xl: 1.625rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 36px
---

# Design System: Fútbol en la Piel (@futbolenlapieluy1)

## 1. Visual Theme & Atmosphere

Extracted from `/src`, **Fútbol en la Piel** blends an editorial matchday-night showcase with a structured Uruguayan jersey catalog and WhatsApp inquiry workflow. The root canvas is grounded in deep nocturnal navy (**Midnight Field**, `#0A1B33`) with radial floodlight gradients and translucent frosted-navy glass panels (`rgba(10, 27, 51, 0.72)` with `backdrop-filter: blur(20px) saturate(1.35)`), alternating into warm parchment (**Warm Parchment**, `#F5EAD6`) for high-contrast editorial sections and footers.

Across secondary catalog and guide routes (`/shop-with-sidebar`, `/shop-without-sidebar`, `/checkout`, `/shop-details`), the system shifts into a clean, balanced storefront density (`5 / 10`) constrained to `1180px` (`max-w-[1400px]` ceiling), while the `/` flagship route uses high-variance (`8 / 10`) asymmetric editorial sections.

---

## 2. Color Palette & Roles

### Primary Foundation
- **Midnight Field** (`#0A1B33`) — Primary dark background (`--field`, `--background`) and ink on light parchment sections (`--ink`).
- **Deep Pitch Shadow** (`#070F1C`) — Deepest off-black vignette edge and elevated dark backdrop (replaces raw `#000000` per strict anti-pure-black calibration).
- **Elevated Pitch Navy** (`#102442`) — Primary card container fill (`--card`) across catalog and guide pages.
- **Floodlight Navy** (`#132C52`) — Radial spotlight center (`--field-hi`), secondary surface (`--secondary`), and muted pill backgrounds (`--muted`).
- **Deep Glass Overlay** (`rgba(10, 27, 51, 0.72)`) — Frosted glass panels (`.glass-panel`) with `1px` warm parchment hairlines and inset top highlights.
- **Warm Parchment** (`#F5EAD6`) — Primary light text (`--foreground`, `--ice`) on dark surfaces and alternating light section background.

### Accent & Interactive
- **Celeste Sky** (`#A8D6F0`) — Single primary accent (`--primary`, `--ember`) for primary CTA fills, active size/model rings, focus outlines, and price highlights.
- **Horizon Celeste** (`#8ECBF5`) — Secondary interactive outline (`--peri`, `--ring`) and subtle border tint (`rgba(142, 203, 245, 0.45)`).
- **Club Cobalt** (`#1E5AA8`) — Accent surface (`--azul`, `--accent`) and secondary interactive links on Warm Parchment (`#F5EAD6`) light chapters.

### Typography & Text Hierarchy
- **Parchment Ink** (`#F5EAD6`) — Primary headings, body copy, and active labels on dark navy surfaces.
- **Muted Slate Blue** (`#B8C7DC`) — Secondary descriptions, sizing notes, and quiet metadata (`--muted-foreground`).
- **Ink Navy** (`#0A1B33`) — Primary headings and body text on Warm Parchment (`#F5EAD6`) sections.

### Functional States
- **Whisper Border** (`rgba(245, 234, 214, 0.18)`) — Default 1px structural borders (`--border`) and section separators.
- **Input Hairline** (`rgba(245, 234, 214, 0.22)`) — Form field borders (`--input`) and glass panel edges.
- **Alert Crimson** (`#DC2626`) — Destructive and validation error state (`--destructive`), paired with inline `role="alert"` messages.

---

## 3. Typography Rules

- **Display (`Barlow Condensed`):** Weights `600`–`900`, tight tracking (`-0.025em` to `-0.03em`), line-height `0.88`–`1.08`.
- **Brand Wordmark (`Archivo Black`):** Weight `400`, uppercase, slight positive tracking (`0.02em`), used exclusively for `FUTBOL EN LA PIEL` navbar marks and compact headers.
- **Body (`Geist`):** Weight `400`–`600`, relaxed leading (`1.45`–`1.6`), minimum `16px` (`1rem`) for primary copy, constrained to `65ch` (`max-w-2xl`).
- **Monospace (`JetBrains Mono`):** Weights `400`, `500`, `700`, `letter-spacing: 0.04em` (`.font-mono-cl`), used for prices (`$ 1.690`, `$ 1.990`), size pills (`S`–`XL`), step indices (`01`–`04`), and inquiry codes.

---

## 4. Component Stylings

- **Buttons:** Full pill (`rounded-full`) for primary CTAs, filter chips, and navbar actions; `rounded-lg` (`0.5rem`) for compact UI controls. Primary buttons use **Celeste Sky** (`#A8D6F0`) with **Midnight Field** (`#0A1B33`) bold text, hovering to **Horizon Celeste** (`#8ECBF5`) with `-1px` lift.
- **Cards & Jersey Showcases:** **Elevated Pitch Navy** (`#102442`) fill, `rounded-xl` (`12px`), `1px` border (`rgba(245, 234, 214, 0.18)`), `4:3` jersey preview frames with **zero text or badges overlaid on photography**.
- **Navigation:** Floating centered pill navbar (`top: 12px`, `max-w-[1220px]`, `rounded-full`) with frosted glass (`backdrop-blur-[18px]`) and `2px` **Celeste Sky** scroll-progress underline.
- **Inputs & Forms:** Stacked labels, `h-12` (`48px`) height, `rounded-[14px]` corners, translucent dark fill (`rgba(7, 15, 28, 0.45)`), `1px` hairline border, and `3px` **Celeste Sky** focus ring.

---

## 5. Layout Principles

- **Containment:** `PageShell` constrains interior routes to `w-[min(1180px,calc(100%-32px))]` centered (`max-width: 1400px` ceiling).
- **Responsive Collapse:** Multi-column grids collapse to `grid-cols-1` below `768px` with `overflow-x: clip` and `>= 44px` tap targets.
