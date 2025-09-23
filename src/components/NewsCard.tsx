import React from 'react';
import '../pages/Event.css';

interface NewsItem {
  id: string;
  image: string;
  title: string;
  text?: string;
  content?: string;
}

interface NewsCardProps {
  news: NewsItem;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/bea2x.jpg';
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (news.text) {
      window.open(news.text, '_blank');
    }
  };

  return (
    <div
      className="custom-event-card"
      onClick={handleClick}
      style={{ cursor: news.text ? 'pointer' : 'default' }}
    >
      <div className="event-row">
        <div className="event-img-col">
          <img
            src={news.image || '/bea2x.jpg'}
            alt={news.title || 'News'}
            style={{
              maxWidth: '70px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
            onError={handleImageError}
          />
        </div>
        <div className="event-info-col">
          <div className="event-title-row">
            <h3 className="event-title">{news.title}</h3>
          </div>
          <div className="event-date-row">
            <span className="event-date">{news.content}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;