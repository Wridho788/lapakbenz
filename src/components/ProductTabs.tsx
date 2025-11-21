import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { useLatestProducts, useBestSellerProducts } from '../api/hooks/index';
import { createProductUrl } from '../api/codeMapping';
import './ProductTabs.css';

export const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latest' | 'bestseller'>('latest');
  const navigate = useNavigate();

  // API hooks
  const { data: latestProductsData, isLoading: latestLoading, error: latestError } = useLatestProducts();
  const { data: bestSellerProductsData, isLoading: bestSellerLoading, error: bestSellerError } = useBestSellerProducts();
  
  // Debug logging
  console.log('🏪 ProductTabs - Component rendered');
  console.log('🏪 ProductTabs - Latest data:', latestProductsData);
  console.log('🏪 ProductTabs - Best seller data:', bestSellerProductsData);
  console.log('🏪 ProductTabs - Latest error:', latestError);
  console.log('🏪 ProductTabs - Best seller error:', bestSellerError);

  const handleProductClick = (product: any) => {
    const productName = product.name || product.title || product.sku || product.id;
    const productUrl = createProductUrl(product.id, productName);
    console.log('🔍 Navigating to product detail:', productUrl);
    navigate(productUrl);
  };

  const renderProductGrid = (products: any[]) => {
    console.log('🔍 ProductTabs - Rendering grid with products:', products);
    
    if (!products || products.length === 0) {
      console.log('⚠️ ProductTabs - No products available');
      return (
        <div className="products-empty">
          <p>No products available</p>
        </div>
      );
    }

    console.log('✅ ProductTabs - Rendering', products.length, 'products');
    
    return (
      <div className="products-grid">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
            rating={product.rating}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    console.log('🎯 ProductTabs - Active tab:', activeTab);
    console.log('📊 ProductTabs - Latest loading:', latestLoading);
    console.log('📊 ProductTabs - Best seller loading:', bestSellerLoading);
    console.log('📦 ProductTabs - Latest data:', latestProductsData);
    console.log('📦 ProductTabs - Best seller data:', bestSellerProductsData);
    
    if (activeTab === 'latest') {
      if (latestLoading) {
        console.log('⏳ ProductTabs - Loading latest products...');
        return (
          <div className="products-loading">
            <p>Loading latest products...</p>
          </div>
        );
      }
      console.log('🆕 ProductTabs - Rendering latest products');
      return renderProductGrid(latestProductsData?.content?.result || []);
    }

    if (activeTab === 'bestseller') {
      if (bestSellerLoading) {
        console.log('⏳ ProductTabs - Loading best seller products...');
        return (
          <div className="products-loading">
            <p>Loading best seller products...</p>
          </div>
        );
      }
      console.log('🔥 ProductTabs - Rendering best seller products');
      return renderProductGrid(bestSellerProductsData?.content?.result || []);
    }

    return null;
  };

  return (
    <div className="product-tabs">
      {/* Tab Headers */}
      <div className="tab-headers">
        <button
          className={`tab-header ${activeTab === 'latest' ? 'active' : ''}`}
          onClick={() => setActiveTab('latest')}
        >
          Latest Products
        </button>
        <button
          className={`tab-header ${activeTab === 'bestseller' ? 'active' : ''}`}
          onClick={() => setActiveTab('bestseller')}
        >
          Best Seller
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};