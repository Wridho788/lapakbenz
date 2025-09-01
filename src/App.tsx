import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Event from './pages/Event';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MyProfile from './pages/MyProfile';
import PaymentConfirmation from './pages/PaymentConfirmation';
import MyEventHistory from './pages/MyEventHistory';
import MyTransactionHistory from './pages/MyTransactionHistory';
import MyRedeemHistory from './pages/MyRedeemHistory';
import ChangePassword from './pages/ChangePassword';
import LiveChat from './pages/LiveChat';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/event" element={<Event />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile/my-profile" element={<MyProfile />} />
            <Route path="/profile/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/profile/event-history" element={<MyEventHistory />} />
            <Route path="/profile/transaction-history" element={<MyTransactionHistory />} />
            <Route path="/profile/redeem-history" element={<MyRedeemHistory />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/profile/live-chat" element={<LiveChat />} />
          </Routes>
        </MainLayout>
      </Router>
    </NotificationProvider>
  );
}

export default App;
