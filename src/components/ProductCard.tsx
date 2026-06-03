import React from 'react';
import { MdStar, MdFavorite, MdDelete } from 'react-icons/md';
import { capitalizeWords } from '../utils/format';
import './ProductCard.css';

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  rating: string | number;
  onClick: () => void;
  // Wishlist props (optional)
  showWishlistRemove?: boolean;
  isWishlisted?: boolean;
  onRemoveWishlist?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  price,
  rating,
  onClick,
  showWishlistRemove = false,
  isWishlisted = false,
  onRemoveWishlist,
}) => {
  const handleClick = () => {
    onClick();
  };

  const handleRemoveWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveWishlist) {
      onRemoveWishlist();
    }
  };

  const renderStars = (rating: string | number) => {
    const ratingNumber = typeof rating === 'string' ? parseFloat(rating) : rating;
    const stars = [];
    const fullStars = Math.floor(ratingNumber);
    const hasHalfStar = ratingNumber % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<MdStar key="half" className="star half" />);
    }

    const remainingStars = 5 - Math.ceil(ratingNumber);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<MdStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-card-image">
        <img
          src={image}
          alt={name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/bea2x.jpg';
          }}
        />
        {showWishlistRemove && (
          <button
            className="product-card-wishlist-btn"
            onClick={handleRemoveWishlist}
            aria-label="Remove from wishlist"
          >
            {isWishlisted ? (
              <MdFavorite className="wishlist-icon filled" />
            ) : (
              <MdDelete className="wishlist-icon" />
            )}
          </button>
        )}
      </div>
      <div className="product-card-content">
        <div className="product-card-rating">
          {renderStars(rating)}
          <span className="rating-number">({typeof rating === 'number' ? rating.toFixed(1) : rating})</span>
        </div>
        <h3 className="product-card-name">{capitalizeWords(name)}</h3>
        <div className="product-card-price">
          {formatPrice(price)}
        </div>
      </div>
    </div>
  );
};