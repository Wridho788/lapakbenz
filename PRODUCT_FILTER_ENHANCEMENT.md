# Git Commit Message

## Title
feat: implement comprehensive product filtering with city locations and Tokopedia-style UI

## Description
Enhanced the product catalog with advanced filtering capabilities including price ordering, product condition, and location-based filtering with a modern Tokopedia-inspired interface.

### Features Added:
- **Product City API**: Added GET endpoint for retrieving available product locations
- **Advanced Filtering**: Price ordering (asc/desc), condition (new/used), and multi-location selection
- **Tokopedia-style UI**: Collapsible filter panel with checkbox/radio button interface
- **Location Integration**: Dynamic city loading with auth-required API calls

### API Changes:
- **New Endpoint**: `ENDPOINT_PRODUCT_CITY = 'product/city_product'`
- **Enhanced Payload**: Added `location` and `condition` fields to product requests
- **Headers**: X-auth-token and Content-Type for city API calls
- **Location Format**: Comma-separated string for multiple locations (e.g., "ACEH,PEKANBARU")

### Product API Payload Structure:
```json
{
  "limit": 30,
  "offset": 0,
  "orderby": "price", // Can be "price" or ""
  "order": "desc",    // "asc" or "desc"
  "category": "",
  "location": "ACEH,PEKANBARU", // Comma-separated locations
  "condition": "new"  // "new", "used", or ""
}
```

### New API Functions:
- **productAPI.getProductCities()**: Fetches available product locations with auth
- **useProductCities()**: React Query hook for city data with auth token support
- Enhanced **useProducts()** hook with new filter parameters

### UI/UX Enhancements:
- **Collapsible Filter Panel**: Toggle-able advanced filters with badge counter
- **Tokopedia-style Design**: Custom checkbox/radio styling with hover effects
- **Filter Categories**:
  - Category selection (radio buttons)
  - Price ordering (radio buttons: Default, Lowest, Highest)
  - Product condition (radio buttons: All, New, Used)
  - Location selection (checkboxes: multi-select from API cities)
- **Clear All Filters**: Single button to reset all filter states
- **Visual Feedback**: Active filter badge count and color-coded selections

### Component Architecture:
- **State Management**: Separate states for each filter type
- **Filter Handlers**: Individual functions for each filter category
- **Location Toggle**: Multi-select functionality for city filtering
- **Responsive Design**: Mobile-optimized layout with grid adjustments

### Styling Features:
- **Custom Checkboxes**: Branded styling with #161129 theme colors
- **Filter Badge**: Orange notification badge showing active filter count
- **Hover Effects**: Interactive feedback for all filter elements
- **Mobile Responsive**: Optimized layout for small screens
- **Dark Mode Safe**: Maintains light theme consistency

### Data Flow:
1. **Authentication**: Get token from useAuthStore for city API
2. **City Loading**: Fetch available locations with auth headers
3. **Filter Application**: Combine all filter states into API payload
4. **Location Processing**: Join selected cities with commas
5. **Real-time Updates**: Automatic product refetch on filter changes

### Files Modified:
- `src/api/productApi.ts` - Added getProductCities function and enhanced payload
- `src/api/hooks/productHooks.ts` - Added useProductCities hook and enhanced useProducts
- `src/api/hooks/index.ts` - Export new useProductCities hook
- `src/pages/Product.tsx` - Complete UI enhancement with filter system
- `src/pages/Product.css` - Comprehensive styling for new filter components

### Expected City API Response:
```json
{
  "content": {
    "result": [
      { "name": "ACEH" },
      { "name": "PEKANBARU" }
    ]
  }
}
```

### Filter State Structure:
- `priceOrder`: 'asc' | 'desc' | ''
- `selectedCondition`: 'new' | 'used' | ''
- `selectedLocations`: string[] (array of city names)
- `showFilters`: boolean (panel visibility)

### User Experience:
- **Filter Toggle**: Expandable panel to save screen space
- **Visual Indicators**: Badge shows number of active filters
- **Intuitive Controls**: Familiar checkbox/radio patterns
- **Quick Reset**: One-click filter clearing
- **Responsive Layout**: Works seamlessly on mobile devices

### Performance Optimizations:
- **React Query Caching**: Cities cached for 10 minutes
- **Auth-gated Loading**: Only fetch cities when token available
- **Efficient Re-rendering**: Optimized state updates and memoization
- **API Payload Optimization**: Only send non-empty filter values

---

## Breaking Changes:
None - All changes are additive and backward compatible

## Testing Considerations:
- Filter combinations work correctly together
- Location API requires valid authentication token
- Mobile responsiveness across different screen sizes
- Filter state persistence during navigation

## Example Usage:
```tsx
// API Integration
const { data: cities } = useProductCities(authToken);
const { data: products } = useProducts({
  orderby: 'price',
  order: 'desc',
  condition: 'new',
  location: 'ACEH,PEKANBARU'
});

// Location Selection
const handleLocationToggle = (cityName: string) => {
  setSelectedLocations(prev => 
    prev.includes(cityName) 
      ? prev.filter(loc => loc !== cityName)
      : [...prev, cityName]
  );
};
```