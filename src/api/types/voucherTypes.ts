export interface VoucherItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  value?: number;
  type?: string;
  code?: string;
  raw?: Record<string, unknown>;
}

export interface VoucherListResponse {
  content: {
    voucher: VoucherItem[];
    image_url?: string;
    selected_voucher?: VoucherItem | null;
    raw?: Record<string, unknown>;
  };
}

export interface SetVoucherRequest {
  id: string;
}

export interface SetVoucherResponse {
  discount: number;
  error?: string;
  message?: string;
}

export interface RemoveVoucherResponse {
  success: boolean;
  message: string;
}
