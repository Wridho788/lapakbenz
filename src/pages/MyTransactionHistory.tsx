import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdRefresh, MdShoppingCart, MdCancel, MdCheckCircle, MdPending } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useAuthStore } from '../stores/authStore';
import { useOrders } from '../api/hooks';
import type { OrderItem } from '../api/ordersApi';
import './AccountPages.css';

const MyTransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Use orders hook with 3-second refresh interval
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useOrders({
    limit: "120",
    offset: "0",
    confirm: "",
    paid: "",
    date: ""
  });

  // Set up auto-refresh every 3 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refetch]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const getStatusIcon = (paidStatus: string, canceled: string | null) => {
    if (canceled) {
      return <MdCancel className="status-icon canceled" />;
    }
    
    switch (paidStatus) {
      case 'S':
        return <MdCheckCircle className="status-icon paid" />;
      case 'C':
        return <MdPending className="status-icon pending" />;
      default:
        return <MdPending className="status-icon pending" />;
    }
  };

  const getStatusText = (paidStatus: string, canceled: string | null) => {
    if (canceled) {
      return 'Canceled';
    }
    
    switch (paidStatus) {
      case 'S':
        return 'Paid';
      case 'C':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const getStatusClass = (paidStatus: string, canceled: string | null) => {
    if (canceled) {
      return 'canceled';
    }
    
    switch (paidStatus) {
      case 'S':
        return 'paid';
      case 'C':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  if (error) {
    return (
      <div className="account-page">
        <AppbarDefault
          title="My Transaction History"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={0}
        />
        <div className="account-content">
          <div className="orders-error">
            <h3>Failed to Load Transaction History</h3>
            <p>Unable to fetch your transactions. Please try again.</p>
            <button onClick={handleRefresh} className="retry-btn">
              <MdRefresh />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orders = ordersData?.content?.result || [];
  const totalRecords = ordersData?.content?.record || 0;

  return (
    <div className="account-page">
      <AppbarDefault
        title="My Transaction History"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        {/* Transaction Header */}
        <div className="orders-header">
          <div className="orders-info">
            <h3>Transaction History</h3>
            <p>{totalRecords} transactions found</p>
          </div>
          
          <div className="orders-actions">
            <button 
              onClick={handleRefresh} 
              className={`orders-action-btn ${isRefreshing || isFetching ? 'loading' : ''}`}
              title="Refresh transactions"
              disabled={isRefreshing}
            >
              <MdRefresh />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your transactions...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="orders-empty">
            <MdShoppingCart className="empty-icon" />
            <h3>No Transaction History</h3>
            <p>You don't have any transaction history yet. Start participating in events or redeeming points to see your transactions here!</p>
            <button onClick={() => navigate('/products')} className="shop-now-btn">
              Start Shopping
            </button>
          </div>
        )}

        {/* Transaction List */}
        {!isLoading && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order: OrderItem) => (
              <div 
                key={order.id} 
                className="order-card"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="order-header">
                  <div className="order-code">
                    <h4>#{order.code}</h4>
                  </div>
                  <div className={`order-status ${getStatusClass(order.paid_status, order.canceled)}`}>
                    {getStatusIcon(order.paid_status, order.canceled)}
                    <span>{getStatusText(order.paid_status, order.canceled)}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{order.dates}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">{order.customer}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items_count} item(s)</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-value">{order.payment_type}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="detail-label">Transaction:</span>
                    <span className="detail-value">{order.transno}</span>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-amount">
                    <span className="amount-label">Total Amount:</span>
                    <span className="amount-value">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="order-dates">
                    <div className="date-info">
                      <span className="date-label">Created:</span>
                      <span className="date-value">{order.created}</span>
                    </div>
                    {order.paid_status === 'S' && order.paid_date !== ' - ' && (
                      <div className="date-info">
                        <span className="date-label">Paid:</span>
                        <span className="date-value">{order.paid_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                {order.canceled && (
                  <div className="order-canceled">
                    <p>Order was canceled on {order.canceled}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auto-refresh indicator */}
        {isFetching && !isLoading && (
          <div className="refresh-indicator">
            <div className="refresh-dot"></div>
            <span>Auto-refreshing...</span>
          </div>
        )}
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyTransactionHistory;
