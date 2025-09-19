import React, { useState } from 'react';
import { useNotifications } from '../api/hooks';
import type { NotificationPayload } from '../api/types';

interface NotificationFiltersProps {
  // No longer need authToken as prop since using Zustand
}

const NotificationFilters: React.FC<NotificationFiltersProps> = () => {
  const [payload, setPayload] = useState<NotificationPayload>({
    type: "",
    campaign: "",
    read: "0",
    limit: "50",
    offset: "0"
  });

  // Use the notifications hook with dynamic payload
  const { data, isLoading, error, refetch } = useNotifications(payload);

  const handlePayloadChange = (key: keyof NotificationPayload, value: string) => {
    setPayload(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const presetFilters = {
    unreadOnly: () => setPayload(prev => ({ ...prev, read: "0" })),
    readOnly: () => setPayload(prev => ({ ...prev, read: "1" })),
    allNotifications: () => setPayload(prev => ({ ...prev, read: "" })),
    limit10: () => setPayload(prev => ({ ...prev, limit: "10" })),
    limit50: () => setPayload(prev => ({ ...prev, limit: "50" })),
  };

  return (
    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>Notification Filters (Development Tool)</h3>
      
      {/* Payload Controls */}
      <div style={{ marginBottom: '1rem' }}>
        <h4>Dynamic Payload:</h4>
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label>Type:</label>
            <input
              type="text"
              value={payload.type || ''}
              onChange={(e) => handlePayloadChange('type', e.target.value)}
              placeholder="notification type"
              style={{ width: '100%', padding: '0.25rem' }}
            />
          </div>
          <div>
            <label>Campaign:</label>
            <input
              type="text"
              value={payload.campaign || ''}
              onChange={(e) => handlePayloadChange('campaign', e.target.value)}
              placeholder="campaign name"
              style={{ width: '100%', padding: '0.25rem' }}
            />
          </div>
          <div>
            <label>Read Status:</label>
            <select
              value={payload.read || ''}
              onChange={(e) => handlePayloadChange('read', e.target.value)}
              style={{ width: '100%', padding: '0.25rem' }}
            >
              <option value="">All</option>
              <option value="0">Unread</option>
              <option value="1">Read</option>
            </select>
          </div>
          <div>
            <label>Limit:</label>
            <input
              type="number"
              value={payload.limit || ''}
              onChange={(e) => handlePayloadChange('limit', e.target.value)}
              placeholder="50"
              style={{ width: '100%', padding: '0.25rem' }}
            />
          </div>
          <div>
            <label>Offset:</label>
            <input
              type="number"
              value={payload.offset || ''}
              onChange={(e) => handlePayloadChange('offset', e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: '0.25rem' }}
            />
          </div>
        </div>
      </div>

      {/* Preset Filters */}
      <div style={{ marginBottom: '1rem' }}>
        <h4>Quick Filters:</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={presetFilters.unreadOnly} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
            Unread Only
          </button>
          <button onClick={presetFilters.readOnly} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
            Read Only
          </button>
          <button onClick={presetFilters.allNotifications} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
            All Notifications
          </button>
          <button onClick={presetFilters.limit10} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
            Limit 10
          </button>
          <button onClick={presetFilters.limit50} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
            Limit 50
          </button>
        </div>
      </div>

      <button 
        onClick={handleApplyFilters}
        style={{ 
          background: '#161129', 
          color: 'white', 
          border: 'none', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Apply Filters
      </button>

      {/* Current Payload Display */}
      <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#e9ecef', borderRadius: '4px' }}>
        <strong>Current Payload:</strong>
        <pre style={{ fontSize: '0.875rem', margin: '0.5rem 0' }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {/* API Response Status */}
      {isLoading && <p>Loading notifications...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && (
        <div style={{ marginTop: '1rem' }}>
          <strong>API Response:</strong>
          <p>Total notifications: {data.content?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;
