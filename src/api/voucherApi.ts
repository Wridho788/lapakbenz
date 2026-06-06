import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_VOUCHER,
  ENDPOINT_SET_VOUCHER,
  ENDPOINT_REMOVE_VOUCHER,
} from './constants';
import type {
  VoucherItem,
  VoucherListResponse,
  SetVoucherRequest,
  SetVoucherResponse,
  RemoveVoucherResponse,
} from './types';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

const buildVoucherImage = (rawImage: unknown, imageBase: string): string => {
  const image = typeof rawImage === 'string' ? rawImage : '';
  if (!image) return '/nodata.png';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return `${imageBase || ''}${image}`;
};

const normalizeVoucherItem = (item: any, imageBase: string): VoucherItem => {
  const image = buildVoucherImage(
    item.image || item.image_url || item.banner || item.thumbnail,
    imageBase,
  );

  return {
    id: String(item.id ?? item.voucher_id ?? item.code ?? item.code_voucher ?? ''),
    name: item.name || item.title || item.code || 'Voucher',
    description: item.description || item.subtitle || item.note || '',
    image,
    value: Number(item.value ?? item.amount ?? item.discount_amount ?? 0),
    type: item.type || item.discount_type || item.voucher_type || '',
    code: String(item.code ?? item.voucher_code ?? ''),
    raw: item,
  };
};

export const voucherApi = {
  async getVouchers(authToken: string): Promise<VoucherListResponse> {
    const response = await apiClient.get(ENDPOINT_VOUCHER, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = response.data ?? {};
    const payload = data.content ?? data;
    const imageBase = payload.image_url || data.image_url || '';
    const vouchers = Array.isArray(payload.result)
      ? payload.result
      : Array.isArray(payload.voucher)
        ? payload.voucher
        : Array.isArray(data.result)
          ? data.result
          : Array.isArray(data.voucher)
            ? data.voucher
            : [];

    return {
      content: {
        voucher: vouchers.map((item: any) => normalizeVoucherItem(item, imageBase)),
        image_url: imageBase,
        selected_voucher: payload.selected_voucher
          ? normalizeVoucherItem(payload.selected_voucher, imageBase)
          : data.selected_voucher
            ? normalizeVoucherItem(data.selected_voucher, imageBase)
            : null,
        raw: data,
      },
    };
  },

  async setVoucher(payload: SetVoucherRequest, authToken: string): Promise<SetVoucherResponse> {
    const response = await apiClient.get(`${ENDPOINT_SET_VOUCHER}${payload.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data;
  },

  async removeVoucher(authToken: string): Promise<RemoveVoucherResponse> {
    const response = await apiClient.delete(`${ENDPOINT_REMOVE_VOUCHER}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data;
  },
};

export default voucherApi;
