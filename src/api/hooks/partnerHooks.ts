import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { partnerApi } from '../partnerApi';
import type {
  PartnerListRequest,
  PartnerListResponse,
  PartnerCategoryResponse,
  PartnerCityResponse,
} from '../partnerApi';

// Filter option lists (category/city) change far less often than the
// partner list itself, so they get a longer cache lifetime.
const FILTER_OPTIONS_STALE_TIME = 1000 * 60 * 30; // 30 minutes
const PARTNER_LIST_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function usePartnerCategories(): UseQueryResult<PartnerCategoryResponse, Error> {
  return useQuery({
    queryKey: ['partnerCategories'],
    queryFn: () => partnerApi.getPartnerCategories(),
    staleTime: FILTER_OPTIONS_STALE_TIME,
    retry: 2,
  });
}

export function usePartnerCities(): UseQueryResult<PartnerCityResponse, Error> {
  return useQuery({
    queryKey: ['partnerCities'],
    queryFn: () => partnerApi.getPartnerCities(),
    staleTime: FILTER_OPTIONS_STALE_TIME,
    retry: 2,
  });
}

// Query-based hook: filters are part of the query key, so changing
// category/city automatically triggers a refetch (same pattern as
// useEventList in eventHooks.ts).
export function usePartnerList(
  payload: PartnerListRequest = {},
): UseQueryResult<PartnerListResponse, Error> {
  return useQuery({
    queryKey: ['partnerList', payload],
    queryFn: () => partnerApi.getPartners(payload),
    staleTime: PARTNER_LIST_STALE_TIME,
    retry: 2,
  });
}