import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';

const PaymentConfirmation: React.FC = () => {
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

  const payments = [
    {
      id: '1',
      eventName: 'Workshop UI/UX Design',
      amount: 150000,
      date: '2024-08-15',
      status: 'Confirmed'
    },
    {
      id: '2',
      eventName: 'Tech Career Talk',
      amount: 75000,
      date: '2024-08-10',
      status: 'Pending'
    }
  ];

  return (
    <div className="account-page">
      <AppbarDefault
        title="Payment Confirmation"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        <div className="account-card">
          <h3>Payment History</h3>
          {payments.map((payment) => (
            <div key={payment.id} className="payment-item">
              <div className="payment-info">
                <h4>{payment.eventName}</h4>
                <p>Rp {payment.amount.toLocaleString()}</p>
                <p>{payment.date}</p>
              </div>
              <div className={`payment-status ${payment.status.toLowerCase()}`}>
                {payment.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default PaymentConfirmation;
