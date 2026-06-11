import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { productAPI } from '../productApi';
import type { ProductListRequest, ProductSearchRequest } from '../types';

export function useProducts(
  payload: ProductListRequest = { limit: '10', offset: '0', orderby: '', order: 'asc', category: '', location: '', condition: '' },
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['products', JSON.stringify(payload)],
    queryFn: () => productAPI.getProducts(payload),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useProductCategories(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: () => productAPI.getProductCategories(),
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useProductSearch(): UseMutationResult<any, Error, ProductSearchRequest> {
  return useMutation({
    mutationFn: async (payload: ProductSearchRequest) => {
      try {
        return await productAPI.searchProducts(payload);
      } catch (error) {
        console.error('Product search error:', error);
        throw error;
      }
    },
  });
}

export function useProductPermalink(permalink: string): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productPermalink', permalink],
    queryFn: () => productAPI.getProductPermalink(permalink),
    enabled: !!permalink,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useProductDetail(productId: string): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productDetail', productId],
    queryFn: () => productAPI.getProductDetail(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useProductCities(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['productCities'],
    queryFn: () => productAPI.getProductCities(),
    staleTime: 1000 * 60 * 10,
    retry: 2,
    enabled: true,
  });
}

export function useLatestProducts(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['latestProducts'],
    queryFn: () => productAPI.getLatestProducts(0),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useBestSellerProducts(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['bestSellerProducts'],
    queryFn: () => productAPI.getBestSellerProducts(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
