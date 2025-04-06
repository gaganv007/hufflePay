const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');

// Create Express app
const app = express();
const PORT = process.env.PORT || 9876; 

// Enable CORS for all routes
app.use(cors());

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes for different pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/exchange', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exchange.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/reels', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reels.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Proxy API requests to the backend server
app.use('/api', async (req, res) => {
  try {
    // Forward the request to the backend API
    const apiUrl = 'http://localhost:3000/api';
    
    // Use node-fetch in a CommonJS module
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const response = await fetch(`${apiUrl}${req.url}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling backend API:', error);
    res.status(500).json({ error: 'Failed to connect to backend service' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`HufflePay frontend server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});