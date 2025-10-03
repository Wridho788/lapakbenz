import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { productAPI } from '../productApi';

// Product API Hooks
interface UseProductsPayload {
  limit?: number;
  offset?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  category?: string;
}

export function useProducts(payload: UseProductsPayload = {}): UseQueryResult<any, Error> {
  const defaultPayload = {
    limit: 10,
    offset: 0,
    orderby: '',
    order: 'asc' as const,
    category: '',
    ...payload,
  };

  return useQuery({
    queryKey: ['products', JSON.stringify(defaultPayload)],
    queryFn: () => productAPI.getProducts(defaultPayload),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useProductCategories(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      try {
        return await productAPI.getProductCategories();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (categories don't change often)
    retry: 2,
  });
}

interface UseProductSearchPayload {
  filter: string;
}

export function useProductSearch(): UseMutationResult<any, Error, UseProductSearchPayload> {
  return useMutation({
    mutationFn: async (payload: UseProductSearchPayload) => {
      try {
        return await productAPI.searchProducts(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useProductDetail(productId: string): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productDetail', productId],
    queryFn: () => productAPI.getProductDetail(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}