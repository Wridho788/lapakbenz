import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdCancel, MdCheckCircle, MdPending, MdReceipt, MdShoppingBag, MdOpenInNew } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { useOrderDetail } from '../api/hooks';
import './OrderDetail.css';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Initialize auth token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setAuthToken(token);
  }, [navigate]);

  const {
    data: orderDetail,
    isLoading,
    error,
    refetch
  } = useOrderDetail(orderId || '', authToken);

  const handleBackClick = () => {
    navigate('/orders');
  };

  const getStatusIcon = (canceled: string | null, posted: string, paymentStatus: string | null) => {
    if (canceled) {
      return <MdCancel className="status-icon canceled" />;
    }
    
    // Check payment status first for more accurate status
    if (paymentStatus === 'success' || posted === '1') {
      return <MdCheckCircle className="status-icon paid" />;
    }
    
    if (paymentStatus === 'failed' || paymentStatus === 'cancel') {
      return <MdCancel className="status-icon canceled" />;
    }
    
    return <MdPending className="status-icon pending" />;
  };

  const getStatusText = (canceled: string | null, posted: string, paymentStatus: string | null) => {
    if (canceled) {
      return 'Canceled';
    }
    
    // Check payment status first for more accurate status
    if (paymentStatus === 'success' || posted === '1') {
      return 'Paid';
    }
    
    if (paymentStatus === 'failed') {
      return 'Payment Failed';
    }
    
    if (paymentStatus === 'cancel') {
      return 'Payment Cancelled';
    }
    
    return 'Pending';
  };

  const getStatusClass = (canceled: string | null, posted: string, paymentStatus: string | null) => {
    if (canceled) {
      return 'canceled';
    }
    
    // Check payment status first for more accurate status
    if (paymentStatus === 'success' || posted === '1') {
      return 'paid';
    }
    
    if (paymentStatus === 'failed' || paymentStatus === 'cancel') {
      return 'canceled';
    }
    
    return 'pending';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === ' - ') return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to ensure URL has https protocol
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL doesn't have protocol, add https://
    return `https://${url}`;
  };

  const handleOpenPaymentLink = () => {
    if (order.link_url) {
      const fullUrl = getFullUrl(order.link_url);
      window.open(fullUrl, '_blank');
    }
  };

  const getPaymentStatusIcon = (status: string | null) => {
    if (status === null) {
      return <MdPending className="status-icon pending" />;
    }
    
    switch (status.toLowerCase()) {
      case 'success':
        return <MdCheckCircle className="status-icon paid" />;
      case 'failed':
      case 'cancel':
        return <MdCancel className="status-icon canceled" />;
      default:
        return <MdPending className="status-icon pending" />;
    }
  };

  const getPaymentStatusText = (status: string | null) => {
    if (status === null) {
      return 'Pending Payment';
    }
    
    switch (status.toLowerCase()) {
      case 'success':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'cancel':
        return 'Payment Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  const getPaymentStatusClass = (status: string | null) => {
    if (status === null) {
      return 'pending';
    }
    
    switch (status.toLowerCase()) {
      case 'success':
        return 'paid';
      case 'failed':
      case 'cancel':
        return 'canceled';
      default:
        return 'pending';
    }
  };

  if (!authToken) {
    return (
      <div className="order-detail-page">
        <AppbarDefault
          title="Order Detail"
          onBack={handleBackClick}
        />
        <div className="order-detail-error">
          <h3>Authentication Required</h3>
          <p>Please login to view order details</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="order-detail-page">
        <AppbarDefault
          title="Order Detail"
          onBack={handleBackClick}
        />
        <div className="order-detail-content">
          <div className="order-detail-loading">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <AppbarDefault
          title="Order Detail"
          onBack={handleBackClick}
        />
        <div className="order-detail-content">
          <div className="order-detail-error">
            <h3>Failed to Load Order</h3>
            <p>Unable to fetch order details. Please try again.</p>
            <button onClick={() => refetch()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetail?.content) {
    return (
      <div className="order-detail-page">
        <AppbarDefault
          title="Order Detail"
          onBack={handleBackClick}
        />
        <div className="order-detail-content">
          <div className="order-detail-error">
            <h3>Order Not Found</h3>
            <p>The requested order could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const order = orderDetail.content;
  const orderItems = orderDetail.content.items;

  return (
    <div className="order-detail-page">
      <AppbarDefault
        title={`Order #${order?.code || ''}`}
        onBack={handleBackClick}
      />

      <div className="order-detail-content">
        {/* Payment Status Banner */}
        {(order.status === 'success') && (
          <div className="payment-success-banner">
            <MdCheckCircle className="success-icon" />
            <div className="success-info">
              <h3>Payment Successfully Processed</h3>
              <p>Your order is on the way!</p>
            </div>
          </div>
        )}

        {(order.status === 'failed' || order.status === 'cancel') && (
          <div className="payment-failed-banner">
            <MdCancel className="failed-icon" />
            <div className="failed-info">
              <h3>Payment Failed</h3>
              <p>Please try again or contact support</p>
            </div>
          </div>
        )}

        {order.status === null && (
          <div className="payment-pending-banner">
            <MdPending className="pending-icon" />
            <div className="pending-info">
              <h3>Payment Pending</h3>
              <p>Please complete your payment to process this order</p>
              {order.link_url && (
                <button 
                  onClick={handleOpenPaymentLink}
                  className="payment-link-btn-banner"
                >
                  <MdOpenInNew />
                  Complete Payment
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Detail Section */}
        <div className="order-detail-section">
          <h3>
            <MdReceipt className="card-icon" />
            Order Detail
          </h3>
          <div className="info-table">
            <div className="info-row">
              <span className="info-label">Order ID</span>
              <span className="info-data">{order.code}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Method</span>
              <span className="info-data">{order.payment_type}</span>
            </div>
          </div>
        </div>

        {/* Order Information - 2 Column Layout */}
        <div className="order-info-section">
          <h3>
            <MdReceipt className="card-icon" />
            Order Information
          </h3>
          <div className="info-table">
            <div className="info-row">
              <span className="info-label">Customer</span>
              <span className="info-data">{order.customer}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date</span>
              <span className="info-data">{formatDate(order.dates)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transaction Code</span>
              <span className="info-data">{order.transcode}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transaction No</span>
              <span className="info-data">{order.transno}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transaction ID</span>
              <span className="info-data">{order.transid}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Status</span>
              <div className={`payment-status ${getPaymentStatusClass(order.status)}`}>
                {getPaymentStatusIcon(order.status)}
                <span>{getPaymentStatusText(order.status)}</span>
                {order.status === null && order.link_url && (
                  <button 
                    onClick={handleOpenPaymentLink}
                    className="payment-link-btn"
                    title="Open payment page"
                  >
                    <MdOpenInNew />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
            {order.link_expired && order.status === null && (
              <div className="info-row">
                <span className="info-label">Payment Link Expires</span>
                <span className="info-data expires">{order.link_expired}</span>
              </div>
            )}
            {order.paid_date && (
              <div className="info-row">
                <span className="info-label">Paid Date</span>
                <span className="info-data">{formatDate(order.paid_date)}</span>
              </div>
            )}
            {order.canceled && (
              <div className="info-row">
                <span className="info-label">Canceled Date</span>
                <span className="info-data">{formatDate(order.canceled)}</span>
              </div>
            )}
          </div>
        </div>


        {/* Order Summary Section */}
        <div className="order-summary-section">
          <h3>Order Summary</h3>
          
          {/* Order Items */}
          <div className="summary-items">
            <h4>Order Items ({orderItems?.length || 0})</h4>
            <div className="summary-items-list">
              {orderItems?.map((item: any) => (
                <div key={item.id} className="summary-item-row">
                  <div className="summary-item-info">
                    <h5>{item.product}</h5>
                    <p>SKU: {item.sku}</p>
                    <span className="summary-item-qty">Qty: {item.qty}</span>
                  </div>
                  <div className="summary-item-price">
                    <div className="unit-price">{formatCurrency(item.price)}</div>
                    <div className="total-price">{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Totals */}
          <div className="summary-totals">
            <div className="total-row">
              <span className="total-label">Bag Total:</span>
              <span className="total-value">{formatCurrency(order.amount)}</span>
            </div>
            {order.discount > 0 && (
              <div className="total-row savings">
                <span className="total-label">Bag Savings:</span>
                <span className="total-value">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="total-row">
                <span className="total-label">Tax:</span>
                <span className="total-value">{formatCurrency(order.tax)}</span>
              </div>
            )}
            {order.costs > 0 && (
              <div className="total-row">
                <span className="total-label">Additional Costs:</span>
                <span className="total-value">{formatCurrency(order.costs)}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">Total Amount:</span>
              <span className="total-value">{formatCurrency(order.tot_amt || order.total)}</span>
            </div>
          </div>
        </div>

        
        {/* Cancellation Notice */}
        {order.canceled && (
          <div className="cancellation-card">
            <MdCancel className="cancel-icon" />
            <div className="cancel-info">
              <h4>Order Canceled</h4>
              <p>This order was canceled on {formatDate(order.canceled)}</p>
              {order.canceled_desc && (
                <p className="cancel-reason">Reason: {order.canceled_desc}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;