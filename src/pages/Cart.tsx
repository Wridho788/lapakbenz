import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDelete,
  // MdLocationOn,
  MdPayment,
  MdHome,
  MdClear,
  MdClose,
  MdShoppingCart,
  MdAdd,
  MdRemove,
  MdNotes,
  MdLocalShipping,
  MdCheck,
} from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart as useCartContext } from '../contexts/CartContext';
import { useAuthStore } from '../stores/authStore';
import {
  useCart,
  useRemoveFromCart,
  useAddToCart,
  useSetPickup,
  useCheckoutOrder,
  useVoucherList,
  useSetVoucher,
  useRemoveVoucher,
  useSetPublish,
  useSetNotes,
  useDeleteItemCart,
} from '../api/hooks/index';
// import { useDecodeToken } from '../api/hooks/authHooks';
import type { VoucherItem } from '../api/types';
import { toast } from 'react-toastify';
import { capitalizeWords } from '../utils/format';
import './Cart.css';

interface OrderingStatus {
  isOrdering: boolean;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  processedItems: number;
  totalItems: number;
  error?: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, removeFromCart } = useCartContext();
  const { isAuthenticated, requireAuth } = useAuthStore();

  // Get the referring page from location state or referrer
  const getBackDestination = () => {
    // Priority 1: Check location state for explicit 'from' parameter
    if (location.state?.from) {
      // Validate the path to ensure it's not blank or invalid
      const fromPath = location.state.from;
      if (fromPath && fromPath !== '' && fromPath !== '/') {
        return fromPath;
      }
    }

    // Priority 2: Check document.referrer and map to appropriate routes
    const referrer = document.referrer;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;
        // Map referrer paths to appropriate back destinations
        if (referrerPath.includes('/product-detail')) {
          // Ensure we return the full product detail path
          if (referrerPath.startsWith('/product-detail/')) {
            return referrerPath;
          }
          return '/product'; // Fallback to product list if path is malformed
        }
        if (referrerPath.includes('/product')) return '/product';
        if (referrerPath.includes('/dashboard')) return '/dashboard';
        if (referrerPath.includes('/event-detail')) return referrerPath; // Return to specific event detail
        if (referrerPath.includes('/event')) return '/event';
        if (referrerPath.includes('/profile')) return '/profile';
        if (referrerPath.includes('/invoice')) return '/orders'; // Invoice should go to orders
        if (referrerPath.includes('/orders')) return '/orders';
        if (referrerPath.includes('/checkout')) return '/product'; // Checkout should go back to products
        if (referrerPath === '/' || referrerPath === '') return '/dashboard';

        // Return the referrer path if it's a valid route and not empty
        if (referrerPath && referrerPath !== '' && referrerPath !== '/') {
          return referrerPath;
        }
      } catch (error) {
        console.warn('📍 Error parsing referrer URL:', error);
      }
    }

    // Priority 3: Check if we have product info in location state
    if (location.state?.productId) {
      return `/product-detail/${location.state.productId}`;
    }

    // Priority 4: Default fallback - use product page instead of dashboard for better UX
    return '/product';
  };

  const backDestination = getBackDestination();
  // const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  // const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [orderingStatus, setOrderingStatus] = useState<OrderingStatus>({
    isOrdering: false,
    currentStep: '',
    totalSteps: 3,
    currentStepNumber: 0,
    processedItems: 0,
    totalItems: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // API hooks for cart
  const {
    data: apiCartData,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCart();

  const removeAllFromCartMutation = useRemoveFromCart();
  const addToCartMutation = useAddToCart();
  const setPickupMutation = useSetPickup();
  const setPublishMutation = useSetPublish();
  const setNotesMutation = useSetNotes();
  const deleteItemCartMutation = useDeleteItemCart();

  // Order API hooks
  const checkoutOrderMutation = useCheckoutOrder();

  const {
    data: voucherData,
    isLoading: voucherLoading,
    error: voucherError,
    refetch: refetchVouchers,
  } = useVoucherList();

  const setVoucherMutation = useSetVoucher();
  const removeVoucherMutation = useRemoveVoucher();
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);

  // Notes editing state
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  // Shipping options popup state
  const [showShippingOptions, setShowShippingOptions] = useState<string | null>(null);

  // Decode token hook untuk mendapatkan cost data
  // const { data: decodeTokenData } = useDecodeToken();

  // Refetch cart data when component mounts to ensure fresh data
  useEffect(() => {
    if (isAuthenticated) {
      refetchCart();
      refetchVouchers();
    }
  }, [isAuthenticated, refetchCart, refetchVouchers]);

  useEffect(() => {
    const selectedId = voucherData?.content?.selected_voucher?.id;
    setSelectedVoucherId(selectedId ? String(selectedId) : null);
  }, [voucherData]);

  const apiSelectedVoucherId = voucherData?.content?.selected_voucher?.id;
  const currentVoucherId =
    selectedVoucherId ?? (apiSelectedVoucherId ? String(apiSelectedVoucherId) : null);

  const selectedVoucher =
    voucherData?.content?.selected_voucher
      ? {
          ...voucherData.content.selected_voucher,
          id: String(voucherData.content.selected_voucher.id),
        }
      : voucherData?.content?.voucher?.find((voucher) => voucher.id === currentVoucherId) ?? null;

  // Refetch cart data when window regains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && document.visibilityState === 'visible') {
        refetchCart();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isAuthenticated, refetchCart, refetchVouchers]);

  // Refetch cart data when location changes (navigating to cart)
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/cart') {
      // Small delay to ensure any pending operations complete
      const timer = setTimeout(() => {
        refetchCart();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, isAuthenticated, refetchCart]);

  // Handle quantity change for API cart items
  const handleQuantityChange = async (item: any, newQuantity: number) => {
    if (!requireAuth(() => {}, 'update cart quantity')) {
      toast.warning('Silakan login untuk mengubah keranjang', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    if (newQuantity <= 0) {
      handleRemoveItem(item.id);
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        data: {
          product_id: Number(item.sku),
          qty: newQuantity,
        },
      });

      refetchCart();
    } catch (error: any) {
      toast.error('Gagal memperbarui jumlah item. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleBackClick = () => {
    // Navigate to the determined back destination
    navigate(backDestination);
  };

  const handleCartClick = () => {
    console.log('Already in cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!requireAuth(() => {}, 'remove cart item')) {
      toast.warning('Silakan login untuk mengelola keranjang', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    try {
      // Find the item to get its details for the success message
      const itemToRemove = apiCartData?.content?.result?.find((item) => item.id === itemId);
      const itemName = itemToRemove?.name || 'Item';

      // Use deleteItemCart hook to remove specific item via API
      await deleteItemCartMutation.mutateAsync(itemId);

      // Remove from context cart (for immediate UI update)
      removeFromCart(itemId);

      // Show success message with item name
      toast.success(`${capitalizeWords(itemName)} telah dihapus dari keranjang`, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });

      // Refresh cart data from API
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to remove item:', error);
      toast.error('Gagal menghapus item. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleSelectVoucher = async (voucher: VoucherItem) => {
    if (!requireAuth(() => {}, 'gunakan voucher')) {
      toast.warning('Silakan login untuk menggunakan voucher', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    if (!canApplyVoucher) {
      toast.warning('Pilih item terlebih dahulu sebelum menggunakan voucher.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    try {
      const response = await setVoucherMutation.mutateAsync({
        data: {
          id: voucher.id,
        },
      });

      setSelectedVoucherId(voucher.id);
      setVoucherDiscount(response?.discount ?? 0);
      toast.success(`Voucher "${voucher.name}" berhasil diterapkan`, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      refetchCart();
      refetchVouchers();
    } catch (error: any) {
      console.error('❌ Failed to set voucher:', error);
      toast.error(error?.message || 'Gagal menerapkan voucher. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleRemoveVoucher = async () => {
    if (!currentVoucherId) return;

    try {
      await removeVoucherMutation.mutateAsync(currentVoucherId);
      setSelectedVoucherId(null);
      setVoucherDiscount(0);
      toast.success('Voucher berhasil dihapus', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      refetchCart();
      refetchVouchers();
    } catch (error: any) {
      console.error('❌ Failed to remove voucher:', error);
      toast.error('Gagal menghapus voucher. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  // const handlePickupToggle = async (isPickup: boolean) => {
  //   if (!requireAuth(() => {}, 'change pickup option')) {
  //     toast.warning('Silakan login untuk mengubah opsi pengambilan', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     navigate('/login');
  //     return;
  //   }

  //   const cartItems = apiCartData?.content?.result || [];

  //   if (cartItems.length === 0) {
  //     toast.warning('Keranjang kosong', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     return;
  //   }

  //   try {
  //     const promises = cartItems.map(item =>
  //       setPickupMutation.mutateAsync(item.id)
  //     );

  //     await Promise.all(promises);

  //     toast.success(
  //       isPickup
  //         ? `Berhasil mengatur pengambilan sendiri untuk ${cartItems.length} produk`
  //         : `Berhasil mengatur pengiriman untuk ${cartItems.length} produk`,
  //       {
  //         position: 'bottom-right',
  //         autoClose: 1500,
  //         theme: 'dark',
  //       }
  //     );

  //     // Refresh cart data to get updated pickup status and shipping costs
  //     refetchCart();
  //   } catch (error: any) {
  //     console.error('❌ Failed to set pickup option:', error);
  //     toast.error('Gagal mengubah opsi pengambilan. Silakan coba lagi.', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //   }
  // };

  // Handle publish checkbox toggle for a cart item
  const handlePublishToggle = async (itemId: string, isPublished: boolean) => {
    if (!requireAuth(() => {}, 'update publish status')) {
      toast.warning('Silakan login untuk mengubah status', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    try {
      await setPublishMutation.mutateAsync(itemId);
      toast.success(isPublished ? 'Item tidak dipilih' : 'Item dipilih untuk diproses', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to toggle publish:', error);
      toast.error('Gagal mengubah status. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  // Handle add notes button click
  const handleAddNotes = (itemId: string, currentNote: string) => {
    setEditingNotesItemId(itemId);
    setNotesText(currentNote || '');
  };

  // Handle save notes
  const handleSaveNotes = async (itemId: string) => {
    if (!requireAuth(() => {}, 'save notes')) {
      toast.warning('Silakan login untuk menyimpan catatan', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    try {
      await setNotesMutation.mutateAsync({ cartId: itemId, notes: notesText });
      toast.success('Catatan berhasil disimpan', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      setEditingNotesItemId(null);
      setNotesText('');
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to save notes:', error);
      toast.error('Gagal menyimpan catatan. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  // Handle cancel notes editing
  const handleCancelNotes = () => {
    setEditingNotesItemId(null);
    setNotesText('');
  };

  // Handle per-item shipping option toggle
  const handleItemShippingToggle = async (itemId: string, isPickup: boolean) => {
    if (!requireAuth(() => {}, 'change delivery option')) {
      toast.warning('Silakan login untuk mengubah opsi pengiriman', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    try {
      await setPickupMutation.mutateAsync(itemId);
      toast.success(
        isPickup
          ? 'Opsi pengambilan sendiri berhasil diterapkan'
          : 'Opsi pengiriman berhasil diterapkan',
        {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        },
      );
      refetchCart();
      setShowShippingOptions(null);
    } catch (error: any) {
      console.error('❌ Failed to toggle item shipping:', error);
      toast.error('Gagal mengubah opsi pengiriman. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleRemoveAllFromCart = async () => {
    if (!requireAuth(() => {}, 'clear cart')) {
      toast.warning('Silakan login untuk mengelola keranjang Anda', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    // Show confirmation toast with buttons
    toast(
      ({ closeToast }) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: '12px', fontWeight: '500' }}>
            Yakin ingin menghapus semua item dari keranjang?
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                closeToast();
              }}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Batal
            </button>
            <button
              onClick={async () => {
                closeToast();
                await performRemoveAll();
              }}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Hapus Semua
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      },
    );
  };

  const performRemoveAll = async () => {
    try {
      await removeAllFromCartMutation.mutateAsync();

      toast.success('Semua item telah dihapus dari keranjang Anda', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to clear cart:', error);

      let errorMessage = 'Gagal mengosongkan keranjang. Silakan coba lagi.';

      if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };
  const getSelectedItems = () => {
    return apiCartData?.content?.result?.filter((item) => item.publish === '1') || [];
  };

  const getApiCartTotal = () => {
    return getSelectedItems().reduce((total, item) => total + item.amount, 0) || 0;
  };

  const getApiCartCount = () => {
    return getSelectedItems().reduce((total, item) => total + item.qty, 0) || 0;
  };

  const getShippingCost = () => {
    return getSelectedItems().reduce((total, item) => total + (item.shipping || 0), 0) || 0;
  };

  const getCostFromToken = () => {
    return apiCartData?.content?.cost || 0;
  };

  const selectedItems = getSelectedItems();
  const selectedItemCount = selectedItems.length;
  const hasSelectedCartItems = selectedItemCount > 0;
  const canApplyVoucher = hasSelectedCartItems;

  const subtotal = getApiCartTotal();
  const apiCartCount = getApiCartCount();
  const shippingCost = getShippingCost();
  const costFromToken = getCostFromToken();
  const paymentFee = 0;
  const baseTotal = subtotal;

  const selectedVoucherValue = Number(selectedVoucher?.value ?? 0);
  const selectedVoucherDiscount = canApplyVoucher
    ? voucherDiscount > 0
      ? voucherDiscount
      : selectedVoucher
        ? selectedVoucher.type === 'percent'
          ? Math.floor((baseTotal + shippingCost + costFromToken + paymentFee) * (selectedVoucherValue / 100))
          : selectedVoucherValue
        : 0
    : 0;

  const totalPayment = Math.max(
    baseTotal + shippingCost + costFromToken + paymentFee - selectedVoucherDiscount,
    0,
  );
  // New order flow function
  const handlePlaceOrder = async () => {
    if (!requireAuth(() => {}, 'place order')) {
      toast.warning('Silakan login untuk melakukan pemesanan', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    if (!hasSelectedCartItems) {
      toast.warning('Pilih setidaknya satu item untuk melanjutkan checkout.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    const cartItems = apiCartData?.content?.result || [];

    // Initialize ordering status
    setOrderingStatus({
      isOrdering: true,
      currentStep: 'Creating Order...',
      totalSteps: 3,
      currentStepNumber: 1,
      processedItems: 0,
      totalItems: cartItems.length,
    });

    try {
      // Checkout Order (useCheckoutOrder handles order creation)
      setOrderingStatus({
        isOrdering: true,
        currentStep: 'Processing Checkout...',
        totalSteps: 2,
        currentStepNumber: 1,
        processedItems: 0,
        totalItems: cartItems.length,
      });

      const checkoutResponse = await checkoutOrderMutation.mutateAsync();

      // Handle direct response format: { order_code, link_url }
      const orderCode = checkoutResponse?.order_code || checkoutResponse?.content?.order_code;
      const linkUrl = checkoutResponse?.link_url || checkoutResponse?.content?.link_url;
      const returnedOrderId = checkoutResponse?.content?.orderid;

      // Reset ordering status
      setOrderingStatus({
        isOrdering: false,
        currentStep: '',
        totalSteps: 3,
        currentStepNumber: 0,
        processedItems: 0,
        totalItems: 0,
      });

      // Check if we have order_code and link_url in the response
      if (orderCode && linkUrl) {
        refetchCart();

        // Navigate to invoice page with order_code and link_url
        navigate('/invoice', {
          state: {
            orderCode: orderCode,
            linkUrl: linkUrl,
            orderId: returnedOrderId || orderCode,
          },
        });
        return;
      }

      // Show success message if no link_url (fallback)
      toast.success(`Pesanan #${returnedOrderId || orderCode} telah dibuat dan sedang diproses.`, {
        position: 'bottom-right',
        autoClose: 3000,
        theme: 'dark',
      });
      refetchCart();

      // Navigate to orders page or home
      navigate('/orders');
    } catch (error: any) {
      console.error('❌ Order process failed:', error);

      setOrderingStatus((prev) => ({
        ...prev,
        isOrdering: false,
        error: error.message,
      }));

      toast.error(error.message || 'Gagal melakukan pemesanan. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const hasApiCartItems = apiCartData?.content?.result && apiCartData.content.result.length > 0;

  if ((!hasApiCartItems && !cartLoading) || apiCartData?.content?.result == null) {
    return (
      <div className="cart-page">
        <AppbarDefault
          title="Keranjang Belanja"
          onBack={handleBackClick}
          backTo={backDestination}
          onCartClick={handleCartClick}
          cartCount={cartCount}
          defaultBack="/dashboard"
        />

        <div className="cart-content">
          <div className="empty-cart">
            <img src="/nodata.png" alt="Empty Cart" className="empty-icon" />
            <h3>Keranjang Anda Kosong</h3>
            <p>Tambahkan produk ke keranjang untuk mulai belanja!</p>
            <div className="empty-cart-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/product')}>
                Lanjut Belanja
              </button>
              <button className="home-btn" onClick={() => navigate('/')}>
                <MdHome /> Ke Beranda
              </button>
            </div>
          </div>
        </div>

        <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
      </div>
    );
  }

  return (
    <>
      {/* Ordering Status Modal */}
      {orderingStatus.isOrdering && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '350px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #161129',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }}
            ></div>

            <h3
              style={{
                margin: '0 0 15px 0',
                color: '#161129',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              Processing Order
            </h3>

            <p
              style={{
                margin: '0 0 20px 0',
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.4',
              }}
            >
              {orderingStatus.currentStep}
            </p>

            <div
              style={{
                background: '#f8f9ff',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                <span>
                  Step {orderingStatus.currentStepNumber} of {orderingStatus.totalSteps}
                </span>
                <span>
                  {orderingStatus.processedItems}/{orderingStatus.totalItems} items
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(orderingStatus.currentStepNumber / orderingStatus.totalSteps) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #161129, #2c5aa0)',
                    transition: 'width 0.3s ease',
                  }}
                ></div>
              </div>
            </div>

            <p
              style={{
                margin: '0',
                color: '#999',
                fontSize: '12px',
              }}
            >
              Please wait, do not close this page
            </p>
          </div>
        </div>
      )}

      <div className="cart-page">
        <AppbarDefault
          title={`Keranjang Belanja (${apiCartCount})`}
          onBack={handleBackClick}
          backTo={backDestination}
          onCartClick={handleCartClick}
          cartCount={apiCartCount}
        />

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header">
              <h3>Daftar Belanja</h3>
              {hasApiCartItems && (
                <button
                  className="remove-all-btn"
                  onClick={handleRemoveAllFromCart}
                  disabled={removeAllFromCartMutation.isPending}
                  title="Hapus semua item dari keranjang"
                >
                  <MdClear />
                  <span>
                    {removeAllFromCartMutation.isPending ? 'Menghapus...' : 'Hapus Semua'}
                  </span>
                </button>
              )}
            </div>

            {/* Loading State */}
            {cartLoading && isAuthenticated && (
              <div className="cart-loading">
                <p>Memuat daftar belanja...</p>
              </div>
            )}

            {/* Error State */}
            {cartError && isAuthenticated && (
              <div className="cart-error">
                <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>
                  Gagal memuat keranjang dari server
                </p>
                <button
                  onClick={() => refetchCart()}
                  style={{
                    background: '#161129',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* API Cart Items */}
            {apiCartData?.content?.result?.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-content">
                  {/* Checkbox for publish status */}
                  <div
                    className={`item-checkbox ${item.publish === '1' ? 'checked' : ''}`}
                    onClick={() => handlePublishToggle(`${item.id}`, item.publish === '1')}
                    role="checkbox"
                    aria-checked={item.publish === '1'}
                    title={
                      item.publish === '1'
                        ? 'Klik untuk hapus dari publikasi'
                        : 'Klik untuk publikasikan'
                    }
                  >
                    {item.publish === '1' && <MdCheck size={16} />}
                  </div>

                  {/* Left Column - Product Image */}
                  <div className="item-image-column">
                    <img
                      src={
                        item.product_url_image && item.product_image
                          ? `${item.product_url_image}${item.product_image}`
                          : item.image || '/nodata.png'
                      }
                      alt={item.product_name || item.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/nodata.png';
                      }}
                    />
                  </div>

                  {/* Right Column - Product Info */}
                  <div className="item-info-column">
                    <div className="product-details">
                      <h4 className="item-title">{capitalizeWords(item.name)}</h4>
                      <p className="item-price">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

                    {/* Action buttons: Notes & Shipping Options */}
                    <div className="item-action-buttons">
                      <button
                        className={`action-btn notes-btn ${item.note ? 'has-notes' : ''}`}
                        onClick={() => handleAddNotes(`${item.id}`, item.note || '')}
                        title={item.note ? 'Lihat/Edit Catatan' : 'Tambah Catatan'}
                      >
                        <MdNotes size={16} />
                        <span>{item.note ? 'Catatan' : 'Catatan'}</span>
                      </button>
                      <button
                        className="action-btn shipping-btn"
                        onClick={() =>
                          setShowShippingOptions(
                            showShippingOptions === `${item.id}` ? null : `${item.id}`,
                          )
                        }
                        title="Opsi Pengiriman"
                      >
                        <MdLocalShipping size={16} />
                        <span>{item.pickup === '1' ? 'Ambil' : 'Kirim'}</span>
                      </button>
                    </div>

                    {/* Shipping Options Popup */}
                    {showShippingOptions === `${item.id}` && (
                      <div className="shipping-options-popup">
                        <div className="shipping-options-header">Opsi Pengiriman</div>
                        <button
                          className={`shipping-option ${item.pickup === '0' ? 'selected' : ''}`}
                          onClick={() => handleItemShippingToggle(`${item.id}`, false)}
                        >
                          <MdLocalShipping size={16} />
                          <span>Kirim (Rp {(item.shipping || 0).toLocaleString('id-ID')})</span>
                        </button>
                        <button
                          className={`shipping-option ${item.pickup === '1' ? 'selected' : ''}`}
                          onClick={() => handleItemShippingToggle(`${item.id}`, true)}
                        >
                          <MdHome size={16} />
                          <span>Ambil Sendiri</span>
                        </button>
                        <button
                          className="shipping-options-close"
                          onClick={() => setShowShippingOptions(null)}
                        >
                          Batal
                        </button>
                      </div>
                    )}

                    {/* Notes Textarea */}
                    {editingNotesItemId === `${item.id}` && (
                      <div className="notes-editor">
                        <textarea
                          className="notes-textarea"
                          placeholder="Tambahkan catatan untuk item ini..."
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          rows={3}
                        />
                        <div className="notes-actions">
                          <button className="notes-cancel-btn" onClick={handleCancelNotes}>
                            Batal
                          </button>
                          <button
                            className="notes-save-btn"
                            onClick={() => handleSaveNotes(`${item.id}`)}
                            disabled={setNotesMutation.isPending}
                          >
                            {setNotesMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show existing note if not editing */}
                    {item.note && editingNotesItemId !== `${item.id}` && (
                      <div className="item-note-preview">
                        <MdNotes size={14} />
                        <span>{item.note}</span>
                      </div>
                    )}

                    <div className="quantity-and-remove-section">
                      <div className="quantity-section">
                        <div
                          className="quantity-btn decrease"
                          onClick={() => handleQuantityChange(item, item.qty - 1)}
                          style={{
                            opacity: item.qty <= 1 ? 0.5 : 1,
                            pointerEvents: item.qty <= 1 ? 'none' : 'auto',
                          }}
                        >
                          <MdRemove />
                        </div>
                        <span className="quantity-value">{item.qty}</span>
                        <div
                          className="quantity-btn increase"
                          onClick={() => handleQuantityChange(item, item.qty + 1)}
                        >
                          <MdAdd />
                        </div>
                      </div>

                      <div
                        className="remove-btn-inline"
                        onClick={() => handleRemoveItem(`${item.id}`)}
                        aria-label="Hapus item"
                        title="Hapus item dari keranjang"
                      >
                        <MdDelete />
                      </div>
                    </div>

                    <div className="item-total-section">
                      <span className="item-total-label">Total:</span>
                      <span className="item-total">Rp {item.amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          {/* Pickup Options Section */}
          {/* <div className="pickup-options-section">
            <h3>Opsi Pengiriman</h3>
            
            <div className="pickup-global-options">
              <div className="pickup-radio-group">
                <label className="pickup-radio-option">
                  <input
                    type="radio"
                    name="pickup-global"
                    checked={apiCartData?.content?.result?.every(item => item.pickup === "1") || false}
                    onChange={() => handlePickupToggle(true)}
                    className="pickup-radio-input"
                  />
                  <span className="pickup-radio-label">Ambil Sendiri</span>
                  <span className="pickup-radio-desc">Gratis - Untuk semua produk</span>
                </label>
                
                <label className="pickup-radio-option">
                  <input
                    type="radio"
                    name="pickup-global"
                    checked={apiCartData?.content?.result?.every(item => item.pickup === "0") || false}
                    onChange={() => handlePickupToggle(false)}
                    className="pickup-radio-input"
                  />
                  <span className="pickup-radio-label">Pakai Ongkir</span>
                  <span className="pickup-radio-desc">
                    {shippingCost > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')} - Untuk semua produk` : 'Untuk semua produk'}
                  </span>
                </label>
              </div>
            </div>

            <div className="pickup-items-list">
              <h4>Produk dalam keranjang:</h4>
              <div className="pickup-items">
                {apiCartData?.content?.result?.map((item) => (
                  <div key={item.id} className="pickup-item-display">
                    <div className="pickup-item-info">
                      <img 
                        src={item.image || '/nodata.png'} 
                        alt={item.name}
                        className="pickup-item-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/nodata.png';
                        }}
                      />
                      <div className="pickup-item-details">
                        <h4 className="pickup-item-name">{capitalizeWords(item.name)}</h4>
                        <p className="pickup-item-qty">Qty: {item.qty}</p>
                        <p className="pickup-item-status">
                          Status: {item.pickup === "1" ?
                            <span className="status-pickup">📦 Ambil Sendiri</span> :
                            <span className="status-shipping">🚚 Kirim (Rp {item.shipping.toLocaleString('id-ID')})</span>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}

          {/* Voucher Selection Section */}
          <div className="voucher-section">
            <div className="voucher-section-header">
              <h3>Pilih Voucher</h3>
            </div>

            {selectedVoucher && (
              <div className="voucher-summary-card selected-voucher-card">
                <div className="voucher-summary-left">
                  <div className="voucher-summary-thumb">
                    <img
                      src={selectedVoucher.image || '/nodata.png'}
                      alt={selectedVoucher.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/nodata.png';
                      }}
                    />
                  </div>
                  <div className="voucher-summary-info">
                    <span className="voucher-summary-label">Voucher Terpilih</span>
                    <span className="voucher-summary-name">{selectedVoucher.name}</span>
                    {selectedVoucher.code && (
                      <span className="voucher-summary-code">{selectedVoucher.code}</span>
                    )}
                  </div>
                </div>
                <button
                  className="remove-voucher-btn"
                  onClick={handleRemoveVoucher}
                  disabled={removeVoucherMutation.isPending}
                  title="Hapus voucher"
                >
                  {removeVoucherMutation.isPending ? (
                    <span className="remove-spinner" />
                  ) : (
                    <>
                      <MdClose /> Hapus
                    </>
                  )}
                </button>
              </div>
            )}

            {voucherLoading && (
              <div className="voucher-loading">
                <p>Memuat voucher...</p>
              </div>
            )}

            {!canApplyVoucher && !voucherLoading && (
              <div className="voucher-warning">
                <p>Centang minimal satu item agar voucher dapat digunakan.</p>
              </div>
            )}

            {voucherError && (
              <div className="cart-error">
                <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>
                  Gagal memuat voucher. Silakan coba lagi.
                </p>
                <button
                  onClick={() => refetchVouchers()}
                  style={{
                    background: '#161129',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Muat Ulang Voucher
                </button>
              </div>
            )}

            {voucherData?.content?.voucher?.length ? (
              <div className="voucher-grid">
                {voucherData.content.voucher.map((voucher) => {
                  const isSelected = voucher.id === currentVoucherId;

                  return (
                    <button
                      key={voucher.id}
                      type="button"
                      className={`voucher-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectVoucher(voucher)}
                      disabled={setVoucherMutation.isPending || !canApplyVoucher}
                    >
                      <div className="voucher-image">
                        <img
                          src={voucher.image || '/nodata.png'}
                          alt={voucher.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/nodata.png';
                          }}
                        />
                      </div>
                      <div className="voucher-details">
                        <div className="voucher-name">{voucher.name}</div>
                        {voucher.description ? (
                          <div className="voucher-description">{voucher.description}</div>
                        ) : null}
                        <div className="voucher-meta">
                          {voucher.code ? (
                            <span className="voucher-code">{voucher.code}</span>
                          ) : null}
                          {voucher.value ? (
                            <span className="voucher-value">
                              {voucher.type === 'percent'
                                ? `${voucher.value}%`
                                : `Rp ${voucher.value.toLocaleString('id-ID')}`}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {isSelected && <span className="voucher-badge">✓</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              !voucherLoading && (
                <p style={{ margin: 0, color: '#666' }}>Tidak ada voucher tersedia saat ini.</p>
              )
            )}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Ringkasan Pesanan</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({apiCartCount} item)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              {shippingCost > 0 && (
                <div className="summary-row">
                  <span>Biaya Pengiriman</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
              )}
              {selectedVoucherDiscount > 0 && (
                <div className="summary-row discount">
                  <span>
                    Diskon Voucher
                    {selectedVoucher?.type === 'percent' && selectedVoucherValue > 0
                      ? ` (${selectedVoucherValue}%)`
                      : ''}
                  </span>
                  <span>-Rp {selectedVoucherDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {costFromToken > 0 && (
                <div className="summary-row">
                  <span>Biaya Layanan</span>
                  <span>Rp {costFromToken.toLocaleString('id-ID')}</span>
                </div>
              )}

              {paymentFee > 0 && (
                <div className="summary-row">
                  <span>Biaya Pembayaran</span>
                  <span>Rp {paymentFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Bayar</span>
                <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="checkout-section">
            <button
              className="checkout-btn"
              onClick={handlePlaceOrder}
              disabled={orderingStatus.isOrdering || !hasSelectedCartItems}
            >
              {orderingStatus.isOrdering ? (
                <>
                  <div className="spinner"></div>
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <MdPayment size={24} />
                  <span>Checkout</span>
                  <span className="checkout-total">Rp {totalPayment.toLocaleString('id-ID')}</span>
                </>
              )}
            </button>
            <div className="checkout-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/product')}>
                <MdShoppingCart size={20} />
                <span>Lanjut Belanja</span>
              </button>
              <button className="home-btn" onClick={() => navigate('/')}>
                <MdHome size={20} />
                <span>Ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Cart;
