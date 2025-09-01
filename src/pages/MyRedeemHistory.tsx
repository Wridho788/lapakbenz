import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';

const MyRedeemHistory: React.FC = () => {
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

  const redeems = [
    {
      id: '1',
      item: 'Discount Voucher 20%',
      points: 500,
      date: '2024-08-12',
      status: 'Used',
      expiryDate: '2024-09-12'
    },
    {
      id: '2',
      item: 'Free Event Ticket',
      points: 1000,
      date: '2024-07-20',
      status: 'Used',
      expiryDate: '2024-08-20'
    },
    {
      id: '3',
      item: 'Merchandise T-Shirt',
      points: 800,
      date: '2024-08-01',
      status: 'Delivered',
      expiryDate: '-'
    }
  ];

  return (
    <div className="account-page">
      <AppbarDefault
        title="My Redeem History"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        <div className="account-card">
          <h3>Redeem History</h3>
          {redeems.map((redeem) => (
            <div key={redeem.id} className="redeem-item">
              <div className="redeem-info">
                <h4>{redeem.item}</h4>
                <p>{redeem.points} points</p>
                <p>Redeemed: {redeem.date}</p>
                {redeem.expiryDate !== '-' && <p>Expired: {redeem.expiryDate}</p>}
              </div>
              <div className={`redeem-status ${redeem.status.toLowerCase()}`}>
                {redeem.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyRedeemHistory;
