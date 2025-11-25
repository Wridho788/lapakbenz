/**
 * Meta Tags Injection Service untuk SEO dinamis
 * Service ini akan mengupdate meta tags berdasarkan route yang aktif
 */

interface PageMetaData {
  title: string;
  description: string;
  keywords: string;
  image?: string;
  url: string;
  type?: string;
  schemaData?: any;
}

class MetaTagsService {
  private static instance: MetaTagsService;
  
  static getInstance(): MetaTagsService {
    if (!MetaTagsService.instance) {
      MetaTagsService.instance = new MetaTagsService();
    }
    return MetaTagsService.instance;
  }

  /**
   * Update meta tags untuk halaman tertentu
   */
  updateMetaTags(pageData: PageMetaData): void {
    // Update title
    document.title = pageData.title;
    
    // Update meta tags
    this.updateMetaTag('description', pageData.description);
    this.updateMetaTag('keywords', pageData.keywords);
    
    // Update Open Graph tags
    this.updateMetaProperty('og:title', pageData.title);
    this.updateMetaProperty('og:description', pageData.description);
    this.updateMetaProperty('og:url', pageData.url);
    this.updateMetaProperty('og:type', pageData.type || 'website');
    
    if (pageData.image) {
      this.updateMetaProperty('og:image', pageData.image);
    }
    
    // Update Twitter tags
    this.updateMetaTag('twitter:title', pageData.title);
    this.updateMetaTag('twitter:description', pageData.description);
    
    if (pageData.image) {
      this.updateMetaTag('twitter:image', pageData.image);
    }
    
    // Update canonical URL
    this.updateCanonicalUrl(pageData.url);
    
    // Update structured data
    if (pageData.schemaData) {
      this.updateStructuredData(pageData.schemaData);
    }
  }

  /**
   * Update meta tag dengan name attribute
   */
  private updateMetaTag(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /**
   * Update meta tag dengan property attribute (untuk Open Graph)
   */
  private updateMetaProperty(property: string, content: string): void {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /**
   * Update canonical URL
   */
  private updateCanonicalUrl(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  /**
   * Update structured data JSON-LD
   */
  private updateStructuredData(schemaData: any): void {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-dynamic', 'true');
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }

  /**
   * Get meta data untuk halaman product
   */
  getProductPageMeta(searchQuery?: string, category?: string): PageMetaData {
    let title = 'Katalog Produk lapakBenz - Temukan Produk Komunitas Terbaik';
    let description = 'Jelajahi katalog produk lengkap lapakBenz. Temukan berbagai produk berkualitas dari komunitas UMKM dan otomotif Indonesia.';
    let keywords = 'produk lapakbenz, katalog produk, marketplace indonesia, produk umkm, produk otomotif';

    if (searchQuery) {
      title = `${searchQuery} - Hasil Pencarian Produk lapakBenz`;
      description = `Hasil pencarian "${searchQuery}" di lapakBenz. ${description}`;
      keywords = `${searchQuery.toLowerCase()}, ${keywords}`;
    }

    if (category && category !== 'Semua') {
      title = `${category} - Katalog Produk lapakBenz`;
      description = `Produk ${category} berkualitas di lapakBenz. ${description}`;
      keywords = `${category.toLowerCase()}, ${keywords}`;
    }

    return {
      title: title + ' | lapakBenz',
      description,
      keywords,
      url: `${window.location.origin}/product${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`,
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: `${window.location.origin}/product`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'lapakBenz',
          url: window.location.origin
        }
      }
    };
  }

  /**
   * Get meta data untuk halaman product detail
   */
  getProductDetailMeta(product: any): PageMetaData {
    const title = `${product.title} - ${this.formatPrice(product.price)}`;
    const description = this.truncateText(this.stripHtml(product.description), 155);
    const keywords = `${product.title.toLowerCase()}, ${product.category?.toLowerCase() || 'produk'}, lapakbenz, ${this.formatPrice(product.price)}`;

    return {
      title: title + ' | lapakBenz',
      description,
      keywords,
      image: product.image,
      url: `${window.location.origin}/product/${product.id}`,
      type: 'product',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description,
        image: product.image,
        brand: {
          '@type': 'Brand',
          name: 'lapakBenz'
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'IDR',
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }
    };
  }

  /**
   * Get meta data untuk halaman event
   */
  getEventPageMeta(activeTab: number, eventCount?: number): PageMetaData {
    const tabs = ['Akan Datang', 'Selesai', 'Berita'];
    const tabName = tabs[activeTab] || 'Event';
    
    const title = `Event ${tabName} - Platform Event Komunitas Indonesia`;
    const description = `Temukan event ${tabName.toLowerCase()} dari komunitas UMKM dan otomotif di Indonesia. ${eventCount ? `${eventCount} event tersedia.` : ''} Bergabunglah sekarang!`;
    const keywords = `event ${tabName.toLowerCase()}, event komunitas indonesia, event umkm, event otomotif, ${tabName.toLowerCase()} event`;

    return {
      title: title + ' | lapakBenz',
      description,
      keywords,
      url: `${window.location.origin}/event`,
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: `${window.location.origin}/event`
      }
    };
  }

  /**
   * Get meta data untuk halaman event detail
   */
  getEventDetailMeta(event: any): PageMetaData {
    const title = `${event.name} - ${event.chapter}`;
    const description = `${this.truncateText(this.stripHtml(event.desc), 120)} Event ${event.chapter} pada ${event.dates} - ${event.time}. ${event.fee > 0 ? `Biaya: ${this.formatPrice(event.fee)}` : 'Gratis'}. Daftar sekarang!`;
    const keywords = `${event.name.toLowerCase()}, event ${event.chapter.toLowerCase()}, ${event.type_desc?.toLowerCase() || 'event'}, ${event.dates}, komunitas`;

    return {
      title: title + ' | lapakBenz',
      description,
      keywords,
      image: event.image,
      url: `${window.location.origin}/event/${event.id}`,
      type: 'article',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: this.stripHtml(event.desc),
        startDate: event.dates,
        location: {
          '@type': 'Place',
          name: event.chapter
        },
        organizer: {
          '@type': 'Organization',
          name: 'lapakBenz'
        },
        image: event.image
      }
    };
  }

  /**
   * Helper: Format price
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Helper: Truncate text
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3).trim() + '...';
  }

  /**
   * Helper: Strip HTML tags
   */
  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

export default MetaTagsService;