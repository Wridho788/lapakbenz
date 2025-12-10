/**
 * Utility functions for error handling
 */

/**
 * Check if an error is a 307 (Shipping Address Required) error
 * Supports multiple error formats that might be returned by different APIs
 */
export const isShippingAddressRequiredError = (error: any): boolean => {
  // Check various possible error formats
  const checks = [
    // Standard axios error response status
    error?.response?.status === 307,
    
    // Direct status property
    error?.status === 307,
    
    // Error code property
    error?.code === 307,
    
    // Message contains "307"
    error?.message?.includes('307'),
    
    // Response data status
    error?.response?.data?.status === 307,
    
    // Response data message contains "shipping" (case insensitive)
    error?.response?.data?.message && 
    error.response.data.message.toLowerCase().includes('shipping'),
    
    // Error message contains "shipping address" (case insensitive)
    error?.message && 
    error.message.toLowerCase().includes('shipping address'),
    
    // Additional checks for common shipping-related error messages
    error?.response?.data?.message && 
    error.response.data.message.toLowerCase().includes('alamat pengiriman'),
    
    error?.message && 
    error.message.toLowerCase().includes('alamat pengiriman'),
    
    // Check for specific error codes that might indicate shipping issues
    error?.response?.data?.error_code === 'SHIPPING_ADDRESS_REQUIRED',
    error?.response?.data?.error_code === 'SHIPPING_NOT_SET',
    error?.response?.data?.code === 'SHIPPING_ADDRESS_REQUIRED',
    
    // HTTP status text check
    error?.response?.statusText?.toLowerCase().includes('redirect') && 
    error?.response?.status === 307
  ];

  // Return true if any check passes
  const result = checks.some(check => check === true);
  return result;
};

/**
 * Extract error message for display to user
 */
export const getErrorMessage = (error: any): string => {
  // Priority order for error message extraction
  const messages = [
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.message,
    error?.response?.statusText,
    'An unknown error occurred'
  ];

  return messages.find(msg => msg && typeof msg === 'string') || 'An unknown error occurred';
};

/**
 * Check if error is authentication related (401)
 */
export const isAuthenticationError = (error: any): boolean => {
  return error?.response?.status === 401 || 
         error?.status === 401 ||
         error?.message?.toLowerCase().includes('unauthorized');
};

/**
 * Log error details for debugging
 */
export const logErrorDetails = (error: any, context: string = '') => {
  console.group(`🔍 Error Details${context ? ` - ${context}` : ''}`);
  console.log('Full error object:', error);
  console.groupEnd();
};