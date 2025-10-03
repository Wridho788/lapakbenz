# API Integration Documentation

## Overview
This project uses axios for HTTP requests to interact with the backend API. All customer-related operations are handled through the customerApi module.

## File Structure
```
src/api/
├── constants.ts          # API endpoint constants
├── customerApi.ts        # Customer API functions and interfaces
├── hooks.ts             # React Query hooks for API calls
└── index.ts             # Main API exports
```

## Customer API

### Base Configuration
- **Base URL**: `http://localhost:3001/`
- **HTTP Client**: Axios
- **Content Type**: `application/x-www-form-urlencoded`
- **Authentication**: Bearer token via `X-auth-token` header

### Available Endpoints

#### 1. Login
**Endpoint**: `POST /customer/auth`
```typescript
interface LoginRequest {
  username: string; // Email, phone, or username
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: any;
}
```

#### 2. Register
**Endpoint**: `POST /customer/register`
```typescript
interface RegisterRequest {
  cchapter: string;     // Chapter
  tname: string;        // Full name
  taddress: string;     // Address
  tzip: string;         // Zip code
  tphone1: string;      // Phone number
  temail: string;       // Email
  ccity: string;        // City
  tpassword: string;    // Password
  tdob: string;         // Date of birth
  tnik: string;         // NIK
  tcartype: string;     // Car type
  tpoliceno: string;    // Police number
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

#### 3. Forgot Password
**Endpoint**: `POST /customer/forgot-password`
```typescript
interface ForgotPasswordRequest {
  username: string;     // Phone number or email
  new_password: string; // New password
  otp: string;         // OTP code
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}
```

#### 4. Request OTP
**Endpoint**: `POST /customer/request-otp`
```typescript
interface RequestOTPRequest {
  username: string; // Phone number or email
}

interface RequestOTPResponse {
  success: boolean;
  message: string;
}
```

#### 5. Update Profile
**Endpoint**: `PUT /customer/profile`
**Requires Authentication**: Yes
```typescript
interface UpdateProfileRequest {
  tprofession: string;   // Profession
  torganization: string; // Organization
  tinstagram: string;    // Instagram handle
  taddress: string;      // Address
  tzip: string;         // Zip code
  temail: string;       // Email
  tdob: string;         // Date of birth
  ccity: string;        // City
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

#### 6. Change Password
**Endpoint**: `PUT /customer/change-password`
**Requires Authentication**: Yes
```typescript
interface ChangePasswordRequest {
  old_pass: string; // Current password
  new_pass: string; // New password
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
```

## React Query Hooks

### Usage Examples

#### Basic Authentication
```typescript
import { useLogin, useRegister } from '../api/hooks/index';

function LoginComponent() {
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLogin = async (formData) => {
    try {
      const result = await loginMutation.mutateAsync(formData);
      // Save token to localStorage
      localStorage.setItem('authToken', result.token);
      // Redirect or update app state
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Profile Management
```typescript
import { useUpdateProfile, useChangePassword } from '../api/hooks/index';

function ProfileComponent() {
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const handleUpdateProfile = async (profileData) => {
    const authToken = localStorage.getItem('authToken');
    try {
      await updateProfileMutation.mutateAsync({
        data: profileData,
        authToken
      });
      // Show success message
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Loading states
  if (updateProfileMutation.isPending) {
    return <div>Updating profile...</div>;
  }

  // Error handling
  if (updateProfileMutation.error) {
    return <div>Error: {updateProfileMutation.error.message}</div>;
  }

  return (
    <form onSubmit={handleUpdateProfile}>
      {/* Form fields */}
    </form>
  );
}
```

### Available Hooks

| Hook | Purpose | Parameters | Returns |
|------|---------|------------|---------|
| `useLogin()` | User authentication | `LoginRequest` | `LoginResponse` |
| `useRegister()` | User registration | `RegisterRequest` | `RegisterResponse` |
| `useForgotPassword()` | Password reset | `ForgotPasswordRequest` | `ForgotPasswordResponse` |
| `useRequestOTP()` | OTP request | `RequestOTPRequest` | `RequestOTPResponse` |
| `useUpdateProfile()` | Profile update | `{data, authToken}` | `UpdateProfileResponse` |
| `useChangePassword()` | Password change | `{data, authToken}` | `ChangePasswordResponse` |

### Hook Properties

Each hook returns the following properties:
- `mutateAsync(data)` - Execute the API call
- `isPending` - Loading state
- `isSuccess` - Success state
- `isError` - Error state
- `error` - Error object
- `data` - Response data

## Error Handling

### API Errors
```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data.message);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

### Authentication Errors
- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: Insufficient permissions
- **422 Validation Error**: Invalid input data

## Authentication Flow

1. **Login**: Call `useLogin()` with credentials
2. **Store Token**: Save token to localStorage
3. **Authenticated Requests**: Pass token to protected endpoints
4. **Token Refresh**: Handle token expiration

```typescript
// Store token after successful login
localStorage.setItem('authToken', response.token);

// Use token for authenticated requests
const authToken = localStorage.getItem('authToken');
await updateProfile(data, authToken);

// Clear token on logout
localStorage.removeItem('authToken');
```

## Data Conversion

The API uses URL-encoded form data. The `createFormData` utility function automatically converts JavaScript objects to the required format:

```typescript
const formData = createFormData({
  tname: 'John Doe',
  temail: 'john@example.com'
});
// Results in: "tname=John%20Doe&temail=john%40example.com"
```

## Environment Configuration

Create `.env` file for different environments:

```env
# Development
VITE_API_BASE_URL=http://localhost:3001

# Production
VITE_API_BASE_URL=https://api.yourdomain.com
```

Update `constants.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

## Testing

### Example Test Files
```typescript
// __tests__/customerApi.test.ts
import { customerApi } from '../api/customerApi';

describe('Customer API', () => {
  test('login with valid credentials', async () => {
    const mockResponse = { success: true, token: 'mock-token' };
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await customerApi.login({
      username: 'test@example.com',
      password: 'password123'
    });

    expect(result).toEqual(mockResponse);
  });
});
```

## Best Practices

1. **Always handle loading states** in UI components
2. **Implement proper error handling** for network and API errors
3. **Store sensitive data securely** (tokens in httpOnly cookies preferred)
4. **Validate form data** before sending to API
5. **Use TypeScript interfaces** for type safety
6. **Implement retry logic** for failed requests
7. **Cache responses** when appropriate using React Query

## Security Considerations

1. **Token Storage**: Consider using httpOnly cookies instead of localStorage
2. **HTTPS**: Always use HTTPS in production
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement request rate limiting
5. **CORS**: Configure CORS properly on the server
