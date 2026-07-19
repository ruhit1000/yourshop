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

- [x] `GET /api/products` — Catalog Explore Engine (public, no middleware)
  - [x] Accept query params: `q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`
  - [x] Build aggregation pipeline: `$match` (isActive + text search + price range + category)
  - [x] Apply sort stage (`price_asc`, `price_desc`, `newest`, `name_asc`, `stock_asc`)
  - [x] Count pipeline: run `$count` before skip/limit to get total
  - [x] Apply `$skip` / `$limit` for pagination
  - [x] Return `{ products, meta: { totalItems, totalPages, currentPage, itemsPerPage } }`
- [x] `POST /api/products` — Admin: Add Product (`verifyToken, verifyAdmin`)
  - [x] Validate required fields (`name`, `priceCents`, `stock`, `category`)
  - [x] Auto-generate `slug` from `name` (lowercase, hyphenated, de-duped via `findOne`)
  - [x] Set `isActive: true`, stamp `createdAt` / `updatedAt`
  - [x] `insertOne` and return new document `_id`
- [x] `DELETE /api/products/:id` — Admin: Soft-Delete (`verifyToken, verifyAdmin`)
  - [x] Validate `ObjectId.isValid(id)` → `400` if invalid
  - [x] `updateOne` → set `isActive: false`, update `updatedAt`
  - [x] Return `204 No Content`
- [x] Create MongoDB indexes on `productsCollection`
  - [x] `slug` unique index
  - [x] Text index: `name`, `description`, `tags`
  - [x] Single-field: `category`, `priceCents`, `isActive`, `stock`

---

## Batch 3 — Backend: Cart System (3 Endpoints)

> **Goal:** Add all 3 cart routes inside the `index.js` MongoClient callback. Persistent, upsert-managed cart per user with live product data aggregation on fetch.

- [x] `GET /api/cart` — Fetch User Cart (`verifyToken`)
  - [x] Run `$lookup` aggregation: `items.productId` → `productsCollection._id`
  - [x] `$match` to filter inactive products out of result
  - [x] `$group` back into a single cart document
  - [x] Return enriched cart with product metadata + cart quantities
- [x] `POST /api/cart` — Add / Increment Cart Item (`verifyToken`)
  - [x] Validate `ObjectId.isValid(productId)` → `400` if invalid
  - [x] `findOne` product in `productsCollection` (`isActive: true`) → `404` if missing
  - [x] If `productId` already in `items` → `$inc` the quantity using array filter
  - [x] If new → `$push` new item element `{ productId, quantity, addedAt }`
  - [x] `upsert: true` to create cart document if user has none
  - [x] `$set updatedAt`
- [x] `PATCH /api/cart` — Update Cart Item Quantity / Remove (`verifyToken`)
  - [x] `quantity > 0` → `$set` via positional `$` operator
  - [x] `quantity === 0` → `$pull` item from `items` array
  - [x] `$set updatedAt`
- [x] Create MongoDB indexes on `cartsCollection`: `userId` (unique), `items.productId`

---

## Batch 4 — Backend: Checkout & Orders API (4 Endpoints)

> **Goal:** Add all 4 checkout and order routes inside the `index.js` MongoClient callback. Safe, stock-validated checkout with price snapshotting, inventory deduction, cart clearing, and full order lifecycle management.

- [x] `POST /api/checkout` — Checkout Flow (`verifyToken`)
  - [x] Step 1: `findOne` cart by `req.user._id` → `400` if empty
  - [x] Step 2: `find` all `productId`s from cart in `productsCollection` → build `productMap`
  - [x] Step 3: Stock validation loop — `409` on insufficient stock or missing product
  - [x] Step 4: Build snapshotted order document (name, imageUrl, priceCents captured at checkout time)
  - [x] Step 5: `insertOne` into `ordersCollection`
  - [x] Step 6: `bulkWrite` stock deduction — each `updateOne` uses `$gte` guard; verify `modifiedCount`
  - [x] Step 7: `updateOne` cart → `$set items: []` (clear cart)
  - [x] Return `201 { orderId, totalCents, status: "Pending" }`
- [x] `GET /api/orders` — Customer Order History (`verifyToken`)
  - [x] Scope to `req.user._id`, sort `createdAt: -1`
  - [x] Paginate with `page` / `limit` query params
- [x] `GET /api/admin/orders` — Admin: All Platform Orders (`verifyToken, verifyAdmin`)
  - [x] Optional `status` filter via query param
  - [x] Paginate with `page` / `limit`
