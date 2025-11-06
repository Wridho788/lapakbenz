# Cart Pickup Global Implementation

## Overview
Implementasi baru untuk sistem pickup pada keranjang belanja yang memungkinkan user memilih opsi pengiriman secara global untuk semua produk sekaligus, bukan per produk individual.

## Changes Made

### 1. Cart.tsx - Function Updates

#### handlePickupToggle Function
```typescript
// BEFORE: Individual pickup per item
const handlePickupToggle = async (cartItemId: string, isPickup: boolean) => {
  // ... single item pickup logic
}

// AFTER: Global pickup for all items
const handlePickupToggle = async (isPickup: boolean) => {
  // ... logic for all cart items
  const promises = cartItems.map(item => 
    setPickupMutation.mutateAsync(item.id)
  );
  await Promise.all(promises);
}
```

**Key Changes:**
- Removed `cartItemId` parameter
- Added logic to handle all cart items at once
- Uses `Promise.all()` for concurrent API calls
- Updated success messages to reflect multiple items

### 2. Cart.tsx - UI Updates

#### Pickup Options Section Redesign
```tsx
// NEW: Global pickup options with product list display
<div className="pickup-options-section">
  <h3>Opsi Pengiriman</h3>
  
  {/* Global Pickup Options */}
  <div className="pickup-global-options">
    <div className="pickup-radio-group">
      <label className="pickup-radio-option">
        <input
          type="radio"
          name="pickup-global"
          checked={apiCartData?.content?.result?.every(item => item.pickup === "1") || false}
          onChange={() => handlePickupToggle(true)}
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
        />
        <span className="pickup-radio-label">Pakai Ongkir</span>
        <span className="pickup-radio-desc">
          {shippingCost > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')} - Untuk semua produk` : 'Untuk semua produk'}
        </span>
      </label>
    </div>
  </div>

  {/* Product List Display */}
  <div className="pickup-items-list">
    <h4>Produk dalam keranjang:</h4>
    <div className="pickup-items">
      {apiCartData?.content?.result?.map((item) => (
        <div key={item.id} className="pickup-item-display">
          {/* Product info with status display */}
        </div>
      ))}
    </div>
  </div>
</div>
```

**Key Features:**
- Single global pickup choice for all products
- Radio buttons with `name="pickup-global"` for mutual exclusivity
- Dynamic status checking using `every()` method
- Product list shows current pickup status for each item
- Status icons: 📦 for pickup, 🚚 for shipping

### 3. Cart.css - Styling Updates

#### New CSS Classes Added:
```css
/* Global Pickup Options */
.pickup-global-options {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

/* Product List Display */
.pickup-items-list {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.pickup-item-display {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 12px;
}

.pickup-item-status {
  font-size: 12px;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.status-pickup {
  color: #28a745;
}

.status-shipping {
  color: #007bff;
}
```

#### Responsive Design:
```css
@media (max-width: 768px) {
  .pickup-global-options .pickup-radio-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .pickup-item-display {
    padding: 8px 12px;
  }
  
  .pickup-item-display .pickup-item-image {
    width: 32px;
    height: 32px;
  }
}
```

## User Experience Improvements

### Before:
- User harus memilih pickup/shipping untuk setiap produk secara individual
- Banyak pilihan radio button terpisah
- Interface cluttered dengan banyak input controls
- Process tidak efisien untuk cart dengan banyak item

### After:
- Satu pilihan global untuk semua produk
- Interface lebih clean dan sederhana
- Lebih efisien untuk user experience
- Status pickup/shipping jelas ditampilkan untuk setiap produk
- Bulk API calls untuk mengubah semua item sekaligus

## Technical Benefits

### API Efficiency:
- Multiple concurrent API calls using `Promise.all()`
- Single user action triggers all necessary backend updates
- Better error handling for bulk operations

### UI/UX Benefits:
- Simplified decision making process
- Clear visual hierarchy
- Better mobile responsiveness
- Consistent status display

### Code Maintenance:
- Cleaner component structure
- Reduced state complexity
- Better separation of concerns

## Usage Flow

1. **User opens cart page**
   - Sees global pickup options at the top
   - Views list of products with current status

2. **User selects pickup option**
   - Chooses "Ambil Sendiri" (Free pickup) OR "Pakai Ongkir" (Shipping)
   - Single selection applies to all cart items

3. **System processes request**
   - Makes concurrent API calls for all cart items
   - Updates pickup status for all products
   - Refreshes cart data to show new shipping costs
   - Displays success message with item count

4. **User sees updated status**
   - All products show consistent pickup/shipping status
   - Shipping costs updated in order summary
   - Visual feedback through status icons and colors

## Testing Scenarios

### Scenario 1: All items pickup
```json
{
  "content": {
    "result": [
      {"id": "7", "pickup": "1", "shipping": 0},
      {"id": "6", "pickup": "1", "shipping": 0}
    ]
  }
}
```
- Global "Ambil Sendiri" should be checked
- All items show 📦 Ambil Sendiri status
- No shipping costs in order summary

### Scenario 2: All items shipping
```json
{
  "content": {
    "result": [
      {"id": "7", "pickup": "0", "shipping": 15000},
      {"id": "6", "pickup": "0", "shipping": 10000}
    ]
  }
}
```
- Global "Pakai Ongkir" should be checked
- All items show 🚚 shipping status with costs
- Total shipping cost Rp 25,000 in order summary

### Scenario 3: Mixed status (edge case)
- Should default to no global selection
- Individual statuses still displayed
- User can select global option to unify all items

## Migration Notes

- Existing API endpoints remain unchanged
- Backward compatible with current cart data structure
- No database schema changes required
- Enhanced user experience without breaking changes

## Future Enhancements

1. **Advanced Options:**
   - Mixed pickup/shipping per item (if business requires)
   - Pickup location selection
   - Scheduled pickup times

2. **Analytics:**
   - Track pickup vs shipping preference
   - Monitor bulk operation success rates
   - User behavior analysis

3. **Performance:**
   - Batch API endpoint for pickup changes
   - Optimistic UI updates
   - Better error recovery mechanisms