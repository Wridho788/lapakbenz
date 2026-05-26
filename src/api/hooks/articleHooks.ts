import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { articleApi } from '../articleApi';

export function useArticles(params: any = {}): UseQueryResult<any, Error> {
  const defaultParams = {
    category: '',
    limit: '10',
    offset: '0',
    ...params,
  };

  return useQuery({
    queryKey: ['articles', defaultParams],
    queryFn: () => articleApi.getArticles(defaultParams),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useArticleCategories(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['articleCategories'],
    queryFn: () => articleApi.getArticleCategories(),
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useArticleByPermalink(permalink: string): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['articleByPermalink', permalink],
    queryFn: () => articleApi.getArticleByPermalink(permalink),
    enabled: !!permalink && permalink.trim() !== '',
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useArticlesMutation(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: (params: any) => articleApi.getArticles(params),
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        const isTimeoutError = error?.message?.includes('timeout') || error?.message?.includes('ECONNABORTED');
        const isNetworkError = error?.message?.includes('Network Error') || error?.message?.includes('ERR_NETWORK');
        return isTimeoutError || isNetworkError;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useInfiniteArticles(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: (data: any) => articleApi.getArticles(data),
  });
}

export function usePostArticle(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: (data: any) => articleApi.getArticles(data),
  });
}
