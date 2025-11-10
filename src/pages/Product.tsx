import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdClear, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useProducts, useProductCategories, useProductSearch, useProductCities, useCart } from '../api/hooks/index';
import { createProductUrl } from '../api/codeMapping';
import './Product.css';

// TypeScript interfaces
interface City {
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const Product: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // Changed to use category ID
  
  // New filter states
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc' | ''>('');
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'used' | ''>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // API hooks for cart
  const {
    data: apiCartData,
  } = useCart();
  
  // API hooks - now including all filter parameters
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({
    limit: 10,
    offset: 0,
    orderby: priceOrder ? 'price' : '',
    order: priceOrder || 'asc',
    category: selectedCategoryId, // Using category ID
    location: selectedLocations.join(','), // Join locations with comma
    condition: selectedCondition,
  });

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useProductCategories();
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useProductCities();
  
  const productSearchMutation = useProductSearch();

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      console.log('🔍 Searching for:', query);
      // Clear category filter when searching to show all search results
      if (selectedCategoryId) {
        console.log('🔍 Clearing category filter for search');
        setSelectedCategoryId('');
      }
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
  const categories = useMemo((): Category[] => {
    const baseCategories: Category[] = [{ id: '', name: 'Semua' }]; // Base category with empty ID
    
    if (categoriesData?.content?.result) {
      const apiCategories = categoriesData.content.result.map((cat: any): Category => ({
        id: cat.id || cat.category_id || '',
        name: cat.name || cat.category_name || cat.title || 'Kategori Tidak Diketahui'
      }));
      return [...baseCategories, ...apiCategories];
    }
    
    return baseCategories;
  }, [categoriesData]);

  // Process cities from API
  const cities = useMemo((): City[] => {
    if (citiesData?.content?.result && Array.isArray(citiesData.content.result)) {
      return citiesData.content.result.map((city: any): City => ({
        name: city.name || city.city_name || 'Kota Tidak Diketahui'
      }));
    }
    return [];
  }, [citiesData]);

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

    // If we have search results from API, don't apply additional category filtering
    // because search should show all relevant products regardless of category filter
    if (productSearchMutation.data?.content && searchQuery.trim()) {
      console.log('🔍 Using search results without category filtering');
      console.log('🔍 Search query:', searchQuery);
      console.log('🔍 Selected category:', selectedCategoryId);
      console.log('🔍 Search results count:', filtered.length);
      return filtered; // Return search results as-is
    }

    // Only apply category filtering when NOT searching
    if (!searchQuery.trim() && selectedCategoryId && selectedCategoryId !== '') {
      filtered = filtered.filter((product: any) =>
        (product.category_id || product.categoryId || '') === selectedCategoryId
      );
    }

    // Apply local search filtering only when using main products API (not search API)
    if (searchQuery.trim() && !productSearchMutation.data?.content) {
      filtered = filtered.filter((product: any) =>
        (product.title || product.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategoryId, productSearchMutation.data]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked - Navigate to cart page');
    navigate('/cart', { state: { from: '/product' } });
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
// Log cart API data
  useEffect(() => {
    if (apiCartData) {
      console.log('🛒 Cart API Response:', apiCartData);
      console.log('🛒 Cart Items:', apiCartData?.content?.result);
      console.log('🛒 Cart Balance:', apiCartData?.content?.balance);
      console.log('🛒 Cart Record Count:', apiCartData?.content?.record);
    }
  }, [apiCartData]);

  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };
    const apiCartCount = getApiCartCount();

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

  // New filter handlers
  const handlePriceOrderChange = (order: 'asc' | 'desc' | '') => {
    setPriceOrder(order);
  };

  const handleConditionChange = (condition: 'new' | 'used' | '') => {
    setSelectedCondition(condition);
  };

  const handleLocationToggle = (cityName: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(cityName)) {
        return prev.filter(loc => loc !== cityName);
      } else {
        return [...prev, cityName];
      }
    });
  };

  const clearAllFilters = () => {
    setPriceOrder('');
    setSelectedCondition('');
    setSelectedLocations([]);
    setSelectedCategoryId('');
  };

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (!selectedCategoryId) return 'Semua Produk';
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category ? category.name : 'Kategori Tidak Diketahui';
  };

  // Loading states
  const isLoading = productsLoading || categoriesLoading || citiesLoading || productSearchMutation.isPending;
  const hasError = productsError || categoriesError || citiesError || productSearchMutation.error;

  return (
    <div className="product-page">
      <AppbarDefault
        title="Katalog Produk"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={apiCartCount}
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
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <MdFilterList className="filter-icon" />
              <span>Filter</span>
              {showFilters ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              {(priceOrder || selectedCondition || selectedLocations.length > 0 || selectedCategoryId) && (
                <span className="filter-badge">{
                  [priceOrder, selectedCondition, ...selectedLocations, selectedCategoryId].filter(Boolean).length
                }</span>
              )}
            </button>
            
            {showFilters && (
              <div className="advanced-filters">
                {/* Categories */}
                <div className="filter-group">
                  <h4>Kategori</h4>
                  <div className="filter-options">
                    {categories.map((category) => (
                      <label key={category.id || 'all'} className="filter-checkbox">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategoryId === category.id}
                          onChange={() => handleCategoryChange(category.id)}
                        />
                        <span className="checkmark"></span>
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Order */}
                <div className="filter-group">
                  <h4>Urutkan Harga</h4>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="priceOrder"
                        checked={priceOrder === ''}
                        onChange={() => handlePriceOrderChange('')}
                      />
                      <span className="checkmark"></span>
                      Default
                    </label>
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="priceOrder"
                        checked={priceOrder === 'asc'}
                        onChange={() => handlePriceOrderChange('asc')}
                      />
                      <span className="checkmark"></span>
                      Harga Terendah
                    </label>
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="priceOrder"
                        checked={priceOrder === 'desc'}
                        onChange={() => handlePriceOrderChange('desc')}
                      />
                      <span className="checkmark"></span>
                      Harga Tertinggi
                    </label>
                  </div>
                </div>

                {/* Condition */}
                <div className="filter-group">
                  <h4>Kondisi Barang</h4>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === ''}
                        onChange={() => handleConditionChange('')}
                      />
                      <span className="checkmark"></span>
                      Semua Kondisi
                    </label>
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === 'new'}
                        onChange={() => handleConditionChange('new')}
                      />
                      <span className="checkmark"></span>
                      Baru
                    </label>
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === 'used'}
                        onChange={() => handleConditionChange('used')}
                      />
                      <span className="checkmark"></span>
                      Bekas
                    </label>
                  </div>
                </div>

                {/* Locations */}
                {cities.length > 0 && (
                  <div className="filter-group">
                    <h4>Lokasi Produk</h4>
                    <div className="filter-options location-options">
                      {cities.map((city: City) => (
                        <label key={city.name} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(city.name)}
                            onChange={() => handleLocationToggle(city.name)}
                          />
                          <span className="checkmark"></span>
                          {city.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={clearAllFilters}
                  >
                    Hapus Semua Filter
                  </button>
                </div>
              </div>
            )}
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
                    <h4 className="product-title">{(product.title || product.name).toUpperCase()}</h4>
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