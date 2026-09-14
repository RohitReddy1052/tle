const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const Tender = require('./models/Tender');
const seedData = require('./scripts/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ProcureGuard Backend API' });
});

// Start Server
const startServer = async () => {
  await connectDB();

  // Check if database needs seeding
  const count = await Tender.countDocuments();
  if (count === 0) {
    console.log('Database empty on startup. Triggering automatic seeding process...');
    await seedData();
  }

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  ProcureGuard Backend API running on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/health`);
    console.log(`  API Base: http://localhost:${PORT}/api`);
    console.log(`=================================================`);
  });
};

startServer();
