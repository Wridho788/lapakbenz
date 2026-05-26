// Event types

export interface EventListRequest {
  status?: string;
  limit?: string;
  offset?: string;
  chapter?: string;
}

export interface EventItem {
  id?: number;
  ID: number;
  ClubID?: number;
  chapter_id?: number;
  chapter?: string;
  Code?: string;
  code?: string;
  Name: string;
  name: string;
  Dates: string;
  dates: string;
  time?: string;
  Desc?: string;
  desc?: string;
  description?: string;
  Image?: string;
  image?: string;
  Fee?: number;
  fee?: number;
  MerchantCost?: number;
  MerchantQuota?: number;
  Cost1?: number;
  Cost2?: number;
  Type?: number;
  type?: number;
  type_desc?: string;
  MinimumParticipant?: number;
  minimum_participants?: number;
  Done?: number;
  done?: number;
  done_desc?: string;
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
  [key: string]: any;
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
