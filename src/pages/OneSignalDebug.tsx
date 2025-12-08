import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { AppbarDefault } from '../components/AppbarDefault';

const OneSignalDebug: React.FC = () => {
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    setLoading(true);
    try {
      const info: any = {
        timestamp: new Date().toISOString(),
      };

      // Check if OneSignal is initialized
      try {
        info.isInitialized = true;
        
        // Get permission status
        info.permission = await OneSignal.Notifications.permission;
        
        // Get subscription status
        info.isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        
        // Get push token
        info.pushToken = await OneSignal.User.PushSubscription.token;
        
        // Get OneSignal User ID
        info.oneSignalId = await OneSignal.User.PushSubscription.id;
        
        // Get external user ID
        info.externalUserId = await OneSignal.User.externalId;
        
        // Browser support
        info.isPushSupported = OneSignal.Notifications.isPushSupported();
        
      } catch (error: any) {
        info.isInitialized = false;
        info.initError = error.message;
      }

      // Browser info
      info.browser = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      };

      // Service Worker status
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.serviceWorkers = registrations.map(reg => ({
          scope: reg.scope,
          active: reg.active?.state,
          waiting: reg.waiting?.state,
          installing: reg.installing?.state,
        }));
      }

      setDebugInfo(info);
    } catch (error) {
      console.error('Debug info error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      await OneSignal.Slidedown.promptPush();
      setTimeout(loadDebugInfo, 1000);
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      await OneSignal.User.PushSubscription.optIn();
      setTimeout(loadDebugInfo, 1000);
    } catch (error) {
      console.error('Subscribe failed:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await OneSignal.User.PushSubscription.optOut();
      setTimeout(loadDebugInfo, 1000);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  };

  const handleSendTestNotification = async () => {
    const userId = debugInfo.oneSignalId || debugInfo.externalUserId;
    if (!userId) {
      alert('No user ID found. Please subscribe first.');
      return;
    }
    
    alert(
      `To send test notification:\n\n` +
      `1. Go to OneSignal Dashboard\n` +
      `2. Messages → New Push\n` +
      `3. Target: "Send to Particular Users"\n` +
      `4. Enter User ID: ${userId}\n` +
      `5. Send notification`
    );
  };

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', background: '#f8f9fa' }}>
      <AppbarDefault
        title="OneSignal Debug"
        onBack={() => navigate('/dashboard')}
        showCart={false}
        defaultBack="/dashboard"
      />

      <div style={{ padding: '1rem' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>OneSignal Status</h3>
          
          {loading ? (
            <p>Loading debug info...</p>
          ) : (
            <div style={{ fontSize: '0.85rem' }}>
              <DebugRow label="Initialized" value={debugInfo.isInitialized ? '✅ Yes' : '❌ No'} />
              <DebugRow label="Permission" value={debugInfo.permission} />
              <DebugRow label="Subscribed" value={debugInfo.isSubscribed ? '✅ Yes' : '❌ No'} />
              <DebugRow label="Push Token" value={debugInfo.pushToken || 'None'} />
              <DebugRow label="OneSignal ID" value={debugInfo.oneSignalId || 'None'} />
              <DebugRow label="External User ID" value={debugInfo.externalUserId || 'None'} />
              <DebugRow label="Push Supported" value={debugInfo.isPushSupported ? '✅ Yes' : '❌ No'} />
              
              {debugInfo.initError && (
                <DebugRow label="Init Error" value={debugInfo.initError} error />
              )}
            </div>
          )}
        </div>

        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={loadDebugInfo}
              style={{
                padding: '0.75rem',
                background: '#161129',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 Refresh Debug Info
            </button>
            
            <button
              onClick={handleRequestPermission}
              style={{
                padding: '0.75rem',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔔 Request Permission
            </button>
            
            {debugInfo.isSubscribed ? (
              <button
                onClick={handleUnsubscribe}
                style={{
                  padding: '0.75rem',
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔕 Unsubscribe
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                style={{
                  padding: '0.75rem',
                  background: '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ✅ Subscribe
              </button>
            )}
            
            <button
              onClick={handleSendTestNotification}
              style={{
                padding: '0.75rem',
                background: '#FF9800',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📤 How to Send Test Notification
            </button>
          </div>
        </div>

        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Service Workers</h3>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {debugInfo.serviceWorkers?.length > 0 ? (
              debugInfo.serviceWorkers.map((sw: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
                  <div><strong>Scope:</strong> {sw.scope}</div>
                  <div><strong>Active:</strong> {sw.active || 'none'}</div>
                  <div><strong>Waiting:</strong> {sw.waiting || 'none'}</div>
                </div>
              ))
            ) : (
              <p>No service workers found</p>
            )}
          </div>
        </div>

        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Raw Debug Data</h3>
          <pre style={{ 
            fontSize: '0.7rem', 
            overflow: 'auto', 
            background: '#f5f5f5', 
            padding: '0.75rem',
            borderRadius: '4px',
            maxHeight: '300px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

const DebugRow: React.FC<{ label: string; value: any; error?: boolean }> = ({ label, value, error }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f0f0f0'
  }}>
    <strong>{label}:</strong>
    <span style={{ 
      color: error ? '#f44336' : 'inherit',
      wordBreak: 'break-all',
      textAlign: 'right',
      maxWidth: '60%'
    }}>
      {String(value)}
    </span>
  </div>
);

export default OneSignalDebug;
