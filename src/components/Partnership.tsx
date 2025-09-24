import React, { useState, useEffect } from 'react';
import { useSlider } from '../api/hooks';
import './Partnership.css';

interface PartnershipProps {
  className?: string;
}

export const Partnership: React.FC<PartnershipProps> = ({ className }) => {
  const { data: sliderData, error } = useSlider();

  useEffect(() => {
    if (sliderData) {
      console.log('Slider API data:', sliderData);
    }
    if (error) {
      console.error('Slider API error:', error);
    }
  }, [sliderData, error]);

  // Check if sliderData has valid result
  const hasValidData =
    sliderData?.content?.result &&
    Array.isArray(sliderData.content.result) &&
    sliderData.content.result.length > 0;

  // Don't render if no valid data
  if (sliderData && !hasValidData) {
    return null;
  }

  const [currentSlide, setCurrentSlide] = useState(0);

  // Use API data if available, otherwise fallback to default
  type Sponsor = {
    id: number | string;
    name: string;
    image: string;
    url?: string;
    alt?: string;
  };
  const sponsors: Sponsor[] =
    sliderData?.content?.result && Array.isArray(sliderData.content.result)
      ? sliderData.content.result
      : [];

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sponsors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsors.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

    const handleSlideClick = (sponsor: Sponsor) => {
    if (sponsor.url) {
      window.open(sponsor.url, '_blank', 'noopener,noreferrer');
    }
  };


  return (
    <div className={`partnership ${className || ''}`}>
      <div className="partnership-slider">
        <div
          className="partnership-slides"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {sponsors.map((sponsor: Sponsor) => (
            <div 
              key={sponsor.id} 
              className="partnership-slide"
              onClick={() => handleSlideClick(sponsor)}
              style={{ cursor: sponsor.url ? 'pointer' : 'default' }}
              role={sponsor.url ? "button" : undefined}
              tabIndex={sponsor.url ? 0 : undefined}
              onKeyDown={sponsor.url ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSlideClick(sponsor);
                }
              } : undefined}
              aria-label={sponsor.url ? `Visit ${sponsor.name} website` : undefined}
            >
              <img
                src={sponsor.image}
                alt={sponsor.alt}
                className="sponsor-image"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Now outside slider container */}
      <div className="slider-dots">
        {sponsors.map((_: Sponsor, index: number) => (
          <div
            key={index}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
