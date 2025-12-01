
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Bot detection middleware
const isBotRequest = (userAgent) => {
  const bots = [
    'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit', 
    'twitterbot', 'linkedinbot', 'googlebot', 'bingbot'
  ];
  return bots.some(bot => userAgent.toLowerCase().includes(bot));
};

// Handle product detail routes
app.get('/product/:productId', (req, res) => {
  const userAgent = req.get('User-Agent') || '';
  
  if (isBotRequest(userAgent)) {
    // Serve static HTML for bots
    res.sendFile(path.join(__dirname, '../dist/product-detail.html'));
  } else {
    // Serve SPA for regular users
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Handle event detail routes
app.get('/event/:eventId', (req, res) => {
  const userAgent = req.get('User-Agent') || '';
  
  if (isBotRequest(userAgent)) {
    // Serve static HTML for bots
    res.sendFile(path.join(__dirname, '../dist/event-detail.html'));
  } else {
    // Serve SPA for regular users
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Handle all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
