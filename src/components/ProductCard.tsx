import React from 'react';
import { MdStar, MdFavorite } from 'react-icons/md';
import { capitalizeWords } from '../utils/format';
import './ProductCard.css';

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  rating: string | number;
  city?: string;
  supplier?: string;
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
  city,
  supplier,
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

  const renderRating = (rating: string | number) => {
    const ratingNumber = typeof rating === 'string' ? parseFloat(rating) : rating;
    const normalizedRating = Number.isFinite(ratingNumber) ? ratingNumber : 0;

    return (
      <div className="product-card-rating-row">
        <MdStar className={normalizedRating > 0 ? 'star filled' : 'star empty'} />
        <span className="rating-number">{normalizedRating.toFixed(1)}</span>
      </div>
    );
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
        {showWishlistRemove && isWishlisted && (
          <div
            className="product-card-wishlist-icon"
            onClick={handleRemoveWishlist}
            aria-label="Remove from wishlist"
            role="button"
            tabIndex={0}
          >
            <MdFavorite className="wishlist-icon filled" />
          </div>
        )}
      </div>
      <div className="product-card-content">
        <div className="product-card-name">{capitalizeWords(name)}</div>
        <div className="product-card-price">
          {formatPrice(price)}
        </div>
        {renderRating(rating)}
        <div className="product-card-meta-row">
          <span className="product-card-city">{city || 'Lokasi tidak tersedia'}</span>
          <span className="product-card-supplier">{supplier || 'Supplier tidak tersedia'}</span>
        </div>
      </div>
    </div>
  );
};