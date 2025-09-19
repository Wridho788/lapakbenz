import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdRemove, MdShoppingCart, MdStar } from 'react-icons/md';
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
  const { addToCart, cartCount } = useCart();
  
  // Auth state
  const { isAuthenticated } = useAuthStore();

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
    console.log('🔄 Processed Product Data for UI:', productData);
  }, [productData]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= productData.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        confirmButtonColor: '#f39c12'
      });
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
      {(!productLoading && !productError || !isAuthenticated) && (
        <div className="product-detail-content">
        {/* Product Images */}
        <div className="product-images-section">
          <div className="main-image">
            <img
              src={productData.images[selectedImageIndex]}
              alt={productData.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/bea2x.jpg";
              }}
            />
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
            <h3>Description</h3>
            <p>{productData.description}</p>
          </div>

          <div className="product-specifications">
            <h3>Specifications</h3>
            <ul>
              {productData.specifications.map((spec: string, index: number) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="purchase-section">
          <div className="purchase-header">
            <h3>Select Quantity</h3>
            <div className="stock-badge">
              <span className={`stock-indicator ${productData.stock > 0 ? 'available' : 'unavailable'}`}>
                {productData.stock > 0 ? `${productData.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="quantity-selector">
            <div className="quantity-label">
              <span>Quantity</span>
            </div>
            <div className="quantity-controls">
              <div
                className={`quantity-btn decrease ${quantity <= 1 ? 'disabled' : ''}`}
                onClick={() => quantity > 1 && handleQuantityChange(-1)}
                aria-label="Decrease quantity"
              >
                <MdRemove />
              </div>
              <div className="quantity-display">
                <span className="quantity-number">{quantity}</span>
              </div>
              <div
                className={`quantity-btn increase ${quantity >= productData.stock ? 'disabled' : ''}`}
                onClick={() => quantity < productData.stock && handleQuantityChange(1)}
                aria-label="Increase quantity"
              >
                <MdAdd />
              </div>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-breakdown">
              <div className="price-row">
                <span>Price per item</span>
                <span>Rp {productData.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="price-row">
                <span>Quantity</span>
                <span>x{quantity}</span>
              </div>
              <div className="price-divider"></div>
              <div className="price-row total">
                <span>Total Price</span>
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
              <span>{addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}</span>
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
