import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_LOGIN,
  ENDPOINT_FORGOT,
  ENDPOINT_REGISTER,
  ENDPOINT_REQ_OTP,
  ENDPOINT_UPDATE,
  ENDPOINT_CHANGE_PASSWORD,
  ENDPOINT_LOGOUT,
  ENDPOINT_GET_PROFILE,
  ENDPOINT_NOTIF,
  ENDPOINT_NOTIF_DETAIL,
  ENDPOINT_DECODE_TOKEN,
  ENDPOINT_IMAGE,
  ENDPOINT_VERIFY,
} from './constants';
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
  // SetShippingRequest,
  // SetShippingResponse,
} from './types';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Utility function to convert object to URLSearchParams
const createFormData = (data: Record<string, any>): URLSearchParams => {
  const formData = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key].toString());
    }
  });
  return formData;
};

// API functions
export const customerApi = {
  /**
   * Login customer
   */
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post(ENDPOINT_LOGIN, JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      return {
        token: data.token,
        type: data.type || 'bearer',
        success: data.success,
        message: data.message,
      };
    } catch (error) {
      console.error('❌ Login API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },

  /**
   * Forgot password
   */
  forgotPassword: async (payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post(ENDPOINT_FORGOT, (payload), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Forgot Password API Error:', error);
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error || error.response?.data?.message;
        if (serverMessage) {
          throw new Error(serverMessage);
        }
      }
      throw error;
    }
  },

  /**
   * Request OTP
   */
  requestOTP: async (payload: RequestOTPRequest): Promise<RequestOTPResponse> => {
    try {
      const response = await apiClient.post(ENDPOINT_REQ_OTP, (payload), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Request OTP API Error:', error);
      throw error;
    }
  },

  /**
   * Update customer profile
   */
  updateProfile: async (
    payload: UpdateProfileRequest,
    authToken: string,
  ): Promise<UpdateProfileResponse> => {
    try {
      const response = await apiClient.put(ENDPOINT_UPDATE, createFormData(payload), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update Profile API Error:', error);
      throw error;
    }
  },

  /**
   * Register new customer
   */
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post(ENDPOINT_REGISTER, createFormData(payload), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Register API Error:', error);
      if (axios.isAxiosError(error)) {
        const serverMsg = error.response?.data?.error || error.response?.data?.message;
        if (serverMsg) {
          throw Object.assign(new Error(serverMsg), { response: error.response });
        }
      }
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (
    payload: ChangePasswordRequest,
    authToken: string,
  ): Promise<ChangePasswordResponse> => {
    try {
      const response = await apiClient.put(ENDPOINT_CHANGE_PASSWORD, payload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Change Password API Error:', error);
      throw error;
    }
  },

  /**
   * Get customer profile
   */
  getProfile: async (authToken: string): Promise<GetProfileResponse> => {
    try {
      const response = await apiClient.get(ENDPOINT_GET_PROFILE, {
        headers: {
           'Authorization': `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          try {
            const { useAuthStore } = await import('../stores/authStore');
            useAuthStore.getState().logout();
          } catch (e) {
            console.error('Failed to logout on 401:', e);
          }
        }
      }
      throw error;
    }
  },


  /**
   * Get notifications with dynamic payload
   */
  getNotifications: async (
    authToken: string,
    payload?: NotificationPayload,
  ): Promise<NotificationResponse> => {
    try {
      // Default payload - get all notifications (read + unread)
      const defaultPayload: NotificationPayload = {
        category: '',
        limit: '10',
        offset: '0',
      };

      // Merge with provided payload
      const finalPayload = { ...defaultPayload, ...payload };

      // Use JSON payload like other APIs (postEvent, postArticle, login)
      const response = await apiClient.post(ENDPOINT_NOTIF, JSON.stringify(finalPayload), {
        headers: {
           'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Get Notifications API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
        console.error('📊 Error Status:', error.response?.status);
        console.error('📋 Error Headers:', error.response?.headers);
        console.error('📤 Request Config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        });
      }
      throw error;
    }
  },

  /**
   * Get notification detail
   */
  getNotificationDetail: async (
    notificationId: string,
    authToken: string,
  ): Promise<NotificationDetailResponse> => {
    try {
      const response = await apiClient.get(
        `${ENDPOINT_NOTIF_DETAIL}${notificationId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('❌ Get Notification Detail API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },

  /**
   * Decode token
   */
  decodeToken: async (authToken: string): Promise<DecodeTokenResponse> => {
    try {
      const response = await apiClient.get(ENDPOINT_DECODE_TOKEN, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },

  /**
   * Verify OTP
   * @param id_customer string - Customer ID
   * @param otp string - OTP code
   */
  verifyOTP: async (username: string, otp: string): Promise<any> => {
    try {
      const response = await apiClient.post(ENDPOINT_VERIFY, JSON.stringify({ username, otp }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },

 

  /**
   * Upload image
   */
  uploadImage: async (file: File, authToken: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiClient.post(ENDPOINT_IMAGE, formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload Image API Error:', error);
      throw error;
    }
  },

  /**
   * Set shipping address
   */
  // setShipping: async (
  //   payload: SetShippingRequest,
  //   authToken: string,
  // ): Promise<SetShippingResponse> => {
  //   try {
  //     const response = await apiClient.put(ENDPOINT_SET_SHIPPING, createFormData(payload), {
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //         'bearer': 'bearer'+authToken,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error('📊 Error Status:', error.response?.status);
  //     }
  //     throw error;
  //   }
  // },

  /**
   * Logout customer
   */
  logout: async (authToken: string): Promise<LogoutResponse> => {
    try {
      const response = await apiClient.get(
        ENDPOINT_LOGOUT,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },
};

// Export individual functions for convenience
export const {
  login,
  forgotPassword,
  requestOTP,
  updateProfile,
  register,
  changePassword,
  getProfile,
  getNotifications,
  getNotificationDetail,
  decodeToken,
  // setShipping,
  logout,
} = customerApi;

// Re-export types for convenience
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
  DecodeTokenResponse,
  LogoutResponse,
  SetShippingRequest,
  SetShippingResponse,
} from './types';

// Export default
export default customerApi;
