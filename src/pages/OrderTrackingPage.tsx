import React, { useState } from 'react';
import OrderTracking from '../components/OrderTracking';
import { useOrderDetail } from '../api/hooks/cartHooks';

interface OrderTrackingPageProps {
  orderId?: string;
}

const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId }) => {
  const [manualAwb, setManualAwb] = useState('');
  const [manualLastDigit, setManualLastDigit] = useState('');
  const [showManualTracking, setShowManualTracking] = useState(false);

  // Get order details to extract AWB and last digit
  const { data: orderData, isLoading: orderLoading } = useOrderDetail(orderId || '');

  // Extract AWB and last digit from order items
  const getTrackingInfo = () => {
    if (!orderData?.content?.items?.length) return null;
    
    // Find first item with tracking info
    const itemWithTracking = orderData.content.items.find(item => item.awb && item.last_digit);
    
    if (itemWithTracking) {
      return {
        awb: itemWithTracking.awb,
        lastDigit: itemWithTracking.last_digit
      };
    }
    
    return null;
  };

  const trackingInfo = getTrackingInfo();

  if (orderLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Memuat detail pesanan...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Lacak Pesanan</h1>
      
      {/* Show tracking from order data */}
      {trackingInfo && trackingInfo.awb && trackingInfo.lastDigit && (
        <div style={{ marginBottom: '40px' }}>
          <h2>Tracking dari Pesanan #{orderId}</h2>
          <OrderTracking 
            awb={trackingInfo.awb} 
            lastDigit={trackingInfo.lastDigit}
          />
        </div>
      )}

      {/* Manual tracking input */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowManualTracking(!showManualTracking)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff8800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {showManualTracking ? 'Sembunyikan' : 'Lacak dengan No. Resi Manual'}
        </button>
      </div>

      {showManualTracking && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <h3>Masukkan Informasi Tracking</h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              No. Resi (AWB):
            </label>
            <input
              type="text"
              value={manualAwb}
              onChange={(e) => setManualAwb(e.target.value)}
              placeholder="Contoh: TG0005321930"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Last Digit:
            </label>
            <input
              type="text"
              value={manualLastDigit}
              onChange={(e) => setManualLastDigit(e.target.value)}
              placeholder="Contoh: 39608"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          {manualAwb && manualLastDigit && (
            <div style={{ marginTop: '20px' }}>
              <h3>Hasil Tracking:</h3>
              <OrderTracking 
                awb={manualAwb} 
                lastDigit={manualLastDigit}
              />
            </div>
          )}
        </div>
      )}

      {!trackingInfo && !showManualTracking && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <p>Tidak ada informasi tracking untuk pesanan ini.</p>
          <p>Gunakan fitur tracking manual di atas.</p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;