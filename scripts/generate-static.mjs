#!/usr/bin/env node

/**
 * Generate Static HTML Files untuk SEO
 * Script ini menggenerate static HTML files yang dapat diindex oleh search engine
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base template untuk static HTML
const baseTemplate = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/lapakbenz.png" type="image/png" />
    <link rel="apple-touch-icon" href="/lapakbenz.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
    <!-- Primary Meta Tags -->
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESCRIPTION}}" />
    <meta name="keywords" content="{{KEYWORDS}}" />
    <meta name="author" content="lapakBenz" />
    <link rel="canonical" href="https://lapakbenz.com{{PATH}}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{DESCRIPTION}}" />
    <meta property="og:image" content="https://lapakbenz.com/lapakbenz.png" />
    <meta property="og:url" content="https://lapakbenz.com{{PATH}}" />
    <meta property="og:site_name" content="lapakBenz" />
    <meta property="og:locale" content="id_ID" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{TITLE}}" />
    <meta name="twitter:description" content="{{DESCRIPTION}}" />
    <meta name="twitter:image" content="https://lapakbenz.com/lapakbenz.png" />
    <meta name="twitter:site" content="@lapakbenz" />
    
    <!-- SEO Meta Tags -->
    <meta name="theme-color" content="#161129" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow" />
    <meta name="bingbot" content="index, follow" />
    
    <!-- Performance -->
    <link rel="manifest" href="/manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
    
    <!-- Structured Data -->
    {{SCHEMA}}
    
    <!-- Bot Detection & Redirect Script -->
    <script>
      (function() {
        // Detect if visitor is a bot/crawler
        const userAgent = navigator.userAgent.toLowerCase();
        const searchBots = [
          'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
          'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot',
          'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
          'outbrain', 'pinterest/0.', 'developers.google.com/+/web/snippet',
          'slackbot', 'vkshare', 'w3c_validator', 'redditbot', 'applebot',
          'whatsapp', 'flipboard', 'tumblr', 'bitlybot', 'skypeuripreview',
          'nuzzel', 'discordbot', 'google page speed', 'qwantbot', 'pinterestbot',
          'bitrix link preview', 'xing-contenttabreceiver', 'chrome-lighthouse',
          'telegrambot'
        ];
        
        const isBotOrCrawler = searchBots.some(bot => userAgent.includes(bot)) ||
                              userAgent.includes('bot') || 
                              userAgent.includes('crawler') || 
                              userAgent.includes('spider') ||
                              userAgent.includes('scraper');
        
        // If not a bot, redirect to React app
        if (!isBotOrCrawler && typeof window !== 'undefined') {
          // Small delay to allow any crawlers that might not be detected to read content
          setTimeout(() => {
            const targetPath = '{{REDIRECT_PATH}}';
            if (window.location.pathname !== targetPath) {
              window.location.replace(targetPath);
            }
          }, 200);
        }
      })();
    </script>
    
    <style>
      * { box-sizing: border-box; }
      body { 
        font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        line-height: 1.6; 
        color: #333; 
        margin: 0; 
        padding: 0;
        background-color: #f8f9fa;
      }
      .container { 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 20px; 
        background: white;
        min-height: 100vh;
      }
      header { 
        margin-bottom: 2rem; 
        border-bottom: 2px solid #161129;
        padding-bottom: 1rem;
      }
      nav ol { 
        list-style: none; 
        padding: 0; 
        display: flex; 
        margin: 0 0 1rem 0; 
        flex-wrap: wrap;
      }
      nav li { margin-right: 1rem; }
      nav li:not(:last-child)::after { content: ' › '; margin-left: 1rem; color: #666; }
      nav a { color: #007bff; text-decoration: none; }
      nav a:hover { text-decoration: underline; }
      h1 { 
        color: #161129; 
        font-size: 2.5rem; 
        margin: 0 0 1rem 0; 
        font-weight: 700;
        line-height: 1.2;
      }
      h2 { 
        color: #333; 
        font-size: 1.8rem; 
        margin: 2rem 0 1rem 0; 
        border-left: 4px solid #007bff;
        padding-left: 1rem;
      }
      h3 { 
        color: #555; 
        font-size: 1.3rem; 
        margin: 1.5rem 0 0.5rem 0; 
      }
      .lead { 
        font-size: 1.2rem; 
        color: #666; 
        margin-bottom: 2rem; 
        line-height: 1.5;
      }
      .cta-button { 
        display: inline-block; 
        padding: 12px 32px; 
        background: linear-gradient(45deg, #007bff, #0056b3); 
        color: white; 
        text-decoration: none; 
        border-radius: 8px; 
        margin: 20px 0; 
        font-weight: bold;
        font-size: 1.1rem;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
      }
      .cta-button:hover { 
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 123, 255, 0.4);
        color: white;
        text-decoration: none;
      }
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
      }
      .feature-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }
      .feature-card h4 {
        margin: 0 0 1rem 0;
        color: #161129;
        font-size: 1.2rem;
      }
      ul { padding-left: 1.5rem; margin: 1rem 0; }
      li { margin-bottom: 0.5rem; }
      li::marker { color: #007bff; }
      footer { 
        margin-top: 3rem; 
        padding: 2rem 0; 
        border-top: 1px solid #eee; 
        color: #666; 
        text-align: center;
        background: #161129;
        color: white;
        margin-left: -20px;
        margin-right: -20px;
        padding-left: 20px;
        padding-right: 20px;
      }
      .hidden { display: none !important; }
      
      @media (max-width: 768px) {
        .container { padding: 15px; }
        h1 { font-size: 2rem; }
        h2 { font-size: 1.5rem; }
        .feature-grid { grid-template-columns: 1fr; gap: 1rem; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      {{CONTENT}}
    </div>
    
    <!-- React App Root (hidden dari crawler) -->
    <div id="root" class="hidden"></div>
    
    <!-- Vite HMR untuk development -->
    <script>
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Only load in development
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/src/main.tsx';
        document.head.appendChild(script);
      }
    </script>
  </body>
</html>`;

// Konfigurasi halaman
const pageConfigs = [
  {
    path: '/product',
    redirectPath: '/product',
    title: 'Katalog Produk lapakBenz - Temukan Produk Komunitas Terbaik Indonesia',
    description: 'Jelajahi katalog produk lengkap lapakBenz. Temukan berbagai produk berkualitas dari komunitas UMKM dan otomotif Indonesia dengan harga terjangkau dan kualitas terjamin.',
    keywords: 'produk lapakbenz, katalog produk, marketplace indonesia, produk umkm, produk otomotif, belanja online, produk komunitas, lapakbenz produk',
    content: {
      heading: 'Katalog Produk lapakBenz',
      lead: 'Temukan produk-produk berkualitas dari komunitas UMKM dan otomotif terpercaya di Indonesia',
      sections: [
        {
          title: 'Kategori Produk Unggulan',
          content: 'Kami menyediakan berbagai kategori produk untuk memenuhi kebutuhan Anda',
          features: [
            {
              title: 'Otomotif & Spare Parts',
              content: 'Suku cadang berkualitas, aksesoris kendaraan, dan perlengkapan otomotif dari supplier terpercaya'
            },
            {
              title: 'Fashion & Apparel', 
              content: 'Koleksi pakaian, aksesoris fashion, dan produk lifestyle dari designer lokal Indonesia'
            },
            {
              title: 'Elektronik & Gadget',
              content: 'Perangkat elektronik, gadget terbaru, dan aksesoris teknologi dengan harga kompetitif'
            },
            {
              title: 'Makanan & Minuman',
              content: 'Produk kuliner khas nusantara, makanan olahan, dan minuman tradisional Indonesia'
            },
            {
              title: 'Kerajinan & Handicraft',
              content: 'Karya seni unik, kerajinan tangan tradisional, dan produk kreatif dari artisan lokal'
            },
            {
              title: 'Peralatan & Tools',
              content: 'Alat kerja profesional, peralatan rumah tangga, dan tools berkualitas untuk berbagai kebutuhan'
            }
          ]
        },
        {
          title: 'Keunggulan Berbelanja di lapakBenz',
          content: 'Dapatkan pengalaman berbelanja terbaik dengan keunggulan yang kami tawarkan',
          items: [
            'Produk berkualitas tinggi dari komunitas UMKM terpercaya di seluruh Indonesia',
            'Harga terjangkau dan kompetitif dengan sistem pembayaran yang aman',
            'Mendukung pertumbuhan ekonomi UMKM dan entrepreneur lokal Indonesia',
            'Sistem pengiriman cepat dan terpercaya ke seluruh nusantara',
            'Customer service responsif 24/7 untuk membantu segala kebutuhan Anda',
            'Program loyalty dan cashback menarik untuk member setia lapakBenz'
          ]
        }
      ]
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Katalog Produk lapakBenz',
      description: 'Jelajahi katalog produk lengkap lapakBenz dari komunitas UMKM dan otomotif Indonesia',
      url: 'https://lapakbenz.com/product',
      isPartOf: {
        '@type': 'WebSite',
        name: 'lapakBenz',
        url: 'https://lapakbenz.com'
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://lapakbenz.com'
          },
          {
            '@type': 'ListItem', 
            position: 2,
            name: 'Products'
          }
        ]
      }
    }
  },
  {
    path: '/event',
    redirectPath: '/event', 
    title: 'Event lapakBenz - Bergabung dengan Event Komunitas Terbaik Indonesia',
    description: 'Bergabunglah dengan event-event menarik dari komunitas UMKM dan otomotif di seluruh Indonesia. Workshop, gathering, networking, dan seminar untuk pengembangan bisnis.',
    keywords: 'event lapakbenz, event komunitas indonesia, event umkm, event otomotif, workshop indonesia, gathering komunitas, networking bisnis, seminar entrepreneur',
    content: {
      heading: 'Event lapakBenz - Event Komunitas Indonesia',
      lead: 'Bergabunglah dengan komunitas terbesar Indonesia dan ikuti event-event menarik untuk pengembangan bisnis dan networking',
      sections: [
        {
          title: 'Jenis Event yang Tersedia',
          content: 'Kami menyelenggarakan berbagai jenis event berkualitas untuk pengembangan komunitas dan bisnis',
          features: [
            {
              title: 'Workshop & Pelatihan Bisnis',
              content: 'Program pelatihan intensif untuk meningkatkan skill bisnis, marketing digital, dan pengembangan produk'
            },
            {
              title: 'Networking & Business Matching',
              content: 'Event networking eksklusif untuk memperluas jaringan bisnis dan mencari partnership strategis'  
            },
            {
              title: 'Product Launching & Exhibition',
              content: 'Platform peluncuran produk baru dan pameran untuk showcase inovasi dari komunitas'
            },
            {
              title: 'Community Gathering',
              content: 'Acara kumpul bersama untuk mempererat silaturahmi dan berbagi pengalaman bisnis'
            },
            {
              title: 'Seminar & Talkshow',
              content: 'Sharing knowledge dari para expert, founder sukses, dan praktisi berpengalaman'
            },
            {
              title: 'Bazaar & Trade Show',
              content: 'Pameran dagang dan bazaar produk komunitas untuk meningkatkan penjualan'
            }
          ]
        },
        {
          title: 'Chapter Komunitas Nasional',
          content: 'Event kami tersebar di chapter-chapter utama di seluruh Indonesia',
          items: [
            'Jakarta & Jabodetabek - Hub bisnis dan teknologi terbesar Indonesia',
            'Bandung & Jawa Barat - Pusat industri kreatif dan fashion Indonesia',
            'Surabaya & Jawa Timur - Sentra perdagangan dan industri terbesar kedua',
            'Medan & Sumatera Utara - Gateway ekonomi Sumatera dan perdagangan',
            'Makassar & Sulawesi Selatan - Pintu gerbang ekonomi Indonesia Timur',
            'Yogyakarta & Sekitarnya - Kota budaya, pendidikan, dan startup hub',
            'Semarang & Jawa Tengah - Pusat logistik dan distribusi nasional',
            'Denpasar & Bali - Destinasi wisata dan ekonomi kreatif'
          ]
        }
      ]
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Event lapakBenz',
      description: 'Event komunitas UMKM dan otomotif di Indonesia untuk networking dan pengembangan bisnis',
      url: 'https://lapakbenz.com/event',
      isPartOf: {
        '@type': 'WebSite',
        name: 'lapakBenz',
        url: 'https://lapakbenz.com'
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home', 
            item: 'https://lapakbenz.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Events'
          }
        ]
      }
    }
  },
  {
    path: '/product-detail',
    redirectPath: '/product-detail',
    title: 'Merciku T-Shirt Premium - Rp 149.000 | lapakBenz',
    description: 'Beli Merciku T-Shirt Premium berkualitas tinggi dengan harga Rp 149.000. Material 100% cotton, tersedia berbagai ukuran. Rating 4.8/5 dari customer. Beli sekarang di lapakBenz!',
    keywords: 'merciku t-shirt premium, kaos premium lapakbenz, beli merciku t-shirt premium, rp 149.000, apparel lapakbenz, kaos cotton premium, marketplace indonesia',
    content: {
      heading: 'Merciku T-Shirt Premium - Detail Produk',
      lead: 'Premium quality t-shirt made from 100% cotton with comfortable fit. Perfect for daily wear or casual events.',
      sections: [
        {
          title: 'Spesifikasi Produk',
          content: 'Detail lengkap spesifikasi dan fitur produk premium ini',
          items: [
            'Material: 100% Cotton berkualitas tinggi',
            'Tersedia ukuran: S, M, L, XL, XXL', 
            'Pilihan warna: Black, White, Navy',
            'Berat kain: 180 GSM (premium weight)',
            'Perawatan: Machine wash cold, tumble dry low',
            'Design: Iconic Merciku logo with modern style'
          ]
        }
      ]
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Merciku T-Shirt Premium',
      description: 'Premium quality t-shirt made from 100% cotton with comfortable fit',
      brand: { '@type': 'Brand', name: 'lapakBenz' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'IDR',
        price: '149000',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127'
      }
    }
  },
  {
    path: '/event-detail',
    redirectPath: '/event-detail',
    title: 'Workshop Digital Marketing UMKM - Jakarta Chapter | Event lapakBenz',
    description: 'Bergabunglah dengan Workshop Digital Marketing UMKM di Jakarta Chapter pada 15 Februari 2024 - 09:00 WIB. Event gratis untuk member komunitas lapakBenz. Daftar sekarang!',
    keywords: 'workshop digital marketing umkm, event jakarta chapter, workshop lapakbenz, event komunitas indonesia, digital marketing, umkm indonesia, 15 februari 2024, jakarta',
    content: {
      heading: 'Workshop Digital Marketing UMKM - Jakarta Chapter',
      lead: 'Workshop digital marketing khusus untuk pelaku UMKM. Pelajari strategi pemasaran digital terbaru untuk mengembangkan bisnis Anda.',
      sections: [
        {
          title: 'Detail Workshop',
          content: 'Informasi lengkap mengenai workshop digital marketing untuk UMKM',
          items: [
            'Tanggal: 15 Februari 2024, 09:00 - 17:00 WIB',
            'Lokasi: Jakarta Chapter lapakBenz',
            'Kapasitas: Maksimal 50 peserta',
            'Biaya: GRATIS untuk member lapakBenz',
            'Fasilitas: Sertifikat, materi digital, networking session',
            'Pembicara: Praktisi digital marketing berpengalaman'
          ]
        }
      ]
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Workshop Digital Marketing UMKM',
      description: 'Workshop Digital Marketing khusus untuk UMKM di Jakarta Chapter',
      startDate: '2024-02-15T09:00:00+07:00',
      endDate: '2024-02-15T17:00:00+07:00',
      location: {
        '@type': 'Place',
        name: 'Jakarta Chapter lapakBenz',
        address: { '@type': 'PostalAddress', addressCountry: 'ID' }
      },
      organizer: { '@type': 'Organization', name: 'lapakBenz' },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR'
      }
    }
  }
];

// Function untuk generate breadcrumbs
function generateBreadcrumbs(path) {
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  
  if (path === '/product') {
    breadcrumbs.push({ name: 'Products', url: null });
  } else if (path === '/event') {
    breadcrumbs.push({ name: 'Events', url: null });
  } else if (path === '/product-detail') {
    breadcrumbs.push({ name: 'Products', url: '/product' });
    breadcrumbs.push({ name: 'Merciku T-Shirt Premium', url: null });
  } else if (path === '/event-detail') {
    breadcrumbs.push({ name: 'Events', url: '/event' });
    breadcrumbs.push({ name: 'Workshop Digital Marketing UMKM', url: null });
  }
  
  return `
    <nav aria-label="Breadcrumb">
      <ol>
        ${breadcrumbs.map((crumb, index) => `
          <li ${index === breadcrumbs.length - 1 ? 'aria-current="page"' : ''}>
            ${crumb.url ? 
              `<a href="${crumb.url}">${crumb.name}</a>` : 
              crumb.name
            }
          </li>
        `).join('')}
      </ol>
    </nav>
  `;
}

// Function untuk generate content
function generateContent(config) {
  const breadcrumbs = generateBreadcrumbs(config.path);
  
  let sectionsHtml = '';
  config.content.sections.forEach(section => {
    let sectionContent = `
      <section>
        <h2>${section.title}</h2>
        <p class="lead">${section.content}</p>
    `;
    
    if (section.features) {
      sectionContent += `
        <div class="feature-grid">
          ${section.features.map(feature => `
            <div class="feature-card">
              <h4>${feature.title}</h4>
              <p>${feature.content}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    if (section.items) {
      sectionContent += `
        <ul>
          ${section.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
    }
    
    sectionContent += `</section>`;
    sectionsHtml += sectionContent;
  });

  let ctaText, ctaUrl;
  
  if (config.path === '/product') {
    ctaText = 'Mulai Belanja Sekarang';
    ctaUrl = '/';
  } else if (config.path === '/event') {
    ctaText = 'Lihat Event Terbaru'; 
    ctaUrl = '/';
  } else if (config.path === '/product-detail') {
    ctaText = 'Lihat Produk Lainnya';
    ctaUrl = '/product';
  } else if (config.path === '/event-detail') {
    ctaText = 'Lihat Event Lainnya';
    ctaUrl = '/event';
  } else {
    ctaText = 'Kembali ke Beranda';
    ctaUrl = '/';
  }

  return `
    <header>
      ${breadcrumbs}
      <h1>${config.content.heading}</h1>
      <p class="lead">${config.content.lead}</p>
    </header>
    
    <main>
      ${sectionsHtml}
      
      <div style="text-align: center; margin: 3rem 0;">
        <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
      </div>
    </main>
    
    <footer>
      <p>&copy; 2024 lapakBenz - Platform Komunitas UMKM & Event Terbesar Indonesia</p>
      <p>Bergabunglah dengan ribuan entrepreneur sukses di seluruh nusantara</p>
    </footer>
  `;
}

// Function untuk generate static page
function generateStaticPage(config) {
  let html = baseTemplate;
  
  // Replace placeholders
  html = html.replace(/{{TITLE}}/g, config.title);
  html = html.replace(/{{DESCRIPTION}}/g, config.description);
  html = html.replace(/{{KEYWORDS}}/g, config.keywords);
  html = html.replace(/{{PATH}}/g, config.path);
  html = html.replace(/{{REDIRECT_PATH}}/g, config.redirectPath);
  
  // Generate schema
  const schemaScript = config.schema ? 
    `<script type="application/ld+json">${JSON.stringify(config.schema, null, 2)}</script>` : 
    '';
  html = html.replace('{{SCHEMA}}', schemaScript);
  
  // Generate content
  const content = generateContent(config);
  html = html.replace('{{CONTENT}}', content);
  
  return html;
}

// Main function
function generateAllStaticPages() {
  
  const publicDir = path.join(process.cwd(), 'public');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  let successCount = 0;
  let totalPages = pageConfigs.length;
  
  pageConfigs.forEach(config => {
    try {
      const html = generateStaticPage(config);
      let filename;
      switch(config.path) {
        case '/product':
          filename = 'product.html';
          break;
        case '/event':
          filename = 'event.html';
          break;
        case '/product-detail':
          filename = 'product-detail.html';
          break;
        case '/event-detail':
          filename = 'event-detail.html';
          break;
        default:
          filename = config.path.replace('/', '') + '.html';
      }
      const outputPath = path.join(publicDir, filename);
      
      fs.writeFileSync(outputPath, html, 'utf8');
      
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${config.path}: ${error.message}`);
    }
  });
}

// Run if executed directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    generateAllStaticPages();
  }
}

export { generateAllStaticPages };