- [x] `PATCH /api/admin/orders/:id` — Admin: Update Order Status (`verifyToken, verifyAdmin`)
  - [x] Validate `ObjectId.isValid(id)` → `400` if invalid
  - [x] Validate status transition against allowed matrix → `400` on illegal transition
  - [x] `updateOne` order `status`, push to `statusHistory` array
  - [x] `upsert: true` on `ordersCollection` index: `userId`, `status`, `createdAt`
- [x] Create MongoDB indexes on `ordersCollection`: `userId`, `status`, `createdAt` (desc), compound `userId + createdAt`

---

## Batch 5 — Backend: Customers Endpoint & AI Chat (2 Endpoints)

> **Goal:** Add the final 2 routes inside the `index.js` MongoClient callback. Admin can view customer accounts; AI chat assistant powered by Gemini 2.5 Flash with live inventory context and streaming.

- [x] `GET /api/admin/customers` — Admin: Customer Accounts (`verifyToken, verifyAdmin`)
  - [x] `find` on `userProfilesCollection`
  - [x] Project: `email`, `displayName`, `avatarUrl`, `role`, `createdAt` (omit sensitive fields)
  - [x] Paginate: 20 per page via `skip` / `limit`
  - [x] Return `{ customers, pagination: { ... } }`
- [x] `POST /api/chat` — Agentic AI Chat (`verifyToken`)
  - [x] Step 1: `find` active products with projection (`name`, `category`, `priceCents`, `stock`, `tags`, `description`, `_id: 0`)
  - [x] Step 2: Minify product array — rename keys (`n`, `cat`, `price`, `stock`, `tags`, `desc`), truncate description to 150 chars, format price as `"$X.XX"`
  - [x] Step 3: Build `systemInstruction` string with minified inventory JSON injected
  - [x] Step 4: Map client `history` array to Gemini SDK format (`{ role, parts: [{ text }] }`)
  - [x] Step 5: Initialize `GoogleGenerativeAI` with `GEMINI_API_KEY`; call `model.startChat({ history })`
  - [x] Step 6: Stream response using `generateContentStream`; set `Content-Type: text/event-stream` and pipe chunks to `res`
  - [x] Step 7: Append `SUGGEST_JSON:[...]` block to system prompt instructing Gemini to end each reply with 3 suggested prompts in a parseable JSON suffix
  - [x] Return final `{ reply, suggestedPrompts }` on stream end
- [x] Final verification: all 12 endpoints registered, server restarts cleanly, test each route with a REST client

---

## Batch 6 — Frontend: Project Foundation & Design System

> **Goal:** Next.js project initialized inside `client/`, all dependencies installed, `src/lib/` scaffolded following the analyzed project pattern, Better Auth + Stripe wired, and all shared components built.

**Project Structure Pattern (from reference project):**
```
client/src/
  app/
    (main)/          # Public routes with Navbar + Footer layout
    (dashboard)/     # Admin routes with AdminSidebar layout
    api/
      auth/[...all]/ # Better Auth handler
      payment/       # Stripe checkout session handler
  lib/
    core/
      server.js      # serverFetch, protectedFetch, serverMutation, serverDelete
      session.js     # getUserSession, getUserToken, requireRole
    api/             # Read-only fetcher functions (Server Components)
      products.js
      orders.js
      cart.js
    actions/         # `"use server"` mutating functions (Server Actions)
      cart.js
      orders.js
      products.js
      checkout.js
    auth.js          # Better Auth server config (betterAuth + mongodbAdapter)
    auth-client.js   # Better Auth client (createAuthClient + adminClient)
    stripe.js        # Stripe server-only singleton
  components/        # Shared reusable UI components
```

- [x] Initialize `client/` with `create-next-app` (App Router, JavaScript, Tailwind CSS, `src/` directory)
- [x] Install dependencies:
  - `better-auth` `mongodb` — Auth + DB adapter
  - `stripe` `@stripe/stripe-js` — Stripe server + client SDKs
  - `lucide-react` `react-icons` — Icons
  - `react-hook-form` — Form handling
  - `motion` — Animations
- [x] Configure `tailwind.config.js` / `globals.css`
  - [x] Extend colors: `navy: #0A0F1E`, `blue: #3B82F6`, `amber: #F59E0B`, `surface: #1E293B`
  - [x] Add Inter font via Google Fonts in `app/layout.js`
