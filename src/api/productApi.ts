import axios, { AxiosError } from 'axios';
import {
  BASE_URL,
  ENDPOINT_PRODUCT,
  ENDPOINT_PRODUCT_DETAIL,
  ENDPOINT_PRODUCT_SEARCH,
  ENDPOINT_PRODUCT_CITY,
  ENDPOINT_PRODUCT_LATEST,
} from './constants';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface ProductApiError extends ApiError {
  endpoint?: string;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const axiosError = error as AxiosError<ProductApiError>;
    const status = error.response?.status ?? 0;
    const data = axiosError.response?.data;

    const apiError: ProductApiError = {
      status,
      message: data?.message ?? error.message ?? 'Unknown error occurred',
      code: data?.code,
      endpoint: axiosError.config?.url,
    };

    console.error(`API Error [${status}] on ${apiError.endpoint}:`, apiError.message);
    return Promise.reject(apiError);
  }
);

export const productAPI = {
  getProducts: async (payload = {}) => {
    const defaultPayload = {
      limit: 30,
      offset: 0,
      orderby: '',
      order: 'asc',
      category: '',
      location: '',
      condition: '',
      ...payload,
    };

    try {
      const response = await apiClient.post(ENDPOINT_PRODUCT, defaultPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProductDetail: async (productId: string) => {
    try {
      const response = await apiClient.get(`${ENDPOINT_PRODUCT_DETAIL}${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  searchProducts: async (searchPayload = {}) => {
    try {
      const response = await apiClient.post(ENDPOINT_PRODUCT_SEARCH, searchPayload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProductCities: async () => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_CITY);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLatestProducts: async (type: 0 | 1 = 0) => {
    try {
      const response = await apiClient.get(`${ENDPOINT_PRODUCT_LATEST}${type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBestSellerProducts: async () => {
    try {
      const response = await apiClient.get(`${ENDPOINT_PRODUCT_LATEST}1`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProductCategories: async () => {
    // TODO: Add actual endpoint if needed
    return { content: [] };
  },
};

export default productAPI;
