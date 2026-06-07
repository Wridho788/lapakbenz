import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { cartApi } from '../cartApi';
import { orderApi } from '../ordersApi';
import type {
  CartResponse,
  AddToCartRequest,
  AddToCartResponse,
  RemoveFromCartResponse,
  SetPickupResponse,
  OrderListRequest,
  OrderListResponse,
  OrderDetailResponse,
  OrderTrackingResponse,
} from '../types';

export function useCart(): UseQueryResult<CartResponse, Error> {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
}

export function useAddToCart(): UseMutationResult<AddToCartResponse, Error, { data: AddToCartRequest }> {
  return useMutation({
    mutationFn: async ({ data }: { data: AddToCartRequest }) => {
      if (!data.product_id) throw new Error('Product ID is required');
      if (!data.qty || data.qty < 1) throw new Error('Quantity must be at least 1');
      return await cartApi.addToCart(data);
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

export function useRemoveFromCart(): UseMutationResult<RemoveFromCartResponse, Error, void> {
  return useMutation({
    mutationFn: () => cartApi.removeFromCart(),
  });
}

export function useSetPickup(): UseMutationResult<SetPickupResponse, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartId: string) => cartApi.setPickup(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useSetPublish(): UseMutationResult<SetPickupResponse, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartId: string) => cartApi.setPublish(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useSetNotes(): UseMutationResult<SetPickupResponse, Error, { cartId: string; notes: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, notes }: { cartId: string; notes: string }) => cartApi.setNotes(cartId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useDeleteItemCart(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartId: string) => cartApi.deleteItemCart(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCheckoutOrder(): UseMutationResult<{ order_code?: string; link_url?: string; content?: { orderid?: string | number; invoice_url?: string; transid?: number; [key: string]: unknown }; error?: string }, Error, void> {
  return useMutation({
    mutationFn: () => cartApi.checkoutOrder(),
  });
}

export function useOrders(
  payload: OrderListRequest = { limit: '120', offset: '0', confirm: '', paid: '', start: '', end: '' },
): UseQueryResult<OrderListResponse, Error> {
  return useQuery({
    queryKey: ['orders', JSON.stringify(payload)],
    queryFn: () => orderApi.getOrders(payload),
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
}

export function useOrderDetail(orderId: string): UseQueryResult<OrderDetailResponse, Error> {
  return useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => orderApi.getOrderDetail(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useOrderTracking(awb: string, lastDigit: string): UseQueryResult<OrderTrackingResponse, Error> {
  return useQuery({
    queryKey: ['orderTracking', awb, lastDigit],
    queryFn: () => orderApi.trackOrder(awb, lastDigit),
    enabled: !!awb && !!lastDigit && awb.trim() !== '' && lastDigit.trim() !== '',
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}