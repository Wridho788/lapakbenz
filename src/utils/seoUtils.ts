/**
 * Create SEO-friendly URLs for products and events
 */

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const createProductUrl = (id: string, title: string): string => {
  const slug = createSlug(title);
  return `/product/${id}-${slug}`;
};

export const createEventUrl = (id: string, name: string): string => {
  const slug = createSlug(name);
  return `/event/${id}-${slug}`;
};

export const extractIdFromParam = (param: string): string => {
  // Extract ID from URL parameter (handles both "123" and "123-product-name" formats)
  const match = param.match(/^(\d+)/);
  return match ? match[1] : param;
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

/**
 * Format date for structured data
 */
export const formatDateForSchema = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

/**
 * Truncate text for meta descriptions
 */
export const truncateText = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
};

/**
 * Clean HTML tags from text
 */
export const stripHtml = (html: string): string => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Generate breadcrumbs for different pages
 */
export const generateBreadcrumbs = (type: 'product' | 'event' | 'profile', itemName?: string) => {
  const base = [
    { name: 'Home', url: '/' }
  ];

  switch (type) {
    case 'product':
      base.push({ name: 'Products', url: '/product' });
      if (itemName) {
        base.push({ name: itemName, url: window.location.pathname });
      }
      break;
    
    case 'event':
      base.push({ name: 'Events', url: '/event' });
      if (itemName) {
        base.push({ name: itemName, url: window.location.pathname });
      }
      break;
    
    case 'profile':
      base.push({ name: 'Profile', url: '/profile' });
      if (itemName) {
        base.push({ name: itemName, url: window.location.pathname });
      }
      break;
    
    default:
      break;
  }

  return base;
};