const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json())

//databse connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.corsq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("cameraHouse");
        const cameraCollection = database.collection("cameras");
        const orderCollection = database.collection("orders");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection("users");

        // Get all camera 
        app.get('/cameras', async (req, res) => {
        const cursor = cameraCollection.find({});
        const allCamera = await cursor.toArray();
        res.send(allCamera);
        });

       //insert single camera in db
        app.post('/cameras', async(req, res)=>{
        const camera = req.body;
        const result = await cameraCollection.insertOne(camera);
        res.json(result)
        })


        // Get all reviews 
        app.get('/reviews', async (req, res) => {
        const cursor = reviewCollection.find({});
        const allReviews = await cursor.toArray();
        res.send(allReviews);
        });

       //insert review  in db
        app.post('/reviews', async(req, res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.json(result)
        })

       //insert users in db
        app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
        });

        //add order in database
        app.post("/addOrders", async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result)
        });

        // Get Single Camera Details
        app.get('/cameras/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const singleCamera = await cameraCollection.findOne(query);
        res.json(singleCamera);
        })


        // get user all order by email query
        app.get("/myOrders/:email", async (req, res) => {
        const cursor = orderCollection.find({email: req.params.email});
        const allOrders = await cursor.toArray();
        res.send(allOrders);

        });

        // Delete Order Item
        app.delete('/myOrders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.json(result);
        })

        // Delete Product
        app.delete('/cameras/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await cameraCollection.deleteOne(query);
        res.json(result);
        })

        // get all order by email query
        app.get("/myOrders", async (req, res) => {
        const cursor = orderCollection.find({});
        const allOrders = await cursor.toArray();
        res.send(allOrders);
        });

        //set admin for the website
        app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);      
        })

        //check admin role
        app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
        })

        // update statuses

        app.put("/updateStatus/:id", async(req, res)=>{
        const id = req.params.id;
        const updatedStatus = req.body.status;
        const filter = { _id: ObjectId(id) };
        let result= await orderCollection.updateOne(filter, {
        $set: { status: updatedStatus },
      })

        res.json(result)

        })
    }


    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})