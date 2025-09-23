import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdClear } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
import { useProducts, useProductCategories, useProductSearch } from '../api/hooks';
import './Product.css';

const Product: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { cartCount } = useCart();
  // API hooks
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({
    limit: 3000,
    offset: 0,
    orderby: '',
    order: 'asc',
    category: selectedCategory,
  });

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useProductCategories();
  
  const productSearchMutation = useProductSearch();

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      console.log('🔍 Searching for:', query);
      productSearchMutation.mutate(
        { filter: query.trim() },
        {
          onSuccess: (data) => {
            console.log('✅ Search results:', data);
            if (data?.content?.result === null) {
              console.log('🔍 No products found for query:', query);
            }
          },
          onError: (error) => {
            console.error('❌ Search failed:', error);
          }
        }
      );
    }
  };

  // Process categories from API
  const categories = useMemo(() => {
    const baseCategories = ['All'];
    
    if (categoriesData?.content?.result) {
      const apiCategories = categoriesData.content.result.map((cat: any) => cat.name || cat.category_name || cat.title);
      return [...baseCategories, ...apiCategories];
    }
    
    return baseCategories;
  }, [categoriesData]);

  // Process products from API
  const products = useMemo(() => {
    // If we have search results (including null results), use them
    if (productSearchMutation.data?.content) {
      // Handle case where search returns null results
      if (productSearchMutation.data.content.result === null || 
          !Array.isArray(productSearchMutation.data.content.result)) {
        console.log('🔍 Search returned no results (null/invalid)');
        return []; // Return empty array for no results
      }
      console.log('🔍 Using search results:', productSearchMutation.data.content.result);
      return productSearchMutation.data.content.result;
    }
    
    // Otherwise use products from the main API
    if (productsData?.content?.result && Array.isArray(productsData.content.result)) {
      console.log('📦 Using main products data');
      return productsData.content.result;
    }
    
    console.log('⚠️ No products available');
    return [];
  }, [productsData, productSearchMutation.data]);

  // Filter products based on search query and selected category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // If we have an active search query, products are already filtered by the search API
    // No need to filter again unless we're using the main products API
    if (searchQuery.trim() && !productSearchMutation.data?.content) {
      // Only apply local filtering if search API hasn't been called yet
      filtered = filtered.filter((product: any) =>
        (product.title || product.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category (always apply this filter)
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((product: any) =>
        (product.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, productSearchMutation.data]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked - Navigate to cart page');
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Handle search with debouncing and reset search results when cleared
  useEffect(() => {
    if (searchQuery.trim()) {
      // Call search for any non-empty query (removed length > 2 restriction)
      const debounceTimer = setTimeout(() => {
        handleSearch(searchQuery.trim());
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else if (searchQuery === '') {
      // Clear search results when search is cleared to return to original product list
      if (productSearchMutation.data) {
        productSearchMutation.reset();
      }
      // Don't refetch here to prevent infinite loop - just reset search state
    }
  }, [searchQuery]); // Removed productSearchMutation and refetchProducts from dependency array

  const handleProductClick = (productId: string) => {
    console.log('🛍️ Product clicked with ID:', productId);
    console.log('🔄 Navigating to product detail page...');
    navigate(`/product/${productId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? '' : category);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (productSearchMutation.data) {
      productSearchMutation.reset();
    }
  };

  // Loading states
  const isLoading = productsLoading || categoriesLoading || productSearchMutation.isPending;
  const hasError = productsError || categoriesError || productSearchMutation.error;

  return (
    <div className="product-page">
      <AppbarDefault
        title="Product Catalog"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div className="product-content">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-bar">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                <MdClear />
              </button>
            )}
          </div>
          
          <div className="filter-section">
            <MdFilterList className="filter-icon" />
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`filter-btn ${(selectedCategory === '' && category === 'All') || selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <p>Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="error-state">
            <p>Failed to load products. Please try again.</p>
            <button onClick={() => refetchProducts()}>Retry</button>
          </div>
        )}

        {/* Product Catalog */}
        {!isLoading && !hasError && (
          <div className="product-catalog">
            <h3 className="catalog-title">
              {selectedCategory === '' || selectedCategory === 'All' ? 'All Products' : selectedCategory}
              <span className="product-count">({filteredProducts.length} items)</span>
            </h3>
            
            <div className="product-grid">
              {filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img
                      src={product.image || product.img || "/bea2x.jpg"}
                      alt={product.title || product.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/bea2x.jpg";
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h4 className="product-title">{product.title || product.name}</h4>
                    <div className="product-rating">
                      <span className="rating-stars">⭐ {product.rating || '4.5'}</span>
                      <span className="product-category">{product.category}</span>
                    </div>
                    <div className="product-price">
                      Rp {(product.price || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && !isLoading && (
              <div className="empty-state">
                <img src="/nodata.png" alt="No Products" className="empty-icon" />
                <h3>
                  {searchQuery ? `No results found for "${searchQuery}"` : 'No Products Found'}
                </h3>
                <p>
                  {searchQuery 
                    ? 'Try searching with different keywords or browse our categories.' 
                    : 'Try adjusting your search or filter to find what you\'re looking for.'
                  }
                </p>
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="clear-search-action-btn"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Product;
