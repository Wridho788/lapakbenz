# API Hooks Documentation

This directory contains all React Query hooks organized by domain/functionality for better maintainability and developer experience.

## Structure Overview

```
src/api/hooks/
├── index.ts              # Main export file - import hooks from here
├── authHooks.ts          # Authentication & user management hooks  
├── eventHooks.ts         # Event, chapter, and registration hooks
├── productHooks.ts       # Product catalog and search hooks
├── cartHooks.ts          # Cart and order management hooks
└── generalHooks.ts       # General/utility hooks (slider, splash, city)
```

## Usage

Import hooks from the main index file:

```typescript
// ✅ Recommended - Import from main index
import { 
  useLogin, 
  useProfile, 
  useProducts, 
  useCart 
} from '../api/hooks';

// ❌ Avoid - Direct imports from individual files
import { useLogin } from '../api/hooks/authHooks';
```

## Hook Categories

### 🔐 Authentication Hooks (`authHooks.ts`)
- **Login & Registration**: `useLogin`, `useRegister`, `useForgotPassword`
- **OTP Management**: `useRequestOTP`, `useSimpleRequestOTP`, `useVerifyOTP`
- **Profile Management**: `useProfile`, `useUpdateProfile`, `useChangePassword`
- **Notifications**: `useNotifications`, `useUnreadNotifications`, `useNotificationDetail`
- **Utilities**: `useDecodeToken`, `useUploadImage`, `useLogout`

### 🎪 Event Hooks (`eventHooks.ts`)
- **Event Data**: `usePostEvent`, `useEventById`, `useEventsByCustomer`
- **Articles**: `usePostArticle`
- **Chapters**: `useChapters`, `useChapterById`, `useChaptersByCustomer`
- **Registrations**: `useMerchantRegistration`, `usePublicRegistration`, `useEventRegister`
- **Infinite Scroll**: `useInfiniteEvents`, `useInfiniteArticles`

### 🛍️ Product Hooks (`productHooks.ts`)
- **Product Catalog**: `useProducts`, `useProductCategories`
- **Search**: `useProductSearch`
- **Details**: `useProductDetail`

### 🛒 Cart & Order Hooks (`cartHooks.ts`)
- **Cart Management**: `useCart`, `useAddToCart`, `useRemoveFromCart`
- **Order Management**: `useOrders`, `useAddOrder`, `useAddItemToOrder`
- **Checkout**: `useCheckoutOrder`, `useOrderDetail`

### 🌟 General Hooks (`generalHooks.ts`)
- **UI Content**: `useSlider`, `useSplash`
- **Financial**: `useLedger`
- **Location**: `useCity`

## Migration from Old Structure

The old monolithic `hooks.ts` file has been split into these modular files. No changes needed in existing components since the main `index.ts` re-exports all hooks with the same API.

## Benefits

1. **Better Organization**: Related hooks are grouped together
2. **Improved Maintainability**: Easier to find and modify specific hooks
3. **Better Performance**: Smaller bundle sizes through tree-shaking
4. **Developer Experience**: Better IDE autocomplete and navigation
5. **Team Collaboration**: Easier to work on different features in parallel

## Adding New Hooks

1. Add the hook to the appropriate category file
2. Export it from the category file
3. Re-export it from `index.ts`
4. Update this documentation

Example:
```typescript
// 1. Add to productHooks.ts
export function useProductReviews(productId: string) {
  // hook implementation
}

// 2. Add to index.ts exports
export {
  useProducts,
  useProductDetail,
  useProductReviews, // ← Add here
} from './productHooks';
```