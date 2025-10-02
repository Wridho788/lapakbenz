import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdClear } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
import { useProducts, useProductCategories, useProductSearch } from '../api/hooks';
import { createProductUrl } from '../api/codeMapping';
import './Product.css';

const Product: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // Changed to use category ID
  const { cartCount } = useCart();
  
  // API hooks - now passing category ID instead of category name
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({
    limit: 10,
    offset: 0,
    orderby: '',
    order: 'asc',
    category: selectedCategoryId, // Using category ID
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

  // Process categories from API - now storing both ID and name
  const categories = useMemo(() => {
    const baseCategories = [{ id: '', name: 'Semua' }]; // Base category with empty ID
    
    if (categoriesData?.content?.result) {
      const apiCategories = categoriesData.content.result.map((cat: any) => ({
        id: cat.id || cat.category_id || '',
        name: cat.name || cat.category_name || cat.title || 'Kategori Tidak Diketahui'
      }));
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

  // Filter products based on search query and selected category ID
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

    // Filter by category ID (always apply this filter)
    if (selectedCategoryId && selectedCategoryId !== '') {
      filtered = filtered.filter((product: any) =>
        (product.category_id || product.categoryId || '') === selectedCategoryId
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategoryId, productSearchMutation.data]);

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

  const handleProductClick = (product: any) => {
    const productName = product.title || product.name || product.sku || product.id;
    const productUrl = createProductUrl(product.id, productName);
    console.log('� Product clicked, navigating to:', productUrl);
    navigate(productUrl);
  };

  // Updated to handle category ID instead of category name
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (productSearchMutation.data) {
      productSearchMutation.reset();
    }
  };

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (!selectedCategoryId) return 'Semua Produk';
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category ? category.name : 'Kategori Tidak Diketahui';
  };

  // Loading states
  const isLoading = productsLoading || categoriesLoading || productSearchMutation.isPending;
  const hasError = productsError || categoriesError || productSearchMutation.error;

  return (
    <div className="product-page">
      <AppbarDefault
        title="Katalog Produk"
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
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="clear-search-btn"
                aria-label="Hapus pencarian"
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
                  key={category.id || 'all'}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`filter-btn ${selectedCategoryId === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <p>Memuat produk...</p>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="error-state">
            <p>Gagal memuat produk. Silakan coba lagi.</p>
            <button onClick={() => refetchProducts()}>Coba Lagi</button>
          </div>
        )}

        {/* Product Catalog */}
        {!isLoading && !hasError && (
          <div className="product-catalog">
            <h3 className="catalog-title">
              {getCurrentCategoryName()}
              <span className="product-count">({filteredProducts.length} produk)</span>
            </h3>
            
            <div className="product-grid">
              {filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
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
                <img src="/nodata.png" alt="Tidak Ada Produk" className="empty-icon" />
                <h3>
                  {searchQuery ? `Tidak ditemukan hasil untuk "${searchQuery}"` : 'Produk Tidak Ditemukan'}
                </h3>
                <p>
                  {searchQuery 
                    ? 'Coba cari dengan kata kunci lain atau telusuri kategori kami.' 
                    : 'Coba atur ulang pencarian atau filter untuk menemukan produk yang Anda cari.'
                  }
                </p>
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="clear-search-action-btn"
                  >
                    Hapus Pencarian
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