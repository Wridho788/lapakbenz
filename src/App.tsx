import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Event from './pages/Event';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
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
          </Routes>
        </MainLayout>
      </Router>
    </NotificationProvider>
  );
}

export default App;
