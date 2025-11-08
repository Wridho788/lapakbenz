# Git Commit Message

## Title
feat: implement comprehensive order tracking system with API integration

## Description
Implemented a complete order tracking system with API endpoints, React hooks, and UI components to track shipment status and delivery information.

### Features Added:
- **Order Tracking API**: Added POST method tracking endpoint with payload support
- **React Components**: Created OrderTracking component with timeline visualization
- **Integration**: Embedded tracking functionality in OrderDetail page
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Responsive Design**: Mobile-friendly UI with proper styling

### API Changes:
- Added `ENDPOINT_ORDER_TRACKING` constant for tracking endpoint
- Implemented `trackOrder` function in `ordersApi.ts` with POST method
- Added TypeScript interfaces for tracking requests and responses
- Updated timeout from 10s to 30s for better reliability

### Components:
- **OrderTracking.tsx**: Main tracking component with timeline and status display
- **OrderTracking.css**: Comprehensive styling with dark mode support
- **OrderDetail.tsx**: Integrated tracking section with conditional rendering

### Hooks:
- Added `useOrderTracking` hook in `cartHooks.ts`
- Implemented retry logic with exponential backoff
- Added proper error handling for different HTTP status codes

### UI/UX Features:
- Timeline visualization for tracking manifest
- Status color coding (Green=Delivered, Orange=Transit, Red=Failed)
- Conditional button display based on AWB availability
- White background with #161129 text for consistent branding
- Responsive design for mobile devices
- Loading, error, and empty states

### Data Flow:
1. Extract AWB and last_digit from order items
2. Concatenate values for display (e.g., "TG000532193039608")
3. Call tracking API with POST method and payload
4. Display tracking timeline and shipping information
5. Handle incomplete data with appropriate messaging

### Files Modified:
- `src/api/constants.ts` - Added tracking endpoint
- `src/api/ordersApi.ts` - Implemented tracking API function
- `src/api/hooks/cartHooks.ts` - Added tracking hook
- `src/components/OrderTracking.tsx` - New tracking component
- `src/components/OrderTracking.css` - Component styling
- `src/pages/OrderDetail.tsx` - Integrated tracking section
- `src/pages/OrderDetail.css` - Updated with tracking styles

### Breaking Changes:
None - All changes are additive and backward compatible

### Testing:
- Handles null AWB values gracefully
- Displays appropriate messages for incomplete tracking data
- Responsive design tested on mobile and desktop
- Dark mode compatibility maintained

---

## Example Usage:
```tsx
// Direct component usage
<OrderTracking awb="TG0005321930" lastDigit="39608" />

// Integrated in OrderDetail page
// Automatically extracts tracking info from order items
// Shows tracking section when AWB data is available
```

## API Request Format:
```json
POST /orders/tracking
{
  "awb": "TG0005321930",
  "lastDigit": "39608",
  "limit": "120",
  "offset": "0",
  "confirm": "",
  "paid": "",
  "date": ""
}
```