# Order Tracking Implementation

## Overview
Implementasi fitur tracking pesanan yang lengkap dengan API endpoint, hooks, dan komponen UI untuk menampilkan informasi tracking pengiriman.

## API Implementation

### 1. Endpoint Constant
```typescript
// src/api/constants.ts
export const ENDPOINT_ORDER_TRACKING = 'orders/tracking/';
```

### 2. API Function
```typescript
// src/api/ordersApi.ts
async trackOrder(awb: string, lastDigit: string, authToken: string): Promise<OrderTrackingResponse>
```

URL Pattern: `{BASE_URL}/orders/tracking/{awb}/{lastDigit}`

### 3. TypeScript Interfaces
- `TrackingManifest`: Data manifest tracking individual
- `TrackingSummary`: Ringkasan informasi pengiriman
- `OrderTrackingResponse`: Response dari API tracking
- `OrderTrackingRequest`: Request parameters untuk tracking

## Hook Implementation

### useOrderTracking Hook
```typescript
// src/api/hooks/cartHooks.ts
export function useOrderTracking(awb: string, lastDigit: string): UseQueryResult<OrderTrackingResponse, Error>
```

Features:
- Automatic retry logic dengan exponential backoff
- Error handling untuk berbagai status code (400, 401, 403, 404)
- Caching dengan staleTime 5 menit
- Enabled kondisional berdasarkan parameter dan auth status

## Component Implementation

### OrderTracking Component
```typescript
// src/components/OrderTracking.tsx
interface OrderTrackingProps {
  awb: string;
  lastDigit: string;
  className?: string;
}
```

Features:
- Loading state dengan spinner
- Error handling dengan retry button
- Not found state untuk tracking yang tidak ditemukan
- Timeline visualization untuk manifest tracking
- Summary card dengan status color coding
- Responsive design untuk mobile
- Refresh functionality

### Styling
File CSS lengkap di `src/components/OrderTracking.css` dengan:
- Modern card design
- Timeline visualization
- Status color indicators
- Loading dan error states
- Mobile responsive

## Usage Examples

### 1. Basic Usage
```typescript
import OrderTracking from '../components/OrderTracking';

// Direct usage dengan AWB dan last digit
<OrderTracking 
  awb="TG0005321930" 
  lastDigit="39608" 
/>
```

### 2. Dari Order Detail
```typescript
import { useOrderDetail } from '../api/hooks/cartHooks';

const { data: orderData } = useOrderDetail(orderId);
const item = orderData?.content?.items?.find(item => item.awb && item.last_digit);

if (item && item.awb && item.last_digit) {
  return (
    <OrderTracking 
      awb={item.awb} 
      lastDigit={item.last_digit} 
    />
  );
}
```

### 3. Dengan Manual Input (OrderTrackingPage)
Lihat `src/pages/OrderTrackingPage.tsx` untuk implementasi lengkap dengan:
- Auto-loading dari order detail
- Manual input AWB dan last digit
- Toggle untuk show/hide manual tracking

## Data Flow

1. **Order Detail API** → Mendapatkan `awb` dan `last_digit` dari item pesanan
2. **Tracking API** → `{BASE_URL}/orders/tracking/{awb}/{lastDigit}`
3. **useOrderTracking Hook** → Menghandle API call dengan error handling
4. **OrderTracking Component** → Menampilkan data dengan UI yang user-friendly

## API Response Structure

### Success Response
```json
{
  "content": {
    "status": true,
    "manifest": [
      {
        "manifest_code": "",
        "manifest_description": "DELIVERED TO [CUSTOMER NAME | DATE | LOCATION]",
        "manifest_date": "21-10-2025 15:21:54",
        "manifest_time": "",
        "city_name": ""
      }
    ],
    "summary": {
      "courier_code": "jne",
      "courier_name": "Jalur Nugraha Ekakurir (JNE)",
      "waybill_number": "TG0005321930",
      "service_code": "JTR",
      "waybill_date": "15-10-2025 20:16:56",
      "shipper_name": "ORTHOBEDOFFICIALSTORE",
      "receiver_name": "CUSTOMER NAME",
      "origin": "KOTA TANGERANG",
      "destination": "BINJAI UTARA,BINJAI",
      "status": "DELIVERED"
    }
  }
}
```

## Error Handling

Component menghandle berbagai kondisi error:
- **400**: Invalid tracking number atau last digit
- **401/403**: Auth errors
- **404**: Tracking tidak ditemukan
- **Network/Timeout**: Connection issues

Setiap error ditampilkan dengan pesan yang user-friendly dalam bahasa Indonesia.

## Status Color Coding

- **DELIVERED**: Green (#4CAF50) - "Terkirim"
- **ON PROCESS/IN TRANSIT**: Orange (#FF9800) - "Dalam Proses/Perjalanan"  
- **FAILED/RETURNED**: Red (#F44336) - "Gagal/Dikembalikan"
- **Default**: Blue (#2196F3)

## Features

✅ **Implemented:**
- Order tracking API dengan timeout 30s
- React hook dengan automatic retry
- Responsive UI component
- Timeline visualization
- Error handling yang comprehensive
- Loading dan empty states
- Manual tracking input
- Refresh functionality

✅ **TypeScript Support:**
- Full type safety
- Interface definitions untuk semua data structures
- Proper error typing

✅ **User Experience:**
- Loading indicators
- Error messages dalam bahasa Indonesia
- Retry functionality
- Mobile-friendly design
- Color-coded status