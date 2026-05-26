import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_EVENT,
  ENDPOINT_EVENT_BY_ID,
  ENDPOINT_EVENT_REGISTER,
  ENDPOINT_EVENT_REGISTER_MERCHANT,
  ENDPOINT_EVENT_REGISTER_PUBLIC,
  ENDPOINT_CHAPTER,
  ENDPOINT_CHAPTER_BY_ID,
  ENDPOINT_GET_FRONT,
} from './constants';
import type {
  EventListRequest,
  EventListResponse,
  EventDetailResponse,
  EventRegisterResponse,
  ChapterListRequest,
  ChapterListResponse,
  ChapterDetailResponse,
  ChapterByCustomerResponse,
} from './types';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const eventApi = {
  getEvents: async (data?: Partial<EventListRequest>): Promise<EventListResponse> => {
    const defaultPayload: EventListRequest = {
      status: '',
      limit: '100',
      offset: '0',
      chapter: '',
    };
    const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
    const response = await apiClient.post(ENDPOINT_EVENT, payload);
    return response.data;
  },

  getEventById: async (id: string, authToken?: string): Promise<EventDetailResponse> => {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const response = await apiClient.get(`${ENDPOINT_EVENT_BY_ID}/${id}`, { headers });
    return response.data;
  },

  getEventsByCustomer: async (
    authToken: string,
    data?: Partial<{ limit: number; offset: number }>,
  ): Promise<EventListResponse> => {
    const defaultPayload = { limit: 30, offset: 0 };
    const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
    const response = await apiClient.post(ENDPOINT_EVENT, JSON.stringify(payload), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  registerEvent: async (authToken: string, eventId: string): Promise<EventRegisterResponse> => {
    try {
      const response = await apiClient.get(`${ENDPOINT_EVENT_REGISTER}/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      return {
        ...response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Event registration API error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response?.status === 404) {
          throw new Error('Event not found. Please check the event ID.');
        } else if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message || 'Invalid request. Please check your data.',
          );
        }
        throw new Error(error.response?.data?.error || 'Registration failed');
      }
      throw error;
    }
  },

  registerMerchant: async (
    authToken: string,
    formData: FormData,
  ): Promise<EventRegisterResponse & { status: number }> => {
    const response = await apiClient.post(ENDPOINT_EVENT_REGISTER_MERCHANT, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      ...response.data,
      status: response.status,
    };
  },

  registerPublic: async (
    authToken: string,
    formData: FormData,
  ): Promise<EventRegisterResponse & { status: number }> => {
    const response = await apiClient.post(ENDPOINT_EVENT_REGISTER_PUBLIC, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      ...response.data,
      status: response.status,
    };
  },

  getEventsByChapters: async (chapterIds: number[]): Promise<any> => {
    const requests = chapterIds.map((chapterId) =>
      apiClient.post(ENDPOINT_EVENT, {
        status: '0',
        limit: '10',
        offset: '0',
        chapter: String(chapterId),
      })
    );

    const responses = await Promise.all(requests);

    const allResults: any[] = [];
    let imageUrl = '';

    responses.forEach((response) => {
      if (response.data?.content?.result) {
        allResults.push(...response.data.content.result);
      }
      if (response.data?.image_url) {
        imageUrl = response.data.image_url;
      }
    });

    return {
      content: {
        result: allResults,
        image_url: imageUrl,
      },
    };
  },
};

export const chapterApi = {
  getChapters: async (): Promise<ChapterListResponse> => {
    try {
      const response = await apiClient.post(ENDPOINT_CHAPTER);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapters');
      }
      throw error;
    }
  },

  getChapterById: async (chapterId: string, authToken: string): Promise<ChapterDetailResponse> => {
    try {
      const response = await apiClient.get(`${ENDPOINT_CHAPTER_BY_ID}${chapterId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter detail:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapter detail');
      }
      throw error;
    }
  },

  getChaptersByCustomer: async (
    customerId: string,
    authToken: string,
  ): Promise<ChapterByCustomerResponse> => {
    try {
      const response = await apiClient.post(
        ENDPOINT_CHAPTER,
        JSON.stringify({ customer: customerId, limit: 100, offset: 0 }),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters by customer:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapters');
      }
      throw error;
    }
  },

  getFrontChapters: async (payload: ChapterListRequest): Promise<ChapterListResponse> => {
    try {
      const response = await apiClient.post(ENDPOINT_GET_FRONT, payload);
      return response.data;
    } catch (error) {
      console.error('Error fetching front chapters:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch front chapters');
      }
      throw error;
    }
  },
};

export default eventApi;
