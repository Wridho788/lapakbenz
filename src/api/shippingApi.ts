import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_PROVINCE_SHIPPING,
  ENDPOINT_CITY_SHIPPING,
  ENDPOINT_DISTRICT_SHIPPING,
  ENDPOINT_SET_SHIPPING,
} from './constants';
import type {
  ProvinceResponse,
  CityShippingResponse,
  DistrictResponse,
} from './types';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const shippingApi = {
  getProvince: async (authToken: string): Promise<ProvinceResponse> => {
    const response = await apiClient.get(ENDPOINT_PROVINCE_SHIPPING, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  getCityByProvince: async (provinceId: string, authToken: string): Promise<CityShippingResponse> => {
    const response = await apiClient.get(`${ENDPOINT_CITY_SHIPPING}${provinceId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  getDistrictByCity: async (cityId: string, authToken: string): Promise<DistrictResponse> => {
    const response = await apiClient.get(`${ENDPOINT_DISTRICT_SHIPPING}${cityId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  setShipping: async (
    payload: { address: string; city: string; city_name: string; district: string; district_name: string; province: string; province_name: string },
    authToken: string,
  ): Promise<any> => {
    const response = await apiClient.put(ENDPOINT_SET_SHIPPING, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

export default shippingApi;
