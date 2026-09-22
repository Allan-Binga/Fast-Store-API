---
name: FastStore Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-card:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  price-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  price-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a modern, approachable, and frictionless retail experience. It targets everyday digital shoppers who prioritize speed, transparent pricing, visual clarity, and effortless navigation over loud promotional noise.

### Design Principles
- **Clarity Over Clutter:** Interfaces eliminate high-pressure badges, blinking banners, and jarring discount markers in favor of whitespace, high-fidelity product imagery, and calm, confident hierarchy.
- **Trustworthy Utility:** Interactions emphasize instant visual feedback, reliable structural cues, and legible typography to ensure transparency at every stage of the funnel.
- **Approachable Modernism:** A hybrid of modern corporate utility and humanized warmth, utilizing soft rounded geometries, delicate hair-line framing, and crisp content delineation.

## Colors

The palette is engineered around high legibility, clean retail presentation, and intentional action triggers.

### Roles & Application
- **Primary (`#2563eb`) & Interactive Secondary (`#1d4ed8`):** Serves as the navigational spine and commitment driver. Applied exclusively to primary calls-to-action (Add to Cart, Checkout, Step Progression), active tab indicators, and interactive links.
- **Rating Gold (`#f59e0b`):** Dedicated exclusively to social proof, star ratings, and review statistics. It remains isolated from marketing alerts to preserve its credibility.
- **Surface Neutrals:**
  - Canvas Base: `#ffffff`
  - Sub-surface / Surface Containers: `#f8fafc` for alternating module bands, search overlays, and item backdrops; `#f1f5f9` for image placeholders, disabled states, and table headers.
- **Structural Borders (`#e2e8f0`):** Fine 1px dividers defining cards, input perimeters, and layout sections without adding visual weight.
- **Typography Neutrals:**
  - High Emphasis: Slate 900 (`#0f172a`) for titles, headlines, prices, and high-priority copy.
  - Medium Emphasis: Slate 700 (`#334155`) for body text, descriptions, and active filters.
  - Subtle / Meta: Slate 500 (`#64748b`) for secondary attributes, breadcrumbs, and SKU tags.

## Typography

The type scale balances approachable geometric headlines with an ultra-neutral, legible body engine.

- **Plus Jakarta Sans** provides a warm, modern, and open geometry for store banners, category headings, and price callouts.
- **Inter** ensures crisp rendering across product specifications, reviews, metadata, and form interactions, maintaining clarity even at small scale.
- Numeric figures in product grids, inventories, and cart totals use proportional lining settings (`tnum` / tabular numerals where applicable) for vertical decimal alignment.

## Layout & Spacing

The layout is built on a responsive 12-column grid system paired with strict 8pt component rhythm (with 4pt micro-steps).

### Responsive Grid Model
- **Desktop (>= 1280px):** 12 columns, max-width `1280px`, `2rem` margins, `1.5rem` gutters. Product grids display 4 items per row.
- **Tablet (768px - 1279px):** 8 columns, fluid width, `1.5rem` margins, `1.25rem` gutters. Product grids display 3 items per row.
- **Mobile (< 768px):** 4 columns, fluid width, `1rem` margins, `1rem` gutters. Product grids adapt to a 2-column stacked format with a minimum card width of 160px.

### Touch Ergonomics
Every interactive element adheres to a minimum 44px by 44px hit-target boundary, ensuring thumb-accessible purchasing across all mobile viewports.

## Elevation & Depth

The system uses subtle ambient shadows combined with crisp borders to avoid visual noise and let product imagery take center stage.

### Elevation Levels
- **Level 0 (Flat Canvas):** Surfaces rest on `#ffffff` or `#f8fafc` with a `1px solid #e2e8f0` border. Product cards use this baseline state to remain calm.
- **Level 1 (Card Hover / Dropdown Menus):** `box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03);` with `border: 1px solid #cbd5e1`. Used when hovering cards, opening flyout search panels, or expanding filter pickers.
- **Level 2 (Sticky Headers & Cart Drawer):** `box-shadow: 0 10px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04);`. Applied to persistent checkout summary docks and navigation bars.
- **Level 3 (Modal / Quick-View Dialogs):** `box-shadow: 0 20px 32px -8px rgba(15, 23, 42, 0.12);` paired with a backdrop overlay of `rgba(15, 23, 42, 0.40)` with `backdrop-filter: blur(4px)`.

## Shapes

The interface embraces a balanced, friendly corner radius that softens structural boxes without feeling playful or juvenile.

- **Base Radius (`0.5rem` / 8px):** Buttons, text fields, chips, small badges, and search bars.
- **Large Radius (`1rem` / 16px):** Product cards, checkout forms, dialog containers, and review card panels.
- **Pill Variant (`9999px`):** Reserved strictly for notification pill counters, promotion indicators, and status tags (e.g., "In Stock").

## Components

### Buttons
- **Primary:** Solid `#2563eb`, text `#ffffff`, font `label-md`. Hover shifts to `#1d4ed8`, active compresses slightly (`transform: scale(0.99)`). Min height `44px`, horizontal padding `1.25rem`.
- **Secondary / Outline:** Background `#ffffff`, border `1px solid #e2e8f0`, text `#0f172a`. Hover transitions to `#f8fafc` with border `#cbd5e1`.
- **Tertiary / Ghost:** No border, text `#334155`. Hover background `#f1f5f9`.

### Product Cards
- **Structure:** White container (`#ffffff`), `1px solid #e2e8f0` border, `1rem` radius.
- **Image Area:** Generous aspect ratios (`4:5` for apparel/lifestyle, `1:1` for general goods), placed inside a `#f8fafc` container to gracefully handle transparent PNGs and varied photography.
- **Content Block:** Internal padding of `1rem`. Hierarchy: Category label (12px, `#64748b`), Title (16px, `#0f172a`, 2-line clamp), Star Rating block with gold stars (`#f59e0b`) and numeric count, followed by Price (`price-md`) and an accessible "Add to Cart" button or icon trigger.

### Input Fields & Search
- **Text Inputs:** Height `44px`, background `#ffffff`, border `1px solid #e2e8f0`, text `#0f172a`, placeholder `#94a3b8`. Focus state introduces a crisp `border-color: #2563eb` and an ambient outer ring `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`.
- **Search Header Bar:** Integrated search bar with leading search glyph, subtle clear button, and inline category filter dropdown.

### Checkboxes & Radio Buttons
- **Checkbox:** `20px x 20px`, `4px` radius. Unchecked: `1.5px solid #cbd5e1`. Checked: Background `#2563eb` with crisp white checkmark SVG.
- **Radio:** `20px x 20px`, circular. Checked: Outer ring `#2563eb`, centered `8px` solid core `#2563eb`.

### Chips & Filter Tags
- **Filter Chip:** Neutral `#f8fafc` background, `1px solid #e2e8f0`, `0.5rem` radius, padding `6px 12px`.
- **Active Filter:** Tinted background `rgba(37, 99, 235, 0.08)`, border `1px solid #2563eb`, text `#2563eb`, with an inline dismiss "x" icon.

### Star Ratings
- Composed of 5 inline SVG stars (`16px x 16px` in cards, `20px x 20px` on product pages). Empty stars are filled with `#e2e8f0`, filled stars use `#f59e0b`. Suffix text uses `label-sm` in `#64748b` format: `4.8 (124)`.

### Sticky Bottom Cart Bar (Mobile)
- Fixed sheet docked to screen bottom on product detail views. Background `#ffffff`, top border `1px solid #e2e8f0`, elevated via Level 2 shadow. Contains the SKU price, selected variant snippet, and full-width Primary "Add to Bag" button.