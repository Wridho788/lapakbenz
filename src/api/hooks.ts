import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import {
  getLedger,
  getSlider,
  getSplash,
  postEvent,
  postArticle,
  getEventById,
  getCity,
  getEventsByCustomer,
  registerMerchant,
  registerPublic,
  registerEvent,
} from './api';
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
  OrderListResponse,
  OrderAddResponse,
  OrderAddItemRequest,
  OrderAddItemResponse,
  OrderCheckoutResponse,
  OrderDetailResponse,
} from './ordersApi';

export function useLedger(): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['ledger', token],
    queryFn: () => getLedger(token!),
    enabled: isAuthenticated,
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

interface UseEventsByCustomerPayload {
  limit?: number;
  offset?: number;
}

export function useEventsByCustomer(payload: UseEventsByCustomerPayload = {}): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  const defaultPayload = {
    limit: 30,
    offset: 0,
    ...payload,
  };

  return useQuery({
    queryKey: ['eventsByCustomer', JSON.stringify(defaultPayload), token],
    queryFn: () => getEventsByCustomer(token!, defaultPayload),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

export function useForgotPassword(): UseMutationResult<
  ForgotPasswordResponse,
  Error,
  ForgotPasswordRequest
> {
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
}

export function useUpdateProfile(): UseMutationResult<
  UpdateProfileResponse,
  Error,
  UseUpdateProfilePayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({ data }: UseUpdateProfilePayload) => customerApi.updateProfile(data, token!),
  });
}

interface UseChangePasswordPayload {
  data: ChangePasswordRequest;
  authToken: string;
}

export function useChangePassword(): UseMutationResult<
  ChangePasswordResponse,
  Error,
  UseChangePasswordPayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({ data }: UseChangePasswordPayload) => customerApi.changePassword(data, token!),
  });
}

// GET API Hooks
export function useProfile(): UseQueryResult<GetProfileResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile', token],
    queryFn: () => customerApi.getProfile(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
export function useCustomerById(customerId: string): UseQueryResult<GetProfileResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['customer', customerId, token],
    queryFn: () => customerApi.getCustomerById(customerId, token!),
    enabled: isAuthenticated && !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
export function useNotifications(
  payload?: NotificationPayload,
): UseQueryResult<NotificationResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', token, JSON.stringify(payload || {})],
    queryFn: () => customerApi.getNotifications(token!, payload),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes (notifications update more frequently)
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
// Hook specifically for getting unread notifications count

export function useUnreadNotifications(): UseQueryResult<NotificationResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['unreadNotifications', token],
    queryFn: () => customerApi.getNotifications(token!, { read: '0' }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 minute (unread count should be more fresh)
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useNotificationDetail(
  notificationId: string,
  payload?: NotificationPayload,
): UseQueryResult<NotificationDetailResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notificationDetail', notificationId, token, JSON.stringify(payload || {})],
    queryFn: () => customerApi.getNotificationDetail(notificationId, token!, payload),
    enabled: isAuthenticated && !!notificationId,
    staleTime: 1000 * 60 * 2, // shorter cache for detail to allow refresh
    retry: 2,
  });
}
export function useDecodeToken(): UseQueryResult<DecodeTokenResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['decodeToken', token],
    queryFn: () => customerApi.decodeToken(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15, // 15 minutes (token info doesn't change often)
    retry: 2,
  });
}

interface UseUploadImagePayload {
  file: File;
  authToken: string;
}

