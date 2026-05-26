// Shipping types

export interface ProvinceItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ProvinceResponse {
  content?: ProvinceItem[];
  [key: string]: any;
}

export interface CityShippingItem {
  id: string;
  name: string;
  province_id: string;
  [key: string]: any;
}

export interface CityShippingResponse {
  content?: CityShippingItem[];
  [key: string]: any;
}

export interface DistrictItem {
  id: string;
  name: string;
  city_id: string;
  [key: string]: any;
}

export interface DistrictResponse {
  content?: DistrictItem[];
  [key: string]: any;
}
