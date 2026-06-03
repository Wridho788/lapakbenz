// Cart types

export interface CartItem {
  id: string;
  sku: string;
  name: string;
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
  pickup: string;
  publish: string;
  attribute?: string | null;
  description?: string | null;
  note: string;
  notes?: string | null;
  customer?: number;
  tax?: number;
  created: string;
  updated: string | null;
  deleted?: string | null;
}

export interface CartResponse {
  content: {
    balance: number;
    record: number;
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
