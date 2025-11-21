import React from 'react';
import { MdStar } from 'react-icons/md';
import './ProductCard.css';

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  rating: string;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  price,
  rating,
  onClick,
}) => {
  const handleClick = () => {
    onClick();
  };

  const renderStars = (rating: string) => {
    const ratingNumber = parseFloat(rating) || 0;
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
      </div>
      <div className="product-card-content">
        <div className="product-card-rating">
          {renderStars(rating)}
          <span className="rating-number">({rating})</span>
        </div>
        <h3 className="product-card-name">{name}</h3>
        <div className="product-card-price">
          {formatPrice(price)}
        </div>
      </div>
    </div>
  );
};