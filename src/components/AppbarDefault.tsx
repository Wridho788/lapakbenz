import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdShoppingCart } from 'react-icons/md';
import './AppbarDefault.css';

export type AppbarDefaultProps = {
  title: string;
  onBack?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
  showCart?: boolean; // New optional prop to control cart visibility
};

export const AppbarDefault: React.FC<AppbarDefaultProps> = ({ 
  title, 
  onBack, 
  onCartClick, 
  cartCount = 0,
  showCart = true // Default to true to maintain backward compatibility
}) => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/cart');
    }
  };

  return (
    <header className="appbar-default">
      {onBack && (
        <button
          className="appbar-back-btn"
          onClick={onBack}
          aria-label="Back"
          title="Go back"
        >
          <MdArrowBack />
        </button>
      )}
      <span className="appbar-title">{title}</span>
      {showCart && (
        <button
          className={`appbar-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
          onClick={handleCartClick}
          aria-label={`Shopping Cart (${cartCount})`}
          title={`You have ${cartCount} item${cartCount !== 1 ? 's' : ''} in cart`}
        >
          <MdShoppingCart />
          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      )}
    </header>
  );
};