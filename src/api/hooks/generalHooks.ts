import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { generalApi } from '../generalApi';
import type { LedgerResponse, SliderResponse, SplashResponse, CityListResponse } from '../types';

const getAuthToken = (): string | null => localStorage.getItem('authToken');

export function useLedger(authToken?: string | null): UseQueryResult<LedgerResponse, Error> {
  const token = authToken || getAuthToken();
  return useQuery({
    queryKey: ['ledger', token],
    queryFn: () => generalApi.getLedger(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useSlider(): UseQueryResult<SliderResponse, Error> {
  return useQuery({
    queryKey: ['slider'],
    queryFn: () => generalApi.getSlider(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useSplash(): UseQueryResult<SplashResponse, Error> {
  return useQuery({
    queryKey: ['splash'],
    queryFn: () => generalApi.getSplash(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useCityList(): UseQueryResult<CityListResponse, Error> {
  return useQuery({
    queryKey: ['city-list'],
    queryFn: () => generalApi.getCityList(),
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}