- [x] Create `client/.env.local` with:
  - `NEXT_PUBLIC_BASE_URL` — base URL (used in `src/lib/core/server.js`)
  - `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` — Better Auth config
  - `MONGODB_URI`, `MONGODB_DB` — for Better Auth adapter
  - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe keys
- [x] Scaffold `src/lib/core/server.js` — `serverFetch`, `protectedFetch`, `serverMutation`, `serverDelete` using native `fetch` + `authHeader()`
- [x] Scaffold `src/lib/core/session.js` — `getUserSession`, `getUserToken`, `requireRole` using `auth.api.getSession({ headers })`
- [x] Create `src/lib/auth.js` — `betterAuth` with `mongodbAdapter`, `emailAndPassword`, `admin()` plugin, user `role` field (default `"customer"`)
- [x] Create `src/lib/auth-client.js` — `createAuthClient` with `adminClient()` plugin; export `signIn, signUp, signOut, useSession`
- [x] Create `src/lib/stripe.js` — `import 'server-only'`, `new Stripe(process.env.STRIPE_SECRET_KEY)`
- [x] Scaffold `src/lib/api/` fetcher files (use `serverFetch` / `protectedFetch`):
  - [x] `products.js` — `getProducts(searchParams)`, `getProductBySlug(slug)`
  - [x] `orders.js` — `getUserOrders()`, `getOrderById(id)`, `getAdminOrders()`
  - [x] `cart.js` — `getUserCart()`
  - [x] `customers.js` — `getAdminCustomers(page)`
- [x] Scaffold `src/lib/actions/` Server Action files (`"use server"`):
  - [x] `cart.js` — `addToCart(productId, quantity)`, `updateCartItem(productId, quantity)`
  - [x] `orders.js` — `updateOrderStatus(orderId, status)`
  - [x] `products.js` — `createProduct(data)`, `deleteProduct(id)`
  - [x] `checkout.js` — `createStripeCheckoutSession(cartItems)` → calls `stripe.checkout.sessions.create`
- [x] Create Next.js API Route Handlers:
  - [x] `src/app/api/auth/[...all]/route.js` — `toNextJsHandler(auth)` (GET + POST)
  - [x] `src/app/api/payment/route.js` — Stripe checkout session creator (POST), reads cart from our Express API, creates Stripe session, returns `{ url }`
- [x] Create route group layouts:
  - [x] `src/app/(main)/layout.js` — wraps `<Navbar>` + `{children}` + `<Footer>`
  - [x] `src/app/(dashboard)/layout.jsx` — wraps `<AdminSidebar>` guard-checks `requireRole("admin")`
- [x] Create root `src/app/layout.js` — sets `lang`, Inter font, dark theme, renders `<Toast.Provider />`
- [x] Build shared components in `src/components/shared/`
  - [x] `<ProductCard />` — image, category pill, name (2-line clamp), price (amber), "View Details" button
  - [x] `<SkeletonCard />` — `animate-pulse` matching ProductCard shape
  - [x] `<StatusBadge />` — color-coded by order status string
  - [x] `<Modal />` — reusable overlay with close button and `{children}` slot
  - [x] `<Pagination />` — numbered pages + Prev/Next arrows, URL-synced
  - [x] `<AdminGuard />` — uses `requireRole("admin")` from `session.js`, redirects to `/login`
- [x] Push Batch 6 changes to GitHub

---

## Batch 7 — Frontend: Navbar, Footer & Home Page

> **Goal:** Fully functional landing page with all 9 sections, sticky navbar with all 3 auth states, and complete footer.

- [x] Build `<Navbar />`
  - [x] Logged-out: Home · Shop · About + Login / Register buttons
  - [x] Customer: Home · Shop · Orders · Chat · About + Cart badge + user dropdown (My Orders, Logout)
  - [x] Admin: All customer routes + Admin dropdown (Overview, Products, Add Product, Orders, Customers)
  - [x] Sticky with glassmorphism: `backdrop-blur-md bg-[#0A0F1E]/90`
  - [x] Cart badge animates (scale pulse) on item count change
  - [x] Mobile hamburger → full-screen slide-in drawer
  - [x] Active route: Electric Blue underline via `usePathname()`
- [x] Build `<Footer />`
  - [x] 5 columns: Brand + socials, Shop links, Company links, Support links, Contact info
  - [x] All links are internal `<Link>` components (no dead `href="#"`)
  - [x] Electric Blue top border, copyright line
