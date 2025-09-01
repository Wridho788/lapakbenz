import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="account-page">
      <AppbarDefault
        title="My Profile"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        <div className="account-card">
          <h3>My Profile Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue="john.doe@email.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" defaultValue="+62 812-3456-7890" />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" defaultValue="1990-01-01" />
          </div>
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyProfile;
