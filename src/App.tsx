import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Event from './pages/Event';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Invoice from './pages/Invoice';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
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
import MerchantRegistration from './pages/MerchantRegistration';
import PublicRegistration from './pages/PublicRegistration';
import VerifyOtp from './pages/VerifyOtp';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <Router>
          <MainLayout>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/event" element={<Event />} />
            <Route path="/product" element={<Product />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
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
            <Route path="/merchant-registration/:eventId" element={<MerchantRegistration />} />
            <Route path="/public-registration/:eventId" element={<PublicRegistration />} />
            <Route path="/verify" element={<VerifyOtp />} />
            </Routes>
          </MainLayout>
        </Router>
      </CartProvider>
    </NotificationProvider>
  );
}export default App;
