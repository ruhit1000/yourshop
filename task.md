# YourShop — Implementation Task List

> Tasks are grouped into **12 batches**. Each batch is reviewed before the next begins.
> Legend: `[ ]` Not started · `[/]` In progress · `[x]` Complete

---

## Batch 1 — Backend: Project Foundation & Server Setup

> **Goal:** A running Express server with a live MongoDB connection, environment config, and all inline middleware wired up — all inside a single `index.js` file matching the reference project structure. No separate route or middleware files.

**File structure target after this batch:**
```
server/
  index.js          ← single file with everything
  .env              ← secrets
  .gitignore        ← node_modules, .env
  package.json      ← already initialized
  vercel.json       ← Vercel deploy config
```

- [x] Install missing dependency: `@google/genai` (`npm install @google/genai`)
- [x] Add `"start": "node index.js"` and `"dev": "nodemon index.js"` scripts to `package.json`
- [x] Create `server/.env`
  - [x] `MONGODB_URI` — MongoDB Atlas connection string
  - [x] `GEMINI_API_KEY` — Google Gemini API key
  - [x] `PORT=5000`
- [x] Create `server/.gitignore` — entries: `node_modules/`, `.env`
- [x] Create `server/vercel.json` — Vercel serverless config (`builds` + `routes`)
- [x] Write `server/index.js` — full single-file structure matching reference pattern
  - [x] Imports: `mongodb` (`MongoClient`, `ServerApiVersion`, `ObjectId`), `express`, `cors`, `dotenv`
  - [x] `app.use(cors())` and `app.use(express.json())`
  - [x] `MongoClient` instance using `process.env.MONGODB_URI` with `ServerApiVersion.v1`
  - [x] `client.connect(callback)` — all collections, middleware, and routes live inside this callback
  - [x] Inside callback: declare all 4 collection references
    - [x] `productsCollection = db.collection("products")`
    - [x] `userProfilesCollection = db.collection("userProfiles")`
    - [x] `cartsCollection = db.collection("carts")`
    - [x] `ordersCollection = db.collection("orders")`
  - [x] Inline `verifyToken` middleware
    - [x] Read `Authorization: Bearer <token>` header → return `401` if missing
    - [x] Look up token in Better Auth `session` collection → return `401` if not found
    - [x] Look up user in `userProfiles` collection → attach as `req.user` → call `next()`
  - [x] Inline `verifyAdmin` middleware
    - [x] Check `req.user?.role !== "admin"` → return `403 Forbidden`
    - [x] Call `next()` if valid admin
  - [x] Health check route: `app.get("/", ...)` → `res.send("YourShop API is running.")`
  - [x] `app.listen(process.env.PORT || 5000, ...)`
  - [x] `module.exports = app`
- [x] Smoke test: `node index.js` starts, MongoDB connects, `GET /` returns health string

---

## Batch 2 — Backend: Catalog / Products API (3 Endpoints)

> **Goal:** Add all 3 product routes directly inside the `index.js` MongoClient callback. Full catalog engine — admins can add and soft-delete; public can search, filter, sort, and paginate.

- [ ] `GET /api/products` — Catalog Explore Engine (public, no middleware)
  - [ ] Accept query params: `q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`
  - [ ] Build aggregation pipeline: `$match` (isActive + text search + price range + category)
  - [ ] Apply sort stage (`price_asc`, `price_desc`, `newest`, `name_asc`, `stock_asc`)
  - [ ] Count pipeline: run `$count` before skip/limit to get total
  - [ ] Apply `$skip` / `$limit` for pagination
  - [ ] Return `{ products, meta: { totalItems, totalPages, currentPage, itemsPerPage } }`
- [ ] `POST /api/products` — Admin: Add Product (`verifyToken, verifyAdmin`)
  - [ ] Validate required fields (`name`, `priceCents`, `stock`, `category`)
  - [ ] Auto-generate `slug` from `name` (lowercase, hyphenated, de-duped via `findOne`)
  - [ ] Set `isActive: true`, stamp `createdAt` / `updatedAt`
  - [ ] `insertOne` and return new document `_id`
- [ ] `DELETE /api/products/:id` — Admin: Soft-Delete (`verifyToken, verifyAdmin`)
  - [ ] Validate `ObjectId.isValid(id)` → `400` if invalid
  - [ ] `updateOne` → set `isActive: false`, update `updatedAt`
  - [ ] Return `204 No Content`
