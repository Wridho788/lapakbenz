# Git Commit Message

## Commit Message:
```
feat: Comprehensive cart system improvements and timeout handling

- Fix timeout errors: Increase API timeout from 10s to 30s for all cart endpoints
- Add retry logic: Auto-retry for timeout/network errors with exponential backoff  
- Enhance cart removal: Replace handleRemoveItem with API-based removal using qty=0
- Fix quantity accumulation: Add to cart now properly accumulates existing quantities
- Add service fee display: Show order.cost as "Biaya Layanan" in Orders page with orange styling
- Improve product names: All product titles now display in uppercase across Product, ProductDetail, and Cart pages
- Enhance error handling: Add specific timeout and network error messages in Indonesian
- Improve UX: Add loading spinner with "Menambahkan..." text for add to cart button
- Fix navigation: Use dynamic window.location.pathname for cart back navigation instead of hardcoded paths

Technical changes:
- cartApi.ts: Timeout increased to 30000ms for all endpoints
- cartHooks.ts: Added retry logic with 2 retries for timeout/network errors
- Cart.tsx: Enhanced handleRemoveItem and performRemoveAll with proper API integration
- ProductDetail.tsx: Fixed cumulative quantity logic and improved error handling
- Orders.tsx: Added service fee display with conditional rendering
- Product.tsx: Product titles now display in uppercase
- CSS: Added spinner animation and service fee styling with orange color (#e67e22)

Closes: Cart timeout issues, quantity accumulation bugs, product name casing, service fee display
```

## Short Version (for command line):
```
feat: cart improvements, timeout handling, service fees, uppercase products

- Fix timeout errors: 10s→30s API timeout + retry logic
- Cart removal: API-based removal with qty=0 method  
- Quantity fix: Proper accumulation of existing cart items
- Orders: Add service fee display from order.cost
- Products: Uppercase display across all pages
- UX: Better error messages, loading spinner, navigation
```

## Files Modified:
- `src/api/cartApi.ts` - Timeout increase and error handling
- `src/api/hooks/cartHooks.ts` - Retry logic implementation
- `src/pages/Cart.tsx` - Enhanced remove item and remove all functions
- `src/pages/ProductDetail.tsx` - Quantity accumulation fix and error handling
- `src/pages/Orders.tsx` - Service fee display and formatting
- `src/pages/Product.tsx` - Uppercase product names
- `src/pages/ProductDetail.css` - Spinner animation styles
- `src/pages/orders.css` - Service fee styling

## Impact:
✅ **Reliability**: Timeout errors reduced with 30s timeout + auto-retry  
✅ **Functionality**: Cart operations now work correctly with API integration  
✅ **UX**: Better error messages, loading states, and consistent product naming  
✅ **Feature**: Service fees now visible in order history  
✅ **Consistency**: Product names display in uppercase across all pages