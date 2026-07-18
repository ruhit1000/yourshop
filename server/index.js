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
    strict: true,
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
      const { q, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;
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

  // Routes will be added here in subsequent batches
}).catch(console.dir);

// Health check route
app.get("/", (req, res) => {
  res.send("YourShop API is running.");
});

app.listen(port, () => {
  console.log(`YourShop server listening on port ${port}`);
});

module.exports = app;
