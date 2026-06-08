import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdClear, MdKeyboardArrowDown, MdKeyboardArrowUp, MdStar } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import SEO from '../components/SEO';
import { generateBreadcrumbs } from '../utils/seoUtils';
import { useProducts, useProductCategories, useProductSearch, useProductCities, useCart } from '../api/hooks/index';
import { createProductUrl } from '../api/codeMapping';
import { capitalizeWords } from '../utils/format';
import './Product.css';
import '../components/LoadingSkeleton.css';

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
  
  // Render stars function similar to ProductDetail
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<MdStar key="half" className="star half" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<MdStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };
  
  // New filter states
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc' | ''>('');
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'used' | ''>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Infinite scroll states
  const [offset, setOffset] = useState("0");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasDataBeenFetched, setHasDataBeenFetched] = useState(false);
  const [isFirstInit, setIsFirstInit] = useState(true);

  // API hooks for cart
  const {
    data: apiCartData,
  } = useCart();

  // API hooks - now including all filter parameters
  // When search is active, don't send filter parameters to API
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({
    limit: "10",
    offset: `${offset}`,
    orderby: searchQuery.trim() ? '' : (priceOrder ? 'price' : ''),
    order: searchQuery.trim() ? 'asc' : (priceOrder || 'desc'),
    category: searchQuery.trim() ? '' : selectedCategoryId, // Clear filters when searching
    location: searchQuery.trim() ? '' : selectedLocations.join(','), // Clear filters when searching
    condition: searchQuery.trim() ? '' : selectedCondition, // Clear filters when searching
  });

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useProductCategories();
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useProductCities();

  const productSearchMutation = useProductSearch();

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Clear ALL filters when searching to show all search results
      if (selectedCategoryId || priceOrder || selectedCondition || selectedLocations.length > 0) {
        // console.log('🔍 Clearing all filters for search');
        setSelectedCategoryId('');
        setPriceOrder('');
        setSelectedCondition('');
        setSelectedLocations([]);
      }
      productSearchMutation.mutate(
        { filter: query.trim(), limit: '10' },
        {
          onSuccess: (data) => {
            if (data?.result === null) {
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

    if (categoriesData?.result) {
      const apiCategories = categoriesData.result.map((cat: any): Category => ({
        id: cat.id || cat.category_id || '',
        name: cat.name || cat.category_name || cat.title || 'Kategori Tidak Diketahui'
      }));
      return [...baseCategories, ...apiCategories];
    }

    return baseCategories;
  }, [categoriesData]);

  // Process cities from API
  const cities = useMemo((): City[] => {
    if (citiesData?.result && Array.isArray(citiesData.result)) {
      return citiesData.result.map((city: any): City => ({
        name: city.name || city.city_name || 'Kota Tidak Diketahui'
      }));
    }
    return [];
  }, [citiesData]);

  // Monitor offset changes for infinite scroll and trigger refetch if needed
  useEffect(() => {
    if (parseInt(offset || '0', 10) > 0 && isLoadingMore && !productsLoading) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        refetchProducts();
      }, 50);
    }
  }, [offset, isLoadingMore, productsLoading, refetchProducts]);

  // Handle products data accumulation for infinite scroll
  useEffect(() => {

    // Only process if not currently loading
    if (!productsLoading && productsData) {
      if (productsData?.result && Array.isArray(productsData.result)) {
        const newProducts = productsData.result;

        setHasDataBeenFetched(true);
        setIsLoadingMore(false);

        if (offset === "0") {
          // First load or filter change - replace all products
          setAllProducts(newProducts);
        } else {
          // Subsequent loads - append to existing products
          setAllProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewProducts = newProducts.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProducts];
          });
        }

        // Update hasMore based on whether we got a full page of results
        const hasMoreData = newProducts.length === 10;
        setHasMore(hasMoreData);
      } else {
        // Handle empty results
        setHasDataBeenFetched(true);
        setIsLoadingMore(false);
        if (offset === "0") {
          setAllProducts([]);
        }
        setHasMore(false);
      }
    }
  }, [productsData, productsLoading, offset]);

  // Process products from API
  const products = useMemo(() => {
    // If we have search results (including null results), use them
    if (productSearchMutation.data?.result) {
      // Handle case where search returns null results
      if (!Array.isArray(productSearchMutation.data.result)) {
        return [];
      }
      return productSearchMutation.data.result;
    }

    // Use accumulated products for infinite scroll
    return allProducts;
  }, [allProducts, productSearchMutation.data]);

  // Fallback effect to ensure products are loaded
  useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      if (allProducts.length === 0 &&
          !productsLoading &&
          !searchQuery.trim() &&
          !isLoadingMore &&
          !productSearchMutation.data &&
          isInitialized &&
          !productsData) {
        setOffset("0");
        refetchProducts();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [allProducts.length, productsLoading, searchQuery.trim(), isLoadingMore, productSearchMutation.data, refetchProducts, isInitialized, productsData]);

  // Filter products based on search query and selected category ID
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // If we have search results from API, don't apply additional category filtering
    // because search should show all relevant products regardless of category filter
    if (productSearchMutation.data?.result && searchQuery.trim()) {

      return filtered; // Return search results as-is
    }

    // Only apply category filtering when NOT searching
    if (!searchQuery.trim() && selectedCategoryId && selectedCategoryId !== '') {
      filtered = filtered.filter((product: any) =>
        (product.category_id || product.category || '') === selectedCategoryId
      );
    }

    // Apply local search filtering only when using main products API (not search API)
    if (searchQuery.trim() && !productSearchMutation.data?.result) {
      filtered = filtered.filter((product: any) =>
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategoryId, productSearchMutation.data]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleCartClick = () => {
    // console.log('Cart clicked - Navigate to cart page');
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

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Skip if searching, loading, no more data, or already loading more
      if (searchQuery.trim() || isLoadingMore || !hasMore || productsLoading) {
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Trigger when user is near bottom (150px threshold)
      const nearBottom = scrollTop + windowHeight >= documentHeight - 150;
      
      if (nearBottom) {
        setIsLoadingMore(true);
        setOffset(prev => {
          const newOffset = parseInt(prev || '0', 10) + 10;
          return String(newOffset);
        });
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [searchQuery, isLoadingMore, hasMore, productsLoading, offset, allProducts.length]);

  // Handle filter changes by updating offset and refetching (without clearing products)
  useEffect(() => {
    if (isInitialized && !isFirstInit && !searchQuery.trim()) {
      setOffset("0"); // Reset to first page
      setHasMore(true);
      setIsLoadingMore(false);
      
      // Refetch without clearing existing products first
      setTimeout(() => {
        refetchProducts();
      }, 100);
    } else if (isInitialized && isFirstInit) {
      setIsFirstInit(false);
    }
  }, [selectedCategoryId, priceOrder, selectedCondition, selectedLocations, searchQuery.trim(), isInitialized, isFirstInit, refetchProducts]);

  // Force fresh API call on component mount (only once)
  useEffect(() => {
    const timer = setTimeout(() => {
      refetchProducts();
    }, 50);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency - only run on mount

  // Initialize component state once
  useEffect(() => {
    if (!isInitialized) {
      // Clear any existing search state
      if (productSearchMutation.data) {
        productSearchMutation.reset();
      }
      
      // Reset data fetch tracking only if we don't have data
      if (allProducts.length === 0) {
        setHasDataBeenFetched(false);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, productSearchMutation, allProducts.length]);

  // Simplified page visibility handling for returning from other pages
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !searchQuery.trim() && allProducts.length === 0) {
        setTimeout(() => refetchProducts(), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [searchQuery.trim(), allProducts.length, refetchProducts]);

// Log cart API data
  useEffect(() => {
    if (apiCartData) {
    }
  }, [apiCartData]);

  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };
    const apiCartCount = getApiCartCount();

  const handleProductClick = (product: any) => {
    const productName = capitalizeWords(product.name || product.sku || product.id);
    const productUrl = createProductUrl(productName,String(product.sku));
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
    // Note: We don't restore previous filters when clearing search
    // User can manually set filters again if needed
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
  const isLoading = categoriesLoading || citiesLoading || productSearchMutation.isPending;
  const hasError = productsError || categoriesError || citiesError || productSearchMutation.error;
  
  // Determine if we should show loading state  
  const shouldShowLoading = (!isInitialized && !allProducts.length) || 
    (productsLoading && allProducts.length === 0 && !hasDataBeenFetched);

  return (
    <div className="product-page">
      <SEO 
        title="Katalog Produk lapakBenz - Temukan Produk Komunitas Terbaik"
        description={`Jelajahi katalog produk lengkap lapakBenz. Temukan ${filteredProducts.length > 0 ? filteredProducts.length + ' produk' : 'berbagai produk'} berkualitas dari komunitas UMKM dan otomotif Indonesia. ${searchQuery ? `Hasil pencarian: ${searchQuery}` : getCurrentCategoryName() !== 'Semua' ? `Kategori: ${getCurrentCategoryName()}` : 'Semua kategori tersedia'}.`}
        keywords={`produk lapakbenz, ${searchQuery || 'katalog produk'}, marketplace indonesia, produk umkm, produk otomotif, ${getCurrentCategoryName() !== 'Semua' ? getCurrentCategoryName().toLowerCase() : 'semua kategori'}, belanja online, produk komunitas`}
        schemaType="WebPage"
        breadcrumbs={generateBreadcrumbs('product')}
      />
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
              className={`search-input ${productSearchMutation.isPending ? 'searching' : ''}`}
            />
            {productSearchMutation.isPending && (
              <div className="search-loading">
                <div className="search-spinner"></div>
              </div>
            )}
            {searchQuery && !productSearchMutation.isPending && (
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

        {/* Loading State - Skeleton */}
        {(shouldShowLoading || isLoading) && (
          <div className="loading-state">
            <div className="skeleton-container">
              <h3 className="catalog-title">
                <div className="skeleton-text skeleton-title"></div>
              </h3>
              <div className="product-grid">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="product-card skeleton-card">
                    <div className="product-image skeleton-image">
                      <div className="skeleton-shimmer"></div>
                    </div>
                    <div className="product-info">
                      <div className="skeleton-text skeleton-product-title"></div>
                      <div className="skeleton-text skeleton-rating"></div>
                      <div className="skeleton-text skeleton-price"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && isInitialized && !productsLoading && (
          <div className="error-state">
            <p>Gagal memuat produk. Silakan coba lagi.</p>
            <button onClick={() => refetchProducts()}>Coba Lagi</button>
          </div>
        )}

        {/* Product Catalog */}
        {(() => {
          const shouldShowCatalog = isInitialized && 
            !shouldShowLoading && 
            !isLoading && 
            !hasError && 
            filteredProducts.length > 0;
          return shouldShowCatalog;
        })() && (
          <div className="product-catalog">
            <div className="catalog-header">
              <h3 className="catalog-title">
                {getCurrentCategoryName()}
                <span className="product-count">({filteredProducts.length} produk)</span>
              </h3>
              {productsData?.record && productsData.record > 0 && filteredProducts.length > 0 && (
                <div className="progress-indicator">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((filteredProducts.length / (productsData.record || 1)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {filteredProducts.length} dari {productsData.record} produk
                  </span>
                </div>
              )}
            </div>
            
            <div className="product-grid">
              {filteredProducts.map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideUp 0.5s ease-out both'
                  }}
                >
                  <div className="product-image">
                    <img
                      src={product.url_image + product.image}
                      alt={product.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/bea2x.jpg";
                      }}
                      loading="lazy"
                    />
                    {productsLoading && offset === "0" && (
                      <div className="image-loading-overlay">
                        <div className="image-spinner"></div>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-info-header">
                      <h4 className="product-title">{capitalizeWords(product.name)}</h4>
                    </div>

                    <div className="product-rating-row">
                      <div className="rating-stars">
                        {renderStars(product.rating || 0)}
                        <span className="rating-number">{product.rating ? `(${product.rating})` : '(0.0)'}</span>
                      </div>
                    </div>
                      <span className="product-category-badge">{product.city || 'Lokasi belum tersedia'}</span>

                    <h3 className="product-price">Rp {(product.price || 0).toLocaleString('id-ID')}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll loading indicator */}
            {(() => {
              const showLoadingMore = isLoadingMore && !searchQuery.trim();
              if (showLoadingMore) {
              }
              return showLoadingMore;
            })() && (
              <div className="loading-more">
                <div className="loading-spinner">
                  <div className="spinner-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
                <p>Memuat produk lainnya...</p>
                <div className="loading-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            {/* Skeleton loading for infinite scroll */}
            {isLoadingMore && !searchQuery.trim() && (
              <div className="infinite-scroll-skeleton">
                <div className="product-grid">
                  {[...Array(4)].map((_, index) => (
                    <div key={`skeleton-${index}`} className="product-card skeleton-card">
                      <div className="product-image skeleton-image">
                        <div className="skeleton-shimmer"></div>
                      </div>
                      <div className="product-info">
                        <div className="skeleton-text skeleton-product-title"></div>
                        <div className="skeleton-text skeleton-rating"></div>
                        <div className="skeleton-text skeleton-price"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Load more button (fallback) */}
            {(() => {
              const showLoadMore = !searchQuery.trim() && hasMore && !isLoadingMore && filteredProducts.length >= 10;
             
              return showLoadMore;
            })() && (
              <div className="load-more-section">
                <button
                  className="load-more-btn"
                  onClick={() => {
                    setIsLoadingMore(true);
                    setOffset(prev => {
                      const newOffset = parseInt(prev || '0', 10) + 10;
                      return String(newOffset);
                    });
                  }}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="btn-spinner"></div>
                      Memuat...
                    </>
                  ) : (
                    'Muat Lebih Banyak'
                  )}
                </button>
              </div>
            )}

            {(() => {
              const showEmpty = filteredProducts.length === 0 && 
                allProducts.length === 0 &&
                !productsLoading && 
                !isLoadingMore && 
                isInitialized && 
                hasDataBeenFetched && 
                !productSearchMutation.isPending && 
                !shouldShowLoading;
              
              if (showEmpty) {
              }
              
              return showEmpty;
            })() && (
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