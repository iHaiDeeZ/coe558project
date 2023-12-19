const express = require('express');
const { MongoClient } = require('mongodb');
const { ApolloServer, gql } = require('apollo-server-express');
const cors = require('cors');

// MongoDB setup
const mongoUri = 'mongodb+srv://hadi:hadi@hadi.zfp4gcd.mongodb.net/hadi?retryWrites=true&w=majority';
const app = express();
const port = 3000;

let client;
let dbConnection;

async function connectToDatabase() {
    if (!client || !client.topology || !client.topology.isConnected()) {
        client = new MongoClient(mongoUri);
        await client.connect();
        dbConnection = client.db('hadi');
    }
    return dbConnection;
}

// CORS Middleware for Express
app.use(cors({
    origin: '*', // or specify your client-side origin if needed for security
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization'
}));

app.use(express.json());
function formatTimeDiff(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}
// REST API endpoint

app.get('/data', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('hadi');

        const data = await collection.find({}).sort({ "sensor_001.datetime": -1 }).limit(60).toArray();

        const now = new Date();
        let sensorStatus = 'offline';
        let lastCriticalCondition = 'Normal';
        let timeDifference = null;

        if (data.length > 0) {
            const lastEntry = data[0].sensor_001;
            timeDifference = now - new Date(lastEntry.datetime);

            if (timeDifference <= 300000) {
                sensorStatus = 'online';
            }

            for (const entry of data) {
                if (entry.sensor_001.status === 'Fire') {
                    lastCriticalCondition = 'Fire';
                    break;
                } else if (entry.sensor_001.status === 'Caution') {
                    lastCriticalCondition = 'Caution';
                }
            }
        }

        res.status(200).json({
            "Last Time Online": timeDifference !== null ? formatTimeDiff(timeDifference) : 'Unknown',
            "Sensor Status": sensorStatus,
            "Last Critical Condition": lastCriticalCondition
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        res.status(500).send('Error connecting to database');
    }
});

// GraphQL type definitions
const typeDefs = gql`
    type TempSensor {
        value: Float!
        datetime: String!
    }

    type SmokeSensor {
        smoke_sensor: Boolean!
        datetime: String!
    }

    type Buzzer {
        buzzer_status: Boolean!
        datetime: String!
    }

    type LED {
        led_status: Boolean!
        datetime: String!
    }

    type SensorData {
        temp_sensor: TempSensor
        smoke_sensor: SmokeSensor
        buzzer: Buzzer
        led: LED
    }

    type SensorDataArray {
        data: [SensorData]
    }

    type Query {
        getAllSensorData: SensorDataArray
    }
`;

// Resolvers for your schema
const resolvers = {
    Query: {
        getAllSensorData: async () => {
            const db = await connectToDatabase();
            const collection = db.collection('hadi');
            const allData = await collection.find({}).sort({ "sensor_001.datetime": -1 }).toArray();

            return {
                data: allData.map(item => ({
                    temp_sensor: {
                        value: item.sensor_001.temp_value,
                        datetime: item.sensor_001.datetime
                    },
                    smoke_sensor: {
                        smoke_sensor: item.sensor_001.smoke_sensor === 1,
                        datetime: item.sensor_001.datetime
                    },
                    buzzer: {
                        buzzer_status: item.sensor_001.buzzer_status === 'On',
                        datetime: item.sensor_001.datetime
                    },
                    led: {
                        led_status: item.sensor_001.led_status === 'On',
                        datetime: item.sensor_001.datetime
                    }
                }))
            };
        }
    }
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

// Start the server with Apollo Server
const startServer = async () => {
    await apolloServer.start();
    apolloServer.applyMiddleware({ 
        app,
        cors: {
            origin: 'https://website-xmh5u4hxaa-uc.a.run.app/', // or specify your client-side origin if needed for security
            credentials: false,
            methods: 'GET,POST,OPTIONS',
        } 
    });

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`GraphQL endpoint: ${apolloServer.graphqlPath}`);
    });
};

startServer();

