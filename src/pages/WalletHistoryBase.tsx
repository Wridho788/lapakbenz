import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdChevronRight, MdRefresh, MdSearchOff } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import SEO from '../components/SEO';
import { useLedger } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import { formatDate } from '../utils/dateUtils';
import './Wallet.css';

interface WalletHistoryBaseProps {
  historyType: 'points' | 'refund';
}

const WalletHistoryBase: React.FC<WalletHistoryBaseProps> = ({ historyType }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [offset, setOffset] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const title = historyType === 'points' ? 'Riwayat Poin Saya' : 'Riwayat Uang Refund';
  const subtitle = historyType === 'points' ? 'Lihat detail transaksi poin Anda.' : 'Lihat detail riwayat refund uang Anda.';
  const ismoney = historyType === 'points' ? '0' : '1';

  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useLedger({ ismoney, limit: '10', offset: offset.toString() });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      refetch();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    const result = data?.result;
    if (!Array.isArray(result)) return;

    if (offset === 0) {
      setRecords(result);
    } else {
      setRecords((prev) => [...prev, ...result]);
    }

    setHasMore(result.length === 10);
    setIsLoadingMore(false);
  }, [data, offset]);

  const handleScroll = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    const threshold = 160;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold) {
      setIsLoadingMore(true);
      setOffset((prev) => prev + 10);
    }
  }, [hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleBackClick = () => navigate(-1);
  const handleCartClick = () => navigate('/cart');
  const handleNotificationClick = () => navigate('/notifications');
  const handleRetry = () => refetch();

  const ledgerRecords = useMemo(() => {
    return records ?? [];
  }, [records]);

  return (
    <div className="wallet-page">
      <AppbarDefault
        title={title}
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />

      <SEO
        title={`${title} | lapakBenz`}
        description={`Halaman ${subtitle} pada lapakBenz. Lihat riwayat transaksi ${historyType === 'points' ? 'poin' : 'refund'} Anda dengan cepat.`}
        keywords={`wallet, ${historyType === 'points' ? 'riwayat poin' : 'riwayat refund'}, lapakBenz, dompet`}
        schemaType="WebPage"
        breadcrumbs={[
          { name: 'Wallet', url: '/wallet' },
          { name: title, url: `/wallet/${historyType}-history` }
        ]}
      />
      <div className="wallet-content" role="main" aria-label={title}>
        <div className="wallet-header wallet-header-small">
          <div>

          <h2>{title}</h2>
          <p>{subtitle}</p>
          </div>
        </div>

        {isFetching && !isLoading && (
          <div className="refresh-indicator">
            <MdRefresh />
            <span>Menyegarkan daftar...</span>
          </div>
        )}

        <nav className="wallet-history-actions" aria-label="Aksi riwayat wallet">
          <button type="button" onClick={handleRetry} className="wallet-button" aria-label="Segarkan riwayat wallet">
            <MdRefresh />
            Segarkan
          </button>
          <button type="button" onClick={() => navigate('/wallet')} className="wallet-button secondary" aria-label="Kembali ke wallet utama">
            <MdChevronRight />
            Kembali ke Wallet
          </button>
        </nav>

        {isLoading ? (
          <div className="wallet-loading">
            <div className="loading-spinner" />
            <p>Memuat riwayat...</p>
          </div>
        ) : error ? (
          <div className="wallet-error">
            <p>Gagal memuat riwayat. Silakan coba lagi.</p>
            <button onClick={handleRetry} className="wallet-button">
              Muat ulang
            </button>
          </div>
        ) : ledgerRecords.length === 0 ? (
          <div className="wallet-empty">
            <MdSearchOff className="empty-icon" />
            <h3>Tidak ada riwayat</h3>
            <p>Belum ada {historyType === 'points' ? 'transaksi poin' : 'data refund'} untuk ditampilkan.</p>
          </div>
        ) : (
          <div className="wallet-table" aria-label="Daftar riwayat transaksi">
            {ledgerRecords.map((item: any) => (
              <div key={`${item.id}-${item.dates}-${item.no}`} className="wallet-row">
                <div className="wallet-row-left">
                  <span className="wallet-row-field-label">
                    {historyType === 'points' ? 'Transaksi Poin' : 'Transaksi Refund'}
                  </span>
                  <span className="wallet-row-label" title={item.no || item.code || item.description || 'Transaksi'}>
                    {item.no || item.code || item.description || 'Transaksi'}
                  </span>
                </div>
                <div className="wallet-row-date-block">
                  <span className="wallet-row-field-label">Tanggal</span>
                  <span className="wallet-row-date">{item.dates ? formatDate(item.dates) : '-'}</span>
                </div>
                <div className="wallet-row-right">
                  <span className="wallet-row-field-label">
                    {historyType === 'points' ? 'Jumlah Poin' : 'Jumlah Refund'}
                  </span>
                  <span className="wallet-row-amount">
                    {historyType === 'refund'
                      ? `Rp ${(item.vamount ?? 0).toLocaleString('id-ID')}`
                      : (item.vamount ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoadingMore && (
          <div className="wallet-loading-more">
            <div className="loading-spinner small" />
            <p>Memuat lebih banyak...</p>
          </div>
        )}
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default WalletHistoryBase;