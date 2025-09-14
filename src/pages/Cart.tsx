import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDelete,
  MdLocationOn,
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
import { useCart, useRemoveFromCart, useAddToCart } from '../api/hooks';
import Swal from 'sweetalert2';
import './Cart.css';

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'cod';
  fee: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount, removeFromCart } = useCartContext();
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  // const [redeemPoints, setRedeemPoints] = useState(0);
  // const [userPoints] = useState(1500); // Dummy user points

  // Auth token state
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load auth token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    console.log(
      '🔑 Auth token loaded for cart:',
      token ? `${token.substring(0, 20)}...` : 'No token',
    );
  }, []);

  // API hooks for cart
  const {
    data: apiCartData,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCart(authToken);
  const removeAllFromCartMutation = useRemoveFromCart();
  const addToCartMutation = useAddToCart();

  // Handle quantity change for API cart items
  const handleQuantityChange = async (item: any, newQuantity: number) => {
    if (!authToken) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to update cart',
        confirmButtonColor: '#f39c12',
      });
      return;
    }

    if (newQuantity <= 0) {
      // Remove item if quantity becomes 0
      handleRemoveItem(item.id);
      return;
    }

    try {
      console.log('🔄 Updating quantity for item:', item.sku, 'to:', newQuantity);

      // Add the item with new quantity using SKU
      await addToCartMutation.mutateAsync({
        data: {
          sku: item.sku,
          qty: newQuantity.toString(),
        },
        authToken,
      });

      // Refetch cart data
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to update quantity:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update item quantity. Please try again.',
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

  const shippingAddresses: ShippingAddress[] = [
    {
      name: 'John Doe',
      phone: '+62 812-3456-7890',
      address: 'Jl. Sudirman No. 123, Menteng',
      city: 'Jakarta Pusat',
      zipCode: '10310',
    },
    {
      name: 'John Doe',
      phone: '+62 812-3456-7890',
      address: 'Jl. Gatot Subroto No. 456, Kuningan',
      city: 'Jakarta Selatan',
      zipCode: '12950',
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: 'bca', name: 'Bank BCA', type: 'bank', fee: 0 },
    { id: 'mandiri', name: 'Bank Mandiri', type: 'bank', fee: 0 },
    { id: 'gopay', name: 'GoPay', type: 'ewallet', fee: 0 },
    { id: 'ovo', name: 'OVO', type: 'ewallet', fee: 0 },
    { id: 'cod', name: 'Cash on Delivery', type: 'cod', fee: 5000 },
  ];

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleRemoveAllFromCart = async () => {
    if (!authToken) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to manage your cart',
        confirmButtonColor: '#f39c12',
      });
      navigate('/login');
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Remove All Items?',
      text: 'Are you sure you want to remove all items from your cart? This action cannot be undone.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, remove all',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      console.log('🗑️ Removing all items from cart...');

      // Call API to remove all items
      await removeAllFromCartMutation.mutateAsync(authToken);

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Cart Cleared!',
        text: 'All items have been removed from your cart',
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true,
      });

      // Refetch cart data to update UI
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to clear cart:', error);

      let errorMessage = 'Failed to clear cart. Please try again.';

      if (error?.message) {
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Clear Cart Failed',
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
  const paymentFee = selectedPayment?.fee || 0;
  // const pointsDiscount = redeemPoints * 1000; // 1 point = Rp 1,000
  const totalPayment = subtotal + shippingFee + paymentFee ;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    if (!hasApiCartItems) {
      alert('Your cart is empty');
      return;
    }

    const checkoutData = {
      apiItems: apiCartData?.content?.result || [],
      address: selectedAddress,
      payment: selectedPayment,
      // redeemPoints,
      total: totalPayment,
      subtotal,
      shippingFee,
      paymentFee,
      // pointsDiscount,
      apiCartBalance: apiCartData?.content?.balance || 0,
    };

    // Navigate to checkout page with data
    navigate('/checkout', { state: checkoutData });
  };

  // const maxRedeemPoints = Math.min(userPoints, Math.floor(subtotal / 1000));

  const hasApiCartItems = apiCartData?.content?.result && apiCartData.content.result.length > 0;

  if (!hasApiCartItems && !cartLoading) {
    return (
      <div className="cart-page">
        <AppbarDefault
          title="Shopping Cart"
          onBack={handleBackClick}
          onCartClick={handleCartClick}
          cartCount={cartCount}
        />

        <div className="cart-content">
          <div className="empty-cart">
            <img src="/nodata.png" alt="Empty Cart" className="empty-icon" />
            <h3>Your Cart is Empty</h3>
            <p>Add some products to your cart to get started!</p>
            <div className="empty-cart-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/product')}>
                Continue Shopping
              </button>
              <button className="home-btn" onClick={() => navigate('/')}>
                <MdHome /> Go to Home
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
              <h3>Cart Items</h3>
              {hasApiCartItems && (
                <button
                  className="remove-all-btn"
                  onClick={handleRemoveAllFromCart}
                  disabled={removeAllFromCartMutation.isPending}
                  title="Remove all items from cart"
                >
                  <MdClear />
                  <span>{removeAllFromCartMutation.isPending ? 'Clearing...' : 'Clear All'}</span>
                </button>
              )}
            </div>

            {/* Loading State */}
            {cartLoading && authToken && (
              <div className="cart-loading">
                <p>Loading cart items...</p>
              </div>
            )}

            {/* Error State */}
            {cartError && authToken && (
              <div className="cart-error">
                <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>
                  Failed to load cart from server
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
                  Retry
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

          {/* Shipping Address */}
          <div className="shipping-section">
            <h3>
              <MdLocationOn /> Shipping Address
            </h3>
            <div className="address-options">
              {shippingAddresses.map((address, index) => (
                <div
                  key={index}
                  className={`address-card ${selectedAddress === address ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(address)}
                >
                  <div className="address-info">
                    <h4>{address.name}</h4>
                    <p>{address.phone}</p>
                    <p>{address.address}</p>
                    <p>
                      {address.city} {address.zipCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-section">
            <h3>
              <MdPayment /> Payment Method
            </h3>
            <div className="payment-dropdown">
              <select
                value={selectedPayment?.id || ''}
                onChange={(e) => {
                  const selected = paymentMethods.find((method) => method.id === e.target.value);
                  setSelectedPayment(selected || null);
                }}
                className="payment-select"
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} {method.fee > 0 && `(+Rp ${method.fee.toLocaleString('id-ID')})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Redeem Points */}
          {/* <div className="redeem-section">
            <h3>
              <MdRedeem /> Redeem Points
            </h3>
            <div className="redeem-card">
              <div className="points-info">
                <p>Available Points: {userPoints}</p>
                <p>Max Redeem: {maxRedeemPoints} points</p>
              </div>
              <div className="redeem-controls">
                <input
                  type="number"
                  value={redeemPoints}
                  onChange={(e) => {
                    const value = Math.min(
                      maxRedeemPoints,
                      Math.max(0, parseInt(e.target.value) || 0),
                    );
                    setRedeemPoints(value);
                  }}
                  max={maxRedeemPoints}
                  min={0}
                  placeholder="Enter points"
                />
                <span className="points-value">
                  = Rp {(redeemPoints * 1000).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div> */}

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({apiCartCount} items)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping Fee</span>
                <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>
              {paymentFee > 0 && (
                <div className="summary-row">
                  <span>Payment Fee</span>
                  <span>Rp {paymentFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              {/* {pointsDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Points Discount ({redeemPoints} pts)</span>
                  <span>-Rp {pointsDiscount.toLocaleString('id-ID')}</span>
                </div>
              )} */}
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Payment</span>
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
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              <MdPayment size={26} />
            </button>
          </div>
        </div>
      </div>
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </>
  );
};

export default Cart;
