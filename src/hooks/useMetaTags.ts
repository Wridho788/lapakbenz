import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MetaTagsService from '../services/MetaTagsService';

/**
 * Hook untuk mengupdate meta tags berdasarkan halaman yang aktif
 */
export const useMetaTags = () => {
  const metaService = MetaTagsService.getInstance();

  const updateProductMeta = (searchQuery?: string, category?: string) => {
    const metaData = metaService.getProductPageMeta(searchQuery, category);
    metaService.updateMetaTags(metaData);
  };

  const updateProductDetailMeta = (product: any) => {
    const metaData = metaService.getProductDetailMeta(product);
    metaService.updateMetaTags(metaData);
  };

  const updateEventMeta = (activeTab: number, eventCount?: number) => {
    const metaData = metaService.getEventPageMeta(activeTab, eventCount);
    metaService.updateMetaTags(metaData);
  };

  const updateEventDetailMeta = (event: any) => {
    const metaData = metaService.getEventDetailMeta(event);
    metaService.updateMetaTags(metaData);
  };

  const updateDashboardMeta = () => {
    const metaData = {
      title: 'lapakBenz - Platform Komunitas & Event Indonesia',
      description: 'Bergabunglah dengan lapakBenz, platform komunitas terdepan untuk UMKM, otomotif, dan berbagai komunitas di Indonesia. Temukan event menarik, marketplace terpercaya, dan peluang networking baru.',
      keywords: 'lapakbenz, platform komunitas indonesia, event umkm, event otomotif, komunitas otomotif indonesia, marketplace komunitas, umkm indonesia, networking bisnis',
      url: window.location.origin,
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'lapakBenz',
        url: window.location.origin,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${window.location.origin}/product?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
    };
    metaService.updateMetaTags(metaData);
  };

  return {
    updateProductMeta,
    updateProductDetailMeta,
    updateEventMeta,
    updateEventDetailMeta,
    updateDashboardMeta
  };
};

/**
 * Hook untuk auto-update meta tags berdasarkan route
 */
export const useAutoMetaTags = () => {
  const location = useLocation();
  const { updateDashboardMeta, updateProductMeta, updateEventMeta } = useMetaTags();

  useEffect(() => {
    // Auto update meta tags berdasarkan route
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        updateDashboardMeta();
        break;
      
      case '/product':
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || undefined;
        const category = urlParams.get('category') || undefined;
        updateProductMeta(searchQuery, category);
        break;
      
      case '/event':
        updateEventMeta(0); // Default to "Akan Datang" tab
        break;
      
      default:
        // For dynamic routes like /product/:id or /event/:id
        if (location.pathname.startsWith('/product/')) {
          // This will be handled by the ProductDetail component itself
        } else if (location.pathname.startsWith('/event/')) {
          // This will be handled by the EventDetail component itself
        }
        break;
    }
  }, [location.pathname, location.search]);
};