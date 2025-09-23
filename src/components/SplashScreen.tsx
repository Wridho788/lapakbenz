import React from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  imageUrl: string;
  onClose: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="splash-screen-overlay" onClick={onClose}>
      <div className="splash-screen-container" onClick={(e) => e.stopPropagation()}>
        <div className="splash-image-container">
          <img 
            src={imageUrl} 
            alt="Splash Screen" 
            className="splash-image"
            onError={() => {
              console.error('Failed to load splash image:', imageUrl);
              onClose(); // Close splash if image fails to load
            }}
          />
        </div>
        <div 
          className="splash-close-button"
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
          aria-label="Close splash screen"
        >
          <div className="close-button-icon"></div>
          <span className="close-button-label">Tutup</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;