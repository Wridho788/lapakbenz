// Chapter types

export interface ChapterListRequest {
  limit: string;
  offset: string;
}

export interface ChapterItem {
  id: number;
  code: string;
  name: string;
  desc?: string;
  logo?: string;
  city?: string;
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  bank1?: string;
  bank2?: string;
  bank3?: string;
  regist_fee?: number;
  monthly_fee?: number;
  discount?: number;
  chief?: string;
  vice?: string;
  treasurer?: string;
  billing_contact?: string;
  parent?: number;
  created?: string;
  updated?: string;
  deleted?: string | null;
  [key: string]: any;
}

export interface ChapterListResponse {
  result: ChapterItem[];
}

export interface ChapterDetailResponse {
  status: boolean;
  message: string;
  content: ChapterItem;
}

export interface ChapterByCustomerResponse {
  status: boolean;
  message: string;
  content: {
    result: ChapterItem[];
    total: number;
    [key: string]: any;
  };
}
