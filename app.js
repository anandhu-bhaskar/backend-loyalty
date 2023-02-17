const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv').config();
const https = require('https')

const agent = new https.Agent({
  rejectUnauthorized: false
})

// Import API routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const balanceRoutes = require('./routes/balance');
const rewardRoutes = require('./routes/reward');

// Configure body parser to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS to allow frontend to access API endpoints
app.use(cors());

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

// Check database connection status
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB database');
});

// Set API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/reward', rewardRoutes);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });