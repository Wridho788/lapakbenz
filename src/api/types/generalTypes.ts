// General types

export interface LedgerResponse {
  content?: {
    balance: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SliderItem {
  id: string;
  name: string;
  image: string;
  link?: string;
  [key: string]: any;
}

export interface SliderResponse {
  result?: SliderItem[];
  [key: string]: any;
}

export interface SplashResponse {
  result?: SliderItem[];
  [key: string]: any;
}

// City item from Indonesia region API
export interface CityItem {
  id: number;
  id_prov: string;
  nama: string;
  province: string;
  type: string;
  zip: string;
}

export interface CityListResponse {
  results: CityItem[];
}
