const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// root route
app.get("/", (req, res) => {
  res.send("🍋 Mango Server Is Running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rfkbq1n.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const mangoCollection = client.db("mangoDB").collection("all-mango");
    const userCollection = client.db("mangoDB").collection("users");

    // add new mango
    app.post("/all-mango", async (req, res) => {
      const mangoData = req.body;
      console.log("Received Mango:", mangoData);
      const result = await mangoCollection.insertOne(mangoData);
      res.send(result);
    });

    // get all mango
    app.get("/all-mango", async (req, res) => {
      const result = await mangoCollection.find().toArray();
      res.send(result);
    });

    // get specific mango details
    app.get("/all-mango/:id", async (req, res) => {
      const mangoId = req.params.id;
      const query = { _id: new ObjectId(mangoId) };
      const result = await mangoCollection.findOne(query);
      res.send(result);
    });

    // update specific mango
    app.put("/all-mango/:id", async (req, res) => {
      const mangoId = req.params.id;
      const query = { _id: new ObjectId(mangoId) };
      const options = { upsert: true };
      const updateMango = req.body;
      const updateDoc = {
        $set: updateMango,
      };
      const result = await mangoCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // delete specific mango
    app.delete("/all-mango/:id", async (req, res) => {
      const mangoId = req.params.id;
      const query = { _id: new ObjectId(mangoId) };
      const result = await mangoCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // create user api
    app.post("/users", async (req, res) => {
      const formValue = req.body;
      const result = await userCollection.insertOne(formValue);
      console.log(result);
      res.send(result);
    });

    // get user api from db
    app.get("/users/", async (req, res) => {
      const cursor = await userCollection.find().toArray();
      res.send(cursor);
    });

    // updated patch user
    app.patch("/users", async (req, res) => {
      const { lastSignInTime, email } = req.body;
      const query = { email };
      const update = { $set: { lastSignInTime } };
      const result = await userCollection.updateOne(query, update);
      res.send(result);
    });

    // delete users from db
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    // connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
