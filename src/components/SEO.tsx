import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  category?: string;
  schemaType?: 'WebPage' | 'Product' | 'Event' | 'Article' | 'Organization';
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

const SEO: React.FC<SEOProps> = ({
  title = 'lapakBenz - Platform Komunitas & Event',
  description = 'LapakBenz, platform komunitas dan event untuk UMKM, otomotif, dan berbagai komunitas Indonesia. Temukan event, marketplace, dan peluang baru.',
  keywords = 'lapakbenz, platform komunitas, platform event, event umkm, event otomotif, komunitas otomotif, marketplace komunitas, aplikasi komunitas, aplikasi event, aplikasi umkm, event indonesia, komunitas indonesia',
  image = '/lapakbenz.png',
  url = 'https://lapakbenz.com',
  type = 'website',
  author = 'lapakBenz',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  price,
  currency = 'IDR',
  availability = 'in stock',
  brand = 'lapakBenz',
  category,
  schemaType = 'WebPage',
  breadcrumbs = []
}) => {
  const siteName = 'lapakBenz';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = url || window.location.href;

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: title,
      description,
      url: canonicalUrl,
      image: image.startsWith('http') ? image : `${window.location.origin}${image}`,
      author: {
        '@type': 'Organization',
        name: author,
        url: 'https://lapakbenz.com'
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/lapakbenz.png`
        }
      }
    };

    // Add specific schema properties based on type
    switch (schemaType) {
      case 'Product':
        return {
          ...baseSchema,
          '@type': 'Product',
          brand: {
            '@type': 'Brand',
            name: brand
          },
          category,
          offers: {
            '@type': 'Offer',
            price: price || 0,
            priceCurrency: currency,
            availability: `https://schema.org/${availability === 'in stock' ? 'InStock' : 'OutOfStock'}`
          }
        };

      case 'Event':
        return {
          ...baseSchema,
          '@type': 'Event',
          startDate: publishedTime,
          location: {
            '@type': 'Place',
            name: 'Indonesia'
          },
          organizer: {
            '@type': 'Organization',
            name: siteName
          }
        };

      case 'Article':
        return {
          ...baseSchema,
          '@type': 'Article',
          headline: title,
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          articleSection: section,
          keywords: tags.join(', ')
        };

      default:
        return baseSchema;
    }
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbSchema = () => {
    if (breadcrumbs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${window.location.origin}${crumb.url}`
      }))
    };
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${window.location.origin}${image}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${window.location.origin}${image}`} />

      {/* Product specific meta for e-commerce */}
      {schemaType === 'Product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          {brand && <meta property="product:brand" content={brand} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>

      {/* Breadcrumb Structured Data */}
      {breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema())}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;