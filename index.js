const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();


// middleWares
app.use(cors())
app.use(express.json())


// Api
app.get('/', (req, res) => {
    res.send(`server is running on PORT: ${port}`)
})


// mongoDB


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f30vajg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
      
      await client.connect();
      
      const availableFoodCollection = client.db("surplus-sustain").collection("availableFood")
      
      // Post new food
      app.post('/availableFood', async(req, res) => {
        const newFood = req.body;
        // console.log(newFood)
        const result = await availableFoodCollection.insertOne(newFood);
        res.send(result)
      })

      // Get all available food
      app.get('/availableFood',async (req, res) => {
        const cursor = availableFoodCollection.find();
        const result = await cursor.toArray()
        res.send(result)
      })

      // get the food by specific id

      app.get('/singleFood/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await availableFoodCollection.find(query).toArray();
        res.send(result);
      })

      // post the request in the new collection
      const requestCollection = client.db("surplus-sustain").collection("requests")
      app.post('/requestFood', async (req, res) => {
        const newRequest = req.body;
        console.log(newRequest)
        const result = await requestCollection.insertOne(newRequest);
        res.send(result);
      })

      // get food by filtering by gmail
      app.get('/manageFood/:email', async (req, res) => {
        const email = req.params.email;
        const query = { donorEmail: { $regex: new RegExp(email, 'i') } };
        const cursor = availableFoodCollection.find(query)
        const result = await cursor.toArray();
        res.send(result);
      })

      // delet a specific food item

      app.delete('/food/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await availableFoodCollection.deleteOne(query)
        console.log(id)
        res.send(result);
      })


      
    
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})



// surplus-sustain-team
// JOZcSCwOpJkrQeTc