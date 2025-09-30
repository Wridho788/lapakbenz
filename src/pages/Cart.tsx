import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDelete,
  // MdLocationOn,
  MdPayment,
  MdHome,
  MdClear,
  MdShoppingCart,
  MdAdd,
  MdRemove,
} from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart as useCartContext } from '../contexts/CartContext';
import { useAuthStore } from '../stores/authStore';
import { useCart, useRemoveFromCart, useAddToCart } from '../api/hooks';
import { useAddOrder, useAddItemToOrder, useCheckoutOrder } from '../api/ordersApi';
import Swal from 'sweetalert2';
import './Cart.css';

// interface ShippingAddress {
//   name: string;
//   phone: string;
//   address: string;
//   city: string;
//   zipCode: string;
// }

// interface PaymentMethod {
//   id: string;
//   name: string;
//   type: 'bank' | 'ewallet' | 'cod';
//   fee: number;
// }

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
  const { cartCount, removeFromCart } = useCartContext();
  const { isAuthenticated, token: authToken, requireAuth } = useAuthStore();
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

  // Order API hooks
  const addOrderMutation = useAddOrder();
  const addItemToOrderMutation = useAddItemToOrder();
  const checkoutOrderMutation = useCheckoutOrder();

  // Handle quantity change for API cart items
  const handleQuantityChange = async (item: any, newQuantity: number) => {
    if (!requireAuth(() => {}, 'update cart quantity')) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login untuk mengubah keranjang',
        confirmButtonColor: '#f39c12',
      });
      navigate('/login');
      return;
    }

    if (newQuantity <= 0) {
      handleRemoveItem(item.id);
      return;
    }

    try {
      console.log('🔄 Updating quantity for item:', item.sku, 'to:', newQuantity);

      await addToCartMutation.mutateAsync({
        data: {
          sku: item.sku,
          qty: newQuantity.toString(),
        },
      });

      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to update quantity:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui',
        text: 'Gagal memperbarui jumlah item. Silakan coba lagi.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Log cart API data
  useEffect(() => {
    if (apiCartData) {
      console.log('🛒 Cart API Response:', apiCartData);
      console.log('🛒 Cart Items:', apiCartData?.content?.result);
      console.log('🛒 Cart Balance:', apiCartData?.content?.balance);
      console.log('🛒 Cart Record Count:', apiCartData?.content?.record);
    }
  }, [apiCartData]);

  // Log cart errors
  useEffect(() => {
    if (cartError) {
      console.error('❌ Cart API Error:', cartError);
    }
  }, [cartError]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Already in cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleRemoveAllFromCart = async () => {
    if (!requireAuth(() => {}, 'clear cart')) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login untuk mengelola keranjang Anda',
        confirmButtonColor: '#f39c12',
      });
      navigate('/login');
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Semua Item?',
      text: 'Apakah Anda yakin ingin menghapus semua item dari keranjang? Tindakan ini tidak dapat dibatalkan.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus semua',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      console.log('🗑️ Removing all items from cart...');

      await removeAllFromCartMutation.mutateAsync(authToken!);

      await Swal.fire({
        icon: 'success',
        title: 'Keranjang Kosong!',
        text: 'Semua item telah dihapus dari keranjang Anda',
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true,
      });

      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to clear cart:', error);

  let errorMessage = 'Gagal mengosongkan keranjang. Silakan coba lagi.';

      if (error?.message) {
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Gagal Mengosongkan Keranjang',
        text: errorMessage,
        confirmButtonColor: '#d33',
      });
    }
  };

  // Calculate total from API cart only
  const getApiCartTotal = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.amount, 0) || 0;
  };

  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };

  const subtotal = getApiCartTotal();
  const apiCartCount = getApiCartCount();
  const shippingFee = 15000;
  const paymentFee =  0;
  const totalPayment = subtotal + shippingFee + paymentFee;

  // New order flow function
  const handlePlaceOrder = async () => {
    if (!requireAuth(() => {}, 'place order')) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login untuk melakukan pemesanan',
        confirmButtonColor: '#f39c12',
      });
      navigate('/login');
      return;
    }

    // if (!selectedAddress) {
    //   await Swal.fire({
    //     icon: 'warning',
    //     title: 'Address Required',
    //     text: 'Please select a shipping address',
    //     confirmButtonColor: '#f39c12',
    //   });
    //   return;
    // }

    // if (!selectedPayment) {
    //   await Swal.fire({
    //     icon: 'warning',
    //     title: 'Payment Method Required',
    //     text: 'Please select a payment method',
    //     confirmButtonColor: '#f39c12',
    //   });
    //   return;
    // }

    if (!hasApiCartItems) {
      await Swal.fire({
        icon: 'warning',
        title: 'Keranjang Kosong',
        text: 'Keranjang Anda kosong',
        confirmButtonColor: '#f39c12',
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

    console.log('🚀 Starting order process...');
    console.log('📦 Cart items to process:', cartItems);
    console.log('💰 Total payment:', totalPayment);

    try {
      // Step 1: Create Order (useAddOrder)
      console.log('📝 Step 1: Creating new order...');
      const orderResponse = await addOrderMutation.mutateAsync(authToken!);
      
      if (!orderResponse?.content?.id) {
        throw new Error('Failed to create order - no order ID returned');
      }

      const orderId = orderResponse.content.id;
      console.log('✅ Step 1 completed: Order created with ID:', orderId);
      console.log('📋 Order details:', orderResponse.content);

      // Step 2: Add Items to Order (useAddItemToOrder)
      setOrderingStatus(prev => ({
        ...prev,
        currentStep: 'Adding Items to Order...',
        currentStepNumber: 2,
      }));

      console.log('📦 Step 2: Adding items to order...');
      console.log(`🔄 Processing ${cartItems.length} items...`);

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        
        console.log(`📦 Processing item ${i + 1}/${cartItems.length}:`, {
          sku: item.sku,
          name: item.name,
          quantity: item.qty,
          price: item.price
        });

        // Update status for each item
        setOrderingStatus(prev => ({
          ...prev,
          processedItems: i,
          currentStep: `Adding Item ${i + 1}/${cartItems.length}: ${item.name}...`,
        }));

        const itemPayload = {
          cproduct: item.sku,
          ctax: '0',
          tqty: item.qty.toString(),
          tdiscount: '0',
        };

        console.log(`📤 Sending item payload:`, itemPayload);

        try {
          const itemResponse = await addItemToOrderMutation.mutateAsync({
            orderId,
            data: itemPayload,
            authToken: authToken!,
          });

          console.log(`✅ Item ${i + 1} added successfully:`, itemResponse);
        } catch (itemError: any) {
          console.error(`❌ Failed to add item ${i + 1}:`, itemError);
          throw new Error(`Failed to add item "${item.name}" to order: ${itemError.message}`);
        }
      }

      console.log('✅ Step 2 completed: All items added to order');

      // Update status for final processed items
      setOrderingStatus(prev => ({
        ...prev,
        processedItems: cartItems.length,
      }));

      // Step 3: Checkout Order (useCheckoutOrder)
      setOrderingStatus(prev => ({
        ...prev,
        currentStep: 'Processing Checkout...',
        currentStepNumber: 3,
      }));

      console.log('💳 Step 3: Processing checkout for order:', orderId);
      const checkoutResponse = await checkoutOrderMutation.mutateAsync({
        orderId,
        authToken: authToken!,
      });

      console.log('✅ Step 3 completed: Checkout processed successfully');
      console.log('🎉 Final checkout response:', checkoutResponse);

      // Reset ordering status
      setOrderingStatus({
        isOrdering: false,
        currentStep: '',
        totalSteps: 3,
        currentStepNumber: 0,
        processedItems: 0,
        totalItems: 0,
      });

      // Check if we have an invoice_url in the response
      if (checkoutResponse?.content?.invoice_url) {
        console.log('📄 Invoice URL found:', checkoutResponse.content.invoice_url);
        
        // Clear cart after successful order
        await removeAllFromCartMutation.mutateAsync(authToken!);
        refetchCart();

        // Navigate to invoice page with the invoice_url
        navigate('/invoice', { 
          state: { 
            invoiceUrl: checkoutResponse.content.invoice_url,
            orderId: checkoutResponse.content.orderid || orderId,
            transId: checkoutResponse.content.transid
          } 
        });
        return;
      }

      // Show success message if no invoice_url (fallback)
      await Swal.fire({
        icon: 'success',
        title: 'Pesanan Berhasil!',
        text: `Pesanan #${orderId} telah dibuat dan sedang diproses.`,
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true,
      });

      console.log('🎊 Order process completed successfully!');
      
      // Clear cart after successful order
      await removeAllFromCartMutation.mutateAsync(authToken!);
      refetchCart();

      // Navigate to orders page or home
      navigate('/orders');

    } catch (error: any) {
      console.error('❌ Order process failed:', error);
      
      setOrderingStatus(prev => ({
        ...prev,
        isOrdering: false,
        error: error.message,
      }));

      await Swal.fire({
        icon: 'error',
        title: 'Pesanan Gagal',
        text: error.message || 'Gagal melakukan pemesanan. Silakan coba lagi.',
        confirmButtonColor: '#d33',
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
        <div style={{
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
        }}>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '350px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #161129',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}></div>
            
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#161129',
              fontSize: '18px',
              fontWeight: '600',
            }}>
              Processing Order
            </h3>
            
            <p style={{
              margin: '0 0 20px 0',
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.4',
            }}>
              {orderingStatus.currentStep}
            </p>

            <div style={{
              background: '#f8f9ff',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '15px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#666',
              }}>
                <span>Step {orderingStatus.currentStepNumber} of {orderingStatus.totalSteps}</span>
                <span>{orderingStatus.processedItems}/{orderingStatus.totalItems} items</span>
              </div>
              
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e9ecef',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(orderingStatus.currentStepNumber / orderingStatus.totalSteps) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #161129, #2c5aa0)',
                  transition: 'width 0.3s ease',
                }}></div>
              </div>
            </div>

            <p style={{
              margin: '0',
              color: '#999',
              fontSize: '12px',
            }}>
              Please wait, do not close this page
            </p>
          </div>
        </div>
      )}

      <div className="cart-page">
        <AppbarDefault
          title={`Shopping Cart (${apiCartCount})`}
          onBack={handleBackClick}
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
                  title="Remove all items from cart"
                >
                  <MdClear />
                  <span>{removeAllFromCartMutation.isPending ? 'Menghapus...' : 'Hapus Semua'}</span>
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
                <div
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Remove item"
                >
                  <MdDelete />
                </div>

                <div className="item-content">
                  {/* Left Column - Product Image */}
                  <div className="item-image-column">
                    <img
                      src={item.image || '/nodata.png'}
                      alt={item.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/nodata.png';
                      }}
                    />
                  </div>

                  {/* Right Column - Product Info */}
                  <div className="item-info-column">
                    <div className="product-details">
                      <h4 className="item-title">{item.name}</h4>
                      <p className="item-price">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

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

                    <div className="item-total-section">
                      <span className="item-total-label">Total:</span>
                      <span className="item-total">Rp {item.amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Ringkasan Pesanan</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({apiCartCount} item)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-row">
                <span>Ongkir</span>
                <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>
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
          <div className="order-actions-bottom">
            <button className="continue-shopping-btn" onClick={() => navigate('/product')}>
              <MdShoppingCart size={26} />
            </button>
            <button className="home-btn" onClick={() => navigate('/')}>
              <MdHome size={26} />
            </button>
            <button 
              className="place-order-btn" 
              onClick={handlePlaceOrder}
              disabled={orderingStatus.isOrdering}
            >
              <MdPayment size={26} />
            </button>
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