// Types for API requests and responses

export interface LoginRequest {
  username: string;
  password: string;
  device: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  data?: any;
  // API actual format
  content?: {
    token: string;
    log: number;
    status: number;
    userid: number;
  };
}

export interface ForgotPasswordRequest {
  username: string;
  new_password: string;
  otp: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface RequestOTPRequest {
  username: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
}

export interface UpdateProfileRequest {
  tprofession: string;
  torganization: string;
  tinstagram: string;
  taddress: string;
  tzip: string;
  temail: string;
  tdob: string;
  ccity: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface RegisterRequest {
  cchapter: string;
  tname: string;
  taddress: string;
  tzip: string;
  tphone1: string;
  temail: string;
  ccity: string;
  tpassword: string;
  tdob: string;
  tnik: string;
  tcartype: string;
  tpoliceno: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  content?: {
    id: string;
    clubid: string;
    first_name: string;
    last_name: string | null;
  };
}

export interface ChangePasswordRequest {
  old_pass: string;
  new_pass: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Notification Payload Types
export interface NotificationPayload {
  type?: string;
  campaign?: string;
  read?: string;
  limit?: string;
  offset?: string;
}

// GET API Response Types
export interface GetProfileResponse {
  success?: boolean;
  message?: string;
  content?: {
    result: {
      id: string;
      quinos_id: string;
      clubid: string;
      first_name: string;
      last_name: string | null;
      type: string; // membership type
      address: string;
      shipping_address: string;
      phone1: string;
      phone2: string;
      fax: string;
      email: string;
      password: string;
      website: string;
      state: string;
      city: string;
      region: string;
      zip: string;
      notes: string;
      image: string | null;
      npwp: string | null;
      profession: string | null;
      organization: string | null;
      member_no: string;
      instagram: string | null;
      joined: string;
      premium: string;
      status: string;
      voucher_claimed: string;
      mtype: string;
      dob: string | null;
      nik: string | null;
      car_type: string | null;
      chasis_no: string | null;
      engine_no: string | null;
      police_no: string | null;
      car_image: string | null;
      expired: string | null;
      verified: string;
      billing_num: string;
      created: string;
      updated: string | null;
      deleted: string | null;
      image_url: string;
      joined_time: string;
      expired_format: string | null;
    };
  };
}

export interface NotificationResponse {
  success?: boolean;
  message?: string;
  content?: Array<{
    id: string;
    subject: string;
    content: string;
    reading: string; // "0" = unread, "1" = read
    campaign: string;
    type: string; // "wa", "email", etc.
    created: string; // Date string like "30 October 2024 00:14:32"
    [key: string]: any;
  }>;
}

export interface NotificationDetailResponse {
  success?: boolean;
  message?: string;
  content?: {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    [key: string]: any;
  };
}

export interface DecodeTokenResponse {
  success?: boolean;
  message?: string;
  content?: {
    userid: string;
    username: string;
    name: string;
    phone: string;
    premium: string;
    chapter: string;
    log: number;
    [key: string]: any;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface SetShippingRequest {
  province: string;
  city: string;
  district: string;
  province_name: string;
  city_name: string;
  district_name: string;
  address: string;
  ccity: string;
}

export interface SetShippingResponse {
  success: boolean;
  message: string;
  data?: any;
}
