const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(express.json());

const mongoUri = '';
const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let isConnected = false; // New global variable to track connection status

async function run(data) {
    try {
        if (!isConnected) {
            await client.connect();
            db = client.db("hadi");
            isConnected = true; // Update the connection status
        }

        // Insert data into MongoDB
        await db.collection("hadi").insertOne(data);
        console.log('Data inserted successfully.');

    } catch (error) {
        console.error('Error in database operation:', error);
        isConnected = false; // Reset the connection status on error
        throw error;
    }
    // Note: Not closing the client in a serverless environment
}

app.post('/receiveData', async (req, res) => {
    try {
        const data = req.body;
        console.log('Received data:', data);

        await run(data);

        res.status(200).send('Data received and stored successfully.');
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data');
    }
});

exports.receiveData = app;
