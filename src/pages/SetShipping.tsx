import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import AturPengiriman from '../components/AturPengiriman';
import './AccountPages.css';

const SetShipping: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string })?.from || '/product';

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  return (
    <div className="account-page">
      <AppbarDefault
        title="Atur Alamat Pengiriman"
        onBack={handleBack}
        onCartClick={() => navigate('/cart')}
        cartCount={0}
      />

      <div className="account-content">
        <div className="account-card">
          <AturPengiriman onSuccess={() => navigate(fromPath, { replace: true })} />
        </div>
      </div>

      <FAB onClick={handleNotifications} ariaLabel="Notifications" />
    </div>
  );
};

export default SetShipping;
