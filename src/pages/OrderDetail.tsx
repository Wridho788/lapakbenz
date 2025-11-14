import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdCancel, MdCheckCircle, MdPending, MdReceipt, MdOpenInNew, MdLocalShipping } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { useAuthStore } from '../stores/authStore';
import { useOrderDetail } from '../api/hooks/index';
import OrderTracking from '../components/OrderTracking';
import './OrderDetail.css';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showTracking, setShowTracking] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const {
    data: orderDetail,
    isLoading,
    error,
    refetch
  } = useOrderDetail(orderId || '');

  const handleBackClick = () => {
    navigate('/orders');
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

  // Get tracking information from order items
  const getTrackingInfo = () => {
    console.log('order tracking items:', orderDetail?.content?.items);
    if (!orderDetail?.content?.items?.length) return null;
    
    // Find first item with tracking info - check for either awb or last_digit
    const itemWithTracking = orderDetail.content.items.find(item => 
      (item.awb && item.awb !== null) || (item.last_digit && item.last_digit !== null)
    );
    
    console.log('item with tracking found:', itemWithTracking);
    
    if (itemWithTracking) {
      // Handle cases where awb might be null but last_digit exists
      const awb = itemWithTracking.awb || '';
      const lastDigit = itemWithTracking.last_digit || '';
      
      console.log('tracking data - awb:', awb, 'lastDigit:', lastDigit);
      
      // If we have at least one of them, create tracking info
      if (awb || lastDigit) {
        return {
          awb: awb,
          lastDigit: lastDigit,
          // Concatenate AWB and last digit for display
          fullTrackingNumber: `${awb}${lastDigit}`,
          // Add flags to know what data we have
          hasAwb: !!awb,
          hasLastDigit: !!lastDigit
        };
      }
    }
    
    console.log('no valid tracking info found');
    return null;
  };

  const handleToggleTracking = () => {
    setShowTracking(!showTracking);
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
      return 'Menunggu Pembayaran';
    }
    
    switch (status.toLowerCase()) {
      case 'success':
        return 'Pembayaran Berhasil';
      case 'failed':
        return 'Pembayaran Gagal';
      case 'cancel':
        return 'Pembayaran Dibatalkan';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const getPaymentStatusClass = (status: string | null) => {
    if (status === null) {
      return 'pending';
    }
    
    switch (status.toLowerCase()) {
      case 'SUCCESSFUL':
        return 'paid';
      case 'failed':
      case 'C':
        return 'canceled';
      default:
        return 'pending';
    }
  };

  if (isLoading) {
    return (
      <div className="order-detail-page">
        <AppbarDefault
          title="Detail Pesanan"
          onBack={handleBackClick}
        />
        <div className="order-detail-content">
          <div className="order-detail-loading">
            <div className="loading-spinner"></div>
            <p>Memuat detail pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <AppbarDefault
          title="Detail Pesanan"
          onBack={handleBackClick}
        />
        <div className="order-detail-content">
          <div className="order-detail-error">
            <h3>Gagal Memuat Pesanan</h3>
            <p>Tidak dapat mengambil detail pesanan. Silakan coba lagi.</p>
            <button onClick={() => refetch()} className="retry-btn">
              Coba Lagi
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
          title="Detail Pesanan"
          onBack={handleBackClick}
        />
        <div className="order-detail-content">
          <div className="order-detail-error">
            <h3>Pesanan Tidak Ditemukan</h3>
            <p>Pesanan yang diminta tidak ditemukan.</p>
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
        {(order.status === 'SUCCESSFUL') && (
          <div className="payment-success-banner">
            <MdCheckCircle className="success-icon" />
            <div className="success-info">
              <h3>Pembayaran Berhasil Diproses</h3>
              <p>Pesanan Anda sedang diproses!</p>
            </div>
          </div>
        )}

        {(order.status === 'failed' || order.status === 'cancel') && (
          <div className="payment-failed-banner">
            <MdCancel className="failed-icon" />
            <div className="failed-info">
              <h3>Pembayaran Gagal</h3>
              <p>Silakan coba lagi atau hubungi dukungan</p>
            </div>
          </div>
        )}

        {order.status === null && (
          <div className="payment-pending-banner">
            <MdPending className="pending-icon" />
            <div className="pending-info">
              <h3>Pembayaran Tertunda</h3>
              <p>Silakan selesaikan pembayaran Anda untuk memproses pesanan ini</p>
              {order.link_url && (
                <button 
                  onClick={handleOpenPaymentLink}
                  className="payment-link-btn-banner"
                >
                  <MdOpenInNew />
                  Selesaikan Pembayaran
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Detail Section */}
        <div className="order-detail-section">
          <h3>
            <MdReceipt className="card-icon" />
            Detail Pesanan
          </h3>
          <div className="info-table">
            <div className="info-row">
              <span className="info-label">ID Pesanan</span>
              <span className="info-data">{order.code}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Metode Pembayaran</span>
              <span className="info-data">{order.payment_type}</span>
            </div>
          </div>
        </div>

        {/* Order Information - 2 Column Layout */}
        <div className="order-info-section">
          <h3>
            <MdReceipt className="card-icon" />
            Informasi Pesanan
          </h3>
          <div className="info-table">
            <div className="info-row">
              <span className="info-label">Pelanggan</span>
              <span className="info-data">{order.customer}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tanggal Pesanan</span>
              <span className="info-data">{formatDate(order.dates)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Kode Transaksi</span>
              <span className="info-data">{order.transcode}</span>
            </div>
            <div className="info-row">
              <span className="info-label">No. Transaksi</span>
              <span className="info-data">{order.transno}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ID Transaksi</span>
              <span className="info-data">{order.transid}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status Pembayaran</span>
              <div className={`payment-status ${getPaymentStatusClass(order.status)}`}>
                {getPaymentStatusIcon(order.status)}
                <span>{getPaymentStatusText(order.status)}</span>
                {order.status === null && order.link_url && (
                  <button 
                    onClick={handleOpenPaymentLink}
                    className="payment-link-btn"
                    title="Buka halaman pembayaran"
                  >
                    <MdOpenInNew />
                    Bayar Sekarang
                  </button>
                )}
              </div>
            </div>
            {order.link_expired && order.status === null && (
              <div className="info-row">
                <span className="info-label">Link Pembayaran Berakhir</span>
                <span className="info-data expires">{order.link_expired}</span>
              </div>
            )}
            {order.paid_date && (
              <div className="info-row">
                <span className="info-label">Tanggal Pembayaran</span>
                <span className="info-data">{formatDate(order.paid_date)}</span>
              </div>
            )}
            {order.canceled && (
              <div className="info-row">
                <span className="info-label">Tanggal Dibatalkan</span>
                <span className="info-data">{formatDate(order.canceled)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Section */}
        {(() => {
          const trackingInfo = getTrackingInfo();
          
          if (!trackingInfo) return null;
          
          // Check if we have complete tracking data (both AWB and lastDigit)
          const hasCompleteTracking = trackingInfo.hasAwb && trackingInfo.hasLastDigit;
          
          return (
            <div className="order-tracking-section">
              <h3>
                <MdLocalShipping className="card-icon" />
                Lacak Pengiriman
              </h3>
              <div className="tracking-info-card">
                <div className="tracking-info-content">
                  <div className="tracking-number-display">
                    <span className="tracking-label">
                      {trackingInfo.hasAwb ? 'No. Resi:' : 'Info Pengiriman:'}
                    </span>
                    <span className="tracking-number">
                      {trackingInfo.fullTrackingNumber || 'Sedang diproses'}
                    </span>
                    {!trackingInfo.hasAwb && (
                      <span className="tracking-status-note">
                        Nomor resi akan tersedia setelah paket dikirim
                      </span>
                    )}
                  </div>
                  
                  {/* Only show button if AWB exists */}
                  {trackingInfo.hasAwb && (
                    <button 
                      className="track-order-btn"
                      onClick={handleToggleTracking}
                    >
                      <MdLocalShipping />
                      {showTracking ? 'Tutup Tracking' : 'Lacak Pengiriman'}
                    </button>
                  )}
                </div>
                
                {showTracking && hasCompleteTracking && (
                  <div className="tracking-component-container">
                    <OrderTracking 
                      awb={trackingInfo.awb} 
                      lastDigit={trackingInfo.lastDigit}
                      className="embedded-tracking"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Order Summary Section */}
        <div className="order-summary-section">
          <h3>Ringkasan Pesanan</h3>
          {/* Order Items */}
          <div className="summary-items">
            <h4>Item Pesanan ({orderItems?.length || 0})</h4>
            <div className="summary-items-list">
              {orderItems?.map((item: any) => (
                <div key={item.id} className="summary-item-row">
                  <div className="summary-item-info">
                    <h5>{item.product}</h5>
                    <p>SKU: {item.sku}</p>
                    <span className="summary-item-qty">Jumlah: {item.qty}</span>
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
              <span className="total-label">Total Belanja:</span>
              <span className="total-value">{formatCurrency(order.amount)}</span>
            </div>
              <div className="total-row savings">
                <span className="total-label">Hemat Belanja:</span>
                <span className="total-value">-{formatCurrency(order.discount)}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Pajak:</span>
                <span className="total-value">{formatCurrency(order.tax)}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Biaya Layanan:</span>
                <span className="total-value">{formatCurrency(order.costs)}</span>
              </div>
            <div className="total-row final-total">
              <span className="total-label">Total Bayar:</span>
              <span className="total-value">{formatCurrency(order.tot_amt || order.total)}</span>
            </div>
          </div>
        </div>

        
        {/* Cancellation Notice */}
        {order.canceled && (
          <div className="cancellation-card">
            <MdCancel className="cancel-icon" />
            <div className="cancel-info">
              <h4>Pesanan Dibatalkan</h4>
              <p>Pesanan ini dibatalkan pada {formatDate(order.canceled)}</p>
              {order.canceled_desc && (
                <p className="cancel-reason">Alasan: {order.canceled_desc}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;