export function useUploadImage(): UseMutationResult<any, Error, UseUploadImagePayload> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async ({ file }: UseUploadImagePayload) => {
      if (!file) {
        throw new Error('File is required for upload');
      }
      try {
        return await customerApi.uploadImage(file, token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

// Logout Mutation Hook
export function useLogout(): UseMutationResult<LogoutResponse, Error, string> {
    const { token } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        return await customerApi.logout(token!);
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

export function useProducts(payload: UseProductsPayload = {}): UseQueryResult<any, Error> {
  const defaultPayload = {
    limit: 3000,
    offset: 0,
    orderby: '',
    order: 'asc' as const,
    category: '',
    ...payload,
  };

  return useQuery({
    queryKey: ['products', JSON.stringify(defaultPayload)],
    queryFn: () => productAPI.getProducts(defaultPayload ),
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

export function useProductDetail(productId: string): UseQueryResult<any, Error> {

  return useQuery({
    queryKey: ['productDetail', productId],
    queryFn: () => productAPI.getProductDetail(productId),
    enabled: !!productId,
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
    ...payload,
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

export function useChapterById(chapterId: string): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['chapterById', chapterId, token],
    queryFn: () => chapterApi.getChapterById(chapterId, token!),
    enabled: isAuthenticated && !!chapterId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
export function useChaptersByCustomer(customerId: string): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['chaptersByCustomer', customerId, token],
    queryFn: () => chapterApi.getChaptersByCustomer(customerId, token!),
    enabled: isAuthenticated && !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
// Cart API Hooks
export function useCart(): UseQueryResult<CartResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['cart', token],
    queryFn: () => cartApi.getCart(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes (cart data should be fresh)
    retry: 2,
  });
}
interface UseAddToCartPayload {
  data: AddToCartRequest;
}

export function useAddToCart(): UseMutationResult<AddToCartResponse, Error, UseAddToCartPayload> {
    const { token } = useAuthStore();

  return useMutation({
    mutationFn: async ({ data }: UseAddToCartPayload) => {
      if (!data.sku || data.sku.trim() === '') {
        throw new Error('SKU is required');
      }
      if (!data.qty || data.qty.trim() === '') {
        throw new Error('Quantity is required');
      }
      try {
        return await cartApi.addToCart(data, token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useRemoveFromCart(): UseMutationResult<RemoveFromCartResponse, Error, string> {
    const { token } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        return await cartApi.removeFromCart(token!);
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
    limit: '120',
    offset: '0',
    confirm: '',
    paid: '',
    date: '',
  },
): UseQueryResult<OrderListResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orders', JSON.stringify(payload), token],
    queryFn: () => orderApi.getOrders(payload, token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes (order data should be relatively fresh)
    retry: 2,
  });
}

export function useAddOrder(): UseMutationResult<OrderAddResponse, Error, string> {
    const { token } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        return await orderApi.addOrder(token!);
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

export function useAddItemToOrder(): UseMutationResult<
  OrderAddItemResponse,
  Error,
  UseAddItemToOrderPayload
> {
    const { token } = useAuthStore();

  return useMutation({
    mutationFn: async ({ orderId, data }: UseAddItemToOrderPayload) => {
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
        return await orderApi.addItemToOrder(orderId, data, token!);
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

export function useCheckoutOrder(): UseMutationResult<
  OrderCheckoutResponse,
  Error,
  UseCheckoutOrderPayload
> {
    const { token } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ orderId }: UseCheckoutOrderPayload) => {
      if (!token || token.trim() === '') {
        throw new Error('Valid auth token is required for checkout');
      }
      if (!orderId || orderId.trim() === '') {
        throw new Error('Order ID is required');
      }
      try {
        return await orderApi.checkoutOrder(orderId, token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useOrderDetail(orderId: string): UseQueryResult<OrderDetailResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orderDetail', orderId, token],
    queryFn: () => orderApi.getOrderDetail(orderId, token!),
    enabled: isAuthenticated && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403) or not found (404)
      if (axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Merchant Registration Hook
interface UseMerchantRegistrationPayload {
  eventid: string;
  name: string;
  cp: string;
  address: string;
  phone: string;
  email: string;
  menu: string;
  qty: string;
}

export function useMerchantRegistration(): UseMutationResult<any, Error, UseMerchantRegistrationPayload> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: UseMerchantRegistrationPayload) => {
      try {
        const formData = new FormData();
        formData.append('eventid', payload.eventid);
        formData.append('name', payload.name);
        formData.append('cp', payload.cp);
        formData.append('address', payload.address);
        formData.append('phone', payload.phone);
        formData.append('email', payload.email);
        formData.append('menu', payload.menu);
        formData.append('qty', payload.qty);

        console.log('🏪 Merchant Registration Payload:', payload);
        return await registerMerchant(token!, formData);
      } catch (error) {
        console.error('❌ Merchant Registration Error:', error);
        throw error;
      }
    },
  });
}

// Public Registration Hook
interface UsePublicRegistrationPayload {
  eventid: string;
  name: string;
  type: string;
  policeno: string;
  phone: string;
  email: string;
  notes: string;
}

export function usePublicRegistration(): UseMutationResult<any, Error, UsePublicRegistrationPayload> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: UsePublicRegistrationPayload) => {
      try {
        const formData = new FormData();
        formData.append('eventid', payload.eventid);
        formData.append('name', payload.name);
        formData.append('type', payload.type);
        formData.append('policeno', payload.policeno);
        formData.append('phone', payload.phone);
        formData.append('email', payload.email);
        formData.append('notes', payload.notes);

        console.log('👤 Public Registration Payload:', payload);
        return await registerPublic(token!, formData);
      } catch (error) {
        console.error('❌ Public Registration Error:', error);
        throw error;
      }
    },
  });
}

// Event Registration Hook
interface UseEventRegisterPayload {
  eventId: string;
}

export function useEventRegister(): UseMutationResult<any, Error, UseEventRegisterPayload> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: UseEventRegisterPayload) => {
      try {
        console.log('🎫 Event Registration Payload:', payload);
        return await registerEvent(token!, payload.eventId);
      } catch (error) {
        console.error('❌ Event Registration Error:', error);
        throw error;
      }
    },
  });
}
