// Order types

export interface OrderListRequest {
  limit?: string;
  offset?: string;
  confirm?: string;
  paid?: string;
  start?: string;
  end?: string;
}

export interface OrderItem {
  id: number;
  club_id: number;
  club?: string;
  code: string;
  transcode: string;
  transno: string;
  transid: string | null;
  dates: string;
  customer: number;
  notes: string | null;
  amount: number;
  tax: number;
  cost: number;
  discount: number;
  shipping: number;
  total: number;
  payment_type: string;
  paid_date: string | null;
  sender_name: string | null;
  sender_acc: string | null;
  sender_bank: string | null;
  sender_amount: number;
  bank_id: string | null;
  canceled: string | null;
  canceled_desc: string | null;
  approved: number;
  log: string | null;
  status: string | null;
  link_url: string | null;
  link_expired: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_email: string | null;
  voucher_id: number | null;
  posted?: string;
  paid_status?: string;
  paid_date_str?: string;
  items_count?: number;
  created: string;
  updated: string | null;
  deleted: string | null;
}

// Raw API response (direct from server)
export interface OrderListResponseRaw {
  result?: OrderItem[];
  error?: string;
  message?: string;
}

// Normalized API response (used in the app)
export interface OrderListResponse {
  content: {
    orderid?: number;
    record: number;
    result: OrderItem[];
  };
}

export interface OrderAddResponse {
  content: {
    id: string;
    club_id: string;
    code: string;
    transcode: string;
    transno: string;
    transid: string | null;
    dates: string;
    customer: string;
    notes: string | null;
    amount: string;
    tax: string;
    cost: string;
    discount: string;
    total: string;
    payment_type: string;
    paid_date: string | null;
    sender_name: string | null;
    sender_acc: string | null;
    sender_bank: string | null;
    sender_amount: string;
    bank_id: string | null;
    canceled: string | null;
    canceled_desc: string | null;
    approved: string;
    log: string | null;
    created: string;
    updated: string | null;
    deleted: string | null;
  };
}

export interface OrderAddItemRequest {
  cproduct: string;
  ctax: string;
  tqty: string;
  tdiscount: string;
  tshipping: string;
}

export interface OrderAddItemResponse {
  content: string;
}

export interface OrderCheckoutResponse {
  error?: string;
  content?: {
    invoice_url?: string;
    transid?: number;
    orderid?: string;
    [key: string]: any;
  };
}

export interface OrderErrorResponse {
  error: string;
}

export interface OrderDetailItem {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  tax: number;
  amount: number;
  price: number;
  discount: number;
  shipping: number;
  total: number;
  attribute: string | null;
  description: string | null;
  awb: string | null;
  last_digit: string | null;
  delivered: string | null;
  paid_supplier: string | null;
  paid_amount: number;
  profit: number;
  updated: string | null;
  product_name: string;
  product_image: string;
  product_sku: string;
  product_code?: string;
  product_price?: string;
  quantity?: string;
  subtotal?: string;
  created?: string;
  product?: string;
  sku?: string;
}

// Raw API response for order detail
export interface OrderDetailResponseRaw {
  imageurl?: string;
  result?: OrderItem;
  items?: OrderDetailItem[];
  error?: string;
  message?: string;
}

// Normalized response (used in app)
export interface OrderDetailResponse {
  content: {
    id?: number;
    club_id?: number;
    code: string;
    transcode: string;
    transno: string;
    transid: string | null;
    dates: string;
    customer: number | string;
    cust?: string;
    notes: string | null;
    amount: number;
    tax: number;
    cost: number;
    costs?: number;
    discount: number;
    shipping: number;
    total: number;
    tot_amt?: number;
    payment_type: string;
    paid_date: string | null;
    sender_name: string | null;
    sender_acc: string | null;
    sender_bank: string | null;
    sender_amount: number;
    bank_id: string | null;
    canceled: string | null;
    canceled_desc: string | null;
    canceled_date?: string | null;
    approved: number;
    posted?: string;
    log: string | null;
    status: string | null;
    link_url: string | null;
    link_expired: string | null;
    receiver_name: string | null;
    receiver_phone: string | null;
    receiver_email: string | null;
    voucher_id: number | null;
    created: string;
    updated: string | null;
    deleted: string | null;
    items: OrderDetailItem[];
    imageurl?: string;
  };
}

export interface TrackingManifest {
  manifest_code: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name: string;
  title: string;
}

export interface TrackingSummary {
  courier_code: string;
  courier_name: string;
  waybill_number: string;
  service_code: string;
  waybill_date: string;
  shipper_name: string;
  receiver_name: string;
  origin: string;
  destination: string;
  status: string;
}

export interface TrackingDeliveryStatus {
  status: string;
  pod_receiver: string;
  pod_date: string;
  pod_time: string;
}

export interface TrackingDetails {
  waybill_number: string;
  waybill_date: string;
  waybill_time: string;
  weight: string;
  origin: string;
  destination: string;
  shipper_name: string;
  shipper_address1: string;
  shipper_address2: string;
  shipper_address3: string;
  shipper_city: string;
  receiver_name: string;
  receiver_address1: string;
  receiver_address2: string;
  receiver_address3: string;
  receiver_city: string;
}

// Raw API response from tracking endpoint
export interface OrderTrackingResponseRaw {
  result?: {
    delivered: boolean;
    delivery_status?: TrackingDeliveryStatus;
    details?: TrackingDetails;
    manifest?: TrackingManifest[];
    summary?: TrackingSummary;
  };
  error?: string;
  message?: string;
}

// Normalized response used in the app
export interface OrderTrackingResponse {
  content: {
    status: boolean;
    delivered: boolean;
    delivery_status?: TrackingDeliveryStatus;
    details?: TrackingDetails;
    manifest: TrackingManifest[];
    summary: TrackingSummary;
  };
}

export interface OrderTrackingRequest {
  awb: string;
  lastDigit: string;
  limit?: string;
  offset?: string;
  confirm?: string;
  paid?: string;
  start?: string;
  end?: string;
}