- [ ] Create MongoDB indexes on `productsCollection`
  - [ ] `slug` unique index
  - [ ] Text index: `name`, `description`, `tags`
  - [ ] Single-field: `category`, `priceCents`, `isActive`, `stock`

---

## Batch 3 — Backend: Cart System (3 Endpoints)

> **Goal:** Add all 3 cart routes inside the `index.js` MongoClient callback. Persistent, upsert-managed cart per user with live product data aggregation on fetch.

- [ ] `GET /api/cart` — Fetch User Cart (`verifyToken`)
  - [ ] Run `$lookup` aggregation: `items.productId` → `productsCollection._id`
  - [ ] `$match` to filter inactive products out of result
  - [ ] `$group` back into a single cart document
  - [ ] Return enriched cart with product metadata + cart quantities
- [ ] `POST /api/cart` — Add / Increment Cart Item (`verifyToken`)
  - [ ] Validate `ObjectId.isValid(productId)` → `400` if invalid
  - [ ] `findOne` product in `productsCollection` (`isActive: true`) → `404` if missing
  - [ ] If `productId` already in `items` → `$inc` the quantity using array filter
  - [ ] If new → `$push` new item element `{ productId, quantity, addedAt }`
  - [ ] `upsert: true` to create cart document if user has none
  - [ ] `$set updatedAt`
- [ ] `PATCH /api/cart` — Update Cart Item Quantity / Remove (`verifyToken`)
  - [ ] `quantity > 0` → `$set` via positional `$` operator
  - [ ] `quantity === 0` → `$pull` item from `items` array
  - [ ] `$set updatedAt`
- [ ] Create MongoDB indexes on `cartsCollection`: `userId` (unique), `items.productId`

---

## Batch 4 — Backend: Checkout & Orders API (4 Endpoints)

> **Goal:** Add all 4 checkout and order routes inside the `index.js` MongoClient callback. Safe, stock-validated checkout with price snapshotting, inventory deduction, cart clearing, and full order lifecycle management.

- [ ] `POST /api/checkout` — Checkout Flow (`verifyToken`)
  - [ ] Step 1: `findOne` cart by `req.user._id` → `400` if empty
  - [ ] Step 2: `find` all `productId`s from cart in `productsCollection` → build `productMap`
  - [ ] Step 3: Stock validation loop — `409` on insufficient stock or missing product
  - [ ] Step 4: Build snapshotted order document (name, imageUrl, priceCents captured at checkout time)
  - [ ] Step 5: `insertOne` into `ordersCollection`
  - [ ] Step 6: `bulkWrite` stock deduction — each `updateOne` uses `$gte` guard; verify `modifiedCount`
  - [ ] Step 7: `updateOne` cart → `$set items: []` (clear cart)
  - [ ] Return `201 { orderId, totalCents, status: "Pending" }`
- [ ] `GET /api/orders` — Customer Order History (`verifyToken`)
  - [ ] Scope to `req.user._id`, sort `createdAt: -1`
  - [ ] Paginate with `page` / `limit` query params
- [ ] `GET /api/admin/orders` — Admin: All Platform Orders (`verifyToken, verifyAdmin`)
  - [ ] Optional `status` filter via query param
  - [ ] Paginate with `page` / `limit`
- [ ] `PATCH /api/admin/orders/:id` — Admin: Update Order Status (`verifyToken, verifyAdmin`)
  - [ ] Validate `ObjectId.isValid(id)` → `400` if invalid
  - [ ] Validate status transition against allowed matrix → `400` on illegal transition
  - [ ] `$push` to `statusHistory`: `{ status, changedAt: new Date(), note }`
  - [ ] `$set status` and `updatedAt`
- [ ] Create MongoDB indexes on `ordersCollection`: `userId`, `status`, `createdAt` (desc), compound `userId + createdAt`

---

## Batch 5 — Backend: Customers Endpoint & AI Chat (2 Endpoints)

> **Goal:** Add the final 2 routes inside the `index.js` MongoClient callback. Admin can view customer accounts; AI chat assistant powered by Gemini 2.5 Flash with live inventory context and streaming.

