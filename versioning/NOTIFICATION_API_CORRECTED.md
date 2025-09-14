# 📋 Notification API Structure - CORRECTED

## ✅ **Actual API Response Structure**

Based on the real API response, here's the correct structure:

```json
{
    "content": [
        {
            "id": "832",
            "subject": "Test From Postman - 1223",
            "content": "Ini Content From Postman",
            "reading": "0",
            "campaign": "0",
            "type": "wa",
            "created": "30 October 2024 00:14:32"
        }
    ]
}
```

## 🔧 **Key Field Mappings**

| API Field | Local Field | Description |
|-----------|-------------|-------------|
| `subject` | `title` | Notification title/subject |
| `content` | `message` | Notification message content |
| `reading` | `isRead` | "0" = unread, "1" = read |
| `created` | `timestamp` | Date string |
| `id` | `id` | Unique notification ID |
| `type` | - | Notification type (wa, email, etc.) |
| `campaign` | - | Campaign ID |

## 🎯 **Reading Status Logic**

```javascript
// Unread notifications (reading === "0")
const unreadNotifications = notifications.filter(n => n.reading === "0");

// Read notifications (reading === "1") 
const readNotifications = notifications.filter(n => n.reading === "1");

// Convert to boolean for local use
const isRead = notification.reading === "1";
```

## 📤 **Payload for Different Use Cases**

### 1. Get All Notifications
```json
{
  "type": "",
  "campaign": "",
  "read": "",
  "limit": "50",
  "offset": "0"
}
```

### 2. Get Only Unread Notifications
```json
{
  "type": "",
  "campaign": "",
  "read": "0",
  "limit": "50", 
  "offset": "0"
}
```

### 3. Get Only Read Notifications
```json
{
  "type": "",
  "campaign": "",
  "read": "1",
  "limit": "50",
  "offset": "0"
}
```

### 4. Filter by Type (e.g., WhatsApp only)
```json
{
  "type": "wa",
  "campaign": "",
  "read": "",
  "limit": "50",
  "offset": "0"
}
```

## 🔄 **Updated Code Changes**

### 1. **Fixed transformApiNotification function**
```typescript
const transformApiNotification = (apiNotification: any): NotificationItem => {
  return {
    id: apiNotification.id,
    title: apiNotification.subject,        // ✅ subject not title
    message: apiNotification.content,      // ✅ content not message  
    isRead: apiNotification.reading === "1", // ✅ reading not read
    timestamp: new Date(apiNotification.created), // ✅ created not date
  };
};
```

### 2. **Fixed API response parsing**
```typescript
// ✅ Direct array access, not nested in result
if (!notificationData?.content || !Array.isArray(notificationData.content)) {
  return [];
}
return notificationData.content.map(transformApiNotification);
```

### 3. **Fixed unread count calculation**
```typescript
// ✅ Filter by reading === "0"
const apiUnreadCount = unreadData?.content?.filter(n => n.reading === "0").length || 0;
```

### 4. **Updated TypeScript interfaces**
```typescript
export interface NotificationResponse {
  content?: Array<{
    id: string;
    subject: string;     // ✅ Not title
    content: string;     // ✅ Not message
    reading: string;     // ✅ "0"|"1" not boolean
    campaign: string;
    type: string;
    created: string;     // ✅ Not date
  }>;
}
```

## 🧪 **Testing the Fixed Implementation**

1. **Set test token**: `window.setTestToken()`
2. **Navigate to notifications**: Click notification icon or FAB
3. **Check console logs**: Should show proper field mapping
4. **Verify unread count**: Should count notifications with `reading: "0"`

## 📊 **Expected Results**

With the sample data provided:
- **Total notifications**: 15
- **Unread notifications**: 15 (all have `reading: "0"`)
- **Notification types**: "wa" and "email"
- **Date range**: From August 2021 to October 2024

## 🎯 **Dynamic Payload Usage Examples**

```javascript
// Get all notifications
useNotifications(authToken, {});

// Get only unread
useNotifications(authToken, { read: "0" });

// Get only WhatsApp notifications
useNotifications(authToken, { type: "wa" });

// Get recent 10 notifications
useNotifications(authToken, { limit: "10", offset: "0" });

// Pagination - next 10 notifications
useNotifications(authToken, { limit: "10", offset: "10" });
```

The implementation is now correctly mapped to the actual API response structure! 🎉
