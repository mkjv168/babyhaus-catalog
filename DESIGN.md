# BabyHaus Brand Redesign — Y2K Retro Candy Dark Mode

## Brand Identity (from Logo)

The BabyHaus logo is a playful, retro/Y2K-inspired wordmark on deep black:
- **"Baby"**: B=hot pink, a=golden orange, b=bright green, y=cornflower blue
- **"Haus"**: H=bright green, a=golden orange, u=pale sky blue, s=hot pink
- All letters have **thick white outlines** and a **fine speckled/grain texture**
- Decorative: small pink heart (left of B), yellow sparkle (right of s)
- Overall mood: whimsical, nostalgic, candy-colored, sticker-like, trendy

## Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0a0a0a` | Page background |
| `--bg-surface` | `#141414` | Cards, sheets, drawers |
| `--bg-elevated` | `#1a1a1a` | Hover states, inputs |
| `--text-primary` | `#ffffff` | Headings, primary text |
| `--text-secondary` | `#a0a0a0` | Body, descriptions |
| `--text-muted` | `#6b6b6b` | Placeholders, borders |
| `--accent-pink` | `#FF4D9F` | Hot pink (CTAs, highlights) |
| `--accent-orange` | `#FFB347` | Golden orange/mustard |
| `--accent-green` | `#39FF14` | Bright neon green |
| `--accent-blue` | `#6495ED` | Cornflower blue |
| `--accent-periwinkle` | `#A0C4FF` | Pale sky blue/periwinkle |
| `--border` | `rgba(255,255,255,0.08)` | Subtle dividers |
| `--border-strong` | `rgba(255,255,255,0.15)` | Focus rings, active states |

### Gradients
- **Primary CTA**: `linear-gradient(135deg, #FF4D9F 0%, #FFB347 50%, #39FF14 100%)`
- **Hero glow**: Radial gradient from `#FF4D9F20` to transparent
- **Card hover**: Subtle gradient border glow using `::before` pseudo-element

### Typography
- **Display / Headings**: `Fredoka` (Google Fonts) — rounded, playful, retro
- **Body / UI**: `Inter` (keep existing) or `DM Sans`
- **Weights**: 400 regular, 600 semibold, 700 bold, 800 extrabold
- **Hero title**: `text-4xl md:text-6xl font-extrabold tracking-tight`
- **Section titles**: `text-2xl font-bold`

### Shadows & Effects
- **Card shadow**: `0 4px 24px rgba(0,0,0,0.4)`
- **Glow**: `0 0 20px rgba(255,77,159,0.3)` for featured items
- **Grain overlay**: CSS `background-image` with SVG noise filter at 3% opacity
- **Sticker outline**: `text-shadow: -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff` for special headings (optional, use sparingly)

### Border Radius
- Cards: `rounded-2xl` (16px)
- Buttons: `rounded-full` (pill shape) or `rounded-2xl`
- Inputs: `rounded-xl` (12px)
- Pills/tags: `rounded-full`

### Spacing
- Keep existing spacing scale
- Add more vertical breathing room on desktop (the dark theme needs it)

## Component Redesign Specs

### 1. globals.css
- Replace all warm cream/beige colors with dark tokens
- Add grain noise overlay as a utility class `.grain`
- Update scrollbar to dark theme (thumb: `#333`, track: `#0a0a0a`)
- Update `::selection` to use pink accent
- Add `.text-gradient` utility for the multi-color gradient text

### 2. layout.tsx
- Change `themeColor` to `#0a0a0a`
- Swap Inter font load to Fredoka + Inter combo:
  - `Fredoka:wght@400;600;700` for display
  - `Inter:wght@400;500;600;700` for body
- Update Toaster style to dark theme

### 3. page.tsx (Homepage)
- Background: `#0a0a0a` with subtle grain texture
- Hero section:
  - Remove beige gradient background
  - Add radial glow behind text (pink-to-orange blur)
  - "Baby Haus" title uses Fredoka, multicolor letters matching logo palette
  - Subtitle: white/gray
  - CTA button: gradient pill (pink→orange→green) with white text
  - Decorative: small heart and sparkle emoji/icons flanking the title
- Category pills: dark pills with colored border, active state uses gradient background
- Product grid cards: see CompactProductCard

### 4. product/[id]/page.tsx (Product Detail)
- Dark background `#0a0a0a`
- Sticky back bar: `bg-[#0a0a0a]/90 backdrop-blur` with subtle border
- Brand/category label: gradient text or pink
- Price: gradient text (`text-gradient`)
- Stock badges:
  - In Stock: `bg-green-500/10 text-green-400 border border-green-500/20`
  - Pre-Order: `bg-orange-500/10 text-orange-400 border border-orange-500/20`
  - Out of Stock: `bg-red-500/10 text-red-400 border border-red-500/20`
- Primary CTA: gradient button
- Secondary CTA: white outline button on dark

### 5. Header.tsx
- Background: `bg-[#0a0a0a]/80 backdrop-blur-xl` with `border-b border-white/5`
- Logo: "Baby" in gradient (pink→orange→green→blue), "Haus" in white
  - OR keep it simple: "BabyHaus" in Fredoka bold with white text
- Cart/wishlist buttons: dark circles with white icons, badge uses gradient
- Telegram link: subtle pill with white border

### 6. Footer.tsx
- Background: `#0a0a0a` with `border-t border-white/5`
- Text: gray tones
- Links: pink hover color
- Logo same treatment as header

### 7. CompactProductCard.tsx
- Card: `bg-[#141414] border border-white/5 rounded-2xl`
- Hover: `border-white/10` + subtle pink glow shadow
- Image bg: `#0a0a0a` or `#1a1a1a`
- Brand/category label: pink or gradient
- Product name: white, hover turns pink
- Price: gradient text
- Stock badge: dark themed (see above)
- "Featured" tag: gradient background with white text
- Add to Cart button: gradient pill or pink solid

### 8. CatalogClient.tsx
- Search bar: dark input with `bg-[#1a1a1a] border-white/10`, white placeholder
- Results count: gray text
- Pagination: dark buttons, active page uses gradient

### 9. CartDrawer.tsx
- Drawer bg: `#141414`
- Header: `border-b border-white/5`
- Cart items: `bg-[#1a1a1a] border border-white/5`
- Quantity buttons: dark circles
- Checkout button: gradient
- Empty state: gray text with pink/sparkle icons

### 10. MobileBottomNav.tsx
- Background: `bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/5`
- Active state: pink color + subtle top glow
- Inactive: gray
- Cart badge: gradient or pink

### 11. ProductQuickView.tsx
- Sheet bg: `#141414` with `rounded-t-3xl`
- Drag handle: `#333`
- Image bg: `#0a0a0a`
- Text/CTAs follow product detail page spec

## Global Patterns

### Grain Texture
Add this as a reusable overlay:
```css
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  z-index: 9999;
}
```
Apply to `<main>` or `<body>`.

### Gradient Text
```css
.text-gradient {
  background: linear-gradient(135deg, #FF4D9F, #FFB347, #39FF14);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Sticker Outline Text (for special headings)
```css
.text-sticker {
  color: #FF4D9F;
  text-shadow: -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff;
}
```

## Assets
- No new image assets needed — pure CSS redesign
- Keep all existing functionality (cart, wishlist, search, pagination, quick view, Telegram ordering)
- Responsive behavior unchanged

## What NOT to Change
- Admin portal (`/admin/*`) — leave untouched
- API routes — leave untouched
- Logic/hooks/contexts — leave untouched
- Product data structure — leave untouched
- Only modify visual presentation (CSS, Tailwind classes, colors, fonts, spacing)
