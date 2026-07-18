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

client.connect(() => {
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
