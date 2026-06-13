# BabyHaus Brand Redesign v2 — Bright & Cheerful Children's Boutique

## Brand Identity (from White-Background Logo)

The BabyHaus logo is a playful, groovy/retro wordmark on **pure white**:
- **"Baby"**: B=warm bubblegum pink, a=golden ochre/marigold, b=rich kelly green, y=bright cerulean blue
- **"Haus"**: H=rich kelly green (with distinctive curved negative space in crossbar), a=golden ochre, u=pale sky blue, s=warm bubblegum pink
- **Decorative**: Small pink fluffy cloud/flower shape left of B, small golden sparkle right of s
- **Font**: Thick, heavy, organic rounded letterforms with unconventional cuts — 1960s/70s psychedelic groovy typography
- **Overall mood**: Playful, whimsical, cheerful, children's boutique, youthful fun, rainbow-mismatched candy effect

## CRITICAL: Light Theme Only
- **Background is WHITE or very light cream** — NO dark mode
- This is a bright, happy children's brand — dark backgrounds are completely wrong

## Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#FFFFFF` | Page background |
| `--bg-cream` | `#FFF9F5` | Soft warm sections (hero, cards) |
| `--bg-surface` | `#FFFFFF` | Cards, sheets |
| `--bg-warm` | `#FFF5EE` | Hover states, subtle warm fills |
| `--text-primary` | `#2D2D2D` | Headings, primary text |
| `--text-secondary` | `#6B6B6B` | Body, descriptions |
| `--text-muted` | `#A0A0A0` | Placeholders |
| `--accent-pink` | `#FF6B9D` | Warm bubblegum pink (primary accent) |
| `--accent-gold` | `#F5A623` | Golden ochre/marigold |
| `--accent-green` | `#4CAF50` | Rich kelly green |
| `--accent-blue` | `#2196F3` | Bright cerulean blue |
| `--accent-sky` | `#90CAF9` | Pale sky blue |
| `--border` | `#F0E6DD` | Warm subtle borders |
| `--border-strong` | `#E8D5C4` | Stronger borders |

### Gradients (used sparingly for fun accents)
- **Fun gradient**: `linear-gradient(135deg, #FF6B9D, #F5A623, #4CAF50, #2196F3)` — for featured tags, playful badges
- **Pink glow**: `0 0 20px rgba(255,107,157,0.2)` — subtle card hover glow

### Typography
- **Display / Logo / Headings**: `Fredoka One` or `Fredoka:wght@600;700` — rounded, playful, retro-groovy
  - Hero title uses multicolor letters matching logo palette
  - Large sizes: `text-4xl md:text-6xl font-bold`
- **Body / UI**: `Inter` (keep existing) or `Nunito` for softer feel
- **Weights**: 400 regular, 600 semibold, 700 bold

### Shadows & Effects
- **Card shadow**: `0 4px 20px rgba(255,107,157,0.08)` — soft pink-tinted shadow
- **Card hover**: Lift effect + stronger pink shadow
- **No grain texture** — this logo is clean and crisp on white
- **Rounded everything**: heavy border-radius to match rounded letterforms

### Border Radius
- Cards: `rounded-3xl` (24px) — extra round to match groovy font
- Buttons: `rounded-full` (pill) or `rounded-2xl` (16px)
- Inputs: `rounded-xl` (12px)
- Pills/tags: `rounded-full`

## Component Redesign Specs

### 1. globals.css
- Keep light warm theme — white/cream backgrounds
- Replace old beige `#d4a574` accent with new pink `#FF6B9D`
- Add `.text-pink`, `.text-gold`, `.text-green`, `.text-blue` utilities
- Add `.bg-fun-gradient` for playful gradient backgrounds
- Selection color: pink tint
- Scrollbar: pink thumb on white track

### 2. layout.tsx
- Load `Fredoka:wght@400;600;700` + `Inter` from Google Fonts
- `themeColor`: `#FFFFFF`
- Toaster: white bg, dark text, rounded-2xl

### 3. page.tsx (Homepage)
- Background: `#FFFFFF` or soft gradient from white to `#FFF9F5`
- Hero:
  - "Baby Haus" title in Fredoka, multicolor letters: B=pink, a=gold, b=green, y=blue, H=green, a=gold, u=sky, s=pink
  - Large, bold, playful — this is the brand centerpiece
  - Small pink cloud icon left of title, golden sparkle right
  - Subtitle: soft gray, friendly tone
  - CTA: pink pill button with white text, or fun gradient pill
- Category pills: white with colored border, active = solid pink
- Product cards: white with warm border, pink hover glow

### 4. product/[id]/page.tsx
- White background
- Sticky back bar: white with subtle warm border
- Brand label: pink or gold
- Price: pink bold
- Stock badges keep semantic colors but softer:
  - In Stock: `bg-green-50 text-green-600`
  - Pre-Order: `bg-amber-50 text-amber-600`
  - Out of Stock: `bg-red-50 text-red-600`
- Primary CTA: pink solid or fun gradient
- Secondary CTA: pink outline on white

### 5. Header.tsx
- Background: `bg-white/90 backdrop-blur` with subtle warm border
- Logo: "Baby" in multicolor Fredoka (matching logo palette), "Haus" in dark gray or matching multicolor
- Cart/wishlist: white circles with subtle warm border, pink badge
- Telegram: soft pink pill or outline

### 6. Footer.tsx
- White bg, warm border top
- Pink links
- Multicolor logo

### 7. CompactProductCard.tsx
- White card, `rounded-3xl`, warm border, pink-tinted shadow
- Hover: lift + pink glow
- Image bg: soft cream `#FFF9F5`
- Brand label: pink
- Product name: dark, hover pink
- Price: pink bold
- "Featured" tag: fun gradient (pink→gold→green→blue) with white text
- Add to Cart: pink solid pill

### 8. CatalogClient.tsx
- Search bar: white input with warm border, pink focus
- Results: gray text
- Pagination: white buttons, pink active

### 9. CartDrawer.tsx
- White drawer, warm borders
- Items: white cards with warm border
- Checkout: pink or gradient button
- Empty state: pink/sparkle icons

### 10. MobileBottomNav.tsx
- White bg, warm border top
- Active: pink
- Inactive: gray
- Cart badge: pink

### 11. ProductQuickView.tsx
- White sheet, rounded-t-3xl
- Drag handle: warm gray
- Pink/gold accents throughout

## What NOT to Change
- Admin portal (`/admin/*`)
- API routes
- Logic/hooks/contexts
- Product data structure
- Only visual presentation
