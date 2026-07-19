const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

client.connect().then(() => {
  console.log("Connected to MongoDB");

  const db = client.db("yourshop_db");
  const productsCollection = db.collection("products");
  const userProfilesCollection = db.collection("userProfiles");
  const cartsCollection = db.collection("carts");
  const ordersCollection = db.collection("orders");
  const sessionCollection = db.collection("session"); // Assuming Better Auth uses this

  // Inline verifyToken middleware
  const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }

    // Look up session in DB
    const session = await sessionCollection.findOne({ token: token });
    if (!session) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }

    const userId = session?.userId;
    const user = await userProfilesCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }

    req.user = user;
    next();
  };

  // Inline verifyAdmin middleware
  const verifyAdmin = async (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    next();
  };

  // Batch 2: Create Indexes for productsCollection
  productsCollection.createIndex({ slug: 1 }, { unique: true }).catch(console.error);
  productsCollection.createIndex({ name: "text", description: "text", tags: "text" }).catch(console.error);
  productsCollection.createIndex({ category: 1 }).catch(console.error);
  productsCollection.createIndex({ priceCents: 1 }).catch(console.error);
  productsCollection.createIndex({ isActive: 1 }).catch(console.error);
  productsCollection.createIndex({ stock: 1 }).catch(console.error);

  // GET /api/products — Catalog Explore Engine
  app.get("/api/products", async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice, sort, page = 1, limit = 30 } = req.query;
      const matchStage = { isActive: true };
      
      if (q) {
        matchStage.$text = { $search: q };
      }
      if (category) {
        matchStage.category = category;
      }
      if (minPrice || maxPrice) {
        matchStage.priceCents = {};
        if (minPrice) matchStage.priceCents.$gte = parseInt(minPrice);
        if (maxPrice) matchStage.priceCents.$lte = parseInt(maxPrice);
      }
      
      const pipeline = [{ $match: matchStage }];
      
      let sortStage = {};
      switch (sort) {
        case "price_asc": sortStage = { priceCents: 1 }; break;
        case "price_desc": sortStage = { priceCents: -1 }; break;
        case "name_asc": sortStage = { name: 1 }; break;
        case "stock_asc": sortStage = { stock: 1 }; break;
        case "newest": 
        default:
          sortStage = { createdAt: -1 }; break;
      }
      
      // If doing text search and no specific sort is requested, you often sort by textScore, 
      // but to keep it simple, we just apply the requested or default sort.
      // if (q && sort === undefined) sortStage = { score: { $meta: "textScore" } }; 
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await productsCollection.aggregate(countPipeline).toArray();
      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / parseInt(limit)) || 1;
      
      const dataPipeline = [
        ...pipeline,
        { $sort: sortStage },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];
      
      const products = await productsCollection.aggregate(dataPipeline).toArray();
      
      res.send({
        products,
        meta: { totalItems, totalPages, currentPage: parseInt(page), itemsPerPage: parseInt(limit) }
      });
    } catch (error) {
      console.error("Error in GET /api/products:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // POST /api/products — Admin: Add Product
  app.post("/api/products", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { name, priceCents, stock, category, description, tags, brand, imageUrl } = req.body;
      
      if (!name || priceCents === undefined || stock === undefined || !category) {
        return res.status(400).send({ error: "Missing required fields" });
      }
      
      // Generate unique slug
      let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await productsCollection.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const newProduct = {
        name,
        slug,
        priceCents,
        stock,
        category,
        description,
        tags,
        brand,
        imageUrl,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await productsCollection.insertOne(newProduct);
      res.status(201).send({ _id: result.insertedId, ...newProduct });
    } catch (error) {
      console.error("Error in POST /api/products:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // DELETE /api/products/:id — Admin: Soft-Delete Product
  app.delete("/api/products/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid product ID format" });
      }
      
      const result = await productsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).send({ error: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /api/products/:id:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Batch 3: Create Indexes for cartsCollection
  cartsCollection.createIndex({ userId: 1 }, { unique: true }).catch(console.error);
  cartsCollection.createIndex({ "items.productId": 1 }).catch(console.error);

  // GET /api/cart — Fetch User Cart
  app.get("/api/cart", verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      
      const pipeline = [
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        { $match: { $or: [{ "productDetails.isActive": true }, { "items": { $exists: false } }] } }, 
        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            items: {
              $push: {
                $cond: [
                  { $ifNull: ["$items.productId", false] },
                  {
                    productId: "$items.productId",
                    quantity: "$items.quantity",
                    addedAt: "$items.addedAt",
                    product: "$productDetails"
                  },
                  "$$REMOVE"
                ]
              }
            }
          }
        }
      ];
      
      const result = await cartsCollection.aggregate(pipeline).toArray();
      let cart = result[0];
      
      if (!cart) {
        // If aggregation matched no active products but cart exists, 
        // or user has no cart, fetch fallback.
        cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
        if (!cart) {
          cart = { userId, items: [], createdAt: new Date(), updatedAt: new Date() };
        } else {
          cart.items = []; // all items were inactive
        }
      }
      
      let cartTotal = 0;
      if (cart && cart.items) {
        cart.items.forEach(item => {
          if (item.product && item.product.priceCents) {
            cartTotal += item.product.priceCents * item.quantity;
          }
        });
      }
      cart.cartTotal = cartTotal;
      
      res.send(cart);
    } catch (error) {
      console.error("Error in GET /api/cart:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // POST /api/cart — Add / Increment Cart Item
  app.post("/api/cart", verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId, quantity = 1 } = req.body;
      
      if (!ObjectId.isValid(productId)) {
        return res.status(400).send({ error: "Invalid product ID format" });
      }
      
      const product = await productsCollection.findOne({ _id: new ObjectId(productId), isActive: true });
      if (!product) {
        return res.status(404).send({ error: "Product not found or inactive" });
      }
      
      const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
      
      if (cart) {
        const itemExists = cart.items.find(item => item.productId.toString() === productId);
        if (itemExists) {
          await cartsCollection.updateOne(
            { userId: new ObjectId(userId), "items.productId": new ObjectId(productId) },
            { 
              $inc: { "items.$.quantity": quantity },
              $set: { updatedAt: new Date() }
            }
          );
        } else {
          await cartsCollection.updateOne(
            { userId: new ObjectId(userId) },
            { 
              $push: { items: { productId: new ObjectId(productId), quantity, addedAt: new Date() } },
              $set: { updatedAt: new Date() }
            }
          );
        }
      } else {
        await cartsCollection.insertOne({
          userId: new ObjectId(userId),
          items: [{ productId: new ObjectId(productId), quantity, addedAt: new Date() }],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      res.status(200).send({ message: "Cart updated successfully" });
    } catch (error) {
      console.error("Error in POST /api/cart:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // PATCH /api/cart — Update Cart Item Quantity / Remove
  app.patch("/api/cart", verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;
      
      if (!ObjectId.isValid(productId)) {
        return res.status(400).send({ error: "Invalid product ID format" });
      }
      if (quantity === undefined || quantity < 0) {
        return res.status(400).send({ error: "Valid quantity is required" });
      }
      
      if (quantity === 0) {
        await cartsCollection.updateOne(
          { userId: new ObjectId(userId) },
          { 
            $pull: { items: { productId: new ObjectId(productId) } },
            $set: { updatedAt: new Date() }
          }
        );
      } else {
        await cartsCollection.updateOne(
          { userId: new ObjectId(userId), "items.productId": new ObjectId(productId) },
          { 
            $set: { 
              "items.$.quantity": quantity,
              updatedAt: new Date()
            }
          }
        );
      }
      
      res.status(200).send({ message: "Cart item updated successfully" });
    } catch (error) {
      console.error("Error in PATCH /api/cart:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Batch 4: Create Indexes for ordersCollection
  ordersCollection.createIndex({ userId: 1 }).catch(console.error);
  ordersCollection.createIndex({ createdAt: -1 }).catch(console.error);

  // POST /api/checkout — Checkout Flow
  app.post("/api/checkout", verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      
      const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).send({ error: "Cart is empty" });
      }
      
      const productIds = cart.items.map(item => new ObjectId(item.productId));
      const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();
      
      const productMap = {};
      products.forEach(p => {
        productMap[p._id.toString()] = p;
      });
      
      let orderTotal = 0;
      const orderItems = [];
      
      for (const item of cart.items) {
        const product = productMap[item.productId.toString()];
        if (!product || !product.isActive) {
          return res.status(400).send({ error: `Product ${item.productId} is unavailable` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).send({ error: `Not enough stock for ${product.name}` });
        }
        
        orderTotal += product.priceCents * item.quantity;
        orderItems.push({
          productId: product._id,
          name: product.name,
          priceCents: product.priceCents,
          quantity: item.quantity,
          imageUrl: product.imageUrl
        });
      }
      
      const newOrder = {
        userId: new ObjectId(userId),
        items: orderItems,
        totalCents: orderTotal,
        status: "processing",
        shippingAddress: req.body.shippingAddress || null, 
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const orderResult = await ordersCollection.insertOne(newOrder);
      
      // Deduct stock
      for (const item of orderItems) {
        await productsCollection.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }
      
      // Clear cart
      await cartsCollection.deleteOne({ userId: new ObjectId(userId) });
      
      res.status(201).send({ _id: orderResult.insertedId, message: "Order placed successfully" });
    } catch (error) {
      console.error("Error in POST /api/checkout:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // GET /api/orders — Fetch User Orders
  app.get("/api/orders", verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      const orders = await ordersCollection.find({ userId: new ObjectId(userId) })
                                           .sort({ createdAt: -1 })
                                           .toArray();
      res.send(orders);
    } catch (error) {
      console.error("Error in GET /api/orders:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // GET /api/orders/:id — Order Detail
  app.get("/api/orders/:id", verifyToken, async (req, res) => {
    try {
      const userId = req.user._id;
      const orderId = req.params.id;
      
      if (!ObjectId.isValid(orderId)) {
        return res.status(400).send({ error: "Invalid order ID format" });
      }
      
      const query = { _id: new ObjectId(orderId) };
      if (req.user.role !== "admin") {
        query.userId = new ObjectId(userId);
      }
      
      const order = await ordersCollection.findOne(query);
      if (!order) {
        return res.status(404).send({ error: "Order not found" });
      }
      
      res.send(order);
    } catch (error) {
      console.error("Error in GET /api/orders/:id:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // PATCH /api/orders/:id — Admin: Update Status
  app.patch("/api/orders/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      
      if (!ObjectId.isValid(orderId)) {
        return res.status(400).send({ error: "Invalid order ID format" });
      }
      
      const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).send({ error: "Invalid status value" });
      }
      
      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status, updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).send({ error: "Order not found" });
      }
      
      res.send({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error in PATCH /api/orders/:id:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // GET /api/admin/customers — Admin: Customer Accounts
  app.get("/api/admin/customers", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const totalItems = await userProfilesCollection.countDocuments();
      const totalPages = Math.ceil(totalItems / limit) || 1;

      const customers = await userProfilesCollection
        .find({})
        .project({ email: 1, displayName: 1, avatarUrl: 1, role: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      res.send({ customers, pagination: { totalItems, totalPages, currentPage: page, itemsPerPage: limit } });
    } catch (error) {
      console.error("Error in GET /api/admin/customers:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // POST /api/chat — Agentic AI Chat
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  app.post("/api/chat", verifyToken, async (req, res) => {
    try {
      const { history, message } = req.body;
      
      // Step 1 & 2: Get active products and minify
      const activeProducts = await productsCollection
        .find({ isActive: true })
        .project({ name: 1, category: 1, priceCents: 1, stock: 1, tags: 1, description: 1, _id: 0 })
        .toArray();
        
      const minifiedInventory = activeProducts.map(p => ({
        n: p.name,
        cat: p.category,
        price: `$${(p.priceCents / 100).toFixed(2)}`,
        stock: p.stock,
        tags: p.tags,
        desc: p.description ? p.description.substring(0, 150) : ""
      }));

      // Step 3: Build System Instruction
      const systemInstruction = `You are the YourShop AI Assistant. You help users find products, recommend items, and answer questions.
Here is the current live inventory in JSON format:
${JSON.stringify(minifiedInventory)}

CRITICAL INSTRUCTION: At the very end of every reply you generate, you MUST append a block exactly like this:
SUGGEST_JSON:["Prompt 1", "Prompt 2", "Prompt 3"]
This JSON array should contain exactly 3 suggested follow-up questions the user can ask you based on your response.`;

      // Step 4: Map client history
      const contents = [];
      if (history && Array.isArray(history)) {
        history.forEach(msg => {
          contents.push({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] });
        });
      }
      if (message) {
        contents.push({ role: 'user', parts: [{ text: message }] });
      }

      // Step 5 & 6: Stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: { systemInstruction }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error("Error in POST /api/chat:", error);
      if (!res.headersSent) {
        res.status(500).send({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
        res.end();
      }
    }
  });

  // End of routes
}).catch(console.dir);

// Health check route
app.get("/", (req, res) => {
  res.send("YourShop API is running.");
});

app.listen(port, () => {
  console.log(`YourShop server listening on port ${port}`);
});

module.exports = app;
