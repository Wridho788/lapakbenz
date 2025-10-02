/**
 * Utility functions for creating SEO-friendly URLs while maintaining API compatibility
 */

/**
 * Create a URL-safe slug from text
 * @param text - The text to convert to slug
 * @returns URL-safe slug
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Create SEO-friendly event URL with ID and code slug
 * @param id - Event ID for API compatibility
 * @param code - Event code for SEO slug
 * @returns SEO-friendly URL like "/event/12-21-th-mercedes-benz-club-indonesia"
 */
export const createEventUrl = (id: string, code: string): string => {
  const slug = createSlug(code);
  return `/event/${id}-${slug}`;
};

/**
 * Create SEO-friendly product URL with ID and name/sku slug
 * @param id - Product ID for API compatibility  
 * @param name - Product name or SKU for SEO slug
 * @returns SEO-friendly URL like "/product/123-premium-tshirt"
 */
export const createProductUrl = (id: string, name: string): string => {
  const slug = createSlug(name);
  return `/product/${id}-${slug}`;
};

/**
 * Extract ID from SEO-friendly URL
 * @param param - URL parameter like "12-21-th-mercedes-benz-club-indonesia"
 * @returns ID part (before first hyphen)
 */
export const extractIdFromParam = (param: string): string => {
  const parts = param.split('-');
  return parts[0];
};

/**
 * Check if URL parameter contains SEO slug (has hyphen after ID)
 * @param param - URL parameter
 * @returns true if it's SEO format, false if it's just plain ID
 */
export const hasSeoSlug = (param: string): boolean => {
  return param.includes('-') && !isNaN(Number(param.split('-')[0]));
};