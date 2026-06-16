import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { customerApi } from '../customerApi';
import { useAuthStore } from '../../stores/authStore';
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
  NotificationPayload,
  DecodeTokenContent,
  LogoutResponse,
} from '../types';

const getAuthToken = (): string | null => useAuthStore.getState().token;

export function useLogin(): UseMutationResult<LoginResponse, Error, LoginRequest> {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      try {
        return await customerApi.login(payload);
      } catch (error) {
        console.error('Login Hook Error:', error);
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
        console.error('Register Hook Error:', error);
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
        console.error('Forgot Password Hook Error:', error);
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
        console.error('Request OTP Hook Error:', error);
        throw error;
      }
    },
  });
}

export function useSimpleRequestOTP(
  username: string,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: RequestOTPResponse) => void;
    onError?: (error: Error) => void;
  },
): UseMutationResult<RequestOTPResponse, Error, RequestOTPRequest> & {
  canRequest: boolean;
  requestOTP: () => void;
} {
  const canRequest = Boolean(username && username.trim().length > 0);

  const mutation = useMutation({
    mutationFn: async (payload: RequestOTPRequest): Promise<RequestOTPResponse> => {
      if (!payload.username?.trim()) {
        throw new Error('Username is required');
      }
      return await customerApi.requestOTP(payload);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  const requestOTP = () => {
    if (canRequest) {
      mutation.mutate({ username: username.trim() });
    }
  };

  return { ...mutation, canRequest, requestOTP };
}

interface VerifyOTPPayload {
  otp: number;
  username: string;
}

export function useVerifyOTP(): UseMutationResult<any, Error, VerifyOTPPayload> {
  return useMutation({
    mutationFn: async (payload: VerifyOTPPayload) => {
      if (!payload.username?.trim()) {
        throw new Error('Username is required');
      }
      if (!payload.otp) {
        throw new Error('OTP code is required');
      }
      return await customerApi.verifyOTP(payload.otp,payload.username);
    },
  });
}

interface UpdateProfilePayload {
  data: UpdateProfileRequest;
}

export function useUpdateProfile(): UseMutationResult<
  UpdateProfileResponse,
  Error,
  UpdateProfilePayload
> {
  return useMutation({
    mutationFn: ({ data }: UpdateProfilePayload) => {
      const token = getAuthToken();
      if (!token) throw new Error('Auth token required');
      return customerApi.updateProfile(data, token);
    },
  });
}

interface ChangePasswordPayload {
  data: ChangePasswordRequest;
}

export function useChangePassword(): UseMutationResult<
  ChangePasswordResponse,
  Error,
  ChangePasswordPayload
> {
  return useMutation({
    mutationFn: ({ data }: ChangePasswordPayload) => {
      const token = getAuthToken();
      if (!token) throw new Error('Auth token required');
      return customerApi.changePassword(data, token);
    },
  });
}

export function useProfile(): UseQueryResult<GetProfileResponse, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['profile', token],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      return customerApi.getProfile(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useDecodeToken(): UseQueryResult<DecodeTokenContent, Error> {
  const token = getAuthToken();
  return useQuery({
    queryKey: ['decodeToken', token],
    queryFn: async () => {
      if (!token) throw new Error('Auth token required');
      const res = await customerApi.decodeToken(token);
      if (!res.result) throw new Error('Invalid token response');
      return res.result;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useNotifications(payload?: NotificationPayload): UseQueryResult<any, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['notifications', token, JSON.stringify(payload || {})],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      return customerApi.getNotifications(token, payload);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUnreadNotifications(): UseQueryResult<any, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['unreadNotifications', token],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      return customerApi.getNotifications(token, { category: '', limit: '10', offset: '0' });
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 1,
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
): UseQueryResult<any, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['notificationDetail', notificationId, token, JSON.stringify(payload || {})],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      return customerApi.getNotificationDetail(notificationId, token);
    },
    enabled: !!token && !!notificationId,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
}

interface UploadImagePayload {
  file: File;
}

export function useUploadImage(): UseMutationResult<any, Error, UploadImagePayload> {
  return useMutation({
    mutationFn: async ({ file }: UploadImagePayload) => {
      const token = getAuthToken();
      if (!token) throw new Error('Auth token required');
      if (!file) throw new Error('File is required');
      return await customerApi.uploadImage(file, token);
    },
  });
}

export function useLogout(): UseMutationResult<LogoutResponse, Error, void> {
  return useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      if (!token) throw new Error('Auth token required');
      return await customerApi.logout(token);
    },
    onSuccess: () => {
      useAuthStore.getState().logout();
    },
  });
}

export function useUserData() {
  const profile = useProfile();
  const decodeToken = useDecodeToken();
  const notifications = useNotifications();
  // Normalize notifications response to handle different API shapes
  const normalizeNotificationResult = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data.result)) return data.result;
    if (data.result?.content && Array.isArray(data.result.content)) return data.result.content;
    return [];
  };

  const notificationItems = normalizeNotificationResult(notifications.data);

  // reading can be number (0) or string ('0'), count both as unread
  const unreadCount = notificationItems.filter((n: any) => n.reading === '0' || n.reading === 0).length || 0;
  return {
    profile: profile.data?.result,
    userInfo: decodeToken.data,
    unreadCount,
    isLoading: profile.isLoading || decodeToken.isLoading,
    notifications: notificationItems,
  };
}
