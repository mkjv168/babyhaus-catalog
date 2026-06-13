# BABY HAUS CATALOG — CLAUDE REBUILD BRIEF

## Project Identity
- Name: Baby Haus
- Business: Premium baby products ecommerce in Cambodia (USA & Japan imports)
- IG: @babyhaus.kh
- Telegram: @narote
- Live URL: https://babyhaus-catalog.vercel.app
- Tech: Next.js 16.2.9, React 19.2.4, Prisma 5.22.0, PostgreSQL (Supabase Tokyo), Tailwind CSS

## Current Architecture
- Next.js 14 App Router with `force-dynamic` on DB pages
- Prisma ORM + Supabase PostgreSQL (ap-northeast-1)
- React Context API + localStorage for cart (no auth required)
- Admin panel at /admin with username "admin"
- Image hosting: currently placeholder images (needs real image upload system)

## Database Schema (Prisma)
```prisma
model Product {
  id, name, brand?, category, description?, price?, imageUrl?, sku? @unique,
  stockStatus @default("instock"), featured @default(false), createdAt, updatedAt
}
model Order {
  id, productId, customerName, telegramPhone, notes?, status @default("pending"), createdAt
}
model AdminUser { id, username @unique, password }
```

## What's Currently Working
1. Mobile-first catalog with search, category pills, compact grid, sort
2. Add to Cart system with slide-out drawer, quantity controls, localStorage persistence
3. Product detail page with image, description, add-to-cart
4. Order request form (name + Telegram phone) → sends to admin
5. Admin panel: login, product CRUD, order management with status updates
6. Sticky bottom nav on mobile, sticky header with cart badge
7. Loading skeletons for instant-feeling navigation
8. Telegram CTA links to @narote

## CRITICAL ISSUES TO FIX

### 1. Product Image Management (HIGH PRIORITY)
Currently all products show placeholder images. The admin panel has NO way to upload product photos.
- Add image upload to admin product form (new + edit)
- Store images in a real hosting solution (consider Cloudinary, UploadThing, or Supabase Storage)
- Display real images in catalog grid and product detail
- Add image fallback/placeholder when no image exists

### 2. Product Discovery at Scale (HIGH PRIORITY)
Current grid is fine for 10 products but will fail at 100+ SKUs:
- Add pagination or infinite scroll to the catalog
- Add price range filter
- Add brand filter
- Consider sub-categories or tags
- Add "recently viewed" section
- Add "you may also like" recommendations

### 3. Cart & Checkout Flow (MEDIUM)
- Cart works but checkout just opens Telegram DM
- Add a proper checkout page with order summary
- Collect delivery info (name, phone, address) before sending to Telegram
- Show order confirmation page after submission
- Consider integrating with a local payment method (Wing, ABA Pay, etc.) — at minimum, add "Cash on Delivery" and "Bank Transfer" options

### 4. Admin Experience (MEDIUM)
- Add bulk product actions (delete multiple, update stock status)
- Add product search/filter in admin
- Add order filtering by status/date
- Add dashboard stats (total orders, revenue, low stock alerts)
- Image upload in admin (see #1)

### 5. SEO & Performance (MEDIUM)
- Add Open Graph tags for product pages
- Add structured data (JSON-LD) for products
- Add sitemap.xml
- Add robots.txt
- Optimize images (WebP, responsive sizes)
- Add proper meta descriptions per product

### 6. UX Improvements (LOW-MEDIUM)
- Add toast notifications for add-to-cart, order success
- Add product share button
- Add "back to top" button
- Improve empty states
- Add loading shimmer for images
- Add pull-to-refresh feel on mobile
- Consider adding a wishlist/favorites feature

## CONSTRAINTS
- Must remain mobile-first
- Must work without user authentication (cart is guest-based)
- Must keep Supabase PostgreSQL backend
- Must deploy to Vercel
- Must keep admin panel functional
- Do NOT change the Telegram handle (@narote)
- Do NOT break existing cart localStorage data

## ENVIRONMENT
- Working directory: ~/projects/babyhaus-catalog
- Git repo: mkjv168/babyhaus-catalog
- Vercel project: babyhaus-catalog
- DB: Supabase PostgreSQL (URL in .env)

## DELIVERABLES
1. All code changes committed to git
2. Deployed to Vercel production
3. Summary of what changed
4. Any new env vars needed

Start by reading the current codebase thoroughly, then make improvements systematically.
