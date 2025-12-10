/**
 * Auto SEO Integration Script
 * Integrates SEO components and meta tags service into existing React pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pages yang perlu diintegrasikan SEO
const seoIntegrations = [
  {
    filePath: 'src/pages/Dashboard.tsx',
    seoConfig: {
      title: 'Dashboard lapakBenz - Kelola Bisnis Komunitas Anda',
      description: 'Dashboard lengkap lapakBenz untuk mengelola bisnis, melihat analytics, mengatur produk, dan mengelola event komunitas Anda.',
      keywords: 'dashboard lapakbenz, kelola bisnis, analytics penjualan, manajemen produk, dashboard umkm',
      type: 'WebPage',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Dashboard', url: '/dashboard' }
      ]
    }
  },
  {
    filePath: 'src/pages/Product.tsx',
    seoConfig: {
      title: 'Katalog Produk lapakBenz - Marketplace Komunitas Indonesia',
      description: 'Jelajahi katalog produk lengkap dari komunitas UMKM di lapakBenz. Temukan produk berkualitas dengan harga terjangkau.',
      keywords: 'produk lapakbenz, katalog produk, marketplace indonesia, produk umkm, belanja online',
      type: 'WebPage',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/product' }
      ]
    }
  },
  {
    filePath: 'src/pages/Event.tsx', 
    seoConfig: {
      title: 'Event Komunitas lapakBenz - Networking & Workshop Indonesia',
      description: 'Ikuti event menarik dari komunitas lapakBenz. Workshop, networking, dan pengembangan bisnis di seluruh Indonesia.',
      keywords: 'event lapakbenz, event komunitas, networking indonesia, workshop bisnis, event umkm',
      type: 'WebPage',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Events', url: '/event' }
      ]
    }
  },
  {
    filePath: 'src/pages/ProductDetail.tsx',
    seoConfig: {
      title: 'Detail Produk {{PRODUCT_NAME}} - lapakBenz',
      description: 'Detail lengkap {{PRODUCT_NAME}}. Spesifikasi, harga, review, dan informasi lengkap produk dari komunitas UMKM lapakBenz.',
      keywords: '{{PRODUCT_NAME}}, detail produk, spesifikasi produk, review produk, lapakbenz',
      type: 'Product',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/product' },
        { name: '{{PRODUCT_NAME}}', url: '/product/{{PRODUCT_ID}}' }
      ]
    }
  },
  {
    filePath: 'src/pages/EventDetail.tsx',
    seoConfig: {
      title: 'Detail Event {{EVENT_NAME}} - lapakBenz',
      description: 'Detail lengkap event {{EVENT_NAME}}. Jadwal, lokasi, pembicara, dan cara daftar event komunitas lapakBenz.',
      keywords: '{{EVENT_NAME}}, detail event, jadwal event, daftar event, komunitas lapakbenz',
      type: 'Event', 
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Events', url: '/event' },
        { name: '{{EVENT_NAME}}', url: '/event/{{EVENT_ID}}' }
      ]
    }
  }
];

function addSEOImports(content) {
  // Check jika imports sudah ada
  if (content.includes("import { SEO }") || content.includes("import SEO")) {
    return content;
  }
  
  // Find import section
  const importMatch = content.match(/(import.*?;?\n)+/s);
  if (importMatch) {
    const imports = importMatch[0];
    const newImports = imports + "import { SEO } from '../components/SEO';\nimport { MetaTagsService } from '../services/MetaTagsService';\n";
    return content.replace(imports, newImports);
  }
  
  // Jika tidak ada imports, tambahkan di awal
  return "import { SEO } from '../components/SEO';\nimport { MetaTagsService } from '../services/MetaTagsService';\n\n" + content;
}

function generateSEOComponent(config, dynamicData = {}) {
  const title = config.title.replace(/{{(\w+)}}/g, (match, key) => dynamicData[key] || key);
  const description = config.description.replace(/{{(\w+)}}/g, (match, key) => dynamicData[key] || key);
  const keywords = config.keywords.replace(/{{(\w+)}}/g, (match, key) => dynamicData[key] || key);
  
  return `      <SEO
        title="${title}"
        description="${description}"
        keywords="${keywords}"
        type="${config.type}"
        breadcrumbs={${JSON.stringify(config.breadcrumbs, null, 8)}}
        ${config.type === 'Product' ? `
        product={{
          name: ${dynamicData.PRODUCT_NAME ? `"${dynamicData.PRODUCT_NAME}"` : 'product?.name || "Product"'},
          price: ${dynamicData.PRODUCT_PRICE ? `"${dynamicData.PRODUCT_PRICE}"` : 'product?.price || "0"'},
          image: ${dynamicData.PRODUCT_IMAGE ? `"${dynamicData.PRODUCT_IMAGE}"` : 'product?.image || "/lapakbenz.png"'},
          description: ${dynamicData.PRODUCT_DESCRIPTION ? `"${dynamicData.PRODUCT_DESCRIPTION}"` : 'product?.description || ""'},
          availability: "InStock",
          condition: "NewCondition"
        }}` : ''}
        ${config.type === 'Event' ? `
        event={{
          name: ${dynamicData.EVENT_NAME ? `"${dynamicData.EVENT_NAME}"` : 'event?.name || "Event"'},
          startDate: ${dynamicData.EVENT_START ? `"${dynamicData.EVENT_START}"` : 'event?.startDate || new Date().toISOString()'},
          endDate: ${dynamicData.EVENT_END ? `"${dynamicData.EVENT_END}"` : 'event?.endDate || new Date().toISOString()'},
          location: ${dynamicData.EVENT_LOCATION ? `"${dynamicData.EVENT_LOCATION}"` : 'event?.location || "Indonesia"'},
          description: ${dynamicData.EVENT_DESCRIPTION ? `"${dynamicData.EVENT_DESCRIPTION}"` : 'event?.description || ""'},
          image: ${dynamicData.EVENT_IMAGE ? `"${dynamicData.EVENT_IMAGE}"` : 'event?.image || "/lapakbenz.png"'}
        }}` : ''}
      />`;
}

function addSEOComponentToJSX(content, config) {
  // Find return statement with JSX
  const returnMatch = content.match(/return\s*\(\s*<[^>]*>/);
  if (returnMatch) {
    const returnIndex = returnMatch.index + returnMatch[0].length;
    const seoComponent = generateSEOComponent(config);
    
    // Insert SEO component after opening tag
    return content.slice(0, returnIndex) + '\n' + seoComponent + '\n' + content.slice(returnIndex);
  }
  
  return content;
}

function addMetaTagsService(content, config) {
  // Find useEffect imports atau add React import
  if (!content.includes('useEffect')) {
    content = content.replace(
      /import React/,
      'import React, { useEffect }'
    );
  }
  
  // Add useEffect untuk dynamic meta tags
  const useEffectCode = `
  useEffect(() => {
    // Update meta tags untuk dynamic content
    const metaTags = {
      title: "${config.title.replace(/{{(\w+)}}/g, '$1')}",
      description: "${config.description.replace(/{{(\w+)}}/g, '$1')}",
      keywords: "${config.keywords.replace(/{{(\w+)}}/g, '$1')}",
      canonical: window.location.href,
      ogTitle: "${config.title.replace(/{{(\w+)}}/g, '$1')}",
      ogDescription: "${config.description.replace(/{{(\w+)}}/g, '$1')}",
      ogImage: "/lapakbenz.png",
      ogUrl: window.location.href
    };
    
    MetaTagsService.updateMetaTags(metaTags);
  }, []);
`;

  // Find component function dan add useEffect
  const functionMatch = content.match(/(function\s+\w+|const\s+\w+\s*=.*?=>|export\s+default\s+function\s+\w+)/);
  if (functionMatch) {
    const insertPoint = content.indexOf('{', functionMatch.index) + 1;
    return content.slice(0, insertPoint) + useEffectCode + content.slice(insertPoint);
  }
  
  return content;
}

function integrateSEOToFile(filePath, config) {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Skip jika sudah ada SEO integration
    if (content.includes('<SEO ') || content.includes('MetaTagsService.updateMetaTags')) {
      return true;
    }
    
    // Add imports
    content = addSEOImports(content);
    
    // Add SEO component to JSX
    content = addSEOComponentToJSX(content, config);
    
    // Add MetaTags service
    content = addMetaTagsService(content, config);
    
    // Write back to file
    fs.writeFileSync(fullPath, content, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`❌ Error integrating SEO to ${filePath}:`, error.message);
    return false;
  }
}

function integrateAllSEO() {
  
  let successCount = 0;
  let totalFiles = seoIntegrations.length;
  
  seoIntegrations.forEach(integration => {
    if (integrateSEOToFile(integration.filePath, integration.seoConfig)) {
      successCount++;
    }
  });
}

// Generate template untuk new pages
function generatePageTemplate(pageName, config) {
  return `import React, { useEffect } from 'react';
import { SEO } from '../components/SEO';
import { MetaTagsService } from '../services/MetaTagsService';

const ${pageName} = () => {
  useEffect(() => {
    // Dynamic meta tags update
    const metaTags = {
      title: "${config.title}",
      description: "${config.description}",
      keywords: "${config.keywords}",
      canonical: window.location.href,
      ogTitle: "${config.title}",
      ogDescription: "${config.description}",
      ogImage: "/lapakbenz.png",
      ogUrl: window.location.href
    };
    
    MetaTagsService.updateMetaTags(metaTags);
  }, []);

  return (
    <>
      <SEO
        title="${config.title}"
        description="${config.description}"
        keywords="${config.keywords}"
        type="${config.type}"
        breadcrumbs={${JSON.stringify(config.breadcrumbs, null, 8)}}
      />
      
      <div>
        <h1>${pageName}</h1>
        {/* Your page content here */}
      </div>
    </>
  );
};

export default ${pageName};`;
}

// Run if executed directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    integrateAllSEO();
  }
}

export { integrateAllSEO, integrateSEOToFile, generatePageTemplate };