- [x] Build Home Page (`app/page.js`) — 9 sections:
  - [x] `<HeroSection />` — 65vh, animated particle overlay, 3D-tilt rotating product showcase, two CTAs, scroll chevron
  - [x] `<CategoryLanes />` — 6 electronics categories, horizontal scroll mobile, 6-col desktop, hover glow
  - [x] `<FeaturedProducts />` — 4-card row, `GET /api/products?sort=newest&limit=8`, skeleton loaders
  - [x] `<FlashDeals />` — amber banner, countdown timer, horizontally scrolling deal cards with discount badge
  - [x] `<WhyChooseUs />` — 4 feature tiles (Lucide icons, animated), responsive grid
  - [x] `<StatsCounter />` — 4 counters animated with IntersectionObserver
  - [x] `<Testimonials />` — CSS scroll-snap carousel, 6 testimonial cards, amber star ratings
  - [x] `<Newsletter />` — Electric Blue gradient band, email input, animated envelope icon
  - [x] `<FaqAccordion />` — 6 electronics-relevant items, smooth Tailwind expand/collapse
- [x] Push Batch 7 changes to GitHub (take permission before you push the code)

---

## Batch 8 — Frontend: Shop Page & Product Detail Page

> **Goal:** Fully functional explore experience with 4 filters, URL-synced state, skeleton loaders, and a rich product detail page.

- [x] Build Shop Page (`app/shop/page.js`)
  - [x] `<SearchBar />` — debounced 300ms, syncs to `?q=` URL param
  - [x] `<FilterSidebar />`
    - [x] `<CategoryFilter />` — multi-select checkboxes, syncs to `?category=`
    - [x] `<PriceRangeSlider />` — dual-handle slider, syncs to `?minPrice=&maxPrice=`
    - [x] `<StockToggle />` — in-stock-only toggle, client-side post-filter
  - [x] `<SortDropdown />` — `price_asc`, `price_desc`, `newest`, `name_asc`, syncs to `?sort=`
  - [x] `<ProductGrid />` — 4/2/1 col grid, maps `<ProductCard>` or `<SkeletonCard>` while loading
  - [x] `<Pagination />` — URL-synced, `keepPreviousData: true` TanStack Query
  - [x] `<LazyLoader />` — Infinite scroll / intersection observer, `useInfiniteQuery` with TanStack Query
  - [x] Filter sidebar collapses to slide-up bottom sheet on mobile
  - [x] All filters shareable/bookmarkable via URL query string
- [x] Build Product Detail Page (`app/products/[slug]/page.js`)
  - [x] `<ImageGallery />` — main display + thumbnail strip, click-to-swap
  - [x] `<ProductInfo />` — category tag, name, star rating, price (amber), stock count
  - [x] `<QuantitySelector />` — `[−] [qty] [+]` with min 1, max stock guards
  - [x] `<AddToCartButton />` — calls `POST /api/cart`, invalidates cart query, shows toast; disabled + "Out of Stock" badge if `stock === 0`
  - [x] `<ProductDescription />` — full description tab section
  - [x] `<SpecificationsTable />` — key-value table (brand, model, connectivity, etc.)
  - [x] `<ReviewsSection />` — star distribution bar + 4 seeded review cards
  - [x] `<RelatedProducts />` — `GET /api/products?category=X&limit=4`, 4-card row
  - [x] Hover prefetch on product cards via `queryClient.prefetchQuery()`
- [x] Push Batch 8 changes to GitHub

---

## Batch 9 — Frontend: Auth Pages & Cart + Stripe Checkout

> **Goal:** Login, register, demo login button, the full cart flow, and Stripe-powered checkout (sandbox/test mode).

- [x] Build Login Page (`src/app/(main)/login/page.js`)
  - [x] Email + Password inputs with inline validation via `react-hook-form`
  - [x] `Login` button (amber, full-width) — calls `signIn` from `auth-client.js`
  - [x] **Demo Login button** — auto-fills `demo@yourshop.com` / `Demo@123` and submits
  - [x] Link to `/register`
  - [x] Error messages displayed inline (no alert popups)
- [x] Build Register Page (`src/app/(main)/register/page.js`)
  - [x] Display Name · Email · Password · Confirm Password inputs via `react-hook-form`
  - [x] Real-time password strength indicator bar
  - [x] Validation: min 8 chars, passwords match
  - [x] `Create Account` amber button
  - [x] Link to `/login`
