const { MongoClient } = require('mongodb');

// MongoDB setup
const mongoUri = ''; //setup this

let client;
let dbConnection;

async function connectToDatabase() {
  if (dbConnection) {
    return dbConnection;
  }

  client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  dbConnection = client.db('hadi');
  return dbConnection;
}

exports.getData = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('hadi');

    // Sort the documents by datetime in descending order and get only the most recent one
    const data = await collection.find({}).sort({"sensor_001.datetime": -1}).limit(1).toArray();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows access from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Specify allowed HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers

    res.status(200).json(data);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Error connecting to database');
  } finally {
    if (client && client.isConnected()) {
      await client.close(); // Close the connection when finished.
    }
  }
};
