import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { useCart } from '../contexts/CartContext';
import {
  MdPerson,
  MdPayment,
  MdHistory,
  MdSwapHoriz,
  MdCardGiftcard,
  MdLock,
  MdChat,
  MdLogout,
  MdChevronRight,
} from 'react-icons/md';
import './Profile.css';
import { FAB } from '../components/FAB';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [activeMembershipTab, setActiveMembershipTab] = useState(0);

  const membershipTabs = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Sample user data - replace with actual data from API/state
  const userData = {
    points: 0,
    membership: 'BASIC',
    name: 'john doe',
    expiry: '-',
  };

  // Account menu items
  const accountMenuItems = [
    { id: 'profile', title: 'My Profile', icon: MdPerson },
    { id: 'payment', title: 'Payment Confirmation', icon: MdPayment },
    { id: 'event-history', title: 'My Event History', icon: MdHistory },
    { id: 'transaction', title: 'My Transaction History', icon: MdSwapHoriz },
    { id: 'redeem', title: 'My Redeem History', icon: MdCardGiftcard },
    { id: 'password', title: 'Change Password', icon: MdLock },
    { id: 'chat', title: 'Live Chat', icon: MdChat },
    { id: 'logout', title: 'Logout', icon: MdLogout },
  ];

  const handleMenuClick = (menuId: string) => {
    console.log(`Clicked menu: ${menuId}`);
    
    switch (menuId) {
      case 'profile':
        navigate('/profile/my-profile');
        break;
      case 'payment':
        navigate('/profile/payment-confirmation');
        break;
      case 'event-history':
        navigate('/profile/event-history');
        break;
      case 'transaction':
        navigate('/profile/transaction-history');
        break;
      case 'redeem':
        navigate('/profile/redeem-history');
        break;
      case 'password':
        navigate('/profile/change-password');
        break;
      case 'chat':
        navigate('/profile/live-chat');
        break;
      case 'logout':
        // Handle logout logic here
        console.log('Logout clicked');
        if (confirm('Are you sure you want to logout?')) {
          // Clear user session and redirect to login
          navigate('/login');
        }
        break;
      default:
        console.log('Unknown menu item:', menuId);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="profile-page">
      <AppbarDefault
        title="Profile"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div className="profile-content">
        <div className="user-card">
          <div className="user-card-row">
            <div className="user-card-item">
              <div className="user-card-label">POINTS</div>
              <div className="user-card-value">{userData.points}</div>
            </div>
            <div className="user-card-item">
              <div className="user-card-label">MEMBERSHIP</div>
              <div className="user-card-value">{userData.membership}</div>
            </div>
          </div>

          <div className="user-card-row">
            <div className="user-card-item">
              <div className="user-card-label">NAME</div>
              <div className="user-card-value">{userData.name}</div>
            </div>
            <div className="user-card-item">
              <div className="user-card-label">EXPIRY</div>
              <div className="user-card-value">{userData.expiry}</div>
            </div>
          </div>
        </div>

        {/* Membership Benefits Section */}
        <div className="membership-benefits-card">
          <h3 className="membership-title">MEMBERSHIP BENEFITS</h3>
          <div className="membership-tabs">
            {membershipTabs.map((tab, index) => (
              <button
                key={tab}
                className={`membership-tab ${activeMembershipTab === index ? 'active' : ''}`}
                onClick={() => setActiveMembershipTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="membership-content">
            {/* Content for each membership tier will go here */}
            <p>Benefits for {membershipTabs[activeMembershipTab]} membership</p>
          </div>
        </div>

        {/* Account Menu Section */}
        <div className="account-menu-card">
          <h3 className="account-menu-title">Account</h3>
          <div className="account-menu-list">
            {accountMenuItems.map((item) => (
              <button
                key={item.id}
                className="account-menu-item"
                onClick={() => handleMenuClick(item.id)}
              >
                <div className="account-menu-left">
                  <item.icon className="account-menu-icon" />
                  <span className="account-menu-text">{item.title}</span>
                </div>
                <MdChevronRight className="account-menu-arrow" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Profile;
