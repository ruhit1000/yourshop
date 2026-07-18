# YourShop — Full-Stack Agentic E-Commerce: Architecture Blueprint

> **Phase:** System Design & Architectural Alignment
> **Status:** Backend Architecture — In Review
> **Last Updated:** 2026-07-18

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack Registry](#2-technology-stack-registry)
3. [BSON Database Collection Schemas](#3-bson-database-collection-schemas)
4. [REST API Endpoint Mapping Matrix](#4-rest-api-endpoint-mapping-matrix)
5. [Backend System Transaction Sequence Plans](#5-backend-system-transaction-sequence-plans)
6. [Project Directory Structure](#6-project-directory-structure)
7. [Frontend Plan](#7-frontend-plan)

---

## 1. Project Overview

**YourShop** is a production-ready, full-stack agentic e-commerce platform with:

- A **catalog engine** supporting global search, field-level filtering, sorting, and pagination.
- A **persistent cart system** mapped against `userId`, surviving session switches, logouts, and device changes.
- A **safe checkout flow** with real-time stock validation, price snapshotting, and inventory deduction.
- A **single admin matrix** for product management, order lifecycle management, and platform-wide invoice viewing.
- A **contextual AI Chat Assistant** (Gemini 2.5 Flash) with live inventory awareness and multi-turn conversation history.

Authentication is handled entirely on the **client side via Better Auth**. The backend trusts the `userId` string delivered inside request authorization contexts — no session or token management on the server.

---

## 2. Technology Stack Registry

### Backend

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js | Latest LTS |
| Framework | Express.js | Vanilla JS, no TypeScript |
| Database Driver | `mongodb` (native) | No Mongoose ODM |
| AI Engine | `@google/genai` SDK | `gemini-2.5-flash` model |
| Auth Strategy | Better Auth (client-side) | Server receives `userId` string only |

### Frontend (Phase 2)

| Layer | Technology |
|---|---|
| Framework | React.js / Next.js |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Data Fetching | TanStack Query |
| Charts | Recharts |

---

## 3. BSON Database Collection Schemas

> **Design Principles:**
> - All documents use MongoDB's native `_id` (ObjectId) as the primary key unless stated otherwise.
> - All monetary values are stored as integers in **cents** (e.g., $29.99 → `2999`) to avoid floating-point ledger errors.
> - All timestamps are stored as **ISO 8601 UTC strings** for portability.
> - Orders snapshot prices at checkout time — they are immutable references, never joined back to the Products collection post-creation.

---

### 3.1 `products` Collection

Represents a single purchasable item in the catalog.

```
{
  _id:          ObjectId,           // Auto-generated MongoDB primary key
  name:         String,             // "Wireless Noise-Cancelling Headphones"
  slug:         String,             // "wireless-noise-cancelling-headphones" (URL-safe, unique)
  description:  String,             // Full product description
  category:     String,             // "Electronics" | "Clothing" | "Books" | etc.
  brand:        String,             // "Sony"
  imageUrl:     String,             // CDN or hosted image URL
  priceCents:   Number (Int32),     // Price in cents (2999 = $29.99)
  stock:        Number (Int32),     // Available inventory count
  tags:         [String],           // ["wireless", "audio", "headphones"] — for search boosting
  isActive:     Boolean,            // false = soft-deleted / unlisted from catalog
  createdAt:    String (ISO 8601),
  updatedAt:    String (ISO 8601),
}
```

**Indexes:**

| Field(s) | Type | Purpose |
|---|---|---|
| `slug` | Unique | Canonical URL resolution |
| `name`, `description`, `tags` | Text Index | Full-text catalog search |
| `category` | Ascending | Category filter queries |
| `priceCents` | Ascending | Price range sorting and filtering |
| `isActive` | Ascending | Compound filter: active products only |
| `stock` | Ascending | Low-stock queries for admin dashboard |

---

### 3.2 `userProfiles` Collection

Stores extended profile data for registered users. The `_id` here is **not** an ObjectId — it mirrors the `userId` string issued by Better Auth (typically a UUID or CUID) to enable zero-join lookups.

```
{
  _id:          String,             // Better Auth userId (e.g., "user_2xK9mQ3...") — PRIMARY KEY
  email:        String,             // User's email address
  displayName:  String,            // "Jane Doe"
  avatarUrl:    String,             // Profile image URL (optional)
  role:         String,             // "customer" | "admin"
  createdAt:    String (ISO 8601),
  updatedAt:    String (ISO 8601),
}
```

**Indexes:**

| Field | Type | Purpose |
|---|---|---|
| `_id` | (Default) | Direct userId lookup — O(1) |
| `email` | Unique | Prevent duplicate registrations |
| `role` | Ascending | Admin route guard queries |

> **Auth Note:** The backend does NOT manage passwords or JWTs. Better Auth issues the `userId`. The `verifyToken` middleware (inline in `index.js`) reads the session token from `Authorization: Bearer <token>`, looks it up in the `session` collection, then attaches `req.user` (the full userProfile document) to the request. The `verifyAdmin` middleware (also inline) checks `req.user.role === "admin"` and returns 403 if not.

---

### 3.3 `carts` Collection

One document per user. This is an **upsert-managed** collection — a user will always have at most one cart document. Items within the cart reference live `productId`s but **do not snapshot prices** (price is always read fresh from `products` at checkout time).

```
{
  _id:       ObjectId,
  userId:    String,               // Better Auth userId — foreign key into userProfiles
  items:     [
    {
      productId:   ObjectId,       // Reference to products._id
      quantity:    Number (Int32), // Quantity added (min: 1)
      addedAt:     String (ISO 8601),
    }
  ],
  updatedAt: String (ISO 8601),
}
```

**Indexes:**

| Field | Type | Purpose |
|---|---|---|
| `userId` | Unique | One cart per user; O(1) lookup |
| `items.productId` | Ascending | Validate product existence on cart reads |

**Cart Invariants:**
- A `productId` must not appear more than once in the `items` array. Duplicate additions must **increment `quantity`**, not push a new element.
- `quantity` must be >= 1. Setting quantity to `0` triggers removal of that line item.
- The cart is **cleared atomically** after a successful checkout (not in a separate round-trip).

---

### 3.4 `orders` Collection

Immutable financial ledger. Once created, core fields (`items`, `totalCents`, `userId`) **must never be mutated**. Only `status` and `statusHistory` are mutable post-creation. This preserves accounting integrity.

```
{
  _id:           ObjectId,
  userId:        String,              // Better Auth userId
  items:         [
    {
      productId:     ObjectId,        // Reference kept for display — NOT joined for pricing
      name:          String,          // SNAPSHOTTED product name at checkout
      imageUrl:      String,          // SNAPSHOTTED image at checkout
      priceCents:    Number (Int32),  // SNAPSHOTTED price — immutable ledger entry
      quantity:      Number (Int32),  // Quantity purchased
      subtotalCents: Number (Int32),  // priceCents x quantity
    }
  ],
  totalCents:    Number (Int32),      // Sum of all subtotalCents — immutable
  status:        String,              // "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
  statusHistory: [
    {
      status:    String,
      changedAt: String (ISO 8601),
      note:      String,              // Optional admin note (e.g., "Tracking #XYZ")
    }
  ],
  createdAt:     String (ISO 8601),
  updatedAt:     String (ISO 8601),
}
```

**Indexes:**

| Field | Type | Purpose |
|---|---|---|
| `userId` | Ascending | Fetch all orders for a given user |
| `status` | Ascending | Admin: filter orders by lifecycle stage |
| `createdAt` | Descending | Chronological order listing |
| `userId` + `createdAt` | Compound | User-scoped chronological listing |

**Order Status Lifecycle:**

```
Pending ──► Processing ──► Shipped ──► Delivered
    │
    └──► Cancelled
```

Status transitions are **validated on the backend** — a `Delivered` order cannot move backwards. The `statusHistory` array serves as the immutable audit log.

**Status Transition Validation Matrix:**

```
From \ To     Pending  Processing  Shipped  Delivered  Cancelled
─────────────────────────────────────────────────────────────────
Pending          —         ✓          ✗        ✗          ✓
Processing       ✗         —          ✓        ✗          ✓
Shipped          ✗         ✗          —        ✓          ✗
Delivered        ✗         ✗          ✗        —          ✗
Cancelled        ✗         ✗          ✗        ✗          —
```

---

## 4. REST API Endpoint Mapping Matrix

> **Base URL:** `/api`
> **Auth convention:** All protected routes read the `userId` from the `Authorization` header (provided by Better Auth client). The backend extracts and trusts this value.
> **Admin convention:** Admin routes additionally verify that `userProfiles[userId].role === "admin"`.
> **Total endpoints: 11**

---

### Full Endpoint Matrix

| # | Method | Route | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/products` | Public | Any | Catalog explore: text search, category filter, price range, sort, paginate |
| 2 | `POST` | `/api/products` | Protected | Admin | Add a new product to the catalog |
| 3 | `DELETE` | `/api/products/:id` | Protected | Admin | Soft-delete a product (`isActive: false`) |
| 4 | `GET` | `/api/cart` | Protected | Customer | Retrieve the user's cart with live product data joined via aggregation |
| 5 | `POST` | `/api/cart` | Protected | Customer | Add item to cart or increment quantity if item already exists |
| 6 | `PATCH` | `/api/cart` | Protected | Customer | Update a cart item's quantity; remove if quantity drops to 0 |
| 7 | `POST` | `/api/checkout` | Protected | Customer | Validate stock → snapshot prices → create order → deduct inventory → clear cart |
| 8 | `GET` | `/api/orders` | Protected | Customer | Retrieve the authenticated user's order history (paginated, newest first) |
| 9 | `GET` | `/api/admin/orders` | Protected | Admin | Retrieve ALL platform orders with optional status filter and pagination |
| 10 | `PATCH` | `/api/admin/orders/:id` | Protected | Admin | Update order status with transition validation + append to statusHistory |
| 11 | `POST` | `/api/chat` | Protected | Customer | Submit chat message; receive contextual AI response with live inventory awareness |

---

### Endpoint Detail Specifications

#### Endpoint 1 — `GET /api/products` — Catalog Explore Engine

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | String | Full-text search against `name`, `description`, `tags` |
| `category` | String | Exact match filter on `category` field |
| `minPrice` | Number | Minimum price in cents (inclusive) |
| `maxPrice` | Number | Maximum price in cents (inclusive) |
| `sort` | String | `price_asc` \| `price_desc` \| `newest` \| `name_asc` |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Results per page (default: 20, max: 100) |

**Response shape:**
```json
{
  "products": [...],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

#### Endpoint 2 — `POST /api/products` — Admin: Add Product

**Request body:** `{ name, description, category, brand, imageUrl, priceCents, stock, tags }`

Server generates `slug` from `name` (lowercased, hyphenated, de-duped), sets `isActive: true`, stamps `createdAt`/`updatedAt`.

---

#### Endpoint 3 — `DELETE /api/products/:id` — Admin: Soft-Delete Product

Sets `isActive: false` and `updatedAt`. Does **not** remove the document (preserves historical order references). Returns `204 No Content` on success.

---

#### Endpoint 4 — `GET /api/cart` — Fetch User Cart

Performs a `$lookup` aggregation pipeline joining `items.productId` → `products._id` to return full product metadata (name, imageUrl, current priceCents) alongside cart quantities. Inactive products are excluded from the join result.

---

#### Endpoint 5 — `POST /api/cart` — Add / Increment Cart Item

**Request body:** `{ productId, quantity }`

- If `productId` already exists in `items` array → `$inc` quantity
- If new item → `$push` new item element
- Upserts the cart document if the user has no cart yet

---

#### Endpoint 6 — `PATCH /api/cart` — Update Cart Item Quantity

**Request body:** `{ productId, quantity }`

- `quantity > 0` → `$set items.$.quantity`
- `quantity === 0` → `$pull` item from the array (removes line item)

---

#### Endpoint 7 — `POST /api/checkout` — Checkout Flow

See Section 5.2 for the complete multi-step transaction sequence.

**Response on success:**
```json
{
  "orderId": "64f8a3b2c1d2e3f4a5b6c7d8",
  "totalCents": 5998,
  "status": "Pending"
}
```

---

#### Endpoint 8 — `GET /api/orders` — Customer Order History

**Query Parameters:** `page`, `limit`

Scoped to the authenticated `userId`. Returns orders sorted by `createdAt` descending.

---

#### Endpoint 9 — `GET /api/admin/orders` — Admin: All Platform Orders

**Query Parameters:** `status` (optional filter), `page`, `limit`

Returns all orders across all users. Optionally filtered by `status` string.

---

#### Endpoint 10 — `PATCH /api/admin/orders/:id` — Admin: Update Order Status

**Request body:** `{ status, note }`

Validates the transition legality using the matrix in Section 3.4. On valid transition: appends `{ status, changedAt, note }` to `statusHistory` and updates `status` + `updatedAt`.

---

#### Endpoint 11 — `POST /api/chat` — Agentic AI Chat

**Request body:** `{ message, history: [{ role, content }] }`

See Section 5.3 for the full AI data aggregation and context-building strategy.

**Response:**
```json
{
  "reply": "Yes! We currently have the Sony WH-1000XM5 in stock at $299.99..."
}
```

---

## 5. Backend System Transaction Sequence Plans

---

### 5.1 Cart Persistence Flow

**Objective:** Allow a user to manage a cart that persists across sessions, devices, and logouts. The cart is always server-side and keyed to `userId`.

```
Client (Browser / App)
        │
        │  POST /api/cart  { productId, quantity }
        │  Headers: Authorization: userId
        ▼
[ Express Router ]
        │
        ├─ 1. EXTRACT userId from Authorization header
        │       If missing → 401 Unauthorized
        │
        ├─ 2. VALIDATE productId is a valid ObjectId string
        │       If invalid format → 400 Bad Request
        │
        ├─ 3. VERIFY PRODUCT EXISTS AND IS ACTIVE
        │       db.products.findOne({ _id: ObjectId(productId), isActive: true })
        │       └─ If not found → 404 "Product not found or unavailable"
        │
        ├─ 4. UPSERT CART DOCUMENT
        │       Query:  { userId }
        │       Logic:
        │         If productId already exists in items array:
        │           → $inc: { "items.$.quantity": quantity }
        │         If productId does NOT exist:
        │           → $push: { items: { productId, quantity, addedAt: now() } }
        │         → $set: { updatedAt: now() }
        │         upsert: true  ← creates cart document if user has no cart yet
        │
        └─ 5. RETURN 200 { message: "Cart updated" }
```

**GET /api/cart Enrichment Pipeline (Aggregation):**

```javascript
db.collection('carts').aggregate([
  { $match: { userId } },
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "items.product"
    }
  },
  { $unwind: "$items.product" },
  { $match: { "items.product.isActive": true } },
  {
    $group: {
      _id: "$_id",
      userId: { $first: "$userId" },
      updatedAt: { $first: "$updatedAt" },
      items: { $push: "$items" }
    }
  }
])
```

This pipeline ensures the client always receives **fresh pricing** from the `products` collection while retaining cart quantity metadata.

---

### 5.2 Checkout & Inventory Deduction Flow

**Objective:** Guarantee that:
1. Stock is sufficient before any state changes.
2. Prices are snapshotted at the moment of purchase (immune to future catalog edits).
3. Inventory is reduced exactly by the purchased quantities.
4. The cart is cleared upon success.
5. If any step fails, the entire operation is aborted with no partial state written.

```
Client
   │
   │  POST /api/checkout
   │  Headers: Authorization: userId
   ▼
[ Express Router ]
   │
   ├─ STEP 1: FETCH CART
   │    db.carts.findOne({ userId })
   │    └─ If cart is empty or missing → 400 "Cart is empty"
   │
   ├─ STEP 2: FETCH LIVE PRODUCT DATA
   │    productIds = cart.items.map(i => i.productId)
   │    db.products.find({
   │      _id: { $in: productIds },
   │      isActive: true
   │    }).toArray()
   │    Build productMap: { [productId.toString()]: productDoc }
   │
   ├─ STEP 3: STOCK VALIDATION LOOP
   │    For each cart item:
   │      liveProduct = productMap[item.productId.toString()]
   │      If liveProduct missing:
   │        → 409 "Product '{name}' is no longer available"
   │      If liveProduct.stock < item.quantity:
   │        → 409 "Insufficient stock for '{name}'. Available: {liveProduct.stock}"
   │    All validations pass → proceed
   │
   ├─ STEP 4: BUILD ORDER DOCUMENT (price snapshot)
   │    For each cart item:
   │      liveProduct = productMap[item.productId.toString()]
   │      lineItem = {
   │        productId:     item.productId,
   │        name:          liveProduct.name,           ← SNAPSHOT
   │        imageUrl:      liveProduct.imageUrl,        ← SNAPSHOT
   │        priceCents:    liveProduct.priceCents,      ← SNAPSHOT (IMMUTABLE)
   │        quantity:      item.quantity,
   │        subtotalCents: liveProduct.priceCents * item.quantity
   │      }
   │    totalCents = SUM of all subtotalCents
   │    orderDoc = {
   │      userId,
   │      items: lineItems,
   │      totalCents,
   │      status: "Pending",
   │      statusHistory: [{ status: "Pending", changedAt: now(), note: "Order placed" }],
   │      createdAt: now(),
   │      updatedAt: now()
   │    }
   │
   ├─ STEP 5: INSERT ORDER INTO orders COLLECTION
   │    result = db.orders.insertOne(orderDoc)
   │    orderId = result.insertedId
   │    └─ On insert failure → 500, abort
   │
   ├─ STEP 6: DEDUCT STOCK VIA BULK WRITE
   │    db.products.bulkWrite([
   │      For each cart item:
   │        updateOne({
   │          filter: { _id: item.productId, stock: { $gte: item.quantity } },
   │          update: { $inc: { stock: -item.quantity }, $set: { updatedAt: now() } }
   │        })
   │    ])
   │    └─ Verify modifiedCount === cart.items.length
   │       If mismatch → race condition detected; log + compensate
   │
   ├─ STEP 7: CLEAR CART ATOMICALLY
   │    db.carts.updateOne(
   │      { userId },
   │      { $set: { items: [], updatedAt: now() } }
   │    )
   │
   └─ STEP 8: RETURN 201
        { orderId, totalCents, status: "Pending" }
```

> **Production Atomicity Note:** Steps 5, 6, and 7 should be wrapped in a **MongoDB multi-document transaction** (requires a replica set or Atlas cluster). For single-node development, the sequence is ordered defensively — the worst failure case (order created but cart not cleared) is recoverable via a retry. On retry, stock re-validation in Step 3 prevents duplicate order creation for already-deducted items.

---

### 5.3 AI Data Aggregation & Contextual Chat Strategy

**Objective:** Provide the Gemini model with a compressed, real-time snapshot of the store's inventory so it can answer natural-language queries about products, availability, pricing, and recommendations — while maintaining multi-turn conversation continuity.

```
POST /api/chat  { message, history }
        │
        ├─ STEP 1: FETCH LIVE INVENTORY SNAPSHOT
        │    db.products.find(
        │      { isActive: true },
        │      {                          ← projection (minimize token payload)
        │        name: 1,
        │        category: 1,
        │        priceCents: 1,
        │        stock: 1,
        │        tags: 1,
        │        description: 1,
        │        _id: 0                  ← omit _id from AI context
        │      }
        │    ).toArray()
        │
        ├─ STEP 2: MINIFY PRODUCT DATA STRUCTURE
        │    Transform each product to a condensed, token-efficient object:
        │    {
        │      n:     product.name,
        │      cat:   product.category,
        │      price: "$" + (product.priceCents / 100).toFixed(2),
        │      stock: product.stock,
        │      tags:  product.tags.join(", "),
        │      desc:  product.description.slice(0, 150)  ← truncate long descriptions
        │    }
        │    Serialize the full array to a compact JSON string.
        │
        ├─ STEP 3: BUILD SYSTEM INSTRUCTION WINDOW
        │    systemInstruction = `
        │      You are YourShop's intelligent shopping assistant.
        │      You have real-time access to the store's current inventory.
        │      Help users discover products, compare options, check availability,
        │      and make informed purchase decisions.
        │
        │      ## CURRENT STORE INVENTORY (Live Snapshot):
        │      ${minifiedInventoryJSON}
        │
        │      ## RULES:
        │      - Only recommend products present in the inventory list.
        │      - Always mention if a product is out of stock (stock: 0).
        │      - Format prices as shown (e.g., "$29.99").
        │      - Be concise, friendly, and helpful.
        │      - Do not fabricate product details not present in the inventory.
        │    `
        │
        ├─ STEP 4: PREPARE CONVERSATION HISTORY
        │    Client sends history as:
        │    [
        │      { role: "user",  content: "Do you have wireless headphones?" },
        │      { role: "model", content: "Yes! We have the Sony WH-1000XM5..." },
        │      ...
        │    ]
        │    Map to Gemini SDK format:
        │    [
        │      { role: "user",  parts: [{ text: "..." }] },
        │      { role: "model", parts: [{ text: "..." }] },
        │    ]
        │
        ├─ STEP 5: INVOKE GEMINI SDK
        │    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        │    const model = genAI.getGenerativeModel({
        │      model: "gemini-2.5-flash",
        │      systemInstruction
        │    })
        │    const chat = model.startChat({ history: mappedHistory })
        │    const result = await chat.sendMessage(message)
        │    const responseText = result.response.text()
        │
        └─ STEP 6: RETURN RESPONSE
             { reply: responseText }
             The client appends both the user message and this reply
             to its local history array for the next turn.
```

**Token Budget Strategy:**

| Context Component | Estimated Tokens | Strategy |
|---|---|---|
| System instruction (base) | ~200 | Fixed overhead |
| Minified inventory (per product) | ~50–80 | Truncate description to 150 chars |
| Conversation history (per turn) | ~100–200 | Client sends last N turns (max 10) |
| User message | ~20–50 | Pass through as-is |
| **Total budget target** | **< 8,000 tokens** | Well within Gemini 2.5 Flash's window |

> **Scalability Note:** As the catalog grows beyond ~200 products, add a secondary keyword-filter step before building the inventory snapshot: match the user's message keywords against product `tags` and `category` fields, then pass only the top matching subset to the system instruction. This keeps the context lean at scale without sacrificing relevance.

---

## 6. Project Directory Structure

### Backend — Flat Single-File Architecture

The backend mirrors the reference project structure exactly: **one `index.js` file** containing the MongoClient connection, all inline middleware functions, and all route handlers registered directly on the Express `app`. No separate route files. No separate middleware files.

```
YourShop/
├── plan.md
├── task.md
│
├── server/                          ← Express.js Backend
│   ├── index.js                     ← SINGLE FILE: everything lives here
│   │                                   • MongoClient setup & connect callback
│   │                                   • All collection references (db.collection(...))
│   │                                   • verifyToken inline middleware
│   │                                   • verifyAdmin inline middleware
│   │                                   • All 12 route handlers (app.get, app.post, etc.)
│   │                                   • app.listen at bottom
│   ├── .env                         ← MONGODB_URI, GEMINI_API_KEY, PORT
│   ├── .gitignore                   ← node_modules, .env
│   ├── package.json                 ← express, mongodb, cors, dotenv, @google/genai
│   ├── package-lock.json
│   └── vercel.json                  ← Vercel deployment config
│
└── client/                          ← Next.js Frontend (Phase 2)
    └── ...
```

### Internal `index.js` Structure

```javascript
// 1. Imports & app setup
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors   = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 2. MongoClient connect callback
client.connect(() => {

  // 3. All collection references live here
  const db = client.db("yourshop_db");
  const productsCollection    = db.collection("products");
  const userProfilesCollection = db.collection("userProfiles");
  const cartsCollection       = db.collection("carts");
  const ordersCollection      = db.collection("orders");

  // 4. Inline middleware
  const verifyToken = async (req, res, next) => { ... };
  const verifyAdmin = async (req, res, next) => { ... };

  // 5. Public routes (no middleware)
  app.get("/api/products", async (req, res) => { ... });

  // 6. Protected routes (verifyToken)
  app.get("/api/cart",   verifyToken, async (req, res) => { ... });
  app.post("/api/cart",  verifyToken, async (req, res) => { ... });
  app.patch("/api/cart", verifyToken, async (req, res) => { ... });
  app.post("/api/checkout", verifyToken, async (req, res) => { ... });
  app.get("/api/orders",   verifyToken, async (req, res) => { ... });
  app.post("/api/chat",    verifyToken, async (req, res) => { ... });

  // 7. Admin routes (verifyToken + verifyAdmin)
  app.post("/api/products",          verifyToken, verifyAdmin, async (req, res) => { ... });
  app.delete("/api/products/:id",    verifyToken, verifyAdmin, async (req, res) => { ... });
  app.get("/api/admin/orders",       verifyToken, verifyAdmin, async (req, res) => { ... });
  app.patch("/api/admin/orders/:id", verifyToken, verifyAdmin, async (req, res) => { ... });
  app.get("/api/admin/customers",    verifyToken, verifyAdmin, async (req, res) => { ... });

}).catch(console.dir);

// 8. Health check & listen
app.get("/", (req, res) => res.send("YourShop API is running."));
app.listen(process.env.PORT || 5000, () => console.log("Server running"));
module.exports = app;
```

---

## 7. Frontend Plan — Phase 2

> **Domain:** Electronics E-Commerce
> **Framework:** Next.js (App Router) · JavaScript · Tailwind CSS · TanStack Query · Recharts
> **Auth:** Better Auth (client-side, Google OAuth supported)

---

### 7.1 Design System & Global UI Rules

#### Color Palette (3 Primary + 1 Neutral)

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary Background | Deep Space Navy | `#0A0F1E` | Page backgrounds, navbars |
| Primary Accent | Electric Blue | `#3B82F6` | Buttons, links, highlights, borders |
| CTA / Highlight | Amber Gold | `#F59E0B` | CTA buttons, badges, price tags, ratings |
| Neutral Surface | Slate Dark | `#1E293B` | Cards, modals, input backgrounds |

Additional shades are derived from these using Tailwind's opacity and lightness utilities (no new palette colors introduced).

#### Typography

| Font | Weight | Usage |
|---|---|---|
| **Inter** (Google Fonts) | 400, 500, 600, 700, 800 | All UI text |
| Monospace fallback | system-mono | Code / order IDs only |

#### Global Component Rules

- **Border radius:** `rounded-2xl` (16px) for cards; `rounded-xl` (12px) for buttons; `rounded-lg` (8px) for inputs — applied globally via Tailwind config.
- **Card dimensions:** Fixed aspect ratios enforced via CSS grid / aspect-ratio utilities. All product cards share identical height, width, padding, and shadow.
- **Spacing scale:** 4px base unit; only multiples of 4 used (p-4, p-8, gap-6, etc.).
- **Shadows:** `shadow-lg` with Electric Blue tint on hover (`shadow-blue-500/20`).
- **Transitions:** All interactive elements use `transition-all duration-200 ease-in-out`.
- **Responsiveness breakpoints:** Mobile (`< 640px`), Tablet (`640px–1024px`), Desktop (`> 1024px`).

---

### 7.2 Next.js App Router — Page & Route Map

```
client/
└── app/
    ├── layout.js                  ← Root layout: Navbar + Footer + TanStack QueryProvider + Auth Provider
    ├── page.js                    ← / → Home / Landing Page
    │
    ├── shop/
    │   └── page.js                ← /shop → Explore / Listing Page (search, filter, sort, paginate)
    │
    ├── products/
    │   └── [slug]/
    │       └── page.js            ← /products/[slug] → Product Detail Page
    │
    ├── cart/
    │   └── page.js                ← /cart → Persistent Cart Page (protected)
    │
    ├── checkout/
    │   └── page.js                ← /checkout → Checkout Confirmation (protected)
    │
    ├── orders/
    │   └── page.js                ← /orders → Customer Order History (protected)
    │
    ├── chat/
    │   └── page.js                ← /chat → AI Chat Assistant (protected)
    │
    ├── items/
    │   ├── add/
    │   │   └── page.js            ← /items/add → Admin: Add Product (admin-only)
    │   └── manage/
    │       └── page.js            ← /items/manage → Admin: Manage Products (admin-only)
    │
    ├── admin/
    │   └── orders/
    │       └── page.js            ← /admin/orders → Admin: All Platform Orders (admin-only)
    │
    ├── login/
    │   └── page.js                ← /login → Login Page
    ├── register/
    │   └── page.js                ← /register → Registration Page
    │
    ├── about/
    │   └── page.js                ← /about → About YourShop
    └── contact/
        └── page.js                ← /contact → Contact Page
```

**Total Pages: 14**

---

### 7.3 Navbar Specification

#### Logged-Out State (minimum 3 routes + auth CTAs)

| Position | Element |
|---|---|
| Left | YourShop logo (SVG bolt icon + wordmark) |
| Center | Home · Shop · About |
| Right | `Login` (ghost button) · `Register` (amber filled button) |

#### Logged-In State — Customer (minimum 5 routes)

| Position | Element |
|---|---|
| Left | YourShop logo |
| Center | Home · Shop · Orders · Chat · About |
| Right | Cart icon (with item count badge) · User avatar dropdown |

**User Avatar Dropdown:**
- My Orders
- Logout

#### Logged-In State — Admin (additional routes)

Same as customer navbar **+** an `Admin` dropdown in the center nav:
- Add Product (`/items/add`)
- Manage Products (`/items/manage`)
- Platform Orders (`/admin/orders`)

#### Navbar Behavior

- **Sticky / fixed** at the top with `backdrop-blur-md bg-[#0A0F1E]/90` for a glassmorphism effect.
- Collapses into a hamburger menu on mobile with a full-screen slide-in drawer.
- Active route highlighted with an Electric Blue underline indicator.
- Cart badge animates (scale pulse) when item count changes.

---

### 7.4 Home / Landing Page Sections

**Total sections: 9** (exceeds the 7-section minimum)

#### Section 1 — Hero
- Height: 65vh minimum.
- Dark background with a subtle animated particle / circuit-board grid overlay (CSS keyframes).
- Left: bold headline ("Power Your World"), subheadline, two CTAs: `Shop Now` (amber) and `Explore Deals` (ghost blue).
- Right: auto-rotating 3D-tilt product showcase (CSS perspective transforms) cycling through 3 featured electronics images.
- Animated scroll-down chevron at the bottom.

#### Section 2 — Category Lanes
- Title: "Browse by Category"
- Horizontal scroll row on mobile; 6-column grid on desktop.
- Categories: Smartphones · Laptops · Audio · Cameras · Smart Home · Gaming
- Each category tile: icon + name + product count, hover lifts with blue glow.

#### Section 3 — Featured / New Arrivals
- Title: "New Arrivals"
- 4-card row using the standard product card component.
- Cards pull from `GET /api/products?sort=newest&limit=8`.
- Skeleton loaders while TanStack Query fetches.

#### Section 4 — Flash Deals / Limited Offers
- Title: "Flash Deals" with a live countdown timer.
- Amber accent banner with horizontally scrolling deal cards (showing discount badge, original price struck through).
- 4 deal products hard-wired from the top-discounted items query.

#### Section 5 — Why Choose YourShop (Features)
- 4-column icon grid on desktop, 2-column on tablet, 1-column on mobile.
- Feature tiles: Free Shipping · Secure Payments · 2-Year Warranty · 24/7 Support
- Each tile: animated icon (Lucide React), heading, 2-line description.

#### Section 6 — Platform Statistics
- Full-width dark band with 4 animated counters.
- Stats: `10,000+` Products · `50,000+` Happy Customers · `99.8%` Satisfaction · `Fast` Delivery
- Counter animates from 0 to target value when scrolled into view (IntersectionObserver).

#### Section 7 — Testimonials
- Title: "What Our Customers Say"
- Auto-scrolling carousel (Embla Carousel or custom CSS scroll-snap).
- Each testimonial card: avatar, name, star rating (amber stars), quote.
- 6 real testimonials sourced from the brand's real or seeded customer data.

#### Section 8 — Newsletter Subscription
- Full-width Electric Blue gradient band.
- Headline + subheadline + email input + `Subscribe` button.
- Visual: envelope icon with animated open/close on submit.
- Client-side only (no backend route required; stores to a `subscribers` collection optionally in Phase 3).

#### Section 9 — FAQ Accordion
- Title: "Frequently Asked Questions"
- 6 accordion items relevant to electronics e-commerce (returns, warranty, shipping, payment methods).
- Smooth expand/collapse with Tailwind transitions.

#### Footer

| Column | Content |
|---|---|
| Brand | Logo + 1-line tagline + social icons (Twitter/X, Instagram, GitHub, LinkedIn) |
| Shop | Home · Shop · Cart · Orders |
| Company | About · Contact · Blog |
| Support | FAQ · Returns Policy · Privacy Policy · Terms of Service |
| Contact | `support@yourshop.com` · `+1 (800) 000-0000` · Operating hours |

- Full-width, dark navy background with Electric Blue top border.
- Copyright line at the very bottom.
- All links are internal Next.js `Link` components (no dead href="#").

---

### 7.5 Product Card — Standard Component Spec

Used everywhere: Featured section, Shop page, Related products.

```
┌─────────────────────────────┐
│  [Product Image — 16:9]     │  ← object-cover, lazy-loaded
│  [Out of Stock badge]       │  ← amber badge (conditional)
├─────────────────────────────┤
│  Category tag               │  ← small blue pill
│  Product Name               │  ← 2-line clamp, font-semibold
│  Short description          │  ← 2-line clamp, text-slate-400
├─────────────────────────────┤
│  ★★★★☆ (4.2)   [price]     │  ← amber stars + amber price
│  [View Details →]           │  ← full-width amber button
└─────────────────────────────┘
```

**Grid rules:**
- Desktop: 4 cards per row (`grid-cols-4`)
- Tablet: 2 cards per row (`grid-cols-2`)
- Mobile: 1 card per row (`grid-cols-1`)
- All cards identical height enforced via `grid auto-rows` + flex column inner layout.

**Skeleton Loader:** Matches card shape exactly — animated `animate-pulse` grey blocks replacing each field while data loads.

---

### 7.6 Shop / Explore Page (`/shop`)

```
┌──────────────────────────────────────────────────┐
│  [Search Bar — full width with magnifier icon]   │
├──────────────┬───────────────────────────────────┤
│              │  Sort: [Dropdown]    [X filters]  │
│  FILTER      │  ──────────────────────────────── │
│  SIDEBAR     │  [Card] [Card] [Card] [Card]      │
│              │  [Card] [Card] [Card] [Card]      │
│  Category    │  [Card] [Card] [Card] [Card]      │
│  Checkboxes  │  ──────────────────────────────── │
│              │  [← 1  2  3  4 … →]  Pagination  │
│  Price Range │                                   │
│  Slider      │                                   │
│              │                                   │
│  In Stock    │                                   │
│  Toggle      │                                   │
└──────────────┴───────────────────────────────────┘
```

**Filter Fields (minimum 2, implementing 4):**

| Filter | Type | Maps to API param |
|---|---|---|
| Category | Multi-select checkboxes | `category` |
| Price Range | Dual-handle range slider | `minPrice`, `maxPrice` |
| In Stock Only | Toggle switch | Custom client-side post-filter |
| Sort Order | Dropdown select | `sort` |

**Search:** Debounced (300ms) text input → `q` query param.

**Pagination:**
- Numbered page buttons + Prev/Next arrows.
- URL-synced (`?page=2`) so browser back/forward works.
- TanStack Query `keepPreviousData: true` for smooth page transitions.

**Behavior:**
- All filters are URL-synced (query string) — shareable / bookmarkable filter states.
- Clearing all filters resets to `GET /api/products` defaults.
- Filter sidebar collapses into a slide-up bottom sheet on mobile.

---

### 7.7 Product Detail Page (`/products/[slug]`)

**Publicly accessible (no auth required).**

```
┌──────────────────────┬─────────────────────────────┐
│                      │  Category Tag               │
│  Main Product Image  │  Product Name               │
│  [Large]             │  ★★★★☆ (4.2) · 128 reviews │
│                      │  ──────────────────────     │
│  [Thumb] [Thumb] ... │  $299.99  (in amber)        │
│                      │  ──────────────────────     │
│                      │  Qty: [−] [1] [+]           │
│                      │  [Add to Cart] (blue)       │
│                      │  [Buy Now] (amber)          │
│                      │  ──────────────────────     │
│                      │  Stock: 12 units left       │
│                      │  Free Shipping · Warranty   │
└──────────────────────┴─────────────────────────────┘

[ Description / Overview ]      ← full product description
[ Specifications ]              ← key-value table (brand, model, connectivity, etc.)
[ Customer Reviews ]            ← star distribution + review cards
[ Related Products ]            ← same category, 4-card row
```

**Notes:**
- The image gallery uses a main display + thumbnail strip; clicking a thumbnail updates the main image.
- `Add to Cart` calls `POST /api/cart` and invalidates the `cart` TanStack Query cache.
- If `stock === 0`, the `Add to Cart` button is replaced with an `Out of Stock` disabled badge.
- Client-side review data is seeded statically (no backend reviews endpoint in v1).
- Related products fetched from `GET /api/products?category={currentCategory}&limit=4`.

---

### 7.8 Cart Page (`/cart`) — Protected

```
┌───────────────────────────────┬──────────────────────┐
│  Cart Items                   │  ORDER SUMMARY       │
│  ─────────────────────────    │  ─────────────────── │
│  [Img] Name          $29.99   │  Subtotal:  $299.98  │
│         Qty: [−][2][+]  🗑    │  Shipping:  Free     │
│  ─────────────────────────    │  ─────────────────── │
│  [Img] Name          $49.99   │  TOTAL:     $299.98  │
│         Qty: [−][1][+]  🗑    │                      │
│                               │  [Proceed to         │
│                               │   Checkout] (amber)  │
└───────────────────────────────┴──────────────────────┘
```

- Fetches via `GET /api/cart` — shows live product prices joined from the backend aggregation.
- Quantity `+/-` buttons fire `PATCH /api/cart` and invalidate the cart query.
- Trash icon fires `PATCH /api/cart` with `quantity: 0` to remove the line item.
- Proceeds to `POST /api/checkout` on button click, then redirects to `/orders` on success.
- Empty cart state shows an illustration + `Continue Shopping` link back to `/shop`.

---

### 7.9 Orders Page (`/orders`) — Protected

- Fetches `GET /api/orders` (paginated, newest first).
- Each order displayed as a card: Order ID · Date · Total · Status badge (color-coded).
- Status badge colors:

| Status | Color |
|---|---|
| Pending | Amber |
| Processing | Electric Blue |
| Shipped | Purple |
| Delivered | Green |
| Cancelled | Red |

- Each order card expands inline (accordion) to show the snapshotted line items.

---

### 7.10 Authentication Pages

#### Login (`/login`)
- YourShop logo centered at the top.
- `Email` + `Password` inputs with inline validation.
- `Login` button (amber, full-width).
- `Continue with Google` button (white with Google logo) via Better Auth OAuth flow.
- **Demo Login button** → auto-fills `demo@yourshop.com` / `Demo@123` then submits.
- Link: "Don't have an account? Register" → `/register`.

#### Register (`/register`)
- `Display Name` · `Email` · `Password` · `Confirm Password` fields.
- Real-time password strength indicator (bar component).
- `Create Account` button (amber, full-width).
- `Continue with Google` OAuth button.
- Link: "Already have an account? Login" → `/login`.

**Validation Rules:**
- Email: valid format required.
- Password: min 8 chars, at least 1 uppercase, 1 number.
- Confirm Password: must match.
- All errors displayed inline below the relevant field (no alert popups).

**Better Auth Integration Pattern:**
```javascript
// Client-side Better Auth usage pattern
import { createAuthClient } from "better-auth/client"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
})

// After login, extract userId from session
const { data: session } = await authClient.getSession()
const userId = session?.user?.id

// Attach userId to all API requests
// Authorization: userId  (header key)
```

---

### 7.11 Admin — Add Product (`/items/add`) — Admin Only

**Route guard:** If no session or role !== `"admin"` → redirect to `/login`.

```
┌──────────────────────────────────────────────┐
│  Add New Product                             │
│  ──────────────────────────────────────────  │
│  Product Name            [_______________]   │
│  Short Description       [_______________]   │
│  Full Description        [_______________ ]  │
│                          [_______________ ]  │
│  Category                [Dropdown ▾     ]   │
│  Brand                   [_______________]   │
│  Price (USD)             [_______________]   │
│  Stock Quantity          [_______________]   │
│  Tags (comma-separated)  [_______________]   │
│  Image URL               [_______________]   │
│                                              │
│  [Submit — Add Product] (amber, full-width)  │
└──────────────────────────────────────────────┘
```

- `priceCents` is computed server-side from the dollar-format input (`parseFloat(price) * 100`).
- On submit: `POST /api/products` → success toast notification → form reset.
- On error: field-level error messages displayed inline.

---

### 7.12 Admin — Manage Products (`/items/manage`) — Admin Only

**Route guard:** Same as `/items/add`.

```
┌─────┬──────────────────┬──────────┬──────┬─────────┬─────────┐
│ IMG │ Name             │ Category │Price │ Stock   │ Actions │
├─────┼──────────────────┼──────────┼──────┼─────────┼─────────┤
│ 🖼  │ Sony WH-1000XM5  │ Audio    │$299  │ 12 left │ [Del]   │
│ 🖼  │ MacBook Pro 14"  │ Laptops  │$1999 │  5 left │ [Del]   │
│ 🖼  │ iPhone 15 Pro    │ Phones   │$999  │  0 left │ [Del]   │
└─────┴──────────────────┴──────────┴──────┴─────────┴─────────┘
[ ← 1  2  3 → ]
```

- Data fetched from `GET /api/products` (admin can see all including inactive).
- Delete fires `DELETE /api/products/:id` (soft-delete) → row removed from table optimistically via TanStack Query mutation + rollback on failure.
- Low-stock rows (stock < 5) highlighted with amber left border.
- Out-of-stock rows (stock === 0) dimmed with red left border.

---

### 7.13 Admin — Platform Orders (`/admin/orders`) — Admin Only

```
┌──────────┬─────────────┬──────────┬────────────┬────────────┬──────────┐
│ Order ID │ Customer ID │ Total    │ Status     │ Date       │ Actions  │
├──────────┼─────────────┼──────────┼────────────┼────────────┼──────────┤
│ #A3F2... │ user_2xK9.. │ $299.98  │ [Pending]  │ 2026-07-18 │ [Update] │
│ #B9D1... │ user_7mL4.. │ $1,099   │ [Shipped]  │ 2026-07-17 │ [Update] │
└──────────┴─────────────┴──────────┴────────────┴────────────┴──────────┘
```

- `Update` opens a modal with a status dropdown (constrained to valid transitions per the status matrix) + optional note field.
- Fires `PATCH /api/admin/orders/:id` → invalidates query → table row status updates in place.
- Status filter dropdown at the top (All / Pending / Processing / Shipped / Delivered / Cancelled).
- Includes a Recharts summary bar chart: order count per status, displayed at the top of the page.

---

### 7.14 AI Chat Assistant (`/chat`) — Protected

```
┌─────────────────────────────────────────────┐
│  YourShop AI Assistant                      │
│  ─────────────────────────────────────────  │
│                                             │
│  [model] Hi! I'm your shopping assistant.  │
│           How can I help you today?         │
│                                             │
│  [user] Do you have noise-cancelling        │
│          headphones under $300?             │
│                                             │
│  [model] ●●● (typing indicator)            │
│  [model] Yes! We have the Sony WH-1000XM5  │
│           at $299.99 with 12 in stock...    │
│                                             │
│  ─────────────────────────────────────────  │
│  Suggested:  [Under $100?] [Top Laptops?]   │
│  ─────────────────────────────────────────  │
│  [Type a message...          ] [Send →]     │
└─────────────────────────────────────────────┘
```

**Capabilities:**
- Answers product questions using live inventory context (injected server-side).
- Understands follow-up context within the same session (history array sent on each turn).
- Handles navigation questions (e.g., "Where do I see my orders?" → responds with the `/orders` route).
- Suggests follow-up prompts displayed as clickable pill buttons below the last model response.

**Streaming Implementation:**
- `POST /api/chat` returns the reply as a streamed response using the Gemini SDK's streaming API (`generateContentStream`).
- The client reads the stream chunk-by-chunk using the `ReadableStream` Web API and appends tokens to the message bubble as they arrive.

**Typing Indicator:**
- Three animated dots (`●●●` pulsing with staggered CSS animation) displayed in a model message bubble while streaming.

**Conversation History Management (TanStack Query / useState):**
```
State: chatHistory = [{ role, content }, ...]
- On user send: push { role: "user", content: message } → call POST /api/chat with full history
- On reply complete: push { role: "model", content: reply }
- History capped at last 10 turns before sending to backend (context window management)
- History persists in React state for the session (not stored in DB in v1)
```

**Suggested Follow-Up Prompts (3 shown after each model response):**
Generated server-side — the backend instructs Gemini to append a JSON block of 3 suggested prompts at the end of each response, which the client parses and strips from the display text before rendering as pill buttons.

---

### 7.15 Additional Pages

#### About (`/about`)
- **Section 1:** Brand story — full-width hero with the "Our Mission" statement and a team illustration.
- **Section 2:** Timeline — YourShop's journey from founding to now (horizontal scroll on mobile).
- **Section 3:** Core Values — 4-column grid (Innovation, Quality, Transparency, Support).
- **Section 4:** Team cards — photo, name, role (seeded data).

#### Contact (`/contact`)
- **Left column:** Contact form (Name, Email, Subject, Message) + `Send Message` button.
- **Right column:** Contact info cards (email address, phone, business hours) + embedded map placeholder (static SVG map illustration).
- Client-side form validation; success/error state managed with `useState`.

---

### 7.16 TanStack Query — Cache & Invalidation Strategy

| Query Key | Endpoint | Stale Time | Invalidated By |
|---|---|---|---|
| `['products', filters]` | `GET /api/products` | 5 min | Admin add/delete product |
| `['product', slug]` | `GET /api/products?slug=...` | 5 min | Admin delete product |
| `['cart', userId]` | `GET /api/cart` | 0 (always fresh) | POST/PATCH cart, checkout |
| `['orders', userId]` | `GET /api/orders` | 1 min | Successful checkout |
| `['admin/orders']` | `GET /api/admin/orders` | 30 sec | PATCH order status |

**Optimistic Updates:**
- Cart quantity changes are applied optimistically (UI updates instantly); rolled back on API error with an error toast.
- Product deletion in admin table is applied optimistically; rolled back on API error.

**Prefetching:**
- On hover over a product card, the product detail query is prefetched using `queryClient.prefetchQuery()` so the detail page loads instantly.

---

### 7.17 Component Hierarchy Map

```
app/
├── layout.js
│   ├── <AuthProvider>            ← Better Auth session context
│   ├── <QueryClientProvider>     ← TanStack Query global client
│   ├── <Navbar />
│   │   ├── <NavLinks />
│   │   ├── <CartBadge />
│   │   ├── <UserMenu />
│   │   └── <MobileDrawer />
│   └── <Footer />
│
├── page.js (Home)
│   ├── <HeroSection />
│   ├── <CategoryLanes />
│   ├── <FeaturedProducts />       ← uses <ProductCard />
│   ├── <FlashDeals />             ← uses <DealCard />
│   ├── <WhyChooseUs />
│   ├── <StatsCounter />
│   ├── <Testimonials />
│   ├── <Newsletter />
│   └── <FaqAccordion />
│
├── shop/page.js
│   ├── <SearchBar />
│   ├── <FilterSidebar />
│   │   ├── <CategoryFilter />
│   │   ├── <PriceRangeSlider />
│   │   └── <StockToggle />
│   ├── <SortDropdown />
│   ├── <ProductGrid />            ← maps <ProductCard /> or <SkeletonCard />
│   └── <Pagination />
│
├── products/[slug]/page.js
│   ├── <ImageGallery />
│   ├── <ProductInfo />
│   ├── <QuantitySelector />
│   ├── <AddToCartButton />
│   ├── <ProductDescription />
│   ├── <SpecificationsTable />
│   ├── <ReviewsSection />
│   └── <RelatedProducts />        ← uses <ProductCard />
│
├── cart/page.js
│   ├── <CartItem />               ← repeated per item
│   └── <OrderSummary />
│
├── orders/page.js
│   ├── <OrderCard />              ← expandable accordion
│   └── <OrderLineItem />
│
├── chat/page.js
│   ├── <ChatWindow />
│   │   ├── <MessageBubble />      ← user or model variant
│   │   └── <TypingIndicator />
│   ├── <SuggestedPrompts />
│   └── <ChatInput />
│
└── shared/
    ├── <ProductCard />
    ├── <SkeletonCard />
    ├── <StatusBadge />
    ├── <Toast />
    ├── <Modal />
    └── <AdminGuard />             ← HOC: checks role, redirects if not admin
```

---

### 7.18 Environment Variables — Client

```
# client/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

### 7.19 Admin Dashboard — Dedicated Layout System

> The admin experience lives inside its own **Next.js Route Group** (`(admin)`), which applies a completely different layout shell from the public site. A logged-in admin who visits any `/admin/*` route gets the admin shell instead of the public Navbar + Footer.

---

#### 7.19.1 Route Group Structure

```
client/
└── app/
    └── (admin)/                        ← Route Group — no URL segment added
        ├── layout.js                   ← Admin shell layout (replaces root layout for all children)
        └── admin/
            ├── page.js                 ← /admin          → Dashboard Overview
            ├── products/
            │   └── page.js             ← /admin/products → Manage Products
            ├── products/
            │   └── add/
            │       └── page.js         ← /admin/products/add → Add New Product
            ├── orders/
            │   └── page.js             ← /admin/orders   → All Platform Orders
            └── customers/
                └── page.js             ← /admin/customers → Customer Accounts
```

**Guard:** The `(admin)/layout.js` runs an `<AdminGuard>` check on mount. If the session is missing or `role !== "admin"`, it immediately redirects to `/login`. No admin page ever renders for non-admin users.

**Navbar integration:** When the admin logs in via the public site Navbar, the `Admin Dashboard` link in the user dropdown routes to `/admin`. From that point, the admin shell takes over the entire viewport.

---

#### 7.19.2 Admin Shell — Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  DESKTOP (≥ 1024px)                                            │
│                                                                │
│  ┌─────────────┬──────────────────────────────────────────┐   │
│  │  SIDEBAR    │  TOP HEADER BAR                          │   │
│  │  (fixed,    │  [≡] YourShop Admin · [🔔] [👤 Admin ▾] │   │
│  │   240px)    ├──────────────────────────────────────────┤   │
│  │             │                                          │   │
│  │  🏠 Overview│  <Page Content>                         │   │
│  │  📦 Products│                                          │   │
│  │  ➕ Add Item│                                          │   │
│  │  📋 Orders  │                                          │   │
│  │  👥 Customers                                          │   │
│  │             │                                          │   │
│  │  ─────────  │                                          │   │
│  │  🚪 Logout  │                                          │   │
│  └─────────────┴──────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  MOBILE (< 1024px)                                             │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TOP HEADER BAR                                          │  │
│  │  ← YourShop Admin · [🔔] [👤]                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  <Page Content — full width>                             │  │
│  │                                                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  BOTTOM TAB BAR (fixed)                                  │  │
│  │  🏠    📦    ➕    📋    👥                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

#### 7.19.3 Sidebar — Desktop (≥ 1024px)

| Property | Value |
|---|---|
| Width | 240px fixed, never collapses |
| Position | `fixed left-0 top-0 h-screen` |
| Background | Deep Space Navy `#0A0F1E` with a right border in Electric Blue `border-blue-500/20` |
| Active route | Left accent bar `border-l-4 border-blue-500` + Electric Blue text + subtle bg highlight |
| Inactive route | Slate text, hover → Electric Blue text + `bg-slate-800/50` |
| Logo area | YourShop bolt icon + "Admin Panel" wordmark at top of sidebar |
| Bottom section | Separator line + Logout link (red text, `🚪` icon) |
| Scrollable | `overflow-y-auto` if routes exceed viewport height |

**Sidebar Nav Items:**

| Icon | Label | Route |
|---|---|---|
| `LayoutDashboard` | Overview | `/admin` |
| `Package` | Products | `/admin/products` |
| `PlusCircle` | Add Product | `/admin/products/add` |
| `ClipboardList` | Orders | `/admin/orders` |
| `Users` | Customers | `/admin/customers` |

*(All icons from `lucide-react`)*

---

#### 7.19.4 Bottom Tab Bar — Mobile (< 1024px)

- **Fixed to the bottom** of the viewport (`fixed bottom-0 left-0 right-0 z-50`).
- **Icons only** — no labels. Each tab is a square touch target (min 48×48px).
- Active tab icon filled with Electric Blue; inactive tabs in `text-slate-500`.
- Tab bar background: Deep Space Navy with a top border `border-slate-700`.
- Active tab has a small Electric Blue dot indicator above the icon.
- **Safe area padding** applied for iOS home bar (`pb-safe` / `padding-bottom: env(safe-area-inset-bottom)`).

**Tab Order (left to right):**

| Position | Icon | Route |
|---|---|---|
| 1 | `LayoutDashboard` | `/admin` |
| 2 | `Package` | `/admin/products` |
| 3 | `PlusCircle` | `/admin/products/add` |
| 4 | `ClipboardList` | `/admin/orders` |
| 5 | `Users` | `/admin/customers` |

---

#### 7.19.5 Admin Top Header Bar

Persistent across all admin pages on both mobile and desktop.

| Element | Description |
|---|---|
| Left (desktop) | Page title (dynamic — matches current route, e.g., "Orders") |
| Left (mobile) | `←` back arrow (returns to `/`) + "Admin Panel" text |
| Right | Notification bell icon (static in v1) · Admin avatar + name + logout dropdown |

---

#### 7.19.6 Admin Dashboard Pages

---

##### `/admin` — Overview Dashboard

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Orders│ Revenue     │ Products    │ Customers   │
│ 1,284       │ $48,200     │ 342         │ 2,190       │
│ ↑ 12% MoM  │ ↑ 8% MoM   │ ─────       │ ↑ 5% MoM   │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌──────────────────────────────┬──────────────────────────┐
│  Orders by Status (Bar Chart)│  Revenue Over Time       │
│  [Recharts BarChart]         │  [Recharts LineChart]    │
│  Pending/Processing/Shipped/ │  Last 7 days of          │
│  Delivered/Cancelled         │  totalCents aggregated   │
└──────────────────────────────┴──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Recent Orders (last 5)                                 │
│  Mini table: Order ID · Customer · Total · Status       │
│  [View All Orders →]                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Low Stock Alerts                                       │
│  Products where stock < 5, sorted ascending             │
│  [Product name] [stock count] [Edit →]                  │
└─────────────────────────────────────────────────────────┘
```

**Data Sources:**
- Stats cards → aggregation on `orders` collection (`$group`, `$sum totalCents`) + `products.countDocuments` + `userProfiles.countDocuments`
- Bar chart → `GET /api/admin/orders` grouped client-side by `status`
- Line chart → orders grouped by `createdAt` date (last 7 days), totals summed
- Low stock → `GET /api/products?sort=stock_asc&limit=5` (new sort value added to endpoint 1)

> **Note:** The Overview page adds 1 new read-only aggregation call. No new endpoint needed — the existing `GET /api/admin/orders` and `GET /api/products` endpoints cover all data requirements for the dashboard with client-side grouping.

---

##### `/admin/products` — Manage Products

Same table design as specified in section 7.12, rendered inside the admin shell.

Additional elements in this context:
- `[+ Add New Product]` button in the top-right of the page header → navigates to `/admin/products/add`.
- Search bar above the table to filter the product list client-side.
- Column for `isActive` status toggle (visual only in v1 — soft-delete via Delete button).

---

##### `/admin/products/add` — Add New Product

Same form design as section 7.11, rendered inside the admin shell. On successful submit, redirects to `/admin/products` and shows a success toast.

---

##### `/admin/orders` — Platform Orders

Same table design as section 7.13, rendered inside the admin shell.

Additional elements:
- Recharts `BarChart` at the top (orders by status count) — same as Overview page widget, reused as a shared `<OrderStatusChart />` component.
- Date range filter (from/to date pickers) to narrow order results.

---

##### `/admin/customers` — Customer Accounts

```
┌─────┬──────────────┬───────────────────────┬───────┬────────────┐
│ AVT │ Display Name │ Email                 │ Role  │ Joined     │
├─────┼──────────────┼───────────────────────┼───────┼────────────┤
│ 👤  │ Jane Doe     │ jane@example.com      │ cust. │ 2026-07-01 │
│ 👤  │ John Smith   │ john@example.com      │ cust. │ 2026-07-05 │
└─────┴──────────────┴───────────────────────┴───────┴────────────┘
```

- Data fetched from a new read-only endpoint (added to the server — see note below).
- **Read-only** in v1 — no edit or delete actions for customer accounts.
- Pagination: 20 per page.

> **New Endpoint Required:** `GET /api/admin/customers` — protected, admin-only. Returns paginated `userProfiles` documents (excludes `_id`, returns `email`, `displayName`, `avatarUrl`, `role`, `createdAt`). This brings the total endpoint count to **12**.

---

#### 7.19.7 Admin Layout — Component Breakdown

```
app/(admin)/layout.js
├── <AdminGuard />               ← session check; redirects to /login if not admin
├── <AdminSidebar />             ← hidden on mobile (lg:block), fixed 240px
│   ├── <AdminLogo />
│   ├── <AdminNavItem /> × 5    ← icon + label, active state detection via usePathname()
│   └── <AdminLogout />
├── <AdminTopBar />              ← sticky top header (mobile + desktop)
│   ├── <PageTitle />            ← dynamic via usePathname()
│   └── <AdminUserMenu />
├── <AdminBottomTabs />          ← visible on mobile only (lg:hidden), fixed bottom
│   └── <AdminTabIcon /> × 5    ← icons only, active state via usePathname()
└── <main>                       ← page content, padded left by 240px on desktop
    {children}
</main>
```

**Active Route Detection:**
All nav items use Next.js `usePathname()` hook to compare the current path against their `href`. Exact match for `/admin`; prefix match for nested routes (e.g., `/admin/products` and `/admin/products/add` both highlight the Products tab).

---

#### 7.19.8 Responsive Behavior Summary

| Breakpoint | Sidebar | Bottom Tabs | Top Bar |
|---|---|---|---|
| Mobile `< 1024px` | Hidden (`hidden`) | Visible (`flex`) | Visible |
| Desktop `≥ 1024px` | Visible (`block`) | Hidden (`hidden`) | Visible |
| Main content padding | `pl-0` on mobile | — | `pl-60` on desktop (sidebar width offset) |

---

#### 7.19.9 Updated Route & Page Count

| Area | Pages |
|---|---|
| Public site | 10 (Home, Shop, Product Detail, Cart, Checkout, Orders, Chat, Login, Register, About, Contact) |
| Admin dashboard | 5 (/admin, /admin/products, /admin/products/add, /admin/orders, /admin/customers) |
| **Total** | **15 pages** |

---

*End of Full Architecture Blueprint (Backend + Frontend). Ready for implementation.*

