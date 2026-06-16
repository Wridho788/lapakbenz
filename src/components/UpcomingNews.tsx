import React, { useEffect } from 'react';
import { usePostArticle } from '../api/hooks/index';
import { MdDateRange, MdAccessTime } from 'react-icons/md';
import './UpcomingNews.css';
import {formatDate} from '../utils/dateUtils';

interface NewsItem {
  id: number;
  club_id: number;
  category_id: number;
  user: string;
  lang: string;
  permalink: string;
  title: string;
  text: string;
  image: string | null;
  dates: string;
  time: string;
  counter: number;
  comment: number;
  front: number;
  type: number;
  islink: number;
  shortdesc: string | null;
  ytlink: string | null;
  publish: number;
  created: string;
  deleted: string | null;
  updated: string;
}

interface ArticleResponse {
  image_url: string;
  result: NewsItem[];
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

  const responseData = articleMutation.data as ArticleResponse | undefined;

  // Ambil hasil articleMutation.data.result sebagai upcomingNews
  const upcomingNews: NewsItem[] = responseData?.result ?? [];
  const imageBaseUrl = responseData?.image_url ?? '';

  // Jika result null/empty, jangan render komponen
  if (upcomingNews.length === 0) {
    return null;
  }

  const handleNewsClick = (news: NewsItem) => {
    // Prioritas link: ytlink (untuk item dgn islink=1) -> text jika berupa URL
    if (news.ytlink) {
      window.open(news.ytlink, '_blank');
      return;
    }
    if (news.islink === 1 && news.text) {
      window.open(news.text, '_blank');
      return;
    }
    if (news.text && /^https?:\/\//.test(news.text)) {
      window.open(news.text, '_blank');
      return;
    }
    // Tidak ada link yang relevan, tidak melakukan apa-apa
  };

  return (
    <div className={`upcoming-news ${className || ''}`} style={{marginBottom: '7rem', marginTop: '15px'}}>
      <div className="news-scroll-container">
        {upcomingNews.map((news) => (
          <div
            key={news.id}
            className="news-item"
            onClick={() => handleNewsClick(news)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNewsClick(news);
              }
            }}
          >
            <div className="news-image-container">
             {news.image && (
                <img
                  src={`${imageBaseUrl}${news.image}`}
                  alt={news.title}
                  className="news-image"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="news-content">
              <h3 className="news-title">{news.title}</h3>
              <div className="news-date-info">
                <MdDateRange className="news-icon" />
                <span className="news-date">{formatDate(news.dates)}</span>
              </div>
              <div className="news-time-info">
                <MdAccessTime className="news-icon" />
                <span className="news-time">{formatDate(news.created)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
