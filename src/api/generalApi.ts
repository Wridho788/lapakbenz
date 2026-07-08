import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_LEDGER,
  ENDPOINT_SLIDER,
  ENDPOINT_SPLASH,
  ENDPOINT_CITY,
} from './constants';
import type { LedgerResponse, SliderResponse, SplashResponse, CityListResponse } from './types';

interface LedgerPayload {
  ismoney?: string;
  limit?: string;
  offset?: string;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const generalApi = {
  getLedger: async (authToken: string, payload: LedgerPayload = {}): Promise<LedgerResponse> => {
    const response = await apiClient.post(
      ENDPOINT_LEDGER,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    return response.data;
  },

  getSlider: async (payload: { limit?: number; offset?: number } = {}): Promise<SliderResponse> => {
    const response = await apiClient.post(ENDPOINT_SLIDER, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  getSplash: async (): Promise<SplashResponse> => {
    const response = await apiClient.get(ENDPOINT_SPLASH);
    return response.data;
  },

  getCityList: async (): Promise<CityListResponse> => {
    const response = await apiClient.get(`${ENDPOINT_CITY}`);
    return response.data;
  },
};

export default generalApi;
