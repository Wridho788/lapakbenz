import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_CHAPTER,
  ENDPOINT_CHAPTER_BY_ID,
  ENDPOINT_CHAPTER_GET_BY_CUSTOMER,
} from './constants';

// Types for Chapter API
export interface ChapterListRequest {
  limit: number;
  offset: number;
}

export interface ChapterItem {
  id: string;
  title: string;
  name: string;
  description?: string;
  image?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // For additional fields from API
}

export interface ChapterListResponse {
  status: boolean;
  message: string;
  content: {
    result: ChapterItem[];
    total: number;
    [key: string]: any;
  };
}

export interface ChapterDetailResponse {
  status: boolean;
  message: string;
  content: ChapterItem;
}

export interface ChapterByCustomerResponse {
  status: boolean;
  message: string;
  content: {
    result: ChapterItem[];
    total: number;
    [key: string]: any;
  };
}

// Axios instance for chapter API
const chapterApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Chapter API functions
export const chapterApi = {
  // Get chapters list with pagination
  getChapters: async (payload: ChapterListRequest): Promise<ChapterListResponse> => {
    try {
      console.log('📚 Fetching chapters with payload:', payload);
      
      const response = await chapterApiClient.post(
        ENDPOINT_CHAPTER,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Chapters fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chapters:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapters');
      }
      throw error;
    }
  },

  // Get chapter by ID
  getChapterById: async (chapterId: string, authToken: string): Promise<ChapterDetailResponse> => {
    try {
      console.log('📖 Fetching chapter by ID:', chapterId);
      
      const response = await chapterApiClient.get(
        `${ENDPOINT_CHAPTER_BY_ID}${chapterId}`,
        {
          headers: {
            'X-auth-token': authToken,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Chapter detail fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chapter detail:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapter detail');
      }
      throw error;
    }
  },

  // Get chapters by customer ID
  getChaptersByCustomer: async (customerId: string, authToken: string): Promise<ChapterByCustomerResponse> => {
    try {
      console.log('👤 Fetching chapters by customer ID:', customerId);
      
      const response = await chapterApiClient.get(
        `${ENDPOINT_CHAPTER_GET_BY_CUSTOMER}${customerId}`,
        {
          headers: {
            'X-auth-token': authToken,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Customer chapters fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching customer chapters:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customer chapters');
      }
      throw error;
    }
  },
};

export default chapterApi;
