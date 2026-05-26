// Cart types

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  image: string;
  qty: number;
  price: number;
  shipping: number;
  amount: number;
  total: number;
  pickup: string;
  publish: string;
  note: string;
  created: string;
  updated: string | null;
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
