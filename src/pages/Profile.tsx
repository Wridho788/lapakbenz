import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { useCart } from '../contexts/CartContext';
import { useProfile, useLedger } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import {
  MdPerson,
  // MdPayment,
  MdHistory,
  MdSwapHoriz,
  // MdCardGiftcard,
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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

  // Handle logout with confirmation
  const handleLogout = async () => {
    // Show confirmation toast with custom buttons
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (!confirmLogout) {
      return;
    }

    if (!isAuthenticated) {
      console.error('Not authenticated for logout');
      navigate('/login');
      return;
    }

    setIsLoggingOut(true);
    const loadingToast = toast.info('Keluar...', {
      autoClose: false,
      closeButton: false,
    });

    try {
      await authLogout();
      console.log('✅ Logout successful');
      
      toast.dismiss(loadingToast);
      toast.success('Anda berhasil keluar', {
        autoClose: 1500,
        onClose: () => {
          navigate('/login');
        }
      });
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      toast.dismiss(loadingToast);
      toast.warning('Sesi telah dihapus secara lokal', {
        autoClose: 1500,
        onClose: () => {
          navigate('/login');
        }
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Account menu items
  const accountMenuItems = [
    { id: 'profile', title: 'Profil Saya', icon: MdPerson },
    // { id: 'payment', title: 'Konfirmasi Pembayaran', icon: MdPayment },
    { id: 'event-history', title: 'Riwayat Event Saya', icon: MdHistory },
    { id: 'transaction', title: 'Riwayat Transaksi Saya', icon: MdSwapHoriz },
    // { id: 'redeem', title: 'Riwayat Penukaran Saya', icon: MdCardGiftcard },
    { id: 'password', title: 'Ubah Password', icon: MdLock },
    { id: 'chat', title: 'Live Chat', icon: MdChat },
    { id: 'logout', title: 'Keluar', icon: MdLogout },
  ];

  const handleMenuClick = (menuId: string) => {
    console.log(`Clicked menu: ${menuId}`);
    
    switch (menuId) {
      case 'profile':
        navigate('/profile/my-profile');
        break;
      // case 'payment':
      //   navigate('/profile/payment-confirmation');
      //   break;
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
        window.open('https://wa.me/62813742424', '_blank');
        break;
      case 'logout':
        handleLogout();
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
    toast.info('Memuat ulang data...', { autoClose: 1000 });
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
          defaultBack="/dashboard" 
        />
        <div className="profile-content">
          <div>Loading...</div>
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
              <div className="user-card-label">Poin</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? '...' : userData.points}
              </div>
            </div>
            <div className="user-card-item">
              <div className="user-card-label">Keanggotaan</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? '...' : userData.membership}
              </div>
            </div>
          </div>

          <div className="user-card-row">
            <div className="user-card-item">
              <div className="user-card-label">Nama</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? 'Memuat...' : userData.name}
              </div>
            </div>
            <div className="user-card-item">
              <div className="user-card-label">Berlaku Sampai</div>
              <div className={`user-card-value ${(profileLoading || ledgerLoading) ? 'loading' : ''}`}>
                {(profileLoading || ledgerLoading) ? '...' : userData.expiry}
              </div>
            </div>
          </div>
        </div>

        {/* Membership Benefits Section */}
        <div className="membership-benefits-card">
          <h3 className="membership-title">KEUNTUNGAN KEANGGOTAAN</h3>
          <div className="membership-tabs">
            {membershipTabs.map((tab, index) => (
              <button
                key={tab}
                className={`membership-tab ${activeMembershipTab === index ? 'active' : ''}`}
                onClick={() => setActiveMembershipTab(index)}
              >
                {(() => {
                  switch (tab) {
                    case 'BASIC': return 'BASIC';
                    case 'BRONZE': return 'BRONZE';
                    case 'SILVER': return 'SILVER';
                    case 'GOLD': return 'GOLD';
                    case 'PLATINUM': return 'PLATINUM';
                    default: return tab;
                  }
                })()}
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
                disabled={isLoggingOut && item.id === 'logout'}
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