- [x] Build Cart Page (`src/app/(main)/cart/page.js`) — protected (`requireRole` check)
  - [x] `getUserCart()` from `src/lib/api/cart.js` (Server Component fetch)
  - [x] `<CartItem />` per line: image, name, price, `[−][qty][+]` → `updateCartItem` Server Action, trash → quantity: 0
  - [x] `<OrderSummary />` — subtotal, shipping (Free), total
  - [x] `Proceed to Checkout` button → calls Next.js API Route `POST /api/payment` which creates Stripe Checkout Session
  - [x] Stripe redirects user to hosted checkout page (sandbox mode, test card `4242 4242 4242 4242`)
  - [x] Empty cart state: illustration + "Continue Shopping" link
- [x] Build Checkout Success Page (`src/app/(main)/checkout/success/page.js`)
  - [x] Reads `session_id` from URL query param
  - [x] Calls `POST /api/checkout` on our Express server to create the order in MongoDB
  - [x] Shows order confirmation summary (orderId, total, status: processing)
  - [x] "View My Orders" and "Continue Shopping" CTAs
- [x] Push Batch 9 changes to GitHub

---

## Batch 10 — Frontend: Orders Page & Additional Pages

> **Goal:** Customer order history with status badges and expandable line items, plus About and Contact pages.

- [x] Build Orders Page (`app/orders/page.js`) — protected
  - [x] `GET /api/orders` paginated, newest first
  - [x] `<OrderCard />` — Order ID, date, total, color-coded `<StatusBadge />`
  - [x] Expandable accordion: click card → reveals snapshotted line items (image, name, qty, price)
  - [x] Pagination component
- [x] Build About Page (`app/about/page.js`)
  - [x] Hero section: "Our Mission" statement + brand illustration
  - [x] Timeline: YourShop journey (horizontal scroll on mobile)
  - [x] Core Values grid: Innovation, Quality, Transparency, Support (4-col desktop, 2-col mobile)
  - [x] Team cards: avatar, name, role (seeded data — no placeholder names)
- [ ] Push Batch 10 changes to GitHub
- [x] Build Contact Page (`app/contact/page.js`)
  - [x] Two-column layout: form (Name, Email, Subject, Message) + info cards (email, phone, hours) + SVG map illustration
  - [x] Client-side form validation with `useState`
  - [x] Success / error state feedback after submit

---

## Batch 11 — Frontend: Admin Dashboard

> **Goal:** Fully functional admin shell using the `(dashboard)` route group pattern with `<AdminSidebar>` and all 5 admin pages.

- [x] Create `src/app/(dashboard)/layout.jsx`
  - [x] Server Component: calls `requireRole("admin")` from `session.js` — auto-redirects non-admins
  - [x] Renders `<DashboardNavbar>` (sidebar wrapper component)
- [x] Build `<DashboardNavbar />` (sidebar wrapper `src/components/Dashboard/DashboardNavbar.jsx`)
  - [x] Desktop: 240px fixed left sidebar, `hidden lg:flex`
  - [x] Mobile: `<AdminBottomTabs />` fixed bottom-bar, icon-only, `lg:hidden`
  - [x] 5 nav items using `usePathname()` for active state:
    - Overview (`LayoutDashboard` → `/admin`)
    - Products (`Package` → `/admin/products`)
    - Add Product (`PlusCircle` → `/admin/products/add`)
    - Orders (`ClipboardList` → `/admin/orders`)
    - Customers (`Users` → `/admin/customers`)
  - [x] Active state: `border-l-4 border-blue-500` (desktop), blue icon dot (mobile)
  - [x] Bottom: Logout button (red text)
  - [x] Passes `{children}` to main content area with `pl-60` on desktop, `pb-20` on mobile
- [x] Build Admin Overview Page (`src/app/(dashboard)/admin/page.js`)
  - [x] 4 stat cards: Total Orders, Revenue, Products, Customers
  - [x] `<OrderStatusChart />` — Recharts `BarChart`
  - [x] `<RevenueChart />` — Recharts `LineChart`
  - [x] Recent Orders mini-table (last 5) + "View All Orders" link
  - [x] Low Stock Alerts list (stock < 5)
- [x] Build Admin Products Page (`src/app/(dashboard)/admin/products/page.js`)
  - [x] `getProducts()` from `src/lib/api/products.js` (Server Component)
  - [x] Table: IMG, Name, Category, Price, Stock, Delete Action
  - [x] Delete calls `deleteProduct(id)` Server Action from `src/lib/actions/products.js`
  - [x] Low-stock rows: amber border; out-of-stock: red border
  - [x] `[+ Add New Product]` button → `/admin/products/add`
  - [x] Pagination
