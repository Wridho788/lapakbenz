// Product types

export interface ProductListRequest {
  limit?: string;
  offset?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
  category?: string;
  location?: string;
  condition?: string;
}

export interface ProductItem {
  id: number;
  event_id: number | null;
  club_id: number | null;
  category: number;
  sku: string;
  name: string;
  shortdesc: string;
  description: string | null;
  image: string;
  url_image: string;
  url_type: string;
  capital: number;
  price: number;
  restricted: number;
  qty: number;
  recommended: number;
  best_seller: number;
  latest: number;
  economic: number;
  orders: number;
  conditions: string;
  rating: number;
  weight: number;
  publish: number;
  city: string;
  supplier: string;
  [key: string]: any;
}

export interface ProductListResponse {
  image_url?: string;
  result?: ProductItem[];
  record?: number;
  [key: string]: any;
}

export interface ProductDetailResponse {
  content?: ProductItem;
  [key: string]: any;
}

export interface ProductSearchRequest {
  filter: string;
  limit: string;
}

export interface ProductCity {
  id: number;
  name: string;
  [key: string]: any;
}

export interface ProductCityResponse {
  content?: ProductCity[];
  [key: string]: any;
}
