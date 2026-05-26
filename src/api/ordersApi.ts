import axios, { AxiosError } from 'axios';
import {
  BASE_URL,
  ENDPOINT_ORDER,
  ENDPOINT_ORDER_GET,
  ENDPOINT_ORDER_TRACKING,
} from './constants';
import type {
  OrderListRequest,
  OrderListResponse,
  OrderDetailResponse,
  OrderTrackingResponse,
  OrderItem,
} from './types';
import { useAuthStore } from '../stores/authStore';

// API Error type
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  error?: string;
}

// Centralized axios instance
const createApiClient = () => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
  });

  client.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;

      const apiError: ApiError = {
        status,
        message: data?.message ?? error.message ?? 'Unknown error occurred',
        code: data?.code,
      };

      if (status === 401) {
        try {
          useAuthStore.getState().logout();
        } catch (e) {
          console.error('Failed to logout on 401:', e);
        }
      }

      console.error(`API Error [${status}]:`, apiError.message);
      return Promise.reject(apiError);
    }
  );

  return client;
};

const apiClient = createApiClient();

export const orderApi = {
  getOrders(payload: OrderListRequest = { limit: '120', offset: '0', confirm: '', paid: '', start: '', end: '' }): Promise<OrderListResponse> {
    return apiClient.post(ENDPOINT_ORDER, payload).then((res) => {
      const data = res.data;

      // Handle raw API response format: { result: [...] }
      if (data?.result && Array.isArray(data.result)) {
        return {
          content: {
            record: data.result.length,
            result: data.result as OrderItem[],
          },
        };
      }

      // Handle normalized response format: { content: { result: [...] } }
      if (data?.content?.result && Array.isArray(data.content.result)) {
        return data as OrderListResponse;
      }

      // Fallback: return empty result
      return {
        content: {
          record: 0,
          result: [],
        },
      };
    });
  },

  getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    if (!orderId?.trim()) return Promise.reject(new Error('Order ID is required'));
    return apiClient.get(`${ENDPOINT_ORDER_GET}${orderId}`).then((res) => {
      const data = res.data;

      // Handle raw API response format: { imageurl, result: {...}, items: [...] }
      if (data?.result && typeof data.result === 'object') {
        return {
          content: {
            ...data.result,
            items: data.items || [],
            imageurl: data.imageurl,
          },
        };
      }

      // Handle normalized response format: { content: {...} }
      if (data?.content) {
        return data as OrderDetailResponse;
      }

      // Fallback: reject with error
      return Promise.reject(new Error('Invalid order detail response format'));
    });
  },

  trackOrder(awb: string, lastDigit: string): Promise<OrderTrackingResponse> {
    if (!awb?.trim()) return Promise.reject(new Error('AWB is required'));
    if (!lastDigit?.trim()) return Promise.reject(new Error('Last digit is required'));
    return apiClient.get(`${ENDPOINT_ORDER_TRACKING}${awb}`).then((res) => {
      const data = res.data;

      // Handle raw API response format: { result: { delivered, delivery_status, details, manifest, summary } }
      if (data?.result && typeof data.result === 'object') {
        return {
          content: {
            status: data.result.delivered ?? false,
            delivered: data.result.delivered ?? false,
            delivery_status: data.result.delivery_status,
            details: data.result.details,
            manifest: data.result.manifest ?? [],
            summary: data.result.summary ?? {
              courier_code: '',
              courier_name: '',
              waybill_number: awb,
              service_code: '',
              waybill_date: '',
              shipper_name: data.result.details?.shipper_name ?? '',
              receiver_name: data.result.details?.receiver_name ?? '',
              origin: data.result.details?.origin ?? '',
              destination: data.result.details?.destination ?? '',
              status: data.result.delivered ? 'DELIVERED' : 'ON PROCESS',
            },
          },
        };
      }

      // Handle already-normalized response format: { content: {...} }
      if (data?.content) {
        return data as OrderTrackingResponse;
      }

      // Fallback: return empty/tracking-not-found response
      return {
        content: {
          status: false,
          delivered: false,
          manifest: [],
          summary: {
            courier_code: '',
            courier_name: '',
            waybill_number: awb,
            service_code: '',
            waybill_date: '',
            shipper_name: '',
            receiver_name: '',
            origin: '',
            destination: '',
            status: 'UNKNOWN',
          },
        },
      };
    });
  },
};

// Re-export types for backward compatibility
export type {
  OrderListRequest,
  OrderListResponse,
  OrderDetailResponse,
  OrderTrackingResponse,
} from './types';

// Also export OrderItem for convenience
export type { OrderItem } from './types/orderTypes';

export default orderApi;