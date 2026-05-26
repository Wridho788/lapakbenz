// Event types

export interface EventListRequest {
  status?: string;
  limit?: string;
  offset?: string;
  chapter?: string;
}

export interface EventItem {
  ID: number;
  ClubID?: number;
  Code?: string;
  Name: string;
  Dates: string;
  Desc?: string;
  Image?: string;
  Fee?: number;
  MerchantCost?: number;
  MerchantQuota?: number;
  Cost1?: number;
  Cost2?: number;
  Type?: number;
  MinimumParticipant?: number;
  Done?: number;
  Point?: number;
  AllowMerchant?: number;
  AllowPublic?: number;
  Created?: string;
  Updated?: string;
  Deleted?: string | null;
  chapter_name?: string;
  chapter_code?: string;
  type_label?: string;
  done_label?: string;
}

export interface EventListResponse {
  image_url?: string;
  result: EventItem[];
  record?: number;
  [key: string]: any;
}

export interface EventDetailResponse {
  image_url?: string;
  result?: EventItem;
  content?: EventItem;
  [key: string]: any;
}

export interface EventRegisterRequest {
  eventid: string;
  name: string;
  cp?: string;
  address?: string;
  phone: string;
  email: string;
  menu?: string;
  qty?: string;
  type?: string;
  policeno?: string;
  notes?: string;
}

export interface EventRegisterResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}