- [x] Build Admin Add Product Page (`src/app/(dashboard)/admin/products/add/page.js`)
  - [x] `react-hook-form` form: Name, Description, Category, Brand, Price, Stock, Tags, Image URL
  - [x] Submit calls `createProduct(data)` Server Action → success toast → redirect to `/admin/products`
- [x] Build Admin Orders Page (`src/app/(dashboard)/admin/orders/page.js`)
  - [x] `getAdminOrders()` from `src/lib/api/orders.js`
  - [x] Table: Order ID, Customer, Total, Status badge, Date
  - [x] Status filter dropdown
  - [x] `[Update]` → `<Modal />` with status dropdown → `updateOrderStatus` Server Action
- [x] Build Admin Customers Page (`src/app/(dashboard)/admin/customers/page.js`)
  - [x] `getAdminCustomers(page)` from `src/lib/api/customers.js`
  - [x] Table: Avatar, Display Name, Email, Role, Joined date
  - [x] Pagination
- [x] Push Batch 11 changes to GitHub

---

## Batch 12 — Frontend: AI Chat Assistant

> **Goal:** Streaming AI chat with live inventory awareness, multi-turn history, typing indicator, and suggested follow-up prompts.

- [x] Build Chat Page (`app/chat/page.js`) — protected
  - [x] `<ChatWindow />` — scrollable message list, auto-scrolls to latest
  - [x] `<MessageBubble />` — two variants: `user` (right-aligned, blue bg) and `model` (left-aligned, surface bg)
  - [x] `<TypingIndicator />` — 3 dots with staggered `animate-pulse` CSS animation, shown while streaming
  - [x] `<SuggestedPrompts />` — 3 clickable pill buttons below last model response; clicking auto-fills and sends the message
  - [x] `<ChatInput />` — text area + `Send →` button; submit on Enter (Shift+Enter for newline)
  - [x] Conversation history state: `useState([{ role, content }])`
  - [x] History capped at last 10 turns before each API call
  - [x] Opening welcome message from model on page load (no API call — hardcoded)
- [x] Implement streaming receive
  - [x] Call `POST /api/chat` with `{ message, history }`
  - [x] Read SSE / chunked response stream via `ReadableStream` Web API
  - [x] Append token chunks to the active model bubble as they arrive
  - [x] On stream complete: parse and strip `suggestedPrompts` JSON block from response text
  - [x] Render parsed prompts as `<SuggestedPrompts />` pill buttons
- [x] Push Batch 12 changes to GitHub
- [x] Update backend `POST /api/chat` to support streaming (`generateContentStream`) and inject suggested prompts JSON at end of each response

---

## Summary

| Batch | Area | Status |
|---|---|---|
| 1 | Backend: Project Foundation & Middleware | `[x]` |
| 2 | Backend: Catalog / Products API | `[x]` |
| 3 | Backend: Cart System | `[x]` |
| 4 | Backend: Checkout & Orders API | `[x]` |
| 5 | Backend: Customers & AI Chat | `[x]` |
| 6 | Frontend: Project Foundation & Design System | `[x]` |
| 7 | Frontend: Navbar, Footer & Home Page | `[x]` |
| 8 | Frontend: Shop & Product Detail | `[x]` |
| 9 | Frontend: Auth Pages & Cart | `[x]` |
| 10 | Frontend: Orders & Additional Pages | `[x]` |
| 11 | Frontend: Admin Dashboard | `[x]` |
| 12 | Frontend: AI Chat Assistant | `[x]` |

---

*Tick off tasks as each item completes. Review summary table after each batch before moving on.*

## Future Improvements (V2 Roadmap)
- [ ] **Dynamic Multiple Images:** Update the MongoDB Product schema to natively support an `images` array (upload multiple files via the Admin dashboard) and bind the product detail gallery to this dynamic data instead of the static fallback.
- [ ] **AI Semantic Search:** Enhance the search bar using vector embeddings to allow users to search using natural language (e.g., "something good for taking photos on vacation") instead of exact keyword matching.
- [ ] **User Cart & Checkout Flow:** Implement a fully functional cart state (Redux/Zustand) and integrate a payment gateway like Stripe for processing real orders.
- [ ] **Order Tracking System:** Create a real-time order tracking dashboard for customers, leveraging webhooks to update shipping statuses.
- [ ] **Admin Analytics Dashboard:** Add advanced Recharts visualizations for revenue over time, popular categories, and AI-driven insights on user behavior.
- [ ] **User Reviews & Ratings Integration:** Allow authenticated users to leave reviews and calculate average ratings dynamically.
