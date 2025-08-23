import React from 'react';
import { MdDateRange, MdAccessTime } from 'react-icons/md';
import './UpcomingNews.css';

interface NewsItem {
  id: number;
  image: string;
  title: string;
  date: string;
  time: string;
}

interface UpcomingNewsProps {
  className?: string;
}

export const UpcomingNews: React.FC<UpcomingNewsProps> = ({ className }) => {
  // Sample upcoming news data
  const upcomingNews: NewsItem[] = [
    {
      id: 1,
      image: '/manohara-w202-03-jul-24.png',
      title: 'Manohara W202.03 Jul-24',
      date: '30 Jul 2024',
      time: '30-07-2024 - 00-00-00'
    },
    {
      id: 2,
      image: '/manohara-w202-03-jul-24.png',
      title: 'Leadership Summit 2024',
      date: '15 Aug 2024',
      time: '15-08-2024 - 09-00-00'
    },
    {
      id: 3,
      image: '/manohara-w202-03-jul-24.png',
      title: 'Community Gathering',
      date: '22 Aug 2024',
      time: '22-08-2024 - 14-30-00'
    },
    {
      id: 4,
      image: '/manohara-w202-03-jul-24.png',
      title: 'Workshop Training',
      date: '05 Sep 2024',
      time: '05-09-2024 - 10-00-00'
    },
    {
      id: 5,
      image: '/manohara-w202-03-jul-24.png',
      title: 'Annual Conference',
      date: '20 Sep 2024',
      time: '20-09-2024 - 08-00-00'
    }
  ];

  const handleNewsClick = (newsId: number) => {
    console.log('News clicked:', newsId);
    // TODO: Navigate to news detail page or handle news click
  };

  return (
    <div className={`upcoming-news ${className || ''}`}>
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
                <span className="news-time">{news.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
