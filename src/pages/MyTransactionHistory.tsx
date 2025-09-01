import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';

const MyTransactionHistory: React.FC = () => {
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

  // Uncomment below to test empty state
  // const transactions: any[] = [];

  const transactions = [
    {
      id: '1',
      type: 'Event Payment',
      description: 'Workshop UI/UX Design',
      amount: -150000,
      date: '2024-08-15',
      status: 'Success'
    },
    {
      id: '2',
      type: 'Point Redeem',
      description: 'Voucher Discount 20%',
      amount: -500,
      date: '2024-08-12',
      status: 'Success'
    },
    {
      id: '3',
      type: 'Event Reward',
      description: 'Workshop Completion Bonus',
      amount: +100,
      date: '2024-08-16',
      status: 'Success'
    }
  ];

  return (
    <div className="account-page">
      <AppbarDefault
        title="My Transaction History"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        <div className="account-card">
          <h3>Transaction History</h3>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{transaction.type}</h4>
                  <p>{transaction.description}</p>
                  <p>{transaction.date}</p>
                </div>
                <div className="transaction-amount">
                  <span className={transaction.amount > 0 ? 'positive' : 'negative'}>
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount > 0 ? transaction.amount : Math.abs(transaction.amount)} 
                    {transaction.type === 'Point Redeem' || transaction.type === 'Event Reward' ? ' pts' : ' IDR'}
                  </span>
                  <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>No Transaction History</h3>
              <p>You don't have any transaction history yet. Start participating in events or redeeming points to see your transactions here!</p>
            </div>
          )}
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyTransactionHistory;
