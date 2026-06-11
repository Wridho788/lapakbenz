import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { useLatestProducts, useBestSellerProducts } from '../api/hooks/index';
import { createProductUrl } from '../api/codeMapping';
import { capitalizeWords } from '../utils/format';
import './ProductTabs.css';

export const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latest' | 'bestseller'>('latest');
  const navigate = useNavigate();

  // API hooks
  const { data: latestProductsData, isLoading: latestLoading } = useLatestProducts();
  const { data: bestSellerProductsData, isLoading: bestSellerLoading } = useBestSellerProducts();
  
  const handleProductClick = (product: any) => {
    const permalink = product.permalink || `${product.sku || product.id || ''}`;
    const productUrl = permalink ? `/product/${permalink}` : createProductUrl(product.sku, capitalizeWords(product.name || product.title || product.sku || product.id));
    navigate(productUrl);
  };

  const renderProductGrid = (products: any[], _imageUrl?: string) => {
    if (!products || products.length === 0) {
      return (
        <div className="products-empty">
          <p>No products available</p>
        </div>
      );
    }

    return (
      <div className="products-grid">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            image={product.url_image ? product.url_image + product.image : (product.image || '/nodata.png')}
            name={product.name}
            price={product.price}
            rating={product.rating}
            city={product.city}
            supplier={product.supplier}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'latest') {
      if (latestLoading) {
        return (
          <div className="products-loading">
            <p>Loading latest products...</p>
          </div>
        );
      }
      return renderProductGrid(
        latestProductsData?.result || [],
        latestProductsData?.image_url
      );
    }

    if (activeTab === 'bestseller') {
      if (bestSellerLoading) {
        return (
          <div className="products-loading">
            <p>Loading best seller products...</p>
          </div>
        );
      }
      return renderProductGrid(
        bestSellerProductsData?.result || [],
        bestSellerProductsData?.image_url
      );
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