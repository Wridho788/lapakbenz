
import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { getLedger, getSlider, getSplash, postEvent, postArticle, getEventById } from './api';
import { customerApi } from './customerApi';
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
