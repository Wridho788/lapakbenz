import React from 'react';
import '../pages/Event.css';

interface NewsItem {
  id: number;
  title: string;
  text?: string;
  image?: string | null;
  dates?: string;
  shortdesc?: string | null;
  islink?: number;
  ytlink?: string | null;
  permalink?: string;
}

interface NewsCardProps {
  news: NewsItem;
  onClick?: () => void;
  isGrid?: boolean;
  imageUrl?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick, isGrid = false, imageUrl }) => {
  const getImageSrc = () => {
    if (!news.image) return '/bea2x.jpg';
    if (news.image.startsWith('http')) return news.image;
    return `${imageUrl || ''}${news.image}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/bea2x.jpg';
  };

  const getClickableUrl = () => {
    if (news.ytlink) return news.ytlink;
    if (news.text && news.text.startsWith('http')) return news.text;
    return null;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const url = getClickableUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const hasLink = !!getClickableUrl();

  if (isGrid) {
    return (
      <div
        className="custom-event-card grid-card"
        onClick={handleClick}
        style={{ cursor: hasLink ? 'pointer' : 'default' }}
      >
        <div className="event-grid-layout">
          <div className="event-img-grid">
            <img
              src={getImageSrc()}
              alt={news.title || 'News'}
              className="grid-event-image"
              onError={handleImageError}
            />
          </div>
          <div className="event-info-grid">
            <div className="event-title-grid">
              <h4 className="grid-event-title">Berita</h4>
              <p className="grid-event-name">{news.title}</p>
            </div>
            <div className="event-meta-grid">
              <span className="grid-news-content">{news.shortdesc}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="custom-event-card"
      onClick={handleClick}
      style={{ cursor: hasLink ? 'pointer' : 'default' }}
    >
      <div className="event-row">
        <div className="event-img-col">
          <img
            src={getImageSrc()}
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
            <span className="event-date">{news.shortdesc}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;