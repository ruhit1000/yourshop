const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient("mongodb+srv://yourshop_db:a96YjTQ8qDSgAKzh@cluster0.kd12gaw.mongodb.net/?appName=Cluster0");
  await client.connect();
  const db = client.db("yourshop_db");
  const session = await db.collection("session").findOne({});
  console.log(session);
  process.exit(0);
}
run();
