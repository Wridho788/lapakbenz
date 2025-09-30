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
  ENDPOINT_GET_BY_ID,
  ENDPOINT_NOTIF,
  ENDPOINT_NOTIF_DETAIL,
  ENDPOINT_DECODE_TOKEN,
  ENDPOINT_UPLOAD_IMAGE,
  ENDPOINT_VERIFY
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
} from './types';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Utility function to convert object to URLSearchParams
const createFormData = (data: Record<string, any>): URLSearchParams => {
  const formData = new URLSearchParams();
  Object.keys(data).forEach(key => {
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
      console.log('📤 Login API Request:', {
        url: `${BASE_URL}${ENDPOINT_LOGIN}`,
        payload: JSON.stringify(payload, null, 2),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await apiClient.post(
        ENDPOINT_LOGIN,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('📥 Login API Response:', response.data);
      return response.data;
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
      const response = await apiClient.post(
        ENDPOINT_FORGOT,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Forgot Password API Error:', error);
      throw error;
    }
  },
  

  /**
   * Request OTP
   */
  requestOTP: async (payload: RequestOTPRequest): Promise<RequestOTPResponse> => {
    try {
      const response = await apiClient.post(
        ENDPOINT_REQ_OTP,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
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
    authToken: string
  ): Promise<UpdateProfileResponse> => {
    try {
      const response = await apiClient.post(
        ENDPOINT_UPDATE,
        createFormData(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-auth-token': authToken,
          },
        }
      );
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
      const response = await apiClient.post(
        ENDPOINT_REGISTER,
        createFormData(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Register API Error:', error);
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (
    payload: ChangePasswordRequest,
    authToken: string
  ): Promise<ChangePasswordResponse> => {
    try {
      const response = await apiClient.post(
        ENDPOINT_CHANGE_PASSWORD,
        createFormData(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-auth-token': authToken,
          },
        }
      );
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
      console.log('📤 Get Profile API Request:', {
        url: `${BASE_URL}${ENDPOINT_GET_PROFILE}`,
        headers: { 'X-auth-token': authToken }
      });

      const response = await apiClient.get(
        ENDPOINT_GET_PROFILE,
        {
          headers: {
            'X-auth-token': authToken,
          },
        }
      );

      console.log('📥 Get Profile API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get Profile API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
        console.error('📊 Error Status:', error.response?.status);
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
   * Get customer by ID
   */
  getCustomerById: async (customerId: string, authToken: string): Promise<GetProfileResponse> => {
    try {
      console.log('📤 Get Customer By ID API Request:', {
        url: `${BASE_URL}${ENDPOINT_GET_BY_ID}${customerId}`,
        customerId,
        headers: { 'X-auth-token': authToken }
      });
      
      const response = await apiClient.get(
        `${ENDPOINT_GET_BY_ID}${customerId}`,
        {
          headers: {
            'X-auth-token': authToken,
          },
        }
      );
      
      console.log('📥 Get Customer By ID API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get Customer By ID API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },

  /**
   * Get notifications with dynamic payload
   */
  getNotifications: async (authToken: string, payload?: NotificationPayload): Promise<NotificationResponse> => {
    try {
      // Default payload - get all notifications (read + unread)
      const defaultPayload: NotificationPayload = {
        type: "",
        campaign: "",
        read: "", // Empty string to get all (both read and unread)
        limit: "50",
        offset: "0"
      };

      // Merge with provided payload
      const finalPayload = { ...defaultPayload, ...payload };
      
      console.log('📤 Get Notifications API Request:', {
        url: `${BASE_URL}${ENDPOINT_NOTIF}`,
        payload: finalPayload,
        headers: { 'X-auth-token': authToken.substring(0, 10) + '...' }
      });
      
      // Use JSON payload like other APIs (postEvent, postArticle, login)
      const response = await apiClient.post(
        ENDPOINT_NOTIF,
        JSON.stringify(finalPayload),
        {
          headers: {
            'X-auth-token': authToken,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('📥 Get Notifications API Response:', response.data);
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
          data: error.config?.data
        });
      }
      throw error;
    }
  },

  /**
   * Get notification detail
   */
  getNotificationDetail: async (notificationId: string, authToken: string, payload?: NotificationPayload): Promise<NotificationDetailResponse> => {
    try {
      // Default body payload as requested
      const defaultPayload: NotificationPayload = {
        type: '',
        campaign: '',
        read: '0',
        limit: '2',
        offset: '0'
      };
      const finalPayload = { ...defaultPayload, ...payload };

      console.log('📤 Get Notification Detail API Request:', {
        url: `${BASE_URL}${ENDPOINT_NOTIF_DETAIL}${notificationId}`,
        notificationId,
        body: finalPayload,
        headers: { 'X-auth-token': authToken }
      });

      // Switch to POST to allow body payload (requirement)
      const response = await apiClient.post(
        `${ENDPOINT_NOTIF_DETAIL}${notificationId}`,
        JSON.stringify(finalPayload),
        {
          headers: {
            'X-auth-token': authToken,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('📥 Get Notification Detail API Response:', response.data);
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
      console.log('📤 Decode Token API Request:', {
        url: `${BASE_URL}${ENDPOINT_DECODE_TOKEN}`,
        headers: { 'X-auth-token': authToken }
      });
      
      const response = await apiClient.get(
        ENDPOINT_DECODE_TOKEN,
        {
          headers: {
            'X-auth-token': authToken,
          },
        }
      );
      
      console.log('📥 Decode Token API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Decode Token API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
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
verifyOTP: async (id_customer: string, otp: string): Promise<any> => {
  try {
    const url = `${ENDPOINT_VERIFY}${id_customer}/${otp}`;
    
    console.log('📤 Verify OTP API Request:', {
      url: `${BASE_URL}${url}`,
      id_customer,
      otp: '***' // Hide OTP in logs for security
    });
    
    const response = await apiClient.get(url);
    
    console.log('📥 Verify OTP API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Verify OTP API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('📥 Error Response:', error.response?.data);
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
      formData.append('userfile', file);

      console.log('📤 Upload Image API Request:', {
        url: `${BASE_URL}${ENDPOINT_UPLOAD_IMAGE}`,
        fileName: file.name,
        fileSize: file.size,
        headers: { 'X-auth-token': authToken }
      });
      
      const response = await apiClient.post(
        ENDPOINT_UPLOAD_IMAGE,
        formData,
        {
          headers: {
            'X-auth-token': authToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('📥 Upload Image API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload Image API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
        console.error('📊 Error Status:', error.response?.status);
      }
      throw error;
    }
  },

  /**
   * Logout customer
   */
  logout: async (authToken: string): Promise<LogoutResponse> => {
    try {
      console.log('📤 Logout API Request:', {
        url: `${BASE_URL}${ENDPOINT_LOGOUT}`,
        headers: { 'X-auth-token': authToken }
      });
      
      const response = await apiClient.post(
        ENDPOINT_LOGOUT,
        {},
        {
          headers: {
            'X-auth-token': authToken,
          },
        }
      );
      
      console.log('📥 Logout API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Logout API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('📥 Error Response:', error.response?.data);
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
  getCustomerById,
  getNotifications,
  getNotificationDetail,
  decodeToken,
  uploadImage,
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
} from './types';

// Export default
export default customerApi;
