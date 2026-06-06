import axios, { AxiosError } from 'axios';
import {
  BASE_URL,
  ENDPOINT_CART,
  ENDPOINT_CART_ADD,
  ENDPOINT_CART_CLEAN,
  ENDPOINT_CART_SET_NOTE,
  ENDPOINT_CART_SET_PICKUP,
  ENDPOINT_CART_SET_PUBLISH,
  ENDPOINT_ORDER_CHECKOUT,
} from './constants';
import type {
  CartResponse,
  AddToCartRequest,
  AddToCartResponse,
  RemoveFromCartResponse,
  SetPickupResponse,
} from './types';
import { useAuthStore } from '../stores/authStore';

// Types
interface CheckoutResponse {
  order_code?: string;
  link_url?: string;
  content?: {
    orderid?: string | number;
    invoice_url?: string;
    transid?: number;
    [key: string]: unknown;
  };
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  error?: string;
  data?: any;
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
      const serverMessage = data?.message ?? data?.error;

      const apiError: ApiError = {
        status,
        message: typeof serverMessage === 'string' ? serverMessage : error.message ?? 'Unknown error occurred',
        code: data?.code,
        error: typeof data?.error === 'string' ? data.error : undefined,
        data,
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

// Helper function to check for errors in response
const checkResponseError = (data: any, context: string) => {
  if (data?.error || (data?.success === false)) {
    throw new Error(data?.error || data?.message || `Error in ${context}`);
  }
};

export const cartApi = {
  async getCart(): Promise<CartResponse> {
    const res = await apiClient.get(ENDPOINT_CART);
    checkResponseError(res.data, 'getCart');

    const data = res.data;
    const imageBase = data.image_url || '';

    const normalizeItem = (item: any, baseUrl: string) => ({
      id: String(item.id ?? item.product_id ?? ''),
      sku: item.sku || item.product_sku || '',
      name: item.name || item.product_name || '',
      image:
        item.image ||
        (item.product_image ? `${baseUrl || ''}${item.product_image}` : '/nodata.png'),
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_image: item.product_image,
      product_url_image: item.product_url_image,
      qty: Number(item.qty) || 0,
      price: Number(item.price) || 0,
      shipping: Number(item.shipping) || 0,
      shipping_temp: item.shipping_temp != null ? Number(item.shipping_temp) : undefined,
      amount: Number(item.amount) || 0,
      total: Number(item.total) || 0,
      pickup: String(item.pickup ?? '0'),
      publish: String(item.publish ?? '0'),
      attribute: item.attribute ?? null,
      description: item.description ?? null,
      note: item.note ?? null,
      notes: item.notes ?? null,
      customer: item.customer,
      tax: item.tax,
      created: item.created || '',
      updated: item.updated ?? null,
      deleted: item.deleted ?? null,
    });

    const normalizeItems = (items: any[], baseUrl: string) => items.map((item: any) => normalizeItem(item, baseUrl));

    if (Array.isArray(data?.result)) {
      const normalizedResult = normalizeItems(data.result, imageBase);
      return {
        image_url: data.image_url,
        total: Number(data.total) || 0,
        cost: Number(data.cost) || 0,
        content: {
          balance: Number(data.total) || 0,
          record: normalizedResult.length,
          cost: Number(data.cost) || 0,
          result: normalizedResult,
        },
      };
    }

    if (Array.isArray(data?.content?.result)) {
      const normalizedResult = normalizeItems(data.content.result, imageBase);
      return {
        image_url: data.image_url,
        total: Number(data.total ?? data.content.balance) || 0,
        cost: Number(data.cost ?? data.content.cost) || 0,
        content: {
          balance: Number(data.content.balance ?? data.total) || 0,
          record: normalizedResult.length,
          cost: Number(data.content.cost ?? data.cost) || 0,
          result: normalizedResult,
        },
      };
    }

    return data;
  },

  async addToCart(payload: AddToCartRequest): Promise<AddToCartResponse> {
    const res = await apiClient.post(ENDPOINT_CART_ADD, {
      product_id: payload.product_id,
      qty: payload.qty,
    });
    checkResponseError(res.data, 'addToCart');
    return res.data;
  },

  async removeFromCart(): Promise<RemoveFromCartResponse> {
    const res = await apiClient.delete(ENDPOINT_CART_CLEAN);
    checkResponseError(res.data, 'removeFromCart');
    return res.data;
  },

  async setPickup(cartId: string): Promise<SetPickupResponse> {
    if (!cartId?.trim()) throw new Error('Cart ID is required');
    const res = await apiClient.put(`${ENDPOINT_CART_SET_PICKUP}${cartId}`, null);
    checkResponseError(res.data, 'setPickup');
    return res.data;
  },

  async setPublish(cartId: string): Promise<SetPickupResponse> {
    if (!cartId?.trim()) throw new Error('Cart ID is required');
    const res = await apiClient.put(`${ENDPOINT_CART_SET_PUBLISH}${cartId}`, null);
    checkResponseError(res.data, 'setPublish');
    return res.data;
  },

  async setNotes(cartId: string, notes: string): Promise<SetPickupResponse> {
    if (!cartId?.trim()) throw new Error('Cart ID is required');
    const res = await apiClient.put(`${ENDPOINT_CART_SET_NOTE}${cartId}`, { notes });
    checkResponseError(res.data, 'setNotes');
    return res.data;
  },

  async deleteItemCart(cartId: string): Promise<void> {
    if (!cartId?.trim()) throw new Error('Cart ID is required');
    const res = await apiClient.delete(`${ENDPOINT_CART}/${cartId}`);
    checkResponseError(res.data, 'deleteItemCart');
  },

  async checkoutOrder(): Promise<CheckoutResponse> {
    const res = await apiClient.get(ENDPOINT_ORDER_CHECKOUT);
    checkResponseError(res.data, 'checkoutOrder');
    return res.data;
  },
};

export default cartApi;