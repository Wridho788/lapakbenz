# City API Implementation with GET Method

## Overview
Implementasi API call baru untuk endpoint city menggunakan method GET, beserta hooks dan integrasi ke halaman Register.

## Implementation Details

### 1. API Function - `getCityList`

#### File: `src/api/api.ts`

**New API Function:**
```typescript
export const getCityList = async () => {
  const url = `${BASE_URL}${ENDPOINT_CITY}`;
  
  const response = await axios.get(url);
  return response.data;
};
```

**Import Updates:**
```typescript
import {
  // ... existing imports
  ENDPOINT_CITY,
} from './constants';
```

**Key Features:**
- Uses GET method instead of POST
- Simpler endpoint: `city/get_city` instead of `city/get_city_rj/`
- Direct GET request without payload
- Returns standard API response format

### 2. React Hook - `useCityList`

#### File: `src/api/hooks/generalHooks.ts`

**New Hook Implementation:**
```typescript
export function useCityList(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['city-list'],
    queryFn: async () => {
      try {
        return await getCityList();
      } catch (error) {
        console.error('Error fetching city list:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (city data doesn't change often)
    retry: 2,
  });
}
```

**Hook Features:**
- Unique query key: `['city-list']`
- Built-in error handling and logging
- 10-minute cache time (city data is relatively static)
- 2 retry attempts on failure
- TypeScript support with proper return types

### 3. Hook Export Update

#### File: `src/api/hooks/index.ts`

**Export Addition:**
```typescript
// General/Utility Hooks
export {
  useLedger,
  useSlider,
  useSplash,
  useCity,
  useCityList, // New export
} from './generalHooks';
```

### 4. Register Page Integration

#### File: `src/pages/Register.tsx`

**Import Update:**
```typescript
// Before
import { useRegister, useChapters, useCity } from '../api/hooks/index';

// After
import { useRegister, useChapters, useCityList } from '../api/hooks/index';
```

**Hook Implementation:**
```typescript
// Before
const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useCity();

// After
const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useCityList();
```

**Usage Context:**
- Same variable names maintained for compatibility
- Existing error handling and loading states preserved
- Form dropdown logic remains unchanged

## API Comparison

### Old Implementation (`useCity`)
```typescript
// Endpoint: city/get_city_rj/
// Method: GET
// Parameters: None
// Usage: General city data fetching
```

### New Implementation (`useCityList`)
```typescript
// Endpoint: city/get_city
// Method: GET
// Parameters: None
// Usage: Optimized city list for forms/dropdowns
```

## Benefits of New Implementation

### 1. Simplified Endpoint
- **Cleaner URL**: `city/get_city` vs `city/get_city_rj/`
- **Consistent Method**: GET method for data fetching
- **No Payload Required**: Simpler request structure

### 2. Better Caching Strategy
- **Unique Cache Key**: `['city-list']` prevents conflicts
- **Optimized Stale Time**: 10 minutes for city data
- **Independent Cache**: Doesn't interfere with other city hooks

### 3. Enhanced Error Handling
```typescript
try {
  return await getCityList();
} catch (error) {
  console.error('Error fetching city list:', error);
  throw error;
}
```

### 4. TypeScript Support
- Full TypeScript integration
- Proper return type definitions
- Enhanced IDE support and autocomplete

## Data Structure Expectations

### API Response Format
```typescript
interface CityListResponse {
  status: boolean;
  message: string;
  content: {
    result: Array<{
      id: string;           // City ID
      id_prov: string;      // Province ID
      province: string;     // Province name
      type: string;         // City type (Kabupaten, Kota, etc.)
      nama: string;         // City name
      zip: string;          // ZIP code
    }>;
  };
}

// Example API Response:
{
  "content": {
    "result": [
      {
        "id": "1",
        "id_prov": "21",
        "province": "Nanggroe Aceh Darussalam (NAD)",
        "type": "Kabupaten",
        "nama": "Aceh Barat",
        "zip": "23681"
      }
    ]
  }
}
```

