
import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { getLedger, getSlider, getSplash, postEvent, postArticle, getEventById, getCity } from './api';
import { customerApi } from './customerApi';
import { productAPI } from './productApi';
import { chapterApi } from './chapterApi';
import { cartApi } from './cartApi';
import type {
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
} from './types';
import type {
  CartResponse,
  AddToCartRequest,
  AddToCartResponse,
  RemoveFromCartResponse,
} from './cartApi';
import { orderApi } from './ordersApi';
import type {
  OrderListRequest,
  OrderListResponse,
  OrderAddResponse,
  OrderAddItemRequest,
  OrderAddItemResponse,
  OrderCheckoutResponse,
} from './ordersApi';

export function useLedger(authToken?: string | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['ledger', authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for ledger');
      }
      try {
        return await getLedger(authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '', // Only run if token exists and is not empty
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useSlider(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['slider'],
    queryFn: async () => {
      try {
        return await getSlider();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useSplash(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['splash'],
    queryFn: async () => {
      try {
        return await getSplash();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function usePostEvent(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await postEvent(data);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useEventById(id: string): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['eventById', id],
    queryFn: async () => {
      try {
        return await getEventById(id);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useCity(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['city'],
    queryFn: async () => {
      try {
        return await getCity();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (city data doesn't change often)
    retry: 2,
  });
}


export function usePostArticle(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await postArticle(data);
      } catch (error) {
        throw error;
      }
    },
  });
}

// Customer API Hooks
export function useLogin(): UseMutationResult<LoginResponse, Error, LoginRequest> {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      try {
        return await customerApi.login(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useRegister(): UseMutationResult<RegisterResponse, Error, RegisterRequest> {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      try {
        return await customerApi.register(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useForgotPassword(): UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordRequest> {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      try {
        return await customerApi.forgotPassword(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useRequestOTP(): UseMutationResult<RequestOTPResponse, Error, RequestOTPRequest> {
  return useMutation({
    mutationFn: async (payload: RequestOTPRequest) => {
      try {
        return await customerApi.requestOTP(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

interface UseUpdateProfilePayload {
  data: UpdateProfileRequest;
  authToken: string;
}

export function useUpdateProfile(): UseMutationResult<UpdateProfileResponse, Error, UseUpdateProfilePayload> {
  return useMutation({
    mutationFn: async ({ data, authToken }: UseUpdateProfilePayload) => {
      try {
        return await customerApi.updateProfile(data, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

interface UseChangePasswordPayload {
  data: ChangePasswordRequest;
  authToken: string;
}

export function useChangePassword(): UseMutationResult<ChangePasswordResponse, Error, UseChangePasswordPayload> {
  return useMutation({
    mutationFn: async ({ data, authToken }: UseChangePasswordPayload) => {
      try {
        return await customerApi.changePassword(data, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

// GET API Hooks
export function useProfile(authToken?: string | null): UseQueryResult<GetProfileResponse, Error> {
  return useQuery({
    queryKey: ['profile', authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for profile');
      }
      try {
        return await customerApi.getProfile(authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useCustomerById(customerId: string, authToken?: string | null): UseQueryResult<GetProfileResponse, Error> {
  return useQuery({
    queryKey: ['customer', customerId, authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for customer data');
      }
      if (!customerId || customerId.trim() === '') {
        throw new Error('Customer ID is required');
      }
      try {
        return await customerApi.getCustomerById(customerId, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '' && !!customerId && customerId.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useNotifications(authToken?: string | null, payload?: NotificationPayload): UseQueryResult<NotificationResponse, Error> {
  return useQuery({
    queryKey: ['notifications', authToken, JSON.stringify(payload || {})], // Serialize payload to avoid reference issues
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for notifications');
      }
      try {
        return await customerApi.getNotifications(authToken, payload);
      } catch (error) {
        console.error('🔄 Notification hook error:', error);
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 2, // 2 minutes (notifications update more frequently)
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        console.log('🚫 Auth error detected, not retrying');
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Hook specifically for getting unread notifications count
export function useUnreadNotifications(authToken?: string | null): UseQueryResult<NotificationResponse, Error> {
  return useQuery({
    queryKey: ['unreadNotifications', authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for notifications');
      }
      try {
        return await customerApi.getNotifications(authToken, { read: "0" });
      } catch (error) {
        console.error('🔄 Unread notification hook error:', error);
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 1, // 1 minute (unread count should be more fresh)
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        console.log('🚫 Auth error detected, not retrying unread notifications');
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useNotificationDetail(notificationId: string, authToken?: string | null, payload?: NotificationPayload): UseQueryResult<NotificationDetailResponse, Error> {
  return useQuery({
    queryKey: ['notificationDetail', notificationId, authToken, JSON.stringify(payload || {})],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for notification detail');
      }
      if (!notificationId || notificationId.trim() === '') {
        throw new Error('Notification ID is required');
      }
      try {
        return await customerApi.getNotificationDetail(notificationId, authToken, payload);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '' && !!notificationId && notificationId.trim() !== '',
    staleTime: 1000 * 60 * 2, // shorter cache for detail to allow refresh
    retry: 2,
  });
}

export function useDecodeToken(authToken?: string | null): UseQueryResult<DecodeTokenResponse, Error> {
  return useQuery({
    queryKey: ['decodeToken', authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for token decoding');
      }
      try {
        return await customerApi.decodeToken(authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 15, // 15 minutes (token info doesn't change often)
    retry: 2,
  });
}

interface UseUploadImagePayload {
  file: File;
  authToken: string;
}

export function useUploadImage(): UseMutationResult<any, Error, UseUploadImagePayload> {
  return useMutation({
    mutationFn: async ({ file, authToken }: UseUploadImagePayload) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for image upload');
      }
      if (!file) {
        throw new Error('File is required for upload');
      }
      try {
        return await customerApi.uploadImage(file, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

// Logout Mutation Hook
export function useLogout(): UseMutationResult<LogoutResponse, Error, string> {
  return useMutation({
    mutationFn: async (authToken: string) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for logout');
      }
      try {
        return await customerApi.logout(authToken);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Clear localStorage on successful logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userLog');
      console.log('🗑️ Logout successful, localStorage cleared');
    },
  });
}

// Product API Hooks
interface UseProductsPayload {
  limit?: number;
  offset?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  category?: string;
}

export function useProducts(payload: UseProductsPayload = {}, authToken?: string | null): UseQueryResult<any, Error> {
  const defaultPayload = {
    limit: 3000,
    offset: 0,
    orderby: '',
    order: 'asc' as const,
    category: '',
    ...payload
  };

  return useQuery({
    queryKey: ['products', JSON.stringify(defaultPayload), authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for products');
      }
      try {
        return await productAPI.getProducts(defaultPayload, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useProductCategories(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      try {
        return await productAPI.getProductCategories();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (categories don't change often)
    retry: 2,
  });
}

interface UseProductSearchPayload {
  filter: string;
}

export function useProductSearch(): UseMutationResult<any, Error, UseProductSearchPayload> {
  return useMutation({
    mutationFn: async (payload: UseProductSearchPayload) => {
      try {
        return await productAPI.searchProducts(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useProductDetail(productId: string, authToken?: string | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productDetail', productId, authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for product detail');
      }
      if (!productId || productId.trim() === '') {
        throw new Error('Product ID is required');
      }
      try {
        return await productAPI.getProductDetail(productId, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '' && !!productId && productId.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Chapter API Hooks
interface UseChaptersPayload {
  limit?: number;
  offset?: number;
}

export function useChapters(payload: UseChaptersPayload = {}): UseQueryResult<any, Error> {
  const defaultPayload = {
    limit: 100,
    offset: 0,
    ...payload
  };

  return useQuery({
    queryKey: ['chapters', JSON.stringify(defaultPayload)],
    queryFn: async () => {
     
      try {
        return await chapterApi.getChapters(defaultPayload);
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useChapterById(chapterId: string, authToken?: string | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['chapterById', chapterId, authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for chapter detail');
      }
      if (!chapterId || chapterId.trim() === '') {
        throw new Error('Chapter ID is required');
      }
      try {
        return await chapterApi.getChapterById(chapterId, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '' && !!chapterId && chapterId.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useChaptersByCustomer(customerId: string, authToken?: string | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['chaptersByCustomer', customerId, authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for customer chapters');
      }
      if (!customerId || customerId.trim() === '') {
        throw new Error('Customer ID is required');
      }
      try {
        return await chapterApi.getChaptersByCustomer(customerId, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '' && !!customerId && customerId.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Cart API Hooks
export function useCart(authToken?: string | null): UseQueryResult<CartResponse, Error> {
  return useQuery({
    queryKey: ['cart', authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for cart');
      }
      try {
        return await cartApi.getCart(authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 2, // 2 minutes (cart data should be fresh)
    retry: 2,
  });
}

interface UseAddToCartPayload {
  data: AddToCartRequest;
  authToken: string;
}

export function useAddToCart(): UseMutationResult<AddToCartResponse, Error, UseAddToCartPayload> {
  return useMutation({
    mutationFn: async ({ data, authToken }: UseAddToCartPayload) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for adding to cart');
      }
      if (!data.sku || data.sku.trim() === '') {
        throw new Error('SKU is required');
      }
      if (!data.qty || data.qty.trim() === '') {
        throw new Error('Quantity is required');
      }
      try {
        return await cartApi.addToCart(data, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useRemoveFromCart(): UseMutationResult<RemoveFromCartResponse, Error, string> {
  return useMutation({
    mutationFn: async (authToken: string) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for removing from cart');
      }
      try {
        return await cartApi.removeFromCart(authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}


// Order API Hooks
interface UseOrdersPayload {
  limit?: string;
  offset?: string;
  confirm?: string;
  paid?: string;
  date?: string;
}

export function useOrders(
  payload: UseOrdersPayload = {
    limit: "120",
    offset: "0",
    confirm: "",
    paid: "",
    date: ""
  },
  authToken?: string | null
): UseQueryResult<OrderListResponse, Error> {
  return useQuery({
    queryKey: ['orders', JSON.stringify(payload), authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for orders');
      }
      try {
        return await orderApi.getOrders(payload, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 2, // 2 minutes (order data should be relatively fresh)
    retry: 2,
  });
}

export function useAddOrder(): UseMutationResult<OrderAddResponse, Error, string> {
  return useMutation({
    mutationFn: async (authToken: string) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for creating order');
      }
      try {
        return await orderApi.addOrder(authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

interface UseAddItemToOrderPayload {
  orderId: string;
  data: OrderAddItemRequest;
  authToken: string;
}

export function useAddItemToOrder(): UseMutationResult<OrderAddItemResponse, Error, UseAddItemToOrderPayload> {
  return useMutation({
    mutationFn: async ({ orderId, data, authToken }: UseAddItemToOrderPayload) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for adding item to order');
      }
      if (!orderId || orderId.trim() === '') {
        throw new Error('Order ID is required');
      }
      if (!data.cproduct || data.cproduct.trim() === '') {
        throw new Error('Product code is required');
      }
      if (!data.tqty || data.tqty.trim() === '') {
        throw new Error('Quantity is required');
      }
      try {
        return await orderApi.addItemToOrder(orderId, data, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

interface UseCheckoutOrderPayload {
  orderId: string;
  authToken: string;
}

export function useCheckoutOrder(): UseMutationResult<OrderCheckoutResponse, Error, UseCheckoutOrderPayload> {
  return useMutation({
    mutationFn: async ({ orderId, authToken }: UseCheckoutOrderPayload) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for checkout');
      }
      if (!orderId || orderId.trim() === '') {
        throw new Error('Order ID is required');
      }
      try {
        return await orderApi.checkoutOrder(orderId, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}