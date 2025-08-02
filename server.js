// rate-that-airline-backend/server.js

// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 3. Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // Use port 3000 by default, or an environment variable

// 4. Middleware Setup
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Enable parsing of JSON request bodies

// --- 5. MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI; // Get connection string from environment variable

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in environment variables.');
  process.exit(1); // Exit if no URI is provided
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if connection fails
  });

// --- 6. Define MongoDB Schema and Model ---
// This defines the structure of your review documents in MongoDB
const reviewSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flight: String,
  route: String,
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  ratings: {
    overall: { type: Number, required: true },
    punctuality: Number,
    food: Number,
    comfort: Number,
    staff: Number,
    entertainment: Number,
    value: Number,
    wifi: Number,
    groundService: Number,
  },
  comments: {
    punctuality: String,
    food: String,
    comfort: String,
    staff: String,
    entertainment: String,
    value: String,
    wifi: String,
    groundService: String,
    overall: String, // Added overall comment field
  },
  user: { type: String, default: 'Anonymous' }, // Placeholder for user, can be extended later
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const Review = mongoose.model('Review', reviewSchema); // 'Review' will create a 'reviews' collection

// --- 7. Define API Routes ---

// GET route to fetch all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({}); // Find all documents in the 'reviews' collection
    res.json(reviews); // Send reviews as JSON response
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error fetching reviews.' });
  }
});

// POST route to submit a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body); // Create a new Review document from request body
    const savedReview = await newReview.save(); // Save the new review to MongoDB
    res.status(201).json(savedReview); // Respond with the saved review and 201 Created status
  } catch (error) {
    console.error('Error saving review:', error);
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error saving review.' });
  }
});

// --- 8. Start the Server ---
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});