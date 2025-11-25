# Google Search Console Setup Guide

## 1. Persiapan Verifikasi Domain

### Method 1: HTML File Upload (Recommended)
1. Download file verifikasi dari Google Search Console
2. Upload ke folder `public/` sebagai `google[kode-verifikasi].html`
3. File akan tersedia di `https://lapakbenz.com/google[kode-verifikasi].html`

### Method 2: Meta Tag (Already Implemented)
Tambahkan meta tag berikut ke `index.html` jika menggunakan method ini:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

### Method 3: DNS Record
Tambahkan TXT record di DNS provider:
- Host: @ (atau domain root)
- Value: google-site-verification=YOUR_VERIFICATION_CODE

## 2. Sitemap Submission

### Sitemap URLs untuk Submit:
1. **Main Sitemap**: `https://lapakbenz.com/sitemap.xml`
2. **Product Sitemap**: (akan dibuat dinamis berdasarkan API)
3. **Event Sitemap**: (akan dibuat dinamis berdasarkan API)

### Sitemap Generation Strategy:
```javascript
// Example untuk dynamic sitemap generation
const generateProductSitemap = (products) => {
  return products.map(product => ({
    url: `https://lapakbenz.com/product/${product.id}-${createSlug(product.title)}`,
    lastmod: product.updated_at,
    changefreq: 'weekly',
    priority: '0.8',
    image: {
      loc: product.image,
      title: product.title,
      caption: product.description
    }
  }));
};
```

## 3. Structured Data Monitoring

### Pages to Monitor:
1. **Homepage** (`/`)
   - Organization schema
   - WebSite schema with search action

2. **Product Pages** (`/product/*`)
   - Product schema
   - Breadcrumb schema
   - Organization schema

3. **Product Detail** (`/product/*/`)
   - Product schema with offers
   - Review schema (if reviews available)
   - Breadcrumb schema

4. **Event Pages** (`/event`)
   - WebPage schema
   - Breadcrumb schema

5. **Event Detail** (`/event/*/`)
   - Event schema
   - Breadcrumb schema
   - Organization schema

### Structured Data Validation:
Use these tools regularly:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/
- Google Search Console Enhancements report

## 4. Performance Monitoring

### Core Web Vitals Targets:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Strategies:
1. **Image Optimization**:
   ```html
   <img 
     src="image.webp" 
     alt="descriptive text" 
     loading="lazy"
     width="300" 
     height="200"
   />
   ```

2. **Font Loading Optimization**:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
   ```

## 5. URL Parameter Handling

### Parameters to Exclude from Indexing:
Add to `robots.txt`:
```
Disallow: /*?*
Disallow: /*&*
```

### URL Parameters in GSC:
Configure these parameters in Search Console:
- `search` - Narrows content (search queries)
- `category` - Narrows content (product categories)
- `page` - Pagination
- `limit` - Items per page
- `offset` - Pagination offset

## 6. Mobile Usability

### Checklist:
- ✅ Viewport meta tag configured
- ✅ Touch elements sized properly (48px minimum)
- ✅ Text readable without zooming
- ✅ No horizontal scrolling
- ✅ Compatible with mobile devices

### Test URLs:
Test these pages specifically:
1. `/` (Homepage)
2. `/product` (Product listing)
3. `/product/123-sample-product` (Product detail)
4. `/event` (Event listing)
5. `/event/123-sample-event` (Event detail)
6. `/login` (Login form)
7. `/register` (Registration form)

## 7. International Targeting

### Current Setup:
- Language: Indonesian (`lang="id"`)
- Country: Indonesia (`geo.country="Indonesia"`)
- Locale: `id_ID`

### Hreflang (if expanding to multiple languages):
```html
<link rel="alternate" hreflang="id" href="https://lapakbenz.com/" />
<link rel="alternate" hreflang="en" href="https://lapakbenz.com/en/" />
<link rel="alternate" hreflang="x-default" href="https://lapakbenz.com/" />
```

## 8. Search Console Reports to Monitor

### 1. Performance Report
- **Queries**: Top search queries
- **Pages**: Best performing pages
- **Countries**: Geographic performance
- **Devices**: Mobile vs desktop performance

### 2. Coverage Report
- **Valid pages**: Successfully indexed
- **Error pages**: Pages with indexing errors
- **Excluded pages**: Pages excluded from indexing
- **Valid with warnings**: Pages indexed with minor issues

### 3. Enhancements Report
- **Breadcrumbs**: Breadcrumb structured data status
- **Products**: Product structured data status
- **Events**: Event structured data status
- **FAQ**: FAQ structured data status (if implemented)

### 4. Core Web Vitals Report
- **Mobile**: Mobile performance metrics
- **Desktop**: Desktop performance metrics
- **Field data**: Real user experience data
- **Lab data**: Synthetic testing data

## 9. Content Guidelines for SEO

### Product Pages:
- **Title**: Include product name, key features, brand
- **Description**: Unique description for each product (150-160 chars)
- **Images**: High-quality images with descriptive alt text
- **Content**: Detailed product specifications and benefits

### Event Pages:
- **Title**: Include event name, date, location
- **Description**: Event details, benefits, target audience
- **Images**: Event photos or promotional images
- **Content**: Comprehensive event information

### Category Pages:
- **Title**: Category name + "lapakBenz"
- **Description**: Category description with benefits
- **Content**: Category overview and featured products/events

## 10. Monitoring and Alerts

### Set up alerts for:
1. **Indexing errors**: New coverage issues
2. **Core Web Vitals**: Performance degradation
3. **Structured data errors**: Schema markup issues
4. **Mobile usability**: New mobile issues
5. **Security issues**: Hacking or malware alerts

### Weekly Monitoring Tasks:
- [ ] Check Performance report for ranking changes
- [ ] Review Coverage report for new errors
- [ ] Monitor Core Web Vitals trends
- [ ] Check structured data enhancements
- [ ] Review top queries and optimize content

### Monthly SEO Tasks:
- [ ] Analyze search performance trends
- [ ] Update and optimize underperforming pages
- [ ] Review and update meta descriptions
- [ ] Check competitor rankings and strategies
- [ ] Update sitemap with new content

---

**Note**: Replace `YOUR_VERIFICATION_CODE` with actual verification code from Google Search Console.