- [ ] `GET /api/admin/customers` — Admin: Customer Accounts (`verifyToken, verifyAdmin`)
  - [ ] `find` on `userProfilesCollection`
  - [ ] Project: `email`, `displayName`, `avatarUrl`, `role`, `createdAt` (omit sensitive fields)
  - [ ] Paginate: 20 per page via `skip` / `limit`
  - [ ] Return `{ customers, pagination: { ... } }`
- [ ] `POST /api/chat` — Agentic AI Chat (`verifyToken`)
  - [ ] Step 1: `find` active products with projection (`name`, `category`, `priceCents`, `stock`, `tags`, `description`, `_id: 0`)
  - [ ] Step 2: Minify product array — rename keys (`n`, `cat`, `price`, `stock`, `tags`, `desc`), truncate description to 150 chars, format price as `"$X.XX"`
  - [ ] Step 3: Build `systemInstruction` string with minified inventory JSON injected
  - [ ] Step 4: Map client `history` array to Gemini SDK format (`{ role, parts: [{ text }] }`)
  - [ ] Step 5: Initialize `GoogleGenerativeAI` with `GEMINI_API_KEY`; call `model.startChat({ history })`
  - [ ] Step 6: Stream response using `generateContentStream`; set `Content-Type: text/event-stream` and pipe chunks to `res`
  - [ ] Step 7: Append `SUGGEST_JSON:[...]` block to system prompt instructing Gemini to end each reply with 3 suggested prompts in a parseable JSON suffix
  - [ ] Return final `{ reply, suggestedPrompts }` on stream end
- [ ] Final verification: all 12 endpoints registered, server restarts cleanly, test each route with a REST client

---

## Batch 6 — Frontend: Project Foundation & Design System

> **Goal:** Next.js project initialized, Tailwind design tokens configured, root layout wired, and all shared components built.

- [ ] Initialize `client/` with `create-next-app` (App Router, JavaScript, Tailwind CSS)
- [ ] Install dependencies: `@tanstack/react-query`, `better-auth`, `lucide-react`, `recharts`, `axios`
- [ ] Configure `tailwind.config.js`
  - [ ] Extend colors: `navy: #0A0F1E`, `blue: #3B82F6`, `amber: #F59E0B`, `surface: #1E293B`
  - [ ] Extend `borderRadius`: `card: 16px`, `btn: 12px`
  - [ ] Add Inter font via Google Fonts in `app/layout.js`
