import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_PARTNER,
  ENDPOINT_PARTNER_CATEGORY,
  ENDPOINT_PARTNER_CITY,
} from './constants';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export interface PartnerItem {
  id: number;
  name: string;
  category: string;
  cp: string;
  npwp: string;
  address: string;
  city_name: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  coordinate: string | null;
  zip: string;
  notes: string | null;
  image: string | null;
  created: string;
  updated: string | null;
  deleted: string | null;
}

export interface PartnerListRequest {
  category?: string;
  city?: string;
  limit?: string;
  offset?: string;
}

export interface PartnerListResponse {
  result: PartnerItem[];
}

export interface PartnerCategoryResponse {
  result: string[];
}

export interface PartnerCityResponse {
  result: string[];
}

const DEFAULT_PARTNER_LIST_PAYLOAD: PartnerListRequest = {
  category: '',
  city: '',
  limit: '10',
  offset: '0',
};

export const partnerApi = {
  // POST /partner - server-side filtered + paginated list
  getPartners: async (
    data?: Partial<PartnerListRequest>,
  ): Promise<PartnerListResponse> => {
    const payload = data
      ? { ...DEFAULT_PARTNER_LIST_PAYLOAD, ...data }
      : DEFAULT_PARTNER_LIST_PAYLOAD;
    try {
      const response = await apiClient.post<PartnerListResponse>(
        ENDPOINT_PARTNER,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch partners');
      }
      throw error;
    }
  },

  // GET /partner/category - list of available filter values
  getPartnerCategories: async (): Promise<PartnerCategoryResponse> => {
    try {
      const response = await apiClient.get<PartnerCategoryResponse>(
        ENDPOINT_PARTNER_CATEGORY,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching partner categories:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch partner categories',
        );
      }
      throw error;
    }
  },

  // GET /partner/city - list of available filter values
  getPartnerCities: async (): Promise<PartnerCityResponse> => {
    try {
      const response = await apiClient.get<PartnerCityResponse>(ENDPOINT_PARTNER_CITY);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner cities:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch partner cities',
        );
      }
      throw error;
    }
  },
};

export default partnerApi;