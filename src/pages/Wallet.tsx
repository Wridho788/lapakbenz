import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdChevronRight, MdRefresh, MdMoney, MdStar } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useLedger } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import './Wallet.css';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    data: pointsData,
    isLoading: pointsLoading,
    isFetching: pointsFetching,
    error: pointsError,
    refetch: refetchPoints,
  } = useLedger({ ismoney: '0', limit: '0', offset: '0' });

  const {
    data: refundData,
    isLoading: refundLoading,
    isFetching: refundFetching,
    error: refundError,
    refetch: refetchRefund,
  } = useLedger({ ismoney: '1', limit: '0', offset: '0' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = window.setInterval(() => {
      refetchPoints();
      refetchRefund();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, refetchPoints, refetchRefund]);

  const isLoading = pointsLoading || refundLoading;
  const isFetching = pointsFetching || refundFetching;
  const hasError = !!pointsError || !!refundError;

  const pointTotal = pointsData?.total ?? 0;
  const refundTotal = refundData?.total ?? 0;

  const handleBackClick = () => navigate(-1);
  const handleCartClick = () => navigate('/cart');
  const handleNotificationClick = () => navigate('/notifications');

  return (
    <div className="wallet-page">
      <AppbarDefault
        title="Wallet"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />

      <div className="wallet-content">
        <div className="wallet-header">
          <h2>Dompet Saya</h2>
          <p>Ringkasan poin dan refund Anda.</p>
        </div>

        {isFetching && !isLoading && (
          <div className="refresh-indicator">
            <MdRefresh />
            <span>Menyegarkan data...</span>
          </div>
        )}

        {isLoading ? (
          <div className="wallet-loading">
            <div className="loading-spinner" />
            <p>Memuat wallet Anda...</p>
          </div>
        ) : hasError ? (
          <div className="wallet-error">
            <p>Gagal memuat data wallet. Silakan coba lagi.</p>
            <button onClick={() => { refetchPoints(); refetchRefund(); }} className="wallet-button">
              Muat ulang
            </button>
          </div>
        ) : (
          <>
            <div className="wallet-summary-grid">
              <button
                type="button"
                className="wallet-card wallet-card-point"
                onClick={() => navigate('/wallet/points-history')}
              >
                <div className="wallet-card-icon">
                  <MdStar />
                </div>
                <div className="wallet-card-content">
                  <span className="wallet-card-label">Poin Saya</span>
                  <strong className="wallet-card-value">{pointTotal.toLocaleString('id-ID')}</strong>
                </div>
                <div className="wallet-card-action">
                  <span>Riwayat poin saya</span>
                  <MdChevronRight />
                </div>
              </button>

              <div className="wallet-card wallet-card-refund">
                <div className="wallet-card-icon">
                  <MdMoney />
                </div>
                <div className="wallet-card-content">
                  <span className="wallet-card-label">Uang Refund</span>
                  <strong className="wallet-card-value">Rp {refundTotal.toLocaleString('id-ID')}</strong>
                </div>
                {refundTotal > 0 ? (
                  <button
                    type="button"
                    className="wallet-card-action-link"
                    onClick={() => navigate('/wallet/refund-history')}
                  >
                    <span>Riwayat uang refund</span>
                    <MdChevronRight />
                  </button>
                ) : (
                  <div className="wallet-card-action-muted">
                    <span>Tidak ada refund tersedia</span>
                  </div>
                )}
              </div>
            </div>

            {pointTotal === 0 && refundTotal === 0 && (
              <div className="wallet-empty">
                <h3>Belum ada aktivitas</h3>
                <p>Anda belum memiliki poin atau refund. Coba ikuti event atau lakukan transaksi untuk mulai mengumpulkan poin dan refund.</p>
              </div>
            )}
          </>
        )}
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Wallet;
