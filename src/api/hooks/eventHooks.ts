import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { eventApi, chapterApi } from '../eventApi';
import type {
  EventListRequest,
  EventListResponse,
  EventDetailResponse,
  EventRegisterResponse,
  ChapterListRequest,
  ChapterListResponse,
  ChapterDetailResponse,
} from '../types';

const getAuthToken = (): string | null => localStorage.getItem('authToken');

// Query-based hook for fetching events with filters
export function useEventList(
  payload: EventListRequest = {},
): UseQueryResult<EventListResponse, Error> {
  return useQuery({
    queryKey: ['eventList', payload],
    queryFn: () => eventApi.getEvents(payload),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useEvents(): UseMutationResult<EventListResponse, Error, EventListRequest> {
  return useMutation({
    mutationFn: (payload: EventListRequest) => eventApi.getEvents(payload),
  });
}

// Backwards compatibility alias
export const usePostEvent = useEvents;

// usePostFrontEvent - same as usePostEvent but for front events (status: '1')
export function usePostFrontEvent(): UseMutationResult<EventListResponse, Error, EventListRequest> {
  return useMutation({
    mutationFn: (payload: EventListRequest) => eventApi.getEvents({ ...payload, status: '' }),
  });
}

export function useEventsByCustomer(
  data?: Partial<{ limit: string; offset: string }>,
): UseQueryResult<EventListResponse, Error> {
  const authToken = getAuthToken();
  return useQuery({
    queryKey: ['eventsByCustomer', JSON.stringify(data), authToken],
    queryFn: () => eventApi.getEventsByCustomer(authToken!, {
      limit: data?.limit ? parseInt(data.limit, 10) : undefined,
      offset: data?.offset ? parseInt(data.offset, 10) : undefined,
    }),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useEventById(id: string): UseQueryResult<EventDetailResponse, Error> {
  const authToken = getAuthToken();
  return useQuery({
    queryKey: ['eventById', id, authToken],
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useEventRegister(
  eventId: string,
  authToken?: string | null,
): UseQueryResult<EventRegisterResponse, Error> {
  const token = authToken || getAuthToken();
  return useQuery({
    queryKey: ['eventRegister', eventId, token],
    queryFn: () => eventApi.registerEvent(token!, eventId),
    enabled: !!token && !!eventId,
    retry: 2,
  });
}

interface MerchantRegistrationPayload {
  eventid: string;
  name: string;
  cp: string;
  address: string;
  phone: string;
  email: string;
  menu: string;
  qty: string;
}

export function useMerchantRegistration(): UseMutationResult<
  EventRegisterResponse & { status: number },
  Error,
  MerchantRegistrationPayload
> {
  return useMutation({
    mutationFn: (payload: MerchantRegistrationPayload) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
      return eventApi.registerMerchant(formData);
    },
  });
}

interface PublicRegistrationPayload {
  eventid: string;
  name: string;
  type: string;
  policeno: string;
  phone: string;
  email: string;
  notes: string;
}

export function usePublicRegistration(): UseMutationResult<
  EventRegisterResponse & { status: number },
  Error,
  PublicRegistrationPayload
> {
  return useMutation({
    mutationFn: (payload: PublicRegistrationPayload) => {
      const token = getAuthToken();
      if (!token) throw new Error('Auth token required');
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
      return eventApi.registerPublic(token, formData);
    },
  });
}

export function useChapters(
  payload: ChapterListRequest = { limit: '10', offset: '0' },
): UseQueryResult<ChapterListResponse, Error> {
  return useQuery({
    queryKey: ['chapters', JSON.stringify(payload)],
    queryFn: () => chapterApi.getChapters(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useChapterById(
  chapterId: string,
  authToken: string | null,
): UseQueryResult<ChapterDetailResponse, Error> {
  return useQuery({
    queryKey: ['chapterById', chapterId, authToken],
    queryFn: () => chapterApi.getChapterById(chapterId, authToken!),
    enabled: !!authToken && !!chapterId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useChaptersByCustomer(
  customerId: string,
  authToken: string | null,
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['chaptersByCustomer', customerId, authToken],
    queryFn: () => chapterApi.getChaptersByCustomer(customerId, authToken!),
    enabled: !!authToken && !!customerId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useFrontChapters(
  payload: ChapterListRequest = { limit: '10', offset: '0' },
): UseQueryResult<ChapterListResponse, Error> {
  return useQuery({
    queryKey: ['frontChapters', JSON.stringify(payload)],
    queryFn: () => chapterApi.getFrontChapters(payload),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useEventsByChapters(chapterIds: number[]): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['eventsByChapters', chapterIds],
    queryFn: () => eventApi.getEventsByChapters(chapterIds),
    enabled: chapterIds.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
