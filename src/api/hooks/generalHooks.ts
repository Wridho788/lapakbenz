import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import {
  getLedger,
  getSlider,
  getSplash,
  getCity,
} from '../api';

// Ledger Hook
export function useLedger(): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['ledger', token],
    queryFn: () => getLedger(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// UI Content Hooks
export function useSlider(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['slider'],
    queryFn: async () => {
      try {
        return await getSlider();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useSplash(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['splash'],
    queryFn: async () => {
      try {
        return await getSplash();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

// Location Hook
export function useCity(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['city'],
    queryFn: async () => {
      try {
        return await getCity();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (city data doesn't change often)
    retry: 2,
  });
}