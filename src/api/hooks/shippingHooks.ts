import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { shippingApi } from '../shippingApi';
import type { SetShippingRequest } from '../types';

export function useProvince(): UseQueryResult<any, Error> {
  const token = useAuthStore.getState().token;

  return useQuery({
    queryKey: ['province', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token required');
      }
      return shippingApi.getProvince(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useCityByProvince(provinceId?: string | null): UseQueryResult<any, Error> {
  const token = useAuthStore.getState().token;

  return useQuery({
    queryKey: ['city', provinceId, token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token required');
      }
      return shippingApi.getCityByProvince(provinceId || '', token);
    },
    enabled: !!provinceId && !!token,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

// Backwards compatibility alias
export const useCity = useCityByProvince;

export function useDistrictByCity(cityId: string | null): UseQueryResult<any, Error> {
  const token = useAuthStore.getState().token;

  return useQuery({
    queryKey: ['district', cityId, token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token required');
      }
      return shippingApi.getDistrictByCity(cityId!, token);
    },
    enabled: !!cityId && !!token,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useSetShipping(): UseMutationResult<any, Error, SetShippingRequest> {
  return useMutation({
    mutationFn: (payload: SetShippingRequest) => {
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication token required');
      }
      return shippingApi.setShipping(payload, token);
    },
  });
}
