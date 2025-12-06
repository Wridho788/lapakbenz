import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import OneSignal from "react-onesignal";
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Initialize OneSignal
async function initOneSignal() {
  await OneSignal.init({
    appId: "e97b9d55-bdde-4fa9-8b00-b5d8c72cd466",
    // safari_web_id: "YOUR_SAFARI_ID", // optional
    allowLocalhostAsSecureOrigin: true, // penting untuk dev
    notifyButton: {
      enable: true, // tampilkan bell notif
      prenotify: true,
      showCredit: false,
      text: {
        'tip.state.unsubscribed': 'Subscribe to notifications',
        'tip.state.subscribed': "You're subscribed to notifications",
        'tip.state.blocked': "You've blocked notifications",
        'message.prenotify': 'Click to subscribe to notifications',
        'message.action.subscribed': "Thanks for subscribing!",
        'message.action.subscribing': "Subscribing...",
        'message.action.resubscribed': "You're subscribed to notifications",
        'message.action.unsubscribed': "You won't receive notifications again",
        'dialog.main.title': 'Manage Site Notifications',
        'dialog.main.button.subscribe': 'SUBSCRIBE',
        'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
        'dialog.blocked.title': 'Unblock Notifications',
        'dialog.blocked.message': "Follow these instructions to allow notifications:"
      }
    },
  });

  // Memunculkan prompt izin
  await OneSignal.Slidedown.promptPush();
}

// Run OneSignal initialization
initOneSignal();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
