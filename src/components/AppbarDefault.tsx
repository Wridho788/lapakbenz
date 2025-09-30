import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdShoppingCart } from 'react-icons/md';
import './AppbarDefault.css';

export type AppbarDefaultProps = {
  title: string;
  onBack?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
  showCart?: boolean; // New optional prop to control cart visibility
   backTo?: string; // NEW: Explicit back destination
  defaultBack?: string; // NEW: Default fallback route
};

export const AppbarDefault: React.FC<AppbarDefaultProps> = ({ 
  title, 
  onBack, 
  onCartClick, 
  cartCount = 0,
  showCart = true, // Default to true to maintain backward compatibility
  backTo, // NEW
  defaultBack = '/dashboard' // NEW: Default fallback
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/cart');
    }
  };

  
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      // Use explicit backTo destination
      navigate(backTo);
    } else {
      // Smart back logic
      const state = location.state as { from?: string } | null;
      if (state?.from) {
        navigate(state.from);
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(defaultBack);
      }
    }
  };

  return (
    <header className="appbar-default">
      {onBack && (
        <button
          className="appbar-back-btn"
          onClick={handleBackClick}
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