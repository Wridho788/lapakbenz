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
navigate('/cart');  };

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

  const billingOptions = [
    { id: 'EVT001', name: 'Workshop UI/UX Design - Rp 150,000' },
    { id: 'EVT002', name: 'Tech Career Talk - Rp 75,000' },
    { id: 'EVT003', name: 'Digital Marketing Bootcamp - Rp 200,000' },
    { id: 'EVT004', name: 'React JS Workshop - Rp 180,000' }
  ];

  const bankOptions = [
    'Bank BCA',
    'Bank Mandiri', 
    'Bank BRI',
    'Bank BNI',
    'Bank CIMB Niaga',
    'Bank Danamon',
    'Bank Permata',
    'Bank OCBC NISP',
    'Bank Maybank',
    'Bank Panin',
    'Bank BTN',
    'Bank Mega',
    'Bank Sinarmas',
    'Bank Commonwealth',
    'Bank Bukopin'
  ];

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment submission logic here
  };

  return (
    <div className="account-page">
      <AppbarDefault
        title="Payment Confirmation"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        {/* Payment Input Form */}
        <div className="account-card">
          <h3>Payment Confirmation</h3>
          <form onSubmit={handleSubmitPayment}>
            <div className="form-group">
              <label>Billing ID</label>
              <select required>
                <option value="">Select Event/Service</option>
                {billingOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nama Pengirim</label>
              <input 
                type="text" 
                placeholder="Enter sender name" 
                required 
              />
            </div>
            <div className="form-group">
              <label>No Rekening Pengirim</label>
              <input 
                type="text" 
                placeholder="Enter account number" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Bank Pengirim</label>
              <select required>
                <option value="">Select Bank</option>
                {bankOptions.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Jumlah Transfer</label>
              <input 
                type="number" 
                placeholder="Enter amount" 
                min="0"
                required 
              />
            </div>
            <div className="form-group">
              <label>Bank Tujuan</label>
              <select required>
                <option value="">Select Destination Bank</option>
                {bankOptions.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="save-btn">Submit Payment Confirmation</button>
          </form>
        </div>

        {/* Payment History */}
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
