import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { wishlistApi } from '../wishlistApi';
import { useAuthStore } from '../../stores/authStore';
import type {
  WishlistResponse,
  IsWishlistResponse,
  GetWishlistResponse,
  RemoveWishlistResponse,
  WishlistItem,
} from '../wishlistApi';

const getAuthToken = (): string | null => useAuthStore.getState().token;

// Add to wishlist (GET)
interface AddWishlistPayload {
  productId: string;
}

export function useAddToWishlist(): UseMutationResult<
  GetWishlistResponse,
  Error,
  AddWishlistPayload
> {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: async ({ productId }: AddWishlistPayload) => {
      if (!token) throw new Error('Auth token required');
      return wishlistApi.addToWishlist(token, productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// Check if product is in wishlist (GET)
export function useIsWishlist(productId: string): UseQueryResult<IsWishlistResponse, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['isWishlist', productId, token],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      if (!productId) throw new Error('Product ID required');
      return wishlistApi.isWishlist(token, productId);
    },
    enabled: !!token && !!productId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// Get all wishlist (POST - with pagination)
export function useWishlist(
  limit: string = '50',
  offset: string = '0'
): UseQueryResult<WishlistResponse, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['wishlist', limit, offset, token],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      return wishlistApi.getAllWishlist(token, { limit, offset });
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
}

// Get wishlist by product ID (GET)
export function useGetWishlist(productId: string): UseQueryResult<GetWishlistResponse, Error> {
  const token = getAuthToken();

  return useQuery({
    queryKey: ['getWishlist', productId, token],
    queryFn: () => {
      if (!token) throw new Error('Auth token required');
      if (!productId) throw new Error('Product ID required');
      return wishlistApi.getWishlist(token, productId);
    },
    enabled: !!token && !!productId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// Remove from wishlist (DELETE)
export function useRemoveFromWishlist(): UseMutationResult<
  RemoveWishlistResponse,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!token) throw new Error('Auth token required');
      return wishlistApi.removeFromWishlist(token, productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// Toggle wishlist (add/remove)
export function useToggleWishlist(): UseMutationResult<
  WishlistResponse | GetWishlistResponse | RemoveWishlistResponse,
  Error,
  { productId: string; isWishlisted: boolean }
> {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: string; isWishlisted: boolean }) => {
      if (!token) throw new Error('Auth token required');

      if (isWishlisted) {
        // Remove from wishlist
        return wishlistApi.removeFromWishlist(token, productId);
      } else {
        // Add to wishlist - use GET endpoint with productId
        return wishlistApi.addToWishlist(token, productId);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['isWishlist', variables.productId] });
    },
  });
}

// Get wishlist items with product details
export function useWishlistItems(): UseQueryResult<WishlistItem[], Error> {
  const { data } = useWishlist();

  // Extract wishlist items from response
  const items: WishlistItem[] = data?.result || data?.content?.content || data?.content?.result || [];

  return {
    ...data,
    data: items,
  } as UseQueryResult<WishlistItem[], Error>;
}