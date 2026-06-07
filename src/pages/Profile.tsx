import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { useProfile, useLedger, useCart, useLogout } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import {
  MdPerson,
  MdHistory,
  MdSwapHoriz,
  MdLock,
  MdChat,
  MdLogout,
  MdChevronRight,
  MdFavorite,
} from 'react-icons/md';
import './Profile.css';
import { FAB } from '../components/FAB';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeMembershipTab, setActiveMembershipTab] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Auth state
  const { isAuthenticated, logout: authLogout } = useAuthStore();
  const logoutMutation = useLogout();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // API hooks
  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError } = useLedger();
  const { data: apiCartData } = useCart();

  const membershipTabs = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart', { state: { from: '/profile' } });
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
    if (ledgerData?.content?.balance !== undefined) {
      points = ledgerData.content.balance;
    }

    // Extract profile data
    let name = defaultData.name;
    let membership = defaultData.membership;
    let expiry = defaultData.expiry;
    let memberNo = defaultData.memberNo;

    const profile = profileData?.result;
    if (profile) {
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
        } catch {
          expiry = profile.expired;
        }
      }  else {
        // Check if membership has no expiry (like lifetime membership)
        if (profile.type === 'member' && profile.premium === 0) {
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
      position: 'bottom-right',
      autoClose: false,
      closeButton: false,
      theme: 'dark',
    });

    try {
      await logoutMutation.mutateAsync();
      toast.dismiss(loadingToast);
      toast.success('Anda berhasil keluar', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
        onClose: () => {
          navigate('/login');
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.dismiss(loadingToast);
      authLogout();
      toast.error('Gagal keluar dari server, sesi lokal dibersihkan', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
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
    { id: 'wishlist', title: 'Wishlist Produk', icon: MdFavorite },
    { id: 'password', title: 'Ubah Password', icon: MdLock },
    { id: 'chat', title: 'Live Chat', icon: MdChat },
    { id: 'logout', title: 'Keluar', icon: MdLogout },
  ];

  const handleMenuClick = (menuId: string) => {
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
        navigate('/orders');
        break;
      case 'redeem':
        navigate('/profile/redeem-history');
        break;
      case 'wishlist':
        navigate('/profile/wishlist');
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
        // console.log('Unknown menu item:', menuId);
    }
  };

  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };
  
      const apiCartCount = getApiCartCount();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleRefresh = () => {
    // Force refresh data - Zustand handles token management
    toast.info('Memuat ulang data...', { 
      position: 'bottom-right',
      autoClose: 1500,
      theme: 'dark',
    });
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
          cartCount={apiCartCount}
          defaultBack="/dashboard" 
        />
        <div className="profile-">
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
        cartCount={apiCartCount}
      />

      <div className="profile-">
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

          <div className="membership-">
            {/*  for each membership tier will go here */}
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