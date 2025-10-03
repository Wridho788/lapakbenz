import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdRefresh, MdShoppingCart, MdCancel, MdCheckCircle, MdPending } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useAuthStore } from '../stores/authStore';
import { useOrders } from '../api/hooks/index';
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
          title="Riwayat Transaksi Saya"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={0}
        />
        <div className="account-content">
          <div className="orders-error">
            <h3>Gagal Memuat Riwayat Transaksi</h3>
            <p>Tidak dapat mengambil data transaksi Anda. Silakan coba lagi.</p>
            <button onClick={handleRefresh} className="retry-btn">
              <MdRefresh />
              Coba Lagi
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
        title="Riwayat Transaksi Saya"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        {/* Transaction Header */}
        <div className="orders-header">
          <div className="orders-info">
            <h3>Riwayat Transaksi</h3>
            <p>{totalRecords} transaksi ditemukan</p>
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
            <p>Memuat transaksi Anda...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="orders-empty">
            <MdShoppingCart className="empty-icon" />
            <h3>Tidak Ada Riwayat Transaksi</h3>
            <p>Anda belum memiliki riwayat transaksi. Mulai bertransaksi atau ikuti event untuk melihat riwayat di sini!</p>
            <button onClick={() => navigate('/products')} className="shop-now-btn">
              Belanja Sekarang
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
                    <span>{getStatusText(order.paid_status, order.canceled) === 'Paid' ? 'Lunas' : getStatusText(order.paid_status, order.canceled) === 'Pending' ? 'Menunggu' : getStatusText(order.paid_status, order.canceled) === 'Canceled' ? 'Dibatalkan' : getStatusText(order.paid_status, order.canceled)}</span>
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
                        <span className="date-label">Lunas:</span>
                        <span className="date-value">{order.paid_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                {order.canceled && (
                  <div className="order-canceled">
                    <p>Pemesanan dibatalkan pada {order.canceled}</p>
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
            <span>Menyegarkan otomatis...</span>
          </div>
        )}
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyTransactionHistory;