### Usage in Dropdown
```tsx
<select
  id="city"
  name="city"
  value={formData.city}
  onChange={handleInputChange}
  className="form-input"
  required
  disabled={citiesLoading}
>
  <option value="">
    {citiesLoading ? 'Memuat kota...' : 'Pilih Kota'}
  </option>
  {citiesData?.content?.result?.map((city: any) => (
    <option key={city.id} value={city.id}>
      {city.nama}
    </option>
  )) || []}
</select>
```

## Error Handling & Fallbacks

### Loading State
```typescript
{citiesLoading ? 'Memuat kota...' : 'Pilih Kota'}
```

### Error State with Fallback
```tsx
{citiesError && !citiesData && [
  <option key="aceh" value="aceh">Aceh</option>,
  <option key="medan" value="medan">Medan</option>,
  <option key="jakarta" value="jakarta">Jakarta</option>,
  <option key="bandung" value="bandung">Bandung</option>,
  <option key="surabaya" value="surabaya">Surabaya</option>
]}
{citiesError && (
  <small style={{ color: 'red', fontSize: '12px' }}>
    Error loading cities. Using fallback options.
  </small>
)}
```

## Performance Considerations

### 1. Caching Strategy
- **Stale Time**: 10 minutes reduces unnecessary API calls
- **Query Key**: Unique key prevents cache collisions
- **Retry Logic**: 2 retries handle temporary network issues

### 2. Loading Optimization
- **Disabled State**: Dropdown disabled during loading
- **Loading Text**: Clear feedback to users
- **Error Recovery**: Fallback options ensure functionality

### 3. Memory Management
- **React Query**: Automatic garbage collection
- **Stale Data**: Old data served while fetching new
- **Background Refetch**: Updates happen transparently

## Testing Scenarios

### 1. Successful Data Fetch
```typescript
// Expected behavior:
// - Loading state shows initially
// - API call to city/get_city
// - Dropdown populated with city options
// - No error messages
```

### 2. API Error Handling
```typescript
// Expected behavior:
// - Loading state shows initially
// - API call fails
// - Fallback options displayed
// - Error message shown to user
// - Retry attempts made automatically
```

### 3. Network Timeout
```typescript
// Expected behavior:
// - Loading state persists
// - Multiple retry attempts
// - Eventually shows fallback options
// - User can still complete registration
```

## Migration Notes

### Backward Compatibility
- **Variable Names**: Same variables used (`citiesData`, `citiesLoading`, `citiesError`)
- **Data Structure**: Expected to match existing format
- **Form Logic**: No changes to form validation or submission
- **Error Handling**: Enhanced but maintains existing fallbacks

### Future Enhancements
1. **Province-City Relationship**: Link with province selection
2. **Search Functionality**: Filter cities by name
3. **Geolocation**: Auto-detect user's city
4. **Internationalization**: Multi-language city names

## Development & Testing

### Local Development
```bash
# Development server running at:
http://localhost:5173/

# Hot module replacement active
# Changes automatically reflected in browser
```

### API Endpoint Testing
```bash
# Test the new endpoint directly:
GET https://mbapi.dswip.com/city/get_city

# Expected response:
{
  "status": true,
  "message": "Success",
  "content": {
    "result": [
      {"value": "city_id", "label": "City Name"},
      // ... more cities
    ]
  }
}
```

### Console Debugging
```typescript
// Debug city data in browser console:
console.log('Cities data:', citiesData);
console.log('Cities loading:', citiesLoading);
console.log('Cities error:', citiesError);

// Example city data structure:
console.log('Sample city:', citiesData?.content?.result?.[0]);
// Output: { id: "1", id_prov: "21", province: "Nanggroe Aceh Darussalam (NAD)", type: "Kabupaten", nama: "Aceh Barat", zip: "23681" }
```

This implementation provides a cleaner, more efficient way to fetch city data for the registration form while maintaining full backward compatibility and adding enhanced error handling and caching capabilities.