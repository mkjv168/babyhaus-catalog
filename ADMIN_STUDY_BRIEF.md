# Admin Portal Study Brief for Claude

## PROJECT CONTEXT
- Next.js 16 App Router, TypeScript, Tailwind CSS
- Prisma ORM + PostgreSQL (Supabase in Singapore region)
- Deployed on Vercel
- Cookie-based auth with HMAC-signed tokens (7-day expiry)
- Admin username stored in cookie, password checked against `AdminUser` table
- Style system: warm neutrals `#faf8f5` bg, `#d4a574` accent, `#2d2d2d` text, `#7a7a7a` muted, `#e8e4df` borders, rounded-2xl/rounded-full, shadow-sm
- Icons: lucide-react

## DATABASE SCHEMA

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  brand       String?
  category    String
  description String?
  price       Float?
  imageUrl    String?
  sku         String?  @unique
  stockStatus String   @default("instock") // instock | outofstock | preorder
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
}

model Order {
  id               String   @id @default(uuid())
  productId        String
  quantity         Int      @default(1)
  customerName     String
  telegramPhone    String
  deliveryAddress  String?
  paymentMethod    String   @default("cod")
  notes            String?
  status           String   @default("pending") // pending | confirmed | delivered
  createdAt        DateTime @default(now())
  product          Product  @relation(fields: [productId], references: [id])
}

model AdminUser {
  id       String @id @default(uuid())
  username String @unique
  password String
}
```

## AUTH SYSTEM (`src/lib/auth.ts`)
- HMAC-SHA256 signed tokens with 7-day expiry
- `admin_session` cookie
- `getAdminUser()` returns username or null
- All admin pages redirect to `/admin/login` if unauthenticated

## ADMIN PAGES — CURRENT STATE

### 1. Dashboard (`/admin`) — `src/app/admin/page.tsx`
Server-rendered. Shows:
- 3 stat cards: Total Products, Total Orders, Pending Orders
- 3 action buttons: Add Product, Manage Products, View Orders
- Signed-in user display
- Header with nav links (Products, Orders) + LogoutButton

### 2. Products List (`/admin/products`) — `src/app/admin/products/page.tsx` + `ProductsClient.tsx`
Server fetches all products, passes to client component. Current features:
- Table columns: Image, Name, Brand, Category, Price, Stock, Actions
- Inline Edit button → opens slide-over `EditModal` (no page navigation)
- Inline Delete button → confirm + DELETE API + refresh
- Add Product button → opens same modal in "create" mode
- **NO search, NO filter, NO sort, NO pagination**

### 3. Edit/Create Modal — `src/app/admin/products/EditModal.tsx`
Slide-over panel (mobile: bottom sheet, desktop: right slide). Contains:
- `ProductForm` with all product fields
- Escape to close, backdrop click to close
- Body scroll lock

### 4. Product Form — `src/app/admin/products/ProductForm.tsx`
Fields: Name*, Brand, Category*, Price, SKU, Stock Status (select), Image upload (Cloudinary via `/api/upload`), Description, Featured checkbox.
- Dynamic import of `ImageUpload` (SSR disabled)
- Image upload state blocks submit
- Success callback or fallback router.push

### 5. Orders (`/admin/orders`) — `src/app/admin/orders/page.tsx` + `StatusButton.tsx`
Server-rendered table. Columns: Date, Product, Customer, Telegram, Notes, Status, Action.
- Status badge with color (amber pending / blue confirmed / green delivered)
- StatusButton: cycles through statuses (pending → confirmed → delivered → pending)
- **NO search, NO filter by status, NO date range, NO order detail view, NO pagination**

### 6. Login (`/admin/login`) — `src/app/admin/login/page.tsx` + `LoginForm.tsx`
- Centered card, username + password inputs
- POST to `/api/auth`, success → redirect to `/admin`
- Basic error display

### 7. LogoutButton — `src/app/admin/LogoutButton.tsx`
POST to `/api/logout`, redirect to `/admin/login`

## API ROUTES
- `POST /api/auth` — login, sets `admin_session` cookie
- `POST /api/logout` — clears cookie
- `GET/POST /api/products` — list/create
- `PUT/DELETE /api/products/[id]` — update/delete
- `GET /api/orders` — list orders
- `PUT /api/orders/[id]` — update status
- `POST /api/upload` — Cloudinary image upload

## STOREFRONT CONTEXT (for reference)
- Public site has catalog grid, quick-view sheet on mobile, cart, wishlist, order form
- ISR enabled: homepage + product pages revalidate every 60s
- Admin changes show up within 60s on public site

## THE ASK
Study this admin portal end-to-end. Suggest concrete improvements with these constraints:
1. Keep it mobile-usable (admin checks orders on phone frequently)
2. No external libraries beyond what's already installed (lucide-react, tailwind, next, prisma)
3. Don't break existing auth or API contracts
4. Prioritize by operational pain (what makes daily admin work faster)

For each suggestion, provide:
- What problem it solves
- Files to touch
- Rough implementation approach
- Effort estimate (small / medium / large)

Return a prioritized ranked list. Be opinionated — what would YOU build first?
