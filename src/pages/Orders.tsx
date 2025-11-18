import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdShoppingCart, MdCancel, MdCheckCircle, MdPending, MdFilterList, MdClose, MdPayment, MdVerified, MdCalendarToday, MdClear, MdTune } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { useAuthStore } from '../stores/authStore';
import { useOrders } from '../api/hooks/index';
import type { OrderItem } from '../api/ordersApi';
import './orders.css';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  // const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterPaid, setFilterPaid] = useState<'' | '0' | '1'>('');
  const [filterConfirm, setFilterConfirm] = useState<'' | '1'>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Use Zustand auth store
  const { isAuthenticated } = useAuthStore();

  // Use orders hook with filter parameters
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrders({
    limit: '120',
    offset: '0',
    confirm: filterConfirm,
    paid: filterPaid,
    start: filterStartDate,
    end: filterEndDate,
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

  // Refetch when filters change
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [filterPaid, filterConfirm, filterStartDate, filterEndDate, isAuthenticated, refetch]);

  const handleBackClick = () => {
    navigate('/');
  };

  // const handleRefresh = async () => {
  //   setIsRefreshing(true);
  //   await refetch();
  //   setTimeout(() => setIsRefreshing(false), 500);
  // };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    setFilterPaid('');
    setFilterConfirm('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    refetch();
  };

  // Format today's date for date inputs
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <AppbarDefault title="My Orders" onBack={handleBackClick} />
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
        <AppbarDefault title="My Orders" onBack={handleBackClick} />
        <div className="orders-content">
          <div className="orders-error">
            <h3>Failed to Load Orders</h3>
            <p>Unable to fetch your orders. Please try again.</p>
            {/* <button onClick={handleRefresh} className="retry-btn">
              <MdRefresh />
              Try Again
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  const orders = ordersData?.content?.result || [];
  const totalRecords = ordersData?.content?.record || 0;

  return (
    <div className="orders-page">
      <AppbarDefault title="Pesanan Saya" onBack={handleBackClick} />

      <div className="orders-content">
        {/* Orders Header */}
        <div className="orders-header">
          <div className="orders-info">
            <h3>Riwayat Pesanan</h3>
            <p>{totalRecords} pesanan ditemukan</p>
          </div>

          <div className="orders-actions">
            <button
              onClick={handleToggleFilters}
              className={`orders-action-btn ${showFilters ? 'active' : ''}`}
              title="Filter pesanan"
            >
              Filter
              <MdFilterList />
            </button>
            {/* <button
              onClick={handleRefresh}
              className={`orders-action-btn ${isRefreshing || isFetching ? 'loading' : ''}`}
              title="Segarkan pesanan"
              disabled={isRefreshing}
            >
              
              <MdRefresh />
            </button> */}
          </div>
        </div>

        {/* Enhanced Filter Section */}
        {showFilters && (
          <div className="orders-filters animate-slide-down">
            <div className="filters-header">
              <div className="filter-title-section">
                <MdTune className="filter-header-icon" />
                <h4>Filter & Pencarian</h4>
                <span className="filter-subtitle">Temukan pesanan dengan mudah</span>
              </div>
              <button onClick={handleToggleFilters} className="close-filters-btn">
                <MdClose />
              </button>
            </div>
            
            <div className="filters-content">
              {/* Quick Filter Chips */}
              <div className="quick-filters">
                <span className="quick-filter-label">Filter Cepat:</span>
                <div className="filter-chips">
                  <button 
                    className={`filter-chip ${filterPaid === '0' ? 'active' : ''}`}
                    onClick={() => setFilterPaid(filterPaid === '0' ? '' : '0')}
                  >
                    <MdPayment />
                    Belum Bayar
                  </button>
                  <button 
                    className={`filter-chip ${filterPaid === '1' ? 'active' : ''}`}
                    onClick={() => setFilterPaid(filterPaid === '1' ? '' : '1')}
                  >
                    <MdCheckCircle />
                    Sudah Bayar
                  </button>
                  <button 
                    className={`filter-chip ${filterConfirm === '1' ? 'active' : ''}`}
                    onClick={() => setFilterConfirm(filterConfirm === '1' ? '' : '1')}
                  >
                    <MdVerified />
                    Dikonfirmasi
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="advanced-filters">
                <div className="filter-section">
                  <div className="section-header">
                    <MdPayment className="section-icon" />
                    <span>Status Pembayaran</span>
                  </div>
                  <div className="filter-group enhanced">
                    <div className="select-wrapper">
                      <select 
                        value={filterPaid} 
                        onChange={(e) => setFilterPaid(e.target.value as '' | '0' | '1')}
                        className="filter-select enhanced"
                      >
                        <option value="">🔍 Semua Status</option>
                        <option value="0">⏳ Belum Bayar</option>
                        <option value="1">✅ Sudah Bayar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="filter-section">
                  <div className="section-header">
                    <MdVerified className="section-icon" />
                    <span>Status Konfirmasi</span>
                  </div>
                  <div className="filter-group enhanced">
                    <div className="select-wrapper">
                      <select 
                        value={filterConfirm} 
                        onChange={(e) => setFilterConfirm(e.target.value as '' | '1')}
                        className="filter-select enhanced"
                      >
                        <option value="">🔍 Semua Status</option>
                        <option value="1">✅ Dikonfirmasi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="date-filter-section">
                <div className="section-header">
                  <MdCalendarToday className="section-icon" />
                  <span>Rentang Tanggal</span>
                </div>
                <div className="date-filter-row">
                  <div className="date-input-group">
                    <label className="date-label">Dari Tanggal</label>
                    <div className="date-wrapper">
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="filter-date enhanced"
                        max={getTodayDate()}
                        placeholder="Pilih tanggal mulai"
                      />
                      {filterStartDate && (
                        <button 
                          className="clear-date-btn"
                          onClick={() => setFilterStartDate('')}
                          title="Hapus tanggal"
                        >
                          <MdClose />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="date-input-group">
                    <label className="date-label">Sampai Tanggal</label>
                    <div className="date-wrapper">
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="filter-date enhanced"
                        min={filterStartDate}
                        max={getTodayDate()}
                        placeholder="Pilih tanggal akhir"
                      />
                      {filterEndDate && (
                        <button 
                          className="clear-date-btn"
                          onClick={() => setFilterEndDate('')}
                          title="Hapus tanggal"
                        >
                          <MdClose />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="filters-actions enhanced">
                <button onClick={handleClearFilters} className="clear-filters-btn enhanced">
                  <MdClear />
                  <span>Reset Semua</span>
                </button>
                <button onClick={handleApplyFilters} className="apply-filters-btn enhanced">
                  <MdTune />
                  <span>Terapkan Filter</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Active Filters Display */}
        {(filterPaid || filterConfirm || filterStartDate || filterEndDate) && (
          <div className="active-filters enhanced animate-fade-in">
            <div className="active-filters-header">
              <MdFilterList className="active-filter-icon" />
              <span className="active-filters-label">Filter Aktif</span>
            </div>
            <div className="active-filter-tags">
              {filterPaid === '0' && (
                <div className="filter-tag payment-pending">
                  <MdPending />
                  <span>Belum Bayar</span>
                  <button onClick={() => setFilterPaid('')}><MdClose /></button>
                </div>
              )}
              {filterPaid === '1' && (
                <div className="filter-tag payment-success">
                  <MdCheckCircle />
                  <span>Sudah Bayar</span>
                  <button onClick={() => setFilterPaid('')}><MdClose /></button>
                </div>
              )}
              {filterConfirm === '1' && (
                <div className="filter-tag confirmed">
                  <MdVerified />
                  <span>Dikonfirmasi</span>
                  <button onClick={() => setFilterConfirm('')}><MdClose /></button>
                </div>
              )}
              {(filterStartDate || filterEndDate) && (
                <div className="filter-tag-row date-range-row">
                  {filterStartDate && (
                    <div className="filter-tag date-range">
                      <MdCalendarToday />
                      <span>Dari: {filterStartDate}</span>
                      <button onClick={() => setFilterStartDate('')}><MdClose /></button>
                    </div>
                  )}
                  {filterEndDate && (
                    <div className="filter-tag date-range">
                      <MdCalendarToday />
                      <span>Sampai: {filterEndDate}</span>
                      <button onClick={() => setFilterEndDate('')}><MdClose /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleClearFilters} className="clear-all-filters">
              <MdClear />
              <span>Hapus Semua</span>
            </button>
          </div>
        )}

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
              <div key={order.id} className="order-card" onClick={() => handleOrderClick(order.id)}>
                <div className="order-header">
                  <div className="order-code">
                    <h4>#{order.code}</h4>
                  </div>
                  <div
                    className={`order-status ${getStatusClass(order.paid_status, order.canceled)}`}
                  >
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
                  {/* <div className="order-service-fee">
                    <span className="service-fee-label">Biaya Layanan:</span>
                    <span className="service-fee-value">{formatCurrency(order.cost)}</span>
                  </div> */}
                  <div className="order-amount">
                    <span className="amount-label">Total:</span>
                    <span className="amount-value">{formatCurrency(order.amount)}</span>
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
