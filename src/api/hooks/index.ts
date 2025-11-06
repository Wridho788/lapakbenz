// Re-export all hooks from their respective modules for convenient importing

// Authentication & User Management Hooks
export {
  useLogin,
  useRegister,
  useForgotPassword,
  useRequestOTP,
  useSimpleRequestOTP,
  useVerifyOTP,
  useUpdateProfile,
  useChangePassword,
  useProfile,
  useCustomerById,
  useDecodeToken,
  useNotifications,
  useUnreadNotifications,
  useNotificationDetail,
  useUploadImage,
  useLogout,
} from './authHooks';

// Event & Chapter Management Hooks
export {
  usePostEvent,
  useEventById,
  useEventsByCustomer,
  usePostArticle,
  useChapters,
  useChapterById,
  useChaptersByCustomer,
  useMerchantRegistration,
  usePublicRegistration,
  useEventRegister,
  useInfiniteEvents,
  useInfiniteArticles,
} from './eventHooks';

// Product Management Hooks
export {
  useProducts,
  useProductCategories,
  useProductSearch,
  useProductDetail,
} from './productHooks';

// Cart & Order Management Hooks
export {
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useSetPickup,
  useOrders,
  useAddOrder,
  useAddItemToOrder,
  useCheckoutOrder,
  useOrderDetail,
} from './cartHooks';

// General/Utility Hooks
export {
  useLedger,
  useSlider,
  useSplash,
  useCity,
  useCityList,
} from './generalHooks';

// Type exports for convenience
export type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  RequestOTPRequest,
  RequestOTPResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  GetProfileResponse,
  NotificationResponse,
  NotificationDetailResponse,
  NotificationPayload,
  DecodeTokenResponse,
  LogoutResponse,
} from '../types';

export type {
  CartResponse,
  AddToCartRequest,
  AddToCartResponse,
  RemoveFromCartResponse,
  SetPickupResponse,
} from '../cartApi';

export type {
  OrderListResponse,
  OrderAddResponse,
  OrderAddItemRequest,
  OrderAddItemResponse,
  OrderCheckoutResponse,
  OrderDetailResponse,
} from '../ordersApi';