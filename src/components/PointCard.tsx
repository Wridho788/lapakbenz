import React from 'react';
import './PointCard.css';

export type PointCardProps = {
  points: number;
};

export const PointCard: React.FC<PointCardProps> = ({ points }) => {
  // Format points dengan koma sebagai separator ribuan
  const formatPoints = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  return (
    <div className="point-card">
      <div className="point-content">
        <div className="point-text">
          <h3 className="point-label">My Point</h3>
          <p className="point-value">{formatPoints(points)}</p>
        </div>
        <div className="point-image">
          <img src="/lapakbenz.png" alt="Merci Points" />
        </div>
      </div>
    </div>
  );
};
