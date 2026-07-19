const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient("mongodb+srv://yourshop_db:a96YjTQ8qDSgAKzh@cluster0.kd12gaw.mongodb.net/?appName=Cluster0");
  await client.connect();
  const db = client.db("yourshop_db");
  const session = await db.collection("session").findOne({});
  const token = session.token;
  
  // try direct request to backend
  const backendRes = await fetch("http://localhost:8000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message: "hello" })
  });
  console.log("Backend response status:", backendRes.status);
  
  if (!backendRes.ok) {
    const text = await backendRes.text();
    console.log("Backend error:", text);
  }
  
  process.exit(0);
}
run();
