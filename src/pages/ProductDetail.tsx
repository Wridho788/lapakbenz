import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdRemove, MdShoppingCart, MdStar, MdClose, MdZoomIn } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
import { useProductDetail, useAddToCart } from '../api/hooks';
import { useAuthStore } from '../stores/authStore';
import Swal from 'sweetalert2';
import './ProductDetail.css';

interface ProductDetailType {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  description: string;
  specifications: string[];
  stock: number;
  images: string[];
}

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { addToCart, cartCount } = useCart();
  
  // Auth state - get all needed auth properties
  const { isAuthenticated, token, validateToken, requireAuth } = useAuthStore();

  // Log when productId changes
  useEffect(() => {
    console.log('📦 ProductDetail page loaded with productId:', productId);
  }, [productId]);

  // API hook for product detail
  const { data: productDetailData, isLoading: productLoading, error: productError } = useProductDetail(
    productId || ''
  );

  // Add to cart mutation hook
  const addToCartMutation = useAddToCart();

  // Log the response to console
  useEffect(() => {
    if (productDetailData) {
      console.log('✅ Product Detail API Response:', productDetailData);
      if (productDetailData.content) {
        console.log('📋 Product Detail Raw Data:', productDetailData.content);
      }
    }
  }, [productDetailData]);

  // Log loading state
  useEffect(() => {
    if (productLoading) {
      console.log('⏳ Loading product detail...');
    }
  }, [productLoading]);

  // Log errors
  useEffect(() => {
    if (productError) {
      console.error('❌ Product Detail Error:', productError);
    }
  }, [productError]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked - Navigate to cart page');
    // Navigate to cart page when implemented
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Image zoom handlers
  const handleImageZoomOpen = (imageIndex: number) => {
    setZoomImageIndex(imageIndex);
    setIsImageZoomOpen(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleImageZoomClose = () => {
    setIsImageZoomOpen(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handleZoomImageChange = (direction: 'prev' | 'next') => {
    const productData = getProductData();
    if (direction === 'prev') {
      setZoomImageIndex((prev) => 
        prev === 0 ? productData.images.length - 1 : prev - 1
      );
    } else {
      setZoomImageIndex((prev) => 
        prev === productData.images.length - 1 ? 0 : prev + 1
      );
    }
    // Reset zoom when changing images
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.5, 3);
      console.log('Zoom In - New level:', newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      console.log('Zoom Out - New level:', newZoom);
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Reset Zoom to 1x');
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


  // Pinch-to-zoom state for mobile
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isPinching, setIsPinching] = useState(false);

  // Helper to calculate distance between two touches
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch handlers for drag and pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - imagePosition.x,
        y: e.touches[0].clientY - imagePosition.y
      });
      setIsPinching(false);
    } else if (e.touches.length === 2) {
      setIsPinching(true);
      setLastTouchDistance(getTouchDistance(e.touches));
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinching && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance) {
        const delta = distance - lastTouchDistance;
        if (Math.abs(delta) > 2) { // threshold to avoid jitter
          setZoomLevel(prev => {
            let newZoom = prev + delta / 150; // adjust divisor for sensitivity
            newZoom = Math.max(1, Math.min(3, newZoom));
            return newZoom;
          });
        }
      }
      setLastTouchDistance(distance);
    } else if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      setImagePosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching && e.touches.length < 2) {
      setIsPinching(false);
      setLastTouchDistance(null);
    }
    if (isDragging && e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageZoomOpen) {
        handleImageZoomClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isImageZoomOpen]);

  // Get product data from API or use dummy data as fallback
  const getProductData = (): ProductDetailType => {
    // Default dummy data
    const dummyData: ProductDetailType = {
      id: productId || '1',
      title: 'Merciku T-Shirt Premium',
      price: 149000,
      image: '/bea2x.jpg',
      category: 'Apparel',
      rating: 4.8,
      description: 'Premium quality t-shirt made from 100% cotton with comfortable fit. Perfect for daily wear or casual events. Features the iconic Merciku logo with modern design.',
      specifications: [
        'Material: 100% Cotton',
        'Available sizes: S, M, L, XL, XXL',
        'Color: Black, White, Navy',
        'Weight: 180 GSM',
        'Care: Machine wash cold'
      ],
      stock: 25,
      images: ['/bea2x.jpg', '/bea2x.jpg', '/bea2x.jpg']
    };

    // If we have API data, use it
    if (productDetailData?.content) {
      const apiProduct = productDetailData.content;
      
      // Create images array from available URLs
      const productImages = [];
      if (apiProduct.image) productImages.push(apiProduct.image);
      if (apiProduct.url1) productImages.push(apiProduct.url1);
      if (apiProduct.url2) productImages.push(apiProduct.url2);
      if (apiProduct.url3) productImages.push(apiProduct.url3);
      if (apiProduct.url4) productImages.push(apiProduct.url4);
      if (apiProduct.url5) productImages.push(apiProduct.url5);
      if (apiProduct.url6) productImages.push(apiProduct.url6);
      
      // Remove duplicates
      const uniqueImages = [...new Set(productImages)];
      
      // Create specifications array from available data
      const specifications = [];
      if (apiProduct.sku) specifications.push(`SKU: ${apiProduct.sku}`);
      if (apiProduct.weight) specifications.push(`Weight: ${apiProduct.weight}g`);
      if (apiProduct.period) specifications.push(`Available: ${apiProduct.period}`);
      if (apiProduct.restricted) specifications.push(`Restricted: ${apiProduct.restricted === 'Y' ? 'Yes' : 'No'}`);
      if (apiProduct.status) specifications.push(`Status: ${apiProduct.status === 1 ? 'Active' : 'Inactive'}`);
      
      return {
        id: apiProduct.id?.toString() || productId || '1',
        title: apiProduct.name || dummyData.title,
        price: apiProduct.price || dummyData.price,
        image: apiProduct.image || dummyData.image,
        category: 'Product', // API doesn't provide category, use default
        rating: parseFloat(apiProduct.rating) || dummyData.rating,
        description: apiProduct.description || apiProduct.shortdesc || dummyData.description,
        specifications: specifications.length > 0 ? specifications : dummyData.specifications,
        stock: 25, // API doesn't provide stock info, use default
        images: uniqueImages.length > 0 ? uniqueImages : dummyData.images
      };
    }

    // Return dummy data if no API data
    return dummyData;
  };

  const productData = getProductData();

  // Log processed product data
  useEffect(() => {
    console.log('📄 Processed Product Data for UI:', productData);
  }, [productData]);

  // Log zoom level changes
  useEffect(() => {
    console.log('🔍 Zoom Level Changed:', zoomLevel);
  }, [zoomLevel]);

  // Log image position changes
  useEffect(() => {
    if (zoomLevel > 1) {
      console.log('📍 Image Position:', imagePosition);
    }
  }, [imagePosition, zoomLevel]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= productData.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    // Enhanced authentication check using authStore methods
    const isTokenValid = validateToken();
    
    if (!isAuthenticated || !token || !isTokenValid) {
      console.log('🔒 Authentication required for adding to cart');
      
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        confirmButtonColor: '#f39c12',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonColor: '#6c757d',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // Use requireAuth method from authStore for additional validation
    const canProceed = requireAuth(() => {
      // This callback will only execute if authentication is valid
      console.log('✅ Authentication verified, proceeding with add to cart');
    }, 'add items to cart');

    if (!canProceed) {
      navigate('/login');
      return;
    }

    try {
      console.log(`Adding ${quantity} items to cart:`, productData.title);
      
      // Get the SKU from the API data or use the product ID as fallback
      const productSku = productDetailData?.content?.sku || productData.id;
      
      // Add to cart using API
      await addToCartMutation.mutateAsync({
        data: {
          sku: productSku,
          qty: quantity.toString()
        }
      });

      // Show success message with SweetAlert
      await Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${quantity} ${productData.title} added to cart successfully`,
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true
      });

      // Also add to cart context for immediate UI update
      addToCart({
        id: productData.id,
        title: productData.title,
        price: productData.price,
        image: productData.image
      }, quantity);
      
      // Reset quantity to 1 after adding to cart
      setQuantity(1);
      
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      let errorMessage = 'Failed to add item to cart. Please try again.';
      
      // Check if error is related to authentication
      if (error?.response?.status === 401 || error?.message?.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Your session has expired. Please login again.';
        
        await Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: errorMessage,
          confirmButtonColor: '#f39c12',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          // Logout and redirect to login
          useAuthStore.getState().logout();
          navigate('/login');
        });
        return;
      }
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Add to Cart Failed',
        text: errorMessage,
        confirmButtonColor: '#d33'
      });
    }
  };

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

  return (
    <div className="product-detail-page">
      <AppbarDefault
        title="Product Detail"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      {/* Image Zoom Modal */}
      {isImageZoomOpen && (
        <div className="image-zoom-modal" onClick={handleImageZoomClose}>
          {/* Header */}
          <div className="zoom-modal-header" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-modal-title">
              <MdZoomIn />
              <span>Pratinjau Gambar</span>
              <span className="zoom-image-counter">
                {zoomImageIndex + 1} / {productData.images.length}
              </span>
            </div>
            <div className="zoom-modal-actions">
              <button 
                className="zoom-close-btn" 
                onClick={handleImageZoomClose}
                aria-label="Tutup pratinjau"
              >
                <MdClose />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-image-wrapper">
              <div 
                className={`zoom-image-container ${zoomLevel > 1 ? 'zoomed' : ''} ${isDragging ? 'dragging' : ''}`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={productData.images[zoomImageIndex]}
                  alt={`${productData.title} ${zoomImageIndex + 1}`}
                  className="zoomed-image"
                  draggable="false"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/bea2x.jpg";
                  }}
                />
              </div>
              
              {/* Navigation arrows */}
              {productData.images.length > 1 && (
                <>
                  <button 
                    className="zoom-nav-btn prev" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomImageChange('prev');
                    }}
                    aria-label="Gambar sebelumnya"
                  >
                    ◀
                  </button>
                  <button 
                    className="zoom-nav-btn next" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomImageChange('next');
                    }}
                    aria-label="Gambar berikutnya"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer with Controls */}
          <div className="zoom-modal-footer" onClick={(e) => e.stopPropagation()}>
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button 
                className="zoom-control-btn"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                aria-label="Perkecil"
                type="button"
              >
                −
              </button>
              <div className="zoom-level-display">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button 
                className="zoom-control-btn"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                aria-label="Perbesar"
                type="button"
              >
                +
              </button>
              {zoomLevel > 1 && (
                <button 
                  className="zoom-reset-btn"
                  onClick={handleResetZoom}
                  aria-label="Reset zoom"
                  type="button"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Image Thumbnails */}
            {productData.images.length > 1 && (
              <div className="zoom-thumbnails">
                {productData.images.map((image, index) => (
                  <div
                    key={index}
                    className={`zoom-thumbnail ${zoomImageIndex === index ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Thumbnail clicked:', index);
                      setZoomImageIndex(index);
                      setZoomLevel(1);
                      setImagePosition({ x: 0, y: 0 });
                    }}
                  >
                    <img
                      src={image}
                      alt={`${productData.title} thumbnail ${index + 1}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/bea2x.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {productLoading && (
        <div className="product-detail-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            background: 'white',
            borderRadius: '12px',
            margin: '20px'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Loading product details...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {productError && !productLoading && (
        <div className="product-detail-content">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            background: 'white',
            borderRadius: '12px',
            margin: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 16px 0', color: '#e74c3c', fontSize: '16px' }}>Failed to load product details</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: '#161129',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Product Content - show if not loading and no error, or if we have dummy data */}
      {(!productLoading && !productError) && (
        <div className="product-detail-content">
        {/* Product Images */}
        <div className="product-images-section">
          <div className="main-image" onClick={() => handleImageZoomOpen(selectedImageIndex)}>
            <img
              src={productData.images[selectedImageIndex]}
              alt={productData.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/bea2x.jpg";
              }}
            />
            <div className="zoom-indicator-overlay">
              <MdZoomIn className="zoom-icon" />
              <span>Klik untuk perbesar</span>
            </div>
          </div>
          <div className="image-thumbnails">
            {productData.images.map((image: string, index: number) => (
              <div
                key={index}
                className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${productData.title} ${index + 1}`}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/bea2x.jpg";
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <span className="product-category">{productData.category}</span>
            <h1 className="product-title">{productData.title}</h1>
            
            <div className="product-rating-section">
              <div className="rating-stars">
                {renderStars(productData.rating)}
              </div>
              <span className="rating-text">({productData.rating}) • 156 reviews</span>
            </div>

            <div className="product-price">
              Rp {productData.price.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="product-description">
            <h3>Deskripsi</h3>
            <p>{productData.description}</p>
          </div>

        </div>

        {/* Quantity and Add to Cart */}
        <div className="purchase-section">
          <div className="purchase-header">
            <h3>Pilih Jumlah</h3>
            <div className="stock-badge">
              <span className={`stock-indicator ${productData.stock > 0 ? 'available' : 'unavailable'}`}>
                {productData.stock > 0 ? `${productData.stock} tersedia` : 'Stok habis'}
              </span>
            </div>
          </div>

          <div className="quantity-selector">
            <div className="quantity-label">
              <span>Jumlah</span>
            </div>
            <div className="quantity-controls">
              <div
                className={`quantity-btn decrease ${quantity <= 1 ? 'disabled' : ''}`}
                onClick={() => quantity > 1 && handleQuantityChange(-1)}
                aria-label="Kurangi jumlah"
              >
                <MdRemove />
              </div>
              <div className="quantity-display">
                <span className="quantity-number">{quantity}</span>
              </div>
              <div
                className={`quantity-btn increase ${quantity >= productData.stock ? 'disabled' : ''}`}
                onClick={() => quantity < productData.stock && handleQuantityChange(1)}
                aria-label="Tambah jumlah"
              >
                <MdAdd />
              </div>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-breakdown">
              <div className="price-row">
                <span>Harga per item</span>
                <span>Rp {productData.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="price-row">
                <span>Jumlah</span>
                <span>x{quantity}</span>
              </div>
              <div className="price-divider"></div>
              <div className="price-row total">
                <span>Total Harga</span>
                <span className="total-amount">Rp {(productData.price * quantity).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={productData.stock === 0 || addToCartMutation.isPending}
            >
              <MdShoppingCart className="cart-icon" />
              <span>{addToCartMutation.isPending ? 'Menambahkan...' : 'Tambah ke Keranjang'}</span>
            </button>
          </div>
          </div>
        </div>
        )}

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default ProductDetail;