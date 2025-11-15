import React, { useEffect } from 'react';
import { usePostArticle } from '../api/hooks/index';
import { MdDateRange, MdAccessTime } from 'react-icons/md';
import './UpcomingNews.css';

interface NewsItem {
  id: string;
  name: string;
  category: string;
  title: string;
  date: string;
  lang: string;
  text: string;
  image: string;
  publish: string;
  front: string;
  permalink: string;
  created: string;
}

interface UpcomingNewsProps {
  className?: string;
}

export const UpcomingNews: React.FC<UpcomingNewsProps> = ({ className }) => {
  const articleMutation = usePostArticle();
  // Trigger API postArticle on mount
  useEffect(() => {
    articleMutation.mutate({}); // payload default
  }, []);
  // Logging response/error
  useEffect(() => {
    if (articleMutation.data) {
      console.log('Article API response:', articleMutation.data);
    }
    if (articleMutation.error) {
      console.error('Article API error:', articleMutation.error);
    }
  }, [articleMutation.data, articleMutation.error]);
  // Ambil hasil articleMutation.data.content.result sebagai upcomingNews
  const upcomingNews: NewsItem[] = articleMutation.data?.content?.result ?? [];

  // Jika result null atau empty, jangan render komponen
  if (!articleMutation.data?.content?.result || upcomingNews.length === 0) {
    return null;
  }

  const handleNewsClick = (newsId: string) => {
    const news = upcomingNews.find(item => item.id === newsId);
    if (news && news.text) {
      window.open(news.text, '_blank');
    } else {
      console.log('News clicked:', newsId);
    }
  };

  return (
    <div className={`upcoming-news ${className || ''}`} style={{marginBottom: '7rem'}}>
      <div className="news-scroll-container">
        {upcomingNews.map((news) => (
          <div 
            key={news.id} 
            className="news-item"
            onClick={() => handleNewsClick(news.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNewsClick(news.id);
              }
            }}
          >
            <div className="news-image-container">
              <img
                src={news.image}
                alt={news.title}
                className="news-image"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="news-content">
              <h3 className="news-title">{news.title}</h3>
              <div className="news-date-info">
                <MdDateRange className="news-icon" />
                <span className="news-date">{news.date}</span>
              </div>
              <div className="news-time-info">
                <MdAccessTime className="news-icon" />
                <span className="news-time">{news.created}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
