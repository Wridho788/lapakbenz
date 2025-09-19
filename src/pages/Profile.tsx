import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppbarDefault } from '../components/AppbarDefault';
import { useCart } from '../contexts/CartContext';
import { useProfile, useLedger } from '../api/hooks';
import { useAuthStore } from '../stores/authStore';
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
  
  // Auth state
  const { isAuthenticated, logout: authLogout } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // API hooks
  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError } = useLedger();

  const membershipTabs = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Process user data from API responses
  const getUserData = () => {
    // Default values
    const defaultData = {
      points: 0,
      membership: 'BASIC',
      name: 'Guest User',
      expiry: '-',
      memberNo: '-',
    };

    // If no auth token, return default
    if (!isAuthenticated) {
      return {
        ...defaultData,
        name: 'Please login',
      };
    }

    // If still loading, show loading state
    if (profileLoading || ledgerLoading) {
      return {
        ...defaultData,
        name: 'Loading...',
      };
    }

    // If there's an error, show error state with retry option
    if (profileError || ledgerError) {
      console.error('Profile Error:', profileError);
      console.error('Ledger Error:', ledgerError);
      return {
        ...defaultData,
        name: 'Tap to retry',
      };
    }

    // Extract points from ledger data
    let points = 0;
    if (ledgerData?.content?.point !== undefined) {
      points = ledgerData.content.point;
    }

    // Extract profile data
    let name = defaultData.name;
    let membership = defaultData.membership;
    let expiry = defaultData.expiry;
    let memberNo = defaultData.memberNo;

    if (profileData?.content?.result) {
      const profile = profileData.content.result;
      
      // Combine first_name and last_name for full name
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      name = `${firstName} ${lastName}`.trim() || defaultData.name;
      
      // Get membership from type field
      if (profile.type) {
        membership = profile.type.toUpperCase();
      }

      // Get member number
      if (profile.member_no) {
        memberNo = profile.member_no;
      }
      
      // Get expiry from expired field
      if (profile.expired) {
        // Format expiry date if it's a valid date
        try {
          const expiryDate = new Date(profile.expired);
          if (!isNaN(expiryDate.getTime())) {
            expiry = expiryDate.toLocaleDateString('id-ID');
          } else {
            expiry = profile.expired;
          }
        } catch (error) {
          expiry = profile.expired;
        }
      } else if (profile.expired_format) {
        expiry = profile.expired_format;
      } else {
        // Check if membership has no expiry (like lifetime membership)
        if (profile.type === 'member' && profile.premium === '0') {
          expiry = 'No Expiry';
        }
      }
    }

    return {
      points,
      membership,
      name,
      expiry,
      memberNo,
    };
  };

  const userData = getUserData();

  // Debug information (remove in production)
  useEffect(() => {
    console.log('=== Profile Debug Info ===');
    console.log('Authentication Status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    console.log('Profile Data:', profileData);
    console.log('Ledger Data:', ledgerData);
    console.log('Profile Loading:', profileLoading);
    console.log('Ledger Loading:', ledgerLoading);
    console.log('Profile Error:', profileError);
    console.log('Ledger Error:', ledgerError);
    
    if (profileData?.content?.result) {
      const profile = profileData.content.result;
      console.log('Extracted Profile Fields:');
      console.log('- First Name:', profile.first_name);
      console.log('- Last Name:', profile.last_name);
      console.log('- Type (Membership):', profile.type);
      console.log('- Expired:', profile.expired);
      console.log('- Expired Format:', profile.expired_format);
      console.log('- Premium:', profile.premium);
      console.log('- Member No:', profile.member_no);
    }
    
    if (ledgerData?.content?.point !== undefined) {
      console.log('Extracted Points:', ledgerData.content.point);
    }
    
    console.log('Processed User Data:', userData);
    console.log('========================');
  }, [profileData, ledgerData, profileLoading, ledgerLoading, profileError, ledgerError, userData]);

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
        
        Swal.fire({
          title: 'Logout Confirmation',
          text: 'Are you sure you want to logout?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, logout',
          cancelButtonText: 'Cancel'
        }).then(async (result) => {
          if (result.isConfirmed) {
            if (!isAuthenticated) {
              console.error('Not authenticated for logout');
              // Still navigate to login even without authentication
              navigate('/login');
              return;
            }
            
            // Show loading during logout
            Swal.fire({
              title: 'Logging out...',
              text: 'Please wait',
              icon: 'info',
              allowOutsideClick: false,
              showConfirmButton: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });
            
            // Execute logout using Zustand
            try {
              await authLogout();
              console.log('✅ Logout successful');
              // Close loading and show success message
              Swal.fire({
                title: 'Success!',
                text: 'You have been logged out successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                // Navigate to login page after successful logout
                navigate('/login');
              });
            } catch (error) {
              console.error('❌ Logout failed:', error);
              // Even if logout fails, still navigate to login
              Swal.fire({
                title: 'Logged out',
                text: 'Session cleared locally',
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                navigate('/login');
              });
            }
          }
        });
        break;
      default:
        console.log('Unknown menu item:', menuId);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleRefresh = () => {
    // Force refresh data - Zustand handles token management
    console.log('🔄 Profile data refreshed');
  };

  const isError = (profileError || ledgerError) && !profileLoading && !ledgerLoading;

  // Show loading screen while checking authentication
  if (profileLoading) {
    return (
      <div className="profile-page">
        <AppbarDefault
          title="Profile"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={cartCount}
        />
        <div className="profile-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            background: 'white',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <AppbarDefault
        title="Profile"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div className="profile-content">
        <div 
          className={`user-card ${isError ? 'error-state' : ''}`}
          onClick={isError ? handleRefresh : undefined}
          style={{ cursor: isError ? 'pointer' : 'default' }}
        >
          <div className="user-card-row">
            <div className="user-card-item">
              <div className="user-card-label">POINTS</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? '...' : userData.points}
              </div>
            </div>
            <div className="user-card-item">
              <div className="user-card-label">MEMBERSHIP</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? '...' : userData.membership}
              </div>
            </div>
          </div>

          <div className="user-card-row">
            <div className="user-card-item">
              <div className="user-card-label">NAME</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? 'Loading...' : userData.name}
              </div>
            </div>
            <div className="user-card-item">
              <div className="user-card-label">EXPIRY</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? '...' : userData.expiry}
              </div>
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
