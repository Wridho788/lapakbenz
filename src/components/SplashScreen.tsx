import React from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  imageUrl: string;
  onClose: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="splash-screen-overlay">
      <div className="splash-screen-container">
        <button 
          className="splash-close-button" 
          onClick={onClose}
          aria-label="Close splash screen"
        >
          ×
        </button>
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
      </div>
    </div>
  );
};

export default SplashScreen;
