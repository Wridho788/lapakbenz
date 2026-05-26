import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdCancel,
  MdCheckCircle,
  MdPending,
  MdReceipt,
  MdOpenInNew,
  MdLocalShipping,
} from 'react-icons/md';
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

  const { data: orderDetail, isLoading, error, refetch } = useOrderDetail(orderId || '');

  const handleBackClick = () => {
    navigate('/orders');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
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
        minute: '2-digit',
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
    const items = orderDetail?.content?.items || [];
    if (!items.length) return null;

    // Find first item with tracking info - check for either awb or last_digit
    const itemWithTracking = items.find(
      (item) => (item.awb && item.awb !== null) || (item.last_digit && item.last_digit !== null),
    );
    if (itemWithTracking) {
      // Handle cases where awb might be null but last_digit exists
      const awb = itemWithTracking.awb || '';
      const lastDigit = itemWithTracking.last_digit || '';
      // If we have at least one of them, create tracking info
      if (awb || lastDigit) {
        return {
          awb: awb,
          lastDigit: lastDigit,
          // Concatenate AWB and last digit for display
          fullTrackingNumber: `${awb}${lastDigit}`,
          // Add flags to know what data we have
          hasAwb: !!awb,
          hasLastDigit: !!lastDigit,
        };
      }
    }
    return null;
  };

  const handleToggleTracking = () => {
    setShowTracking(!showTracking);
  };

  const getPaymentStatusIcon = (status: string | null) => {
    if (status === null) {
      return <MdPending className="status-icon pending" />;
    }

    switch (status) {
      case 'SUCCESSFUL':
        return <MdCheckCircle className="status-icon paid" />;
      case 'FAILED':
        return <MdCancel className="status-icon canceled" />;
      case 'CANCEL':
        return <MdCancel className="status-icon canceled" />;
      default:
        return <MdPending className="status-icon pending" />;
    }
  };

  const getPaymentStatusText = (status: string | null) => {
    if (status === null) {
      return 'Menunggu Pembayaran';
    }

    switch (status) {
      case 'SUCCESSFUL':
        return 'Pembayaran Berhasil';
      case 'FAILED':
        return 'Pembayaran Gagal';
      case 'CANCEL':
        return 'Pembayaran Dibatalkan';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const getPaymentStatusClass = (status: string | null) => {
    if (status === null) {
      return 'pending';
    }

    switch (status) {
      case 'SUCCESSFUL':
        return 'paid';
      case 'FAILED':
      case 'CANCEL':
        return 'canceled';
      default:
        return 'pending';
    }
  };

  if (isLoading) {
    return (
      <div className="order-detail-page">
        <AppbarDefault title="Detail Pesanan" onBack={handleBackClick} />
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
        <AppbarDefault title="Detail Pesanan" onBack={handleBackClick} />
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
        <AppbarDefault title="Detail Pesanan" onBack={handleBackClick} />
        <div className="order-detail-content">
          <div className="order-detail-error">
            <h3>Pesanan Tidak Ditemukan</h3>
            <p>Pesanan yang diminta tidak ditemukan.</p>
          </div>
        </div>
      </div>
    );
  }

  const order = orderDetail.content || {};
  const orderItems = (orderDetail.content?.items) || [];

  return (
    <div className="order-detail-page">
      <AppbarDefault title={`Order #${order?.code || ''}`} onBack={handleBackClick} />

      <div className="order-detail-content">
        {/* Payment Status Banner */}
        {order.status === 'SUCCESSFUL' && (
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
                <button onClick={handleOpenPaymentLink} className="payment-link-btn-banner">
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

          // Jika tidak ada tracking info sama sekali, tidak tampilkan apapun
          if (!trackingInfo) return null;

          // Jika AWB null/kosong, tampilkan status processing
          if (!trackingInfo.hasAwb) {
            return (
              <div className="order-tracking-section">
                <h3>
                  <MdLocalShipping className="card-icon" />
                  Status Pengiriman
                </h3>
                <div className="tracking-info-card">
                  <div className="tracking-info-content">
                    <div className="tracking-number-display">
                      <span className="tracking-label">Status:</span>
                      <span className="tracking-status-processing">
                        Barang sedang diproses penjual
                      </span>
                      {/* <span className="tracking-status-note">
                        Nomor resi akan tersedia setelah barang dikirim
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Jika AWB ada, tampilkan komponen tracking normal
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
                    <span className="tracking-label">No. Resi:</span>
                    <span className="tracking-number">{trackingInfo.fullTrackingNumber}</span>
                  </div>

                  <button className="track-order-btn" onClick={handleToggleTracking}>
                    <MdLocalShipping />
                    {showTracking ? 'Tutup Tracking' : 'Lacak Pengiriman'}
                  </button>
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
                <div key={item.id} style={{padding: '1rem', background: '#f8f9fa'}}>
                  <h5 >{item.product_name || item.product || 'Produk'}</h5>
                  {item.product_image && (
                    <img
                      src={`${orderDetail.content?.imageurl || ''}${item.product_image}`}
                      alt={item.product_name}
                      style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px'}}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/nodata.png'; }}
                    />
                  )}
                  <div className="summary-item-grid">
                    <div className="grid-row">
                      <span className="grid-label">SKU</span>
                      <span className="grid-value">{item.product_sku || item.sku || '-'}</span>
                    </div>
                    <div className="grid-row">
                      <span className="grid-label">Jumlah</span>
                      <span className="grid-value">{item.qty} pcs</span>
                    </div>
                    <div className="grid-row">
                      <span className="grid-label">Harga Satuan</span>
                      <span className="grid-value">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="grid-row">
                      <span className="grid-label">Total</span>
                      <span className="grid-value">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>

                  {/* Tombol lacak pesanan dengan status yang lebih menarik */}
                  <div className="tracking-action-section">
                    {item.awb && item.awb !== null ? (
                      <div
                        className="track-item-btn active"
                        onClick={() => {
                          const trackingInfo = {
                            awb: item.awb,
                            lastDigit: item.last_digit || '',
                            hasAwb: !!item.awb,
                            hasLastDigit: !!item.last_digit,
                          };

                          if (trackingInfo.hasAwb && trackingInfo.hasLastDigit) {
                            setShowTracking(!showTracking);
                            const trackingSection = document.querySelector('.order-tracking-section');
                            if (trackingSection) {
                              trackingSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }}
                      >
                        <div className="track-btn-content">
                          <MdLocalShipping className="track-icon" color='#161129' />
                          <div className="track-text">
                            <span className="track-title">Lacak Pengiriman</span>
                            <span className="track-subtitle">Resi: {item.awb}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="processing-status">
                        <div className="processing-content">
                          <div className="processing-icon-wrapper">
                            <MdPending className="processing-icon" />
                          </div>
                          <div className="processing-text">
                            <span className="processing-title">Sedang Diproses</span>
                            <span className="processing-subtitle">Nomor resi akan tersedia setelah dikirim</span>
                          </div>
                        </div>
                        <div className="processing-dots">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Totals */}
          <div className="summary-totals">
            <div className="total-row">
              <span className="total-label">Total Belanja:</span>
              <span className="total-value">{formatCurrency((order.total || 0) - (order.shipping || 0))}</span>
            </div>
             <div className="total-row">
              <span className="total-label">Biaya Pengiriman:</span>
              <span className="total-value">{formatCurrency(order.shipping)}</span>
            </div>
            <div className="total-row savings">
              <span className="total-label">Discount:</span>
              <span className="total-value">-{formatCurrency(order.discount)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Pajak:</span>
              <span className="total-value">{formatCurrency(order.tax)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Biaya Layanan:</span>
              <span className="total-value">{formatCurrency(order.costs ?? 0)}</span>
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
