// Cart types

export interface CartItem {
  id: number | string;
  sku: string;
  name?: string;
  image?: string;
  product_id?: number;
  product_name?: string;
  product_sku?: string;
  product_image?: string;
  product_url_image?: string;
  qty: number;
  price: number;
  shipping: number;
  shipping_temp?: number;
  amount: number;
  total: number;
  pickup: string | number;
  publish: string | number;
  attribute?: string | null;
  description?: string | null;
  note?: string | null;
  notes?: string | null;
  customer?: number;
  tax?: number;
  created: string;
  updated: string | null;
  deleted?: string | null;
}

export interface CartResponse {
  image_url?: string;
  total?: number;
  cost?: number;
  result?: CartItem[];
  content?: {
    balance: number;
    record: number;
    cost: number;
    result: CartItem[];
  };
}

export interface AddToCartRequest {
  product_id: number;
  qty: number;
}

export interface AddToCartResponse {
  content: null;
}

export interface RemoveFromCartResponse {
  content: null;
}

export interface SetPickupResponse {
  content: null;
}