- [ ] Create `client/.env.local` with `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] Create `client/lib/authClient.js` — Better Auth client (`createAuthClient`) singleton
- [ ] Create `client/lib/api.js` — Axios instance with base URL and `Authorization` header interceptor (attaches `userId` from session)
- [ ] Create root `app/layout.js` — wraps `<QueryClientProvider>` + `<AuthProvider>` + `<Navbar>` + `<Footer>`
- [ ] Build shared components in `app/components/shared/`
  - [ ] `<ProductCard />` — image, category pill, name (2-line clamp), description (2-line clamp), stars + price, View Details button
  - [ ] `<SkeletonCard />` — `animate-pulse` matching ProductCard shape exactly
  - [ ] `<StatusBadge />` — color-coded by order status string
  - [ ] `<Toast />` — success / error notification with auto-dismiss
  - [ ] `<Modal />` — reusable overlay with close button and `{children}` slot
  - [ ] `<AdminGuard />` — HOC: checks `session.user.role`, redirects to `/login` if not `"admin"`
  - [ ] `<Pagination />` — numbered pages + Prev/Next arrows, URL-synced

---

## Batch 7 — Frontend: Navbar, Footer & Home Page

> **Goal:** Fully functional landing page with all 9 sections, sticky navbar with all 3 auth states, and complete footer.

- [ ] Build `<Navbar />`
  - [ ] Logged-out: Home · Shop · About + Login / Register buttons
  - [ ] Customer: Home · Shop · Orders · Chat · About + Cart badge + user dropdown (My Orders, Logout)
  - [ ] Admin: All customer routes + Admin dropdown (Overview, Products, Add Product, Orders, Customers)
  - [ ] Sticky with glassmorphism: `backdrop-blur-md bg-[#0A0F1E]/90`
  - [ ] Cart badge animates (scale pulse) on item count change
  - [ ] Mobile hamburger → full-screen slide-in drawer
  - [ ] Active route: Electric Blue underline via `usePathname()`
- [ ] Build `<Footer />`
  - [ ] 5 columns: Brand + socials, Shop links, Company links, Support links, Contact info
  - [ ] All links are internal `<Link>` components (no dead `href="#"`)
  - [ ] Electric Blue top border, copyright line
- [ ] Build Home Page (`app/page.js`) — 9 sections:
  - [ ] `<HeroSection />` — 65vh, animated particle overlay, 3D-tilt rotating product showcase, two CTAs, scroll chevron
  - [ ] `<CategoryLanes />` — 6 electronics categories, horizontal scroll mobile, 6-col desktop, hover glow
  - [ ] `<FeaturedProducts />` — 4-card row, `GET /api/products?sort=newest&limit=8`, skeleton loaders
  - [ ] `<FlashDeals />` — amber banner, countdown timer, horizontally scrolling deal cards with discount badge
  - [ ] `<WhyChooseUs />` — 4 feature tiles (Lucide icons, animated), responsive grid
  - [ ] `<StatsCounter />` — 4 counters animated with IntersectionObserver
  - [ ] `<Testimonials />` — CSS scroll-snap carousel, 6 testimonial cards, amber star ratings
  - [ ] `<Newsletter />` — Electric Blue gradient band, email input, animated envelope icon
  - [ ] `<FaqAccordion />` — 6 electronics-relevant items, smooth Tailwind expand/collapse

---

## Batch 8 — Frontend: Shop Page & Product Detail Page

> **Goal:** Fully functional explore experience with 4 filters, URL-synced state, skeleton loaders, and a rich product detail page.

- [ ] Build Shop Page (`app/shop/page.js`)
  - [ ] `<SearchBar />` — debounced 300ms, syncs to `?q=` URL param
  - [ ] `<FilterSidebar />`
    - [ ] `<CategoryFilter />` — multi-select checkboxes, syncs to `?category=`
    - [ ] `<PriceRangeSlider />` — dual-handle slider, syncs to `?minPrice=&maxPrice=`
    - [ ] `<StockToggle />` — in-stock-only toggle, client-side post-filter
  - [ ] `<SortDropdown />` — `price_asc`, `price_desc`, `newest`, `name_asc`, syncs to `?sort=`
  - [ ] `<ProductGrid />` — 4/2/1 col grid, maps `<ProductCard>` or `<SkeletonCard>` while loading
  - [ ] `<Pagination />` — URL-synced, `keepPreviousData: true` TanStack Query
  - [ ] Filter sidebar collapses to slide-up bottom sheet on mobile
  - [ ] All filters shareable/bookmarkable via URL query string
- [ ] Build Product Detail Page (`app/products/[slug]/page.js`)
  - [ ] `<ImageGallery />` — main display + thumbnail strip, click-to-swap
  - [ ] `<ProductInfo />` — category tag, name, star rating, price (amber), stock count
  - [ ] `<QuantitySelector />` — `[−] [qty] [+]` with min 1, max stock guards
  - [ ] `<AddToCartButton />` — calls `POST /api/cart`, invalidates cart query, shows toast; disabled + "Out of Stock" badge if `stock === 0`
  - [ ] `<ProductDescription />` — full description tab section
  - [ ] `<SpecificationsTable />` — key-value table (brand, model, connectivity, etc.)
  - [ ] `<ReviewsSection />` — star distribution bar + 4 seeded review cards
  - [ ] `<RelatedProducts />` — `GET /api/products?category=X&limit=4`, 4-card row
  - [ ] Hover prefetch on product cards via `queryClient.prefetchQuery()`

---

## Batch 9 — Frontend: Auth Pages & Cart

> **Goal:** Login, register, Google OAuth, demo login button, and the full cart + checkout flow.

- [ ] Build Login Page (`app/login/page.js`)
  - [ ] Email + Password inputs with inline validation
  - [ ] `Login` button (amber, full-width) — calls Better Auth `signIn`
  - [ ] `Continue with Google` button — Better Auth Google OAuth flow
  - [ ] **Demo Login button** — auto-fills `demo@yourshop.com` / `Demo@123` and submits
  - [ ] Link to `/register`
  - [ ] Error messages displayed inline (no alert popups)
- [ ] Build Register Page (`app/register/page.js`)
  - [ ] Display Name · Email · Password · Confirm Password inputs
  - [ ] Real-time password strength indicator bar
  - [ ] Validation: min 8 chars, 1 uppercase, 1 number, passwords match
  - [ ] `Create Account` amber button + Google OAuth button
  - [ ] Link to `/login`
- [ ] Build Cart Page (`app/cart/page.js`) — protected
  - [ ] `GET /api/cart` via TanStack Query (staleTime: 0)
  - [ ] `<CartItem />` per line: image, name, price, `[−][qty][+]` → `PATCH /api/cart`, trash → `PATCH` with `quantity: 0`
  - [ ] Optimistic quantity updates with rollback on error
  - [ ] `<OrderSummary />` — subtotal, shipping (Free), total
  - [ ] `Proceed to Checkout` button → `POST /api/checkout` → redirect to `/orders` on `201`
  - [ ] Empty cart state: illustration + "Continue Shopping" link
- [ ] Build Checkout redirect/confirmation (`app/checkout/page.js`) — protected
  - [ ] Show order confirmation summary after successful checkout (orderId, total, status)
  - [ ] "View My Orders" and "Continue Shopping" CTAs

---

## Batch 10 — Frontend: Orders Page & Additional Pages

> **Goal:** Customer order history with status badges and expandable line items, plus About and Contact pages.

- [ ] Build Orders Page (`app/orders/page.js`) — protected
  - [ ] `GET /api/orders` paginated, newest first
  - [ ] `<OrderCard />` — Order ID, date, total, color-coded `<StatusBadge />`
  - [ ] Expandable accordion: click card → reveals snapshotted line items (image, name, qty, price)
  - [ ] Pagination component
- [ ] Build About Page (`app/about/page.js`)
  - [ ] Hero section: "Our Mission" statement + brand illustration
  - [ ] Timeline: YourShop journey (horizontal scroll on mobile)
  - [ ] Core Values grid: Innovation, Quality, Transparency, Support (4-col desktop, 2-col mobile)
  - [ ] Team cards: avatar, name, role (seeded data — no placeholder names)
- [ ] Build Contact Page (`app/contact/page.js`)
  - [ ] Two-column layout: form (Name, Email, Subject, Message) + info cards (email, phone, hours) + SVG map illustration
  - [ ] Client-side form validation with `useState`
  - [ ] Success / error state feedback after submit

---

## Batch 11 — Frontend: Admin Dashboard

> **Goal:** Fully functional admin shell with responsive sidebar/bottom-tab navigation and all 5 admin pages.

- [ ] Create Next.js Route Group `app/(admin)/layout.js`
  - [ ] Wrap `<AdminGuard />` — redirect non-admins to `/login`
  - [ ] Render `<AdminSidebar />` (desktop only) + `<AdminTopBar />` + `<AdminBottomTabs />` (mobile only) + `{children}`
  - [ ] Main content: `pl-0` on mobile, `pl-60` on desktop
- [ ] Build `<AdminSidebar />`
  - [ ] 240px fixed, `hidden lg:block`
  - [ ] Logo area: bolt icon + "Admin Panel" wordmark
  - [ ] 5 `<AdminNavItem />` — icon + label, `usePathname()` active detection
    - [ ] Overview (`LayoutDashboard` → `/admin`)
    - [ ] Products (`Package` → `/admin/products`)
    - [ ] Add Product (`PlusCircle` → `/admin/products/add`)
    - [ ] Orders (`ClipboardList` → `/admin/orders`)
    - [ ] Customers (`Users` → `/admin/customers`)
  - [ ] Active state: `border-l-4 border-blue-500` + Electric Blue text
  - [ ] Bottom section: separator + Logout (`🚪` red text)
- [ ] Build `<AdminBottomTabs />`
  - [ ] `fixed bottom-0`, `lg:hidden`, 5 icon-only tabs
  - [ ] Min 48×48px touch targets
  - [ ] Active: Electric Blue icon + dot indicator above
  - [ ] iOS safe-area bottom padding
- [ ] Build `<AdminTopBar />`
  - [ ] Dynamic page title via `usePathname()`
  - [ ] Mobile: back arrow → `/` + "Admin Panel" text
  - [ ] Right: notification bell + admin avatar + logout dropdown
- [ ] Build Admin Overview Page (`app/(admin)/admin/page.js`)
  - [ ] 4 stat cards: Total Orders, Revenue, Products, Customers
  - [ ] `<OrderStatusChart />` — Recharts `BarChart` (orders by status count)
  - [ ] `<RevenueChart />` — Recharts `LineChart` (revenue last 7 days)
  - [ ] Recent Orders mini-table (last 5) + "View All Orders" link
  - [ ] Low Stock Alerts list (stock < 5, sorted ascending)
- [ ] Build Admin Products Page (`app/(admin)/admin/products/page.js`)
  - [ ] Table: IMG, Name, Category, Price, Stock, Actions (Delete)
  - [ ] Low-stock rows: amber left border; out-of-stock: red left border
  - [ ] Client-side search bar above table
  - [ ] Optimistic delete with TanStack Query rollback
  - [ ] `[+ Add New Product]` button → `/admin/products/add`
  - [ ] Pagination
- [ ] Build Admin Add Product Page (`app/(admin)/admin/products/add/page.js`)
  - [ ] Form: Name, Short Description, Full Description, Category dropdown, Brand, Price (USD), Stock, Tags, Image URL
  - [ ] `POST /api/products` on submit → success toast → redirect to `/admin/products`
  - [ ] Inline field-level error messages
- [ ] Build Admin Orders Page (`app/(admin)/admin/orders/page.js`)
  - [ ] `<OrderStatusChart />` reused at top
  - [ ] Table: Order ID, Customer ID, Total, Status badge, Date, Update button
  - [ ] Status filter dropdown (All / Pending / Processing / Shipped / Delivered / Cancelled)
  - [ ] `[Update]` → `<Modal />` with status dropdown (transition-constrained) + note field → `PATCH /api/admin/orders/:id`
  - [ ] Date range filter (from/to date pickers)
- [ ] Build Admin Customers Page (`app/(admin)/admin/customers/page.js`)
  - [ ] `GET /api/admin/customers` paginated
  - [ ] Table: Avatar, Display Name, Email, Role, Joined date
  - [ ] Read-only (no action buttons)
  - [ ] Pagination

---

## Batch 12 — Frontend: AI Chat Assistant

> **Goal:** Streaming AI chat with live inventory awareness, multi-turn history, typing indicator, and suggested follow-up prompts.

- [ ] Build Chat Page (`app/chat/page.js`) — protected
  - [ ] `<ChatWindow />` — scrollable message list, auto-scrolls to latest
  - [ ] `<MessageBubble />` — two variants: `user` (right-aligned, blue bg) and `model` (left-aligned, surface bg)
  - [ ] `<TypingIndicator />` — 3 dots with staggered `animate-pulse` CSS animation, shown while streaming
  - [ ] `<SuggestedPrompts />` — 3 clickable pill buttons below last model response; clicking auto-fills and sends the message
  - [ ] `<ChatInput />` — text area + `Send →` button; submit on Enter (Shift+Enter for newline)
  - [ ] Conversation history state: `useState([{ role, content }])`
  - [ ] History capped at last 10 turns before each API call
  - [ ] Opening welcome message from model on page load (no API call — hardcoded)
- [ ] Implement streaming receive
  - [ ] Call `POST /api/chat` with `{ message, history }`
  - [ ] Read SSE / chunked response stream via `ReadableStream` Web API
  - [ ] Append token chunks to the active model bubble as they arrive
  - [ ] On stream complete: parse and strip `suggestedPrompts` JSON block from response text
  - [ ] Render parsed prompts as `<SuggestedPrompts />` pill buttons
- [ ] Update backend `POST /api/chat` to support streaming (`generateContentStream`) and inject suggested prompts JSON at end of each response

---

## Summary

| Batch | Area | Status |
|---|---|---|
| 1 | Backend: Project Foundation & Middleware | `[x]` |
| 2 | Backend: Catalog / Products API | `[ ]` |
| 3 | Backend: Cart System | `[ ]` |
| 4 | Backend: Checkout & Orders API | `[ ]` |
| 5 | Backend: Customers & AI Chat | `[ ]` |
| 6 | Frontend: Project Foundation & Design System | `[ ]` |
| 7 | Frontend: Navbar, Footer & Home Page | `[ ]` |
| 8 | Frontend: Shop & Product Detail | `[ ]` |
| 9 | Frontend: Auth Pages & Cart | `[ ]` |
| 10 | Frontend: Orders & Additional Pages | `[ ]` |
| 11 | Frontend: Admin Dashboard | `[ ]` |
| 12 | Frontend: AI Chat Assistant | `[ ]` |

---

*Tick off tasks as each item completes. Review summary table after each batch before moving on.*
