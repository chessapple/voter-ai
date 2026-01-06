const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in a real app, you'd use a real database)
let votes = [];
let questions = [
  {
    id: 1,
    title: "Select your favorite landscape",
    description: "Choose 3 images you like the most",
    maxSelections: 3,
    images: [
      { id: 1, url: "/images/landscape1.jpg", name: "Mountain View" },
      { id: 2, url: "/images/landscape2.jpg", name: "Ocean Sunset" },
      { id: 3, url: "/images/landscape3.jpg", name: "Forest Path" },
      { id: 4, url: "/images/landscape4.jpg", name: "Desert Dunes" },
      { id: 5, url: "/images/landscape5.jpg", name: "Lake Reflection" },
      { id: 6, url: "/images/landscape6.jpg", name: "City Skyline" }
    ]
  },
  {
    id: 2,
    title: "Best animal photo",
    description: "Choose 2 images you like the most",
    maxSelections: 2,
    images: [
      { id: 7, url: "/images/animal1.jpg", name: "Lion" },
      { id: 8, url: "/images/animal2.jpg", name: "Elephant" },
      { id: 9, url: "/images/animal3.jpg", name: "Dolphin" },
      { id: 10, url: "/images/animal4.jpg", name: "Eagle" },
      { id: 11, url: "/images/animal5.jpg", name: "Panda" },
      { id: 12, url: "/images/animal6.jpg", name: "Tiger" }
    ]
  }
];

let votingClosed = false;
let votingEndTime = null; // ISO string or null

// Admin credentials (in a real app, store this securely)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Helper function to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// API Routes

// Get questions for voting
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// Submit vote
app.post('/api/vote', (req, res) => {
  if (votingClosed) {
    return res.status(400).json({ message: 'Voting is closed.' });
  }
  
  if (votingEndTime && new Date() > new Date(votingEndTime)) {
    votingClosed = true;
    return res.status(400).json({ message: 'Voting time has ended.' });
  }
  
  const { voterName, selections } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Validate input
  if (!voterName || !selections || typeof selections !== 'object') {
    return res.status(400).json({ message: 'Invalid input data.' });
  }
  
  // Validate selections
  for (const questionId in selections) {
    const question = questions.find(q => q.id === parseInt(questionId));
    if (!question) {
      return res.status(400).json({ message: `Invalid question ID: ${questionId}` });
    }
    
    const selectedImages = selections[questionId];
    if (!Array.isArray(selectedImages) || selectedImages.length !== question.maxSelections) {
      return res.status(400).json({ 
        message: `Question ${questionId} requires exactly ${question.maxSelections} selections.` 
      });
    }
    
    // Check if selected images are valid for this question
    for (const imageId of selectedImages) {
      const image = question.images.find(img => img.id === parseInt(imageId));
      if (!image) {
        return res.status(400).json({ message: `Invalid image ID: ${imageId} for question ${questionId}` });
      }
    }
  }
  
  // Create vote object
  const vote = {
    id: votes.length + 1,
    voterName,
    ip,
    selections,
    timestamp: new Date().toISOString(),
    isValid: true // Default to valid
  };
  
  votes.push(vote);
  
  res.status(201).json({ message: 'Vote submitted successfully!' });
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  
  // In a real app, you'd hash and compare the password properly
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get all votes (admin only)
app.get('/api/admin/votes', verifyAdmin, (req, res) => {
  res.json(votes);
});

// Update vote validity (admin only)
app.put('/api/admin/votes/:id', verifyAdmin, (req, res) => {
  const voteId = parseInt(req.params.id);
  const { isValid } = req.body;
  
  const vote = votes.find(v => v.id === voteId);
  if (!vote) {
    return res.status(404).json({ message: 'Vote not found' });
  }
  
  vote.isValid = isValid;
  res.json({ message: 'Vote updated successfully', vote });
});

// Get voting status (admin only)
app.get('/api/admin/status', verifyAdmin, (req, res) => {
  res.json({ 
    votingClosed, 
    votingEndTime,
    totalVotes: votes.length,
    validVotes: votes.filter(v => v.isValid).length
  });
});

// Update voting status (admin only)
app.put('/api/admin/status', verifyAdmin, (req, res) => {
  const { closed, endTime } = req.body;
  
  if (closed !== undefined) votingClosed = closed;
  if (endTime !== undefined) votingEndTime = endTime;
  
  res.json({ 
    message: 'Status updated successfully',
    votingClosed,
    votingEndTime 
  });
});

// Get results (sorted by votes)
app.get('/api/results', (req, res) => {
  const results = {};
  
  // Initialize results structure
  questions.forEach(question => {
    results[question.id] = {
      title: question.title,
      maxSelections: question.maxSelections,
      images: []
    };
    
    // Initialize image vote counts
    question.images.forEach(image => {
      results[question.id].images.push({
        ...image,
        votes: 0
      });
    });
  });
  
  // Count votes for valid votes only
  votes.filter(vote => vote.isValid).forEach(vote => {
    for (const questionId in vote.selections) {
      const selectedImageIds = vote.selections[questionId];
      
      selectedImageIds.forEach(imageId => {
        const imageResult = results[questionId].images.find(img => img.id === parseInt(imageId));
        if (imageResult) {
          imageResult.votes += 1;
        }
      });
    }
  });
  
  res.json(results);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});