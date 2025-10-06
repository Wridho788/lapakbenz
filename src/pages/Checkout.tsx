import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdCheckCircle, MdLocationOn, MdPayment, MdOpenInNew } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
import './Checkout.css';

interface CheckoutData {
  items: any[];
  address: any;
  payment: any;
  redeemPoints: number;
  total: number;
  subtotal: number;
  paymentFee: number;
  pointsDiscount: number;
}

interface CheckoutApiResponse {
  content: {
    invoice_url: string;
    transid: number;
    orderid: string;
  };
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState<number>(0);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [showWebview, setShowWebview] = useState(false);

  // Get checkout data from navigation state
  const checkoutData = location.state as CheckoutData;

  useEffect(() => {
    // If no checkout data, redirect back to cart
    if (!checkoutData) {
      navigate('/cart');
    }
  }, [checkoutData, navigate]);

  const handleBackClick = () => {
    if (orderCompleted) {
      navigate('/');
    } else {
      navigate('/cart');
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Call the checkout API
      const response = await fetch(`/api/orders/checkout/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        const data: CheckoutApiResponse = await response.json();
        
        // Set order details from API response
        setOrderId(data.content.orderid);
        setTransactionId(data.content.transid);
        setInvoiceUrl(data.content.invoice_url);
        
        // Clear cart after successful order
        clearCart();
        
        // Show webview to open invoice URL
        setShowWebview(true);
        setOrderCompleted(true);
        
        console.log('Order confirmed:', data);
      } else {
        throw new Error('Failed to process order');
      }
    } catch (error) {
      console.error('Order processing failed:', error);
      // Handle error (show toast, modal, etc.)
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openInvoiceUrl = () => {
    if (invoiceUrl) {
      // Add https:// if not present
      const fullUrl = invoiceUrl.startsWith('http') ? invoiceUrl : `https://${invoiceUrl}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCloseWebview = () => {
    setShowWebview(false);
  };

  if (!checkoutData) {
    return <div>Loading...</div>;
  }

  // Webview for invoice URL
  if (showWebview && invoiceUrl) {
    return (
      <div className="checkout-page">
        <AppbarDefault
          title="Payment"
          onBack={handleCloseWebview}
          onCartClick={handleCartClick}
          cartCount={0}
        />
        <div className="webview-container">
          <div className="webview-header">
            <p>Complete your payment through the secure payment gateway</p>
            <button className="open-external-btn" onClick={openInvoiceUrl}>
              <MdOpenInNew /> Open in Browser
            </button>
          </div>
          <iframe
            src={invoiceUrl.startsWith('http') ? invoiceUrl : `https://${invoiceUrl}`}
            title="Payment Gateway"
            className="payment-webview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
        <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="checkout-page">
        <AppbarDefault
          title="Order Confirmed"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={0}
        />

        <div className="checkout-content">
          <div className="order-success">
            <div className="success-icon">
              <MdCheckCircle />
            </div>
            <h2>Order Confirmed!</h2>
            <p>Your order has been placed successfully</p>
            <div className="order-id">
              <span>Order ID: {orderId}</span>
              {transactionId && (
                <span>Transaction ID: {transactionId}</span>
              )}
            </div>
            
            <div className="success-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/')}>
                Continue Shopping
              </button>
              <button className="view-orders-btn" onClick={() => navigate('/profile/transaction-history')}>
                View My Orders
              </button>
            </div>
          </div>
        </div>

        <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <AppbarDefault
        title="Checkout"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="checkout-section">
          {/* <h3><MdShoppingCart /> Order Items ({checkoutData.items.length})</h3> */}
          <div className="checkout-items">
            {/* {checkoutData.items.map((item) => (
              <div key={item.id} className="checkout-item">
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-details">
                  <h4>{item.title}</h4>
                  <p>Rp {item.price.toLocaleString('id-ID')} x {item.quantity}</p>
                </div>
                <div className="item-total">
                  <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))} */}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="checkout-section">
          <h3><MdLocationOn /> Shipping Address</h3>
          <div className="address-display">
            <h4>{checkoutData.address.name}</h4>
            <p>{checkoutData.address.phone}</p>
            <p>{checkoutData.address.address}</p>
            <p>{checkoutData.address.city} {checkoutData.address.zipCode}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-section">
          <h3><MdPayment /> Payment Method</h3>
          <div className="payment-display">
            <h4>{checkoutData.payment.name}</h4>
            {checkoutData.payment.fee > 0 && (
              <p>Fee: Rp {checkoutData.payment.fee.toLocaleString('id-ID')}</p>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="checkout-section">
          <h3>Payment Summary</h3>
          <div className="payment-summary">
            <div className="summary-row">
              {/* <span>Subtotal ({checkoutData.items.length} items)</span>
              <span>Rp {checkoutData.subtotal.toLocaleString('id-ID')}</span> */}
            </div>
           
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total Payment</span>
              <span>Rp {checkoutData.total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Confirm Order Button */}
        <div className="checkout-actions">
          <button
            className={`confirm-order-btn ${isProcessing ? 'processing' : ''}`}
            onClick={handleConfirmOrder}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing Order...' : 'Confirm & Pay Order'}
          </button>
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Checkout;