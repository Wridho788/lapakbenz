import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdRemove, MdShoppingCart, MdStar } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
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

  // Dummy product data - in real app, this would come from API
  const productData: ProductDetailType = {
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

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= productData.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} items to cart:`, productData.title);
    
    // Add to cart using context
    addToCart({
      id: productData.id,
      title: productData.title,
      price: productData.price,
      image: productData.image
    }, quantity);
    
    // Show success message
    alert(`Added ${quantity} ${productData.title} to cart!`);
    
    // Reset quantity to 1 after adding to cart
    setQuantity(1);
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
            {productData.images.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${productData.title} ${index + 1}`}
                  onError={(e) => {
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
              {productData.specifications.map((spec, index) => (
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
              disabled={productData.stock === 0}
            >
              <MdShoppingCart className="cart-icon" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default ProductDetail;
