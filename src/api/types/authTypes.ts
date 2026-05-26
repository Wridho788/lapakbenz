// User/Auth types

export interface LoginRequest {
  username: string;
  password: string;
  device: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  type?: string;
  content?: {
    token?: string;
    status?: number;
    userid?: string | number;
    log?: number;
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
  new_password: string;
  username: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface GetProfileResponse {
  success?: boolean;
  message?: string;
  result: ProfileResult;
}

export interface ProfileResult {
  id: number;
  quinos_id: string;
  clubid: number;
  first_name: string;
  last_name: string;
  type: string;
  address: string;
  shipping_address: string;
  province_name: string;
  city_name: string;
  district_name: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
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
  image: string;
  npwp: string;
  profession: string;
  organization: string;
  member_no: string;
  instagram: string;
  joined: string;
  premium: number;
  status: number;
  voucher_claimed: number;
  mtype: number;
  dob: string;
  nik: string;
  car_type: string;
  chasis_no: string;
  engine_no: string;
  police_no: string;
  car_image: string;
  expired: string | null;
  verified: number;
  billing_num: number;
  created: string;
  updated: string | null;
  deleted: string | null;
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
