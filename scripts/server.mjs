import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Bot detection middleware
const isBotRequest = (userAgent) => {
  if (!userAgent) return false;
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
    res.sendFile(path.join(__dirname, '../dist/public/product-detail.html'));
  } else {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Handle event detail routes
app.get('/event/:eventId', (req, res) => {
  const userAgent = req.get('User-Agent') || '';
  (`Event route: ${req.params.eventId}, User-Agent: ${userAgent.substring(0, 50)}...`);
  
  if (isBotRequest(userAgent)) {
    res.sendFile(path.join(__dirname, '../dist/public/event-detail.html'));
  } else {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Handle all other routes (SPA fallback)
app.get('*', (req, res, next) => {
  // Skip if it's a static file request
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|html)$/)) {
    return next();
  }
  
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});