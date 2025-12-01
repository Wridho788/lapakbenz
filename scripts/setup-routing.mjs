#!/usr/bin/env node

/**
 * Setup routing untuk production server
 * Script ini membuat file konfigurasi untuk handle SPA routing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nginx configuration untuk handle SPA routing
const nginxConfig = `
# Nginx configuration untuk LapakBenz SPA
server {
    listen 80;
    server_name lapakbenz.com www.lapakbenz.com;
    root /var/www/lapakbenz/dist;
    index index.html;

    # Handle static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Handle product detail routes
    location ~ ^/product/([^/]+)$ {
        # Check if it's a bot/crawler
        if ($http_user_agent ~* "(bot|crawler|spider|scraper|facebookexternalhit|twitterbot|linkedinbot)") {
            try_files /product-detail.html =404;
        }
        try_files $uri /index.html;
    }

    # Handle event detail routes
    location ~ ^/event/([^/]+)$ {
        # Check if it's a bot/crawler
        if ($http_user_agent ~* "(bot|crawler|spider|scraper|facebookexternalhit|twitterbot|linkedinbot)") {
            try_files /event-detail.html =404;
        }
        try_files $uri /index.html;
    }

    # Handle static pages for bots
    location /product-detail {
        try_files /product-detail.html =404;
    }

    location /event-detail {
        try_files /event-detail.html =404;
    }

    # Handle all other routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

// Apache .htaccess configuration
const htaccessConfig = `
# Apache configuration untuk LapakBenz SPA
RewriteEngine On

# Handle static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Handle product detail routes for bots
RewriteCond %{HTTP_USER_AGENT} (bot|crawler|spider|scraper|facebookexternalhit|twitterbot|linkedinbot) [NC]
RewriteRule ^product/([^/]+)/?$ /product-detail.html [L]

# Handle event detail routes for bots
RewriteCond %{HTTP_USER_AGENT} (bot|crawler|spider|scraper|facebookexternalhit|twitterbot|linkedinbot) [NC]
RewriteRule ^event/([^/]+)/?$ /event-detail.html [L]

# Handle all other routes (SPA)
RewriteRule ^.*$ /index.html [L]
`;

// Express server configuration
const expressServerConfig = `
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
  console.log(\`Server running at http://localhost:\${port}\`);
});
`;

// Package.json scripts untuk production server
const packageJsonScripts = {
  "serve": "node scripts/server.js",
  "serve:nginx": "nginx -c $(pwd)/scripts/nginx.conf",
  "serve:apache": "cp scripts/.htaccess dist/",
};

// Create server files
const projectRoot = path.resolve(__dirname, '..');
const scriptsDir = path.resolve(projectRoot, 'scripts');

// Ensure scripts directory exists
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Write configuration files
fs.writeFileSync(path.join(scriptsDir, 'nginx.conf'), nginxConfig);
fs.writeFileSync(path.join(scriptsDir, '.htaccess'), htaccessConfig);
fs.writeFileSync(path.join(scriptsDir, 'server.js'), expressServerConfig);

console.log('✅ Server routing configuration files created:');
console.log('   - scripts/nginx.conf (Nginx configuration)');
console.log('   - scripts/.htaccess (Apache configuration)');
console.log('   - scripts/server.js (Express server)');
console.log('');
console.log('📚 Usage:');
console.log('   1. For Express server: npm run serve');
console.log('   2. For Apache: Copy .htaccess to your web root');
console.log('   3. For Nginx: Use nginx.conf as reference');
console.log('');
console.log('💡 The configurations handle:');
console.log('   - Bot detection for SEO');
console.log('   - SPA routing fallback');
console.log('   - Static file serving');