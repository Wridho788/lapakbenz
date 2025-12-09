import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

/**
 * Custom hook untuk initialize OneSignal
 * Mencegah double initialization dan menangani cleanup
 */
export const useOneSignal = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Skip jika sudah initialized atau sedang dalam proses
    if (initialized.current) {
      console.log('⚠️ OneSignal already initialized, skipping...');
      return;
    }

    const initOneSignal = async () => {
      try {
        console.log('🔔 Initializing OneSignal...');

        await OneSignal.init({
          appId: 'e97b9d55-bdde-4fa9-8b00-b5d8c72cd466',
          allowLocalhostAsSecureOrigin: true,
          
          // Disable service worker for now - use SDK defaults
          // Service worker registration will be handled by OneSignal CDN
          
          notifyButton: {
            enable: false, // Disable default notify button
            prenotify: true,
            showCredit: false,
            position: 'bottom-right',
            offset: {
              bottom: '80px',
              left: '0px',
              right: '20px',
            },
            text: {
              'tip.state.unsubscribed': 'Subscribe to notifications',
              'tip.state.subscribed': "You're subscribed to notifications",
              'tip.state.blocked': "You've blocked notifications",
              'message.prenotify': 'Click to subscribe to notifications',
              'message.action.subscribed': 'Thanks for subscribing!',
              'message.action.subscribing': 'Subscribing...',
              'message.action.resubscribed': "You're subscribed to notifications",
              'message.action.unsubscribed': "You won't receive notifications again",
              'dialog.main.title': 'Manage Site Notifications',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
              'dialog.blocked.title': 'Unblock Notifications',
              'dialog.blocked.message': 'Follow these instructions to allow notifications:',
            },
          },
        });

        // Mark as initialized
        initialized.current = true;
        console.log('✅ OneSignal initialized successfully');

        // Check service worker registration
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log('🔧 Service Workers registered:', registrations.length);
          registrations.forEach((reg, index) => {
            const scriptURL = reg.active?.scriptURL || 'none';
            const isOneSignal = scriptURL.includes('OneSignal');
            console.log(`  SW ${index + 1}:`, reg.scope);
            console.log(`    - Script: ${scriptURL}`);
            console.log(`    - State: ${reg.active?.state}`);
            console.log(`    - OneSignal: ${isOneSignal ? '✅ YES' : '❌ NO'}`);
          });
        }

        // Check permission status
        const permission = String(await OneSignal.Notifications.permission);
        console.log('🔐 Notification permission:', permission);

        // Show slidedown prompt if not already subscribed
        if (permission !== 'granted') {
          console.log('📢 Showing slidedown prompt...');
          await OneSignal.Slidedown.promptPush();
        } else {
          console.log('✅ User already subscribed');
        }

        // Log subscription status
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        console.log('📱 Push subscription status:', isSubscribed);

        if (isSubscribed) {
          const pushToken = await OneSignal.User.PushSubscription.token;
          const subscriptionId = await OneSignal.User.PushSubscription.id;
          console.log('🔑 Push Token:', pushToken);
          console.log('🆔 Subscription ID:', subscriptionId);
        } else {
          console.warn('⚠️ User not subscribed - notifications will not be received');
        }

        // Listen for subscription changes
        OneSignal.User.PushSubscription.addEventListener('change', (event) => {
          console.log('🔄 Subscription changed:', event);
        });

        // Listen for notification received (foreground)
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
          console.log('🔔 Notification received (foreground):', event.notification);
          // Don't prevent default - let notification show
        });

        // Listen for notification clicks
        OneSignal.Notifications.addEventListener('click', (event) => {
          console.log('🖱️ Notification clicked:', event);
          try {
            const notification = event.notification;
            if (notification) {
              console.log('  - Title:', notification.title);
              console.log('  - Body:', notification.body);
              const data = notification.additionalData as any;
              if (data?.url) {
                console.log('  - Opening URL:', data.url);
                window.location.href = data.url;
              }
            }
          } catch (err) {
            console.error('Error handling notification click:', err);
          }
        });
      } catch (error: any) {
        console.error('❌ OneSignal initialization failed:', error);

        // Handle specific error cases
        if (error.message?.includes('already initialized')) {
          console.log('⚠️ OneSignal was already initialized elsewhere');
          initialized.current = true; // Mark as initialized to prevent retries
        } else if (error.message?.includes('ServiceWorkerRegistration')) {
          console.log('⚠️ Service Worker registration issue');
        }
      }
    };

    // Small delay to ensure React is fully mounted
    const timeoutId = setTimeout(() => {
      initOneSignal();
    }, 500);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Empty deps array - run once on mount

  return { initialized: initialized.current };
};
