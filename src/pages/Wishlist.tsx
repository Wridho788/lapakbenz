import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFavorite } from 'react-icons/md';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { ProductCard } from '../components/ProductCard';
import { useWishlist, useRemoveFromWishlist } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import './Wishlist.css';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;
  const [refreshing, setRefreshing] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect - just show empty state with message
  }, [isAuthenticated, navigate]);

  // Wishlist hooks
  const { data: wishlistData, isLoading, error, refetch } = useWishlist('50', '0');
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // Setup non-passive touch event listeners for pull-to-refresh
  useEffect(() => {
    const element = pullRef.current;
    if (!element) return;

    window.scrollTo(0, 0);

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isLoading && !refreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current || startY.current === null) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        e.preventDefault();
        setPullDistance(Math.min(diff, 120));
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > PULL_THRESHOLD) {
        triggerRefresh();
      }
      pulling.current = false;
      startY.current = null;
      setTimeout(() => setPullDistance(0), 150);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isLoading, refreshing, pullDistance]);

  const triggerRefresh = useCallback(async () => {
    if (refreshing || isLoading) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [refetch, refreshing, isLoading]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Extract wishlist items from response
  const wishlistItems = wishlistData?.result || wishlistData?.content?.content || wishlistData?.content?.result || [];

  const handleProductClick = (productPermalink: string) => {
    navigate(`/product/${productPermalink}`);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlistMutation.mutateAsync(productId);
      toast.success('Removed from wishlist', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      // Refetch to update the list
      refetch();
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      toast.error('Failed to remove from wishlist', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="wishlist-page">
        <AppbarDefault
          title="Wishlist Produk"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          showCart={false}
          defaultBack="/profile"
        />
        <div className="wishlist-empty">
          <MdFavorite className="empty-icon" />
          <h3>Login Diperlukan</h3>
          <p>Silakan login untuk melihat wishlist Anda</p>
        </div>
        <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
      </div>
    );
  }

  return (
    <div
      className="wishlist-page"
      ref={pullRef}
      style={{ overscrollBehavior: 'contain' }}
    >
      <AppbarDefault
        title="Wishlist Produk"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        showCart={false}
        defaultBack="/profile"
      />

      <div style={{
        height: pullDistance > 0 ? pullDistance : 0,
        transition: pulling.current ? 'none' : 'height 0.2s ease',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#555'
      }}>
        {pullDistance > 0 && (
          (pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh') +
          (refreshing ? ' • refreshing...' : '')
        )}
      </div>

      {/* Loading State */}
      {(isLoading || refreshing) && (
        <div className="wishlist-loading">
          <p>Memuat wishlist...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="wishlist-error">
          <p>Gagal memuat wishlist</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && wishlistItems.length === 0 && (
        <div className="wishlist-empty">
          <MdFavorite className="empty-icon" />
          <h3>Belum Ada Wishlist</h3>
          <p>Produk yang Anda wishlist akan muncul di sini</p>
        </div>
      )}

      {/* Wishlist Grid using ProductCard */}
      {!isLoading && !error && wishlistItems.length > 0 && (
        <div className="wishlist-grid">
          {wishlistItems.map((item: any) => (
            <ProductCard
              key={item.id || item.product_id}
              image={item.url_image + item.image  || '/bea2x.jpg'}
              name={item.name || item.product_name || 'Product'}
              price={item.price || 0}
              rating={item.rating || 0}
              onClick={() => handleProductClick(item.permalink || item.sku || String(item.product_id || item.id || ''))}
              showWishlistRemove={true}
              isWishlisted={true}
              onRemoveWishlist={() => handleRemoveFromWishlist(item.product_id)}
            />
          ))}
        </div>
      )}

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Wishlist;