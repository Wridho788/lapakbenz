import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdRefresh, MdShoppingCart, MdCancel, MdCheckCircle, MdPending } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { useAuthStore } from '../stores/authStore';
import { useOrders } from '../api/hooks/index';
import type { OrderItem } from '../api/ordersApi';
import './orders.css';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use Zustand auth store
  const { isAuthenticated } = useAuthStore();

  // Use orders hook - now uses Zustand auth store internally
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Set up auto-refresh every 3 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refetch]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
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

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <AppbarDefault
          title="My Orders"
          onBack={handleBackClick}
        />
        <div className="orders-error">
          <h3>Authentication Required</h3>
          <p>Please login to view your orders</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <AppbarDefault
          title="My Orders"
          onBack={handleBackClick}
        />
        <div className="orders-content">
          <div className="orders-error">
            <h3>Failed to Load Orders</h3>
            <p>Unable to fetch your orders. Please try again.</p>
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
    <div className="orders-page">
      <AppbarDefault
      title="Pesanan Saya"
      onBack={handleBackClick}
      />

      <div className="orders-content">
      {/* Orders Header */}
      <div className="orders-header">
        <div className="orders-info">
        <h3>Riwayat Pesanan</h3>
        <p>{totalRecords} pesanan ditemukan</p>
        </div>
        
        <div className="orders-actions">
        <button 
          onClick={handleRefresh} 
          className={`orders-action-btn ${isRefreshing || isFetching ? 'loading' : ''}`}
          title="Segarkan pesanan"
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
        <p>Memuat pesanan Anda...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && (
        <div className="orders-empty">
        <MdShoppingCart className="empty-icon" />
        <h3>Tidak Ada Pesanan</h3>
        <p>Anda belum pernah melakukan pesanan.</p>
        <button onClick={() => navigate('/products')} className="shop-now-btn">
          Mulai Belanja
        </button>
        </div>
      )}

      {/* Orders List */}
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
            <span className="detail-label">Tanggal:</span>
            <span className="detail-value">{order.dates}</span>
            </div>
            <div className="order-detail-row">
            <span className="detail-label">Pelanggan:</span>
            <span className="detail-value">{order.customer}</span>
            </div>
            <div className="order-detail-row">
            <span className="detail-label">Item:</span>
            <span className="detail-value">{order.items_count} item</span>
            </div>
            <div className="order-detail-row">
            <span className="detail-label">Pembayaran:</span>
            <span className="detail-value">{order.payment_type}</span>
            </div>
            <div className="order-detail-row">
            <span className="detail-label">Transaksi:</span>
            <span className="detail-value">{order.transno}</span>
            </div>
          </div>

          <div className="order-footer">
            <div className="order-amount">
            <span className="amount-label">Total:</span>
            <span className="amount-value">{formatCurrency(order.total)}</span>
            </div>
            <div className="order-dates">
            <div className="date-info">
              <span className="date-label">Dibuat:</span>
              <span className="date-value">{order.created}</span>
            </div>
            {order.paid_status === 'S' && order.paid_date !== ' - ' && (
              <div className="date-info">
              <span className="date-label">Dibayar:</span>
              <span className="date-value">{order.paid_date}</span>
              </div>
            )}
            </div>
          </div>

          {order.canceled && (
            <div className="order-canceled">
            <p>Pesanan dibatalkan pada {order.canceled}</p>
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
        <span>Memperbarui otomatis...</span>
        </div>
      )}
      </div>
    </div>
  );
};

export default Orders;