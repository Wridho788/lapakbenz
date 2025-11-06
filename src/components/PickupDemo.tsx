import React from 'react';

/**
 * Demo Component to show Cart Set Pickup functionality
 * 
 * This component demonstrates how the cart pickup functionality works:
 * 
 * 1. API Call: cart/set_pickup/{id_cart} with GET method
 * 2. Hooks: useSetPickup() for handling pickup toggle
 * 3. UI: Radio buttons to choose between "Ambil Sendiri" and "Pakai Ongkir"
 * 4. Auto-refresh: Calls useCart refetch after successful pickup change
 */

const PickupDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🚚 Cart Set Pickup - Implementation Demo</h2>
      
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📋 Implementation Summary:</h3>
        <ul>
          <li><strong>API Endpoint:</strong> <code>GET cart/set_pickup/{'{id_cart}'}</code></li>
          <li><strong>Hook:</strong> <code>useSetPickup()</code> - handles pickup toggle API calls</li>
          <li><strong>UI:</strong> Radio buttons in Cart page for each cart item</li>
          <li><strong>Auto-refresh:</strong> Calls <code>refetchCart()</code> after successful update</li>
        </ul>
      </div>

      <div style={{ background: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>✅ Features Implemented:</h3>
        <ul>
          <li>✅ <strong>API Function:</strong> <code>cartApi.setPickup(cartId, authToken)</code></li>
          <li>✅ <strong>React Hook:</strong> <code>useSetPickup()</code> with mutation handling</li>
          <li>✅ <strong>UI Components:</strong> Radio buttons for pickup/shipping choice</li>
          <li>✅ <strong>Visual Feedback:</strong> Shows shipping cost when "Pakai Ongkir" selected</li>
          <li>✅ <strong>Error Handling:</strong> Toast notifications for success/error states</li>
          <li>✅ <strong>Authentication:</strong> Requires login to change pickup options</li>
          <li>✅ <strong>Auto-refresh:</strong> Reloads cart data after pickup change</li>
          <li>✅ <strong>Responsive Design:</strong> Mobile-friendly pickup options</li>
        </ul>
      </div>

      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔄 User Flow:</h3>
        <ol>
          <li>User goes to Cart page</li>
          <li>Each cart item shows two radio options:
            <ul>
              <li><strong>"Ambil Sendiri"</strong> - User picks up themselves (no shipping cost)</li>
              <li><strong>"Pakai Ongkir"</strong> - Use shipping service (shows shipping cost)</li>
            </ul>
          </li>
          <li>When user selects option → <code>handlePickupToggle(cartId, isPickup)</code> called</li>
          <li>Hook calls API: <code>GET cart/set_pickup/{'{cartId}'}</code></li>
          <li>On success → Shows toast notification + calls <code>refetchCart()</code></li>
          <li>Cart data refreshes with updated pickup status and shipping costs</li>
        </ol>
      </div>

      <div style={{ background: '#f8d7da', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📝 Code Structure:</h3>
        <pre style={{ background: '#000', color: '#00ff00', padding: '15px', borderRadius: '8px', fontSize: '12px' }}>
{`// 1. API Function (cartApi.ts)
async setPickup(cartId: string, authToken: string) {
  const response = await axios.get(
    \`\${BASE_URL}\${ENDPOINT_CART_SET_PICKUP}\${cartId}\`,
    { headers: { 'X-auth-token': authToken } }
  );
  return response.data;
}

// 2. React Hook (cartHooks.ts)
export function useSetPickup() {
  return useMutation({
    mutationFn: async (cartId: string) => {
      return await cartApi.setPickup(cartId, token!);
    }
  });
}

// 3. UI Component (Cart.tsx)
<div className="pickup-options">
  <label>
    <input 
      type="radio"
      checked={item.pickup === "1"}
      onChange={() => handlePickupToggle(item.id, true)}
    />
    Ambil Sendiri
  </label>
  <label>
    <input 
      type="radio" 
      checked={item.pickup === "0"}
      onChange={() => handlePickupToggle(item.id, false)}
    />
    Pakai Ongkir
  </label>
</div>`}
        </pre>
      </div>

      <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px' }}>
        <h3>🎯 Ready to Test!</h3>
        <p>The pickup functionality has been fully implemented and is ready to use in the Cart page. 
        Go to the Cart page with items to see the pickup options in action!</p>
      </div>
    </div>
  );
};

export default PickupDemo;