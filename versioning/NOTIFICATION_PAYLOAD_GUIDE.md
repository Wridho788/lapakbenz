# Dynamic Notification Payload Implementation

## Overview

The notification system has been enhanced to support dynamic payload parameters, allowing for flexible filtering and pagination of notifications through the API.

## Implementation Details

### 1. API Changes

#### New Types (src/api/types.ts)
```typescript
export interface NotificationPayload {
  type?: string;
  campaign?: string;
  read?: string;
  limit?: string;
  offset?: string;
}
```

#### Updated Customer API (src/api/customerApi.ts)
The `getNotifications` function now accepts an optional payload parameter:

```typescript
getNotifications: async (authToken: string, payload?: NotificationPayload): Promise<NotificationResponse>
```

**Default Payload:**
```json
{
  "type": "",
  "campaign": "",
  "read": "0",
  "limit": "50",
  "offset": "0"
}
```

### 2. Hook Updates (src/api/hooks.ts)

#### useNotifications Hook
```typescript
export function useNotifications(authToken?: string | null, payload?: NotificationPayload): UseQueryResult<NotificationResponse, Error>
```

#### New useUnreadNotifications Hook
```typescript
export function useUnreadNotifications(authToken?: string | null): UseQueryResult<NotificationResponse, Error>
```
This hook specifically fetches unread notifications by setting `read: "0"` in the payload.

### 3. Context Integration (src/contexts/NotificationContext.tsx)

The NotificationContext has been completely rewritten to:
- Use real API data instead of dummy data
- Support loading and error states
- Combine API notifications with local notifications
- Calculate unread count from API data

#### New Context Interface
```typescript
interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  refetch: () => void;
}
```

### 4. Component Updates

#### Dashboard (src/pages/Dashboard.tsx)
- Updated to use `useNotificationContext` instead of the old context
- Added development tools for testing notification payloads
- Access dev tools via browser console: `window.toggleDevTools()`

#### Notifications Page (src/pages/Notifications.tsx)
- Updated to use the new notification context
- Added loading and error state handling
- Improved TypeScript typing

### 5. Development Tools

#### NotificationFilters Component (src/pages/NotificationFilters.tsx)
A development component that allows testing different payload combinations:

- **Dynamic Payload Controls**: Input fields for all payload parameters
- **Quick Filters**: Preset buttons for common filter combinations
- **Real-time API Testing**: See API responses and payload effects immediately

**Access Development Tools:**
1. Open browser console
2. Run: `window.toggleDevTools()`
3. The NotificationFilters component will appear on the Dashboard

## Usage Examples

### Basic Usage
```typescript
// Get all notifications with default payload
const { data, isLoading, error } = useNotifications(authToken);

// Get only unread notifications
const { data } = useNotifications(authToken, { read: "0" });

// Get notifications with pagination
const { data } = useNotifications(authToken, { 
  limit: "10", 
  offset: "0" 
});

// Get notifications by type
const { data } = useNotifications(authToken, { 
  type: "promotion",
  limit: "20"
});
```

### Context Usage
```typescript
const { 
  notifications, 
  unreadCount, 
  isLoading, 
  error, 
  markAsRead,
  refetch 
} = useNotificationContext();
```

## Payload Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `type` | string | Filter by notification type | `""` |
| `campaign` | string | Filter by campaign name | `""` |
| `read` | string | Filter by read status ("0" = unread, "1" = read, "" = all) | `"0"` |
| `limit` | string | Number of notifications to fetch | `"50"` |
| `offset` | string | Number of notifications to skip (for pagination) | `"0"` |

## API Request Format

The API expects a POST request to the notifications endpoint with form data:

```
POST /notifications
Content-Type: application/x-www-form-urlencoded
X-auth-token: {authToken}

type=&campaign=&read=0&limit=50&offset=0
```

## Testing Guide

### 1. Basic Testing
```javascript
// In browser console
window.setTestToken(); // Set a test auth token
window.toggleDevTools(); // Show notification filters
```

### 2. Testing Different Payloads
Use the NotificationFilters component to test:
- Unread vs read notifications
- Different pagination limits
- Type and campaign filtering
- Custom payload combinations

### 3. API Response Monitoring
All API requests and responses are logged to the console with emojis:
- 📤 Request details
- 📥 Response data
- ❌ Error information

## Future Enhancements

1. **Mark as Read API**: Implement API calls in `markAsRead` and `markAllAsRead` functions
2. **Real-time Updates**: WebSocket integration for live notification updates
3. **Caching Strategy**: Optimize query caching based on payload parameters
4. **Notification Types**: Add UI for different notification type styling
5. **Push Notifications**: Integrate browser push notifications

## Troubleshooting

### Common Issues

1. **No notifications showing**
   - Check if auth token is valid
   - Verify API endpoint is accessible
   - Check browser console for API errors

2. **Unread count not updating**
   - Ensure `useUnreadNotifications` hook is properly configured
   - Check if API returns correct read status

3. **Loading state persists**
   - Verify auth token is not null or empty
   - Check network connectivity
   - Review API response format

### Debug Commands
```javascript
// Browser console debugging
window.setTestToken(); // Set test token
window.clearToken(); // Clear auth token
window.toggleDevTools(); // Toggle development tools
```
