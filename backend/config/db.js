const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (uri) {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return;
    }

    // Try standard local MongoDB
    try {
      console.log('Attempting connection to local MongoDB at mongodb://127.0.0.1:27017/procureguard...');
      await mongoose.connect('mongodb://127.0.0.1:27017/procureguard', {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`MongoDB Connected locally: ${mongoose.connection.host}`);
      return;
    } catch (localErr) {
      console.log('Local MongoDB not available. Launching MongoMemoryServer in-memory database...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`MongoDB In-Memory Server Started at: ${mongoUri}`);
    }
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
