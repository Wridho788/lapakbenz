
import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { getLedger, getSlider, getSplash, postEvent } from './api';

export function useLedger(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['ledger'],
    queryFn: async () => {
      try {
        return await getLedger();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

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

export function usePostEvent(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await postEvent(data);
      } catch (error) {
        throw error;
      }
    },
  });
}
