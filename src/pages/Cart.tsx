import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdRemove, MdDelete, MdLocationOn, MdPayment, MdRedeem, MdHome } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart } from '../contexts/CartContext';
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
  const { cartItems, cartCount, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [userPoints] = useState(1500); // Dummy user points

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
      zipCode: '10310'
    },
    {
      name: 'John Doe',
      phone: '+62 812-3456-7890',
      address: 'Jl. Gatot Subroto No. 456, Kuningan',
      city: 'Jakarta Selatan',
      zipCode: '12950'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: 'bca', name: 'Bank BCA', type: 'bank', fee: 0 },
    { id: 'mandiri', name: 'Bank Mandiri', type: 'bank', fee: 0 },
    { id: 'gopay', name: 'GoPay', type: 'ewallet', fee: 0 },
    { id: 'ovo', name: 'OVO', type: 'ewallet', fee: 0 },
    { id: 'cod', name: 'Cash on Delivery', type: 'cod', fee: 5000 }
  ];

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const subtotal = getTotalPrice();
  const shippingFee = 15000;
  const paymentFee = selectedPayment?.fee || 0;
  const pointsDiscount = redeemPoints * 1000; // 1 point = Rp 1,000
  const totalPayment = subtotal + shippingFee + paymentFee - pointsDiscount;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const checkoutData = {
      items: cartItems,
      address: selectedAddress,
      payment: selectedPayment,
      redeemPoints,
      total: totalPayment,
      subtotal,
      shippingFee,
      paymentFee,
      pointsDiscount
    };

    // Navigate to checkout page with data
    navigate('/checkout', { state: checkoutData });
  };

  const maxRedeemPoints = Math.min(userPoints, Math.floor(subtotal / 1000));

  if (cartItems.length === 0) {
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
    <div className="cart-page">
      <AppbarDefault
        title={`Shopping Cart (${cartCount})`}
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
      />

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items-section">
          <h3>Cart Items</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div
                className="remove-btn"
                onClick={() => handleRemoveItem(item.id)}
                aria-label="Remove item"
              >
                <MdDelete />
              </div>
              
              <div className="item-header">
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-info">
                  <h4 className="item-title">{item.title}</h4>
                  <p className="item-price">Rp {item.price.toLocaleString('id-ID')}</p>
                  <p className="item-price-per-unit">per item</p>
                </div>
              </div>
              
              <div className="item-controls">
                <div className="quantity-section">
                  <span className="quantity-label">Quantity</span>
                  <div className="quantity-controls">
                    <div
                      className={`quantity-btn decrease ${item.quantity <= 1 ? 'disabled' : ''}`}
                      onClick={() => item.quantity > 1 && handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <MdRemove />
                    </div>
                    <span className="quantity-display">{item.quantity}</span>
                    <div
                      className="quantity-btn increase"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <MdAdd />
                    </div>
                  </div>
                </div>
                
                <div className="item-total-section">
                  <span className="item-total-label">Total</span>
                  <span className="item-total">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="shipping-section">
          <h3><MdLocationOn /> Shipping Address</h3>
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
                  <p>{address.city} {address.zipCode}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="payment-section">
          <h3><MdPayment /> Payment Method</h3>
          <div className="payment-dropdown">
            <select
              value={selectedPayment?.id || ''}
              onChange={(e) => {
                const selected = paymentMethods.find(method => method.id === e.target.value);
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
        <div className="redeem-section">
          <h3><MdRedeem /> Redeem Points</h3>
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
                  const value = Math.min(maxRedeemPoints, Math.max(0, parseInt(e.target.value) || 0));
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
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal ({cartCount} items)</span>
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
            {pointsDiscount > 0 && (
              <div className="summary-row discount">
                <span>Points Discount ({redeemPoints} pts)</span>
                <span>-Rp {pointsDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total Payment</span>
              <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="order-actions">
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || !selectedPayment}
          >
            Place Order
          </button>
          
          <div className="secondary-actions">
            <button className="home-btn secondary" onClick={() => navigate('/')}>
              <MdHome /> Back to Home
            </button>
            <button className="continue-shopping-btn secondary" onClick={() => navigate('/product')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default Cart;
