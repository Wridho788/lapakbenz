import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { voucherApi } from '../voucherApi';
import type { VoucherListResponse, SetVoucherRequest, SetVoucherResponse } from '../types';

export function useVoucherList(): UseQueryResult<VoucherListResponse, Error> {
  const token = useAuthStore.getState().token;

  return useQuery({
    queryKey: ['vouchers', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token required');
      }
      return voucherApi.getVouchers(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useSetVoucher(): UseMutationResult<SetVoucherResponse, Error, { data: SetVoucherRequest }> {
  return useMutation({
    mutationFn: async ({ data }: { data: SetVoucherRequest }) => {
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication token required');
      }
      return voucherApi.setVoucher(data, token);
    },
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        const msg = error?.message ?? '';
        const isRetryable = msg.includes('timeout') || msg.includes('ECONNABORTED') ||
          msg.includes('Network Error') || msg.includes('ERR_NETWORK');
        return isRetryable;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
