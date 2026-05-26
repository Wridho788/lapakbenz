import React from 'react';
import { useOrderTracking } from '../api/hooks/cartHooks';
import type { TrackingManifest, TrackingSummary } from '../api/types';
import './OrderTracking.css';

interface OrderTrackingProps {
  awb: string;
  lastDigit: string;
  className?: string;
}

interface TrackingManifestItemProps {
  manifest: TrackingManifest;
  index: number;
  total: number;
}

interface TrackingSummaryCardProps {
  summary: TrackingSummary;
}

const TrackingManifestItem: React.FC<TrackingManifestItemProps> = ({ manifest, index, total }) => {
  const isLatest = index === 0;
  const isOldest = index === total - 1;

  return (
    <div className={`tracking-manifest-item ${isLatest ? 'latest' : ''}`}>
      <div className="tracking-timeline">
        <div className={`tracking-dot ${isLatest ? 'active' : ''}`}></div>
        {!isOldest && <div className="tracking-line"></div>}
      </div>
      <div className="tracking-content">
        <div className="tracking-date">{manifest.manifest_date}</div>
        <div className="tracking-description">{manifest.manifest_description}</div>
        {manifest.city_name && (
          <div className="tracking-city">{manifest.city_name}</div>
        )}
      </div>
    </div>
  );
};

const TrackingSummaryCard: React.FC<TrackingSummaryCardProps> = ({ summary }) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return '#4CAF50';
      case 'ON PROCESS':
      case 'IN TRANSIT':
        return '#FF9800';
      case 'FAILED':
      case 'RETURNED':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'DITERIMA';
      case 'ON PROCESS':
        return 'DALAM PROSES';
      case 'IN TRANSIT':
        return 'DALAM PERJALANAN';
      case 'FAILED':
        return 'GAGAL';
      case 'RETURNED':
        return 'DIKEMBALIKAN';
      default:
        return status;
    }
  };

  return (
    <div className="tracking-summary-card">
      <div className="tracking-summary-header">
        <h3>Informasi Pengiriman</h3>
        <div 
          className="tracking-status"
          style={{ backgroundColor: getStatusColor(summary.status) }}
        >
          {getStatusText(summary.status)}
        </div>
      </div>

      <div className="tracking-summary-content">
        <div className="tracking-summary-row">
          <div className="tracking-summary-item">
            <label>No. Resi:</label>
            <span>{summary.waybill_number}</span>
          </div>
          <div className="tracking-summary-item">
            <label>Kurir:</label>
            <span>{summary.courier_name}</span>
          </div>
        </div>

        <div className="tracking-summary-row">
          <div className="tracking-summary-item">
            <label>Layanan:</label>
            <span>{summary.service_code}</span>
          </div>
          <div className="tracking-summary-item">
            <label>Tanggal Kirim:</label>
            <span>{summary.waybill_date}</span>
          </div>
        </div>

        <div className="tracking-summary-row">
          <div className="tracking-summary-item">
            <label>Pengirim:</label>
            <span>{summary.shipper_name}</span>
          </div>
          <div className="tracking-summary-item">
            <label>Penerima:</label>
            <span>{summary.receiver_name}</span>
          </div>
        </div>

        <div className="tracking-summary-row">
          <div className="tracking-summary-item">
            <label>Asal:</label>
            <span>{summary.origin}</span>
          </div>
          <div className="tracking-summary-item">
            <label>Tujuan:</label>
            <span>{summary.destination}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderTracking: React.FC<OrderTrackingProps> = ({ 
  awb, 
  lastDigit, 
  className = '' 
}) => {
  const { data, isLoading, error, refetch } = useOrderTracking(awb, lastDigit);

  if (isLoading) {
    return (
      <div className={`order-tracking ${className}`}>
        <div className="tracking-loading">
          <div className="loading-spinner"></div>
          <p>Memuat informasi tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`order-tracking ${className}`}>
        <div className="tracking-error">
          <div className="error-icon">❌</div>
          <h3>Gagal Memuat Tracking</h3>
          <p>{error.message}</p>
          <button 
            className="retry-button"
            onClick={() => refetch()}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data?.content?.status) {
    return (
      <div className={`order-tracking ${className}`}>
        <div className="tracking-not-found">
          <div className="not-found-icon">📦</div>
          <h3>Informasi Tracking Tidak Ditemukan</h3>
          <p>No. Resi: {awb}</p>
          <p>Silakan coba lagi nanti atau hubungi customer service.</p>
        </div>
      </div>
    );
  }

  const { manifest, summary } = data.content;

  return (
    <div className={`order-tracking ${className}`}>
      <div className="tracking-header">
        <h2>Lacak Pesanan</h2>
        <div className="tracking-number">No. Resi: {awb}</div>
      </div>

      <TrackingSummaryCard summary={summary} />

      <div className="tracking-timeline-container">
        <h3>Riwayat Pengiriman</h3>
        <div className="tracking-timeline-wrapper">
          {manifest.map((item, index) => (
            <TrackingManifestItem
              key={`${item.manifest_date}-${index}`}
              manifest={item}
              index={index}
              total={manifest.length}
            />
          ))}
        </div>
      </div>

      <div className="tracking-footer">
        <button 
          className="refresh-button"
          onClick={() => refetch()}
        >
          🔄 Refresh Tracking
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;