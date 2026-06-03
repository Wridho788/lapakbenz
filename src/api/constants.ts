// Base URL for API
// export const BASE_URL = 'https://goapi.dswip.com/';
export const BASE_URL = 'https://dswip.cloud/';
// article endpoints
export const ENDPOINT_ARTICLE = 'article';
export const ENDPOINT_ARTICLE_CATEGORY = 'article_category';
export const ENDPOINT_ARTICLE_GET_PERMALINK = 'article/permalink';

// authentication endpoints
export const ENDPOINT_DECODE_TOKEN = 'decode'; // method get parameter: none
export const ENDPOINT_FORGOT = 'forgot'; // method post parameter: { otp, password, username }
export const ENDPOINT_LOGIN = 'login'; // method post parameter: { username, password }
export const ENDPOINT_LOGOUT = 'logout'; // method get parameter: none
export const ENDPOINT_REQ_OTP = 'otp'; // method post parameter: { username }
export const ENDPOINT_VERIFY = 'verify'; // method post parameter: { username, otp }
export const ENDPOINT_OAUTH = 'oauth'; // method post parameter: { id_token }

// user management endpoints
export const ENDPOINT_IMAGE = 'image'; // method post parameter: { image file }
export const ENDPOINT_NOTIF = 'notif'; // method post parameter: {limit, offset}
export const ENDPOINT_NOTIF_DETAIL = 'notif_detail/'; // method get parameter: { notification id }
export const ENDPOINT_CHANGE_PASSWORD = 'password'; // method put parameter: { new_password, username }
export const ENDPOINT_REGISTER = 'register'; // method post parameter: { cchapter, tname, taddress, tzip, tphone1, temail, ccity, tpassword, tdob, tnik, tcartype, tpoliceno }
export const ENDPOINT_UPDATE = 'update'; // method put parameter: {  address,cartype, city, name, vehicleno, zip  }
export const ENDPOINT_GET_PROFILE = 'user'; // method get parameter: none
export const ENDPOINT_LEDGER = 'wallet'; // method post parameter: { limit, offset }

// event endpoints
export const ENDPOINT_EVENT = 'event'; // method post parameter: { chapter,limit, offset, status }
export const ENDPOINT_EVENT_BY_ID = 'event'; // method get parameter: { event id }
export const ENDPOINT_EVENT_REGISTER = 'event/register'; // method get parameter: { event id }
export const ENDPOINT_EVENT_REGISTER_MERCHANT = 'event/merchant'; // method post parameter: { eventid, name, cp, address, email, phone, menu, qty }
export const ENDPOINT_EVENT_REGISTER_PUBLIC = 'event/public'; // method post parameter: { eventid, name, type, policeno, phone, email, notes }

// general endpoints
export const ENDPOINT_CITY = 'city'; // method get parameter: none

// Cart endpoints
export const ENDPOINT_CART = 'cart'; // method get, parameter: none
export const ENDPOINT_CART_ADD = 'cart'; // method post parameter: { product_id, quantity }
export const ENDPOINT_CART_CLEAN = 'cart/clean'; // method delete
export const ENDPOINT_CART_DELETE = 'cart/'; // method delete parameter: { cart id }
export const ENDPOINT_CART_SET_PICKUP = 'cart/pickup/'; // method put cart id 
export const ENDPOINT_CART_SET_NOTE = 'cart/notes/'; // method put cart id parameter: { note }
export const ENDPOINT_CART_SET_PUBLISH = 'cart/publish/'; // method put cart id 


// Chapter endpoints
export const ENDPOINT_CHAPTER = 'chapter'; // method get, parameter: none
export const ENDPOINT_CHAPTER_BY_ID = 'chapter/'; // method get parameter: { chapter id }
export const ENDPOINT_GET_FRONT = 'chapter_front'; // method post parameter: { limit, offset }

// Order endpoints
export const ENDPOINT_ORDER = 'order'; // method post parameter: {confirm, end, limit, offset, paid, start}
export const ENDPOINT_ORDER_CHECKOUT = 'order/checkout'; // method get parameter: none
export const ENDPOINT_ORDER_GET = 'order/'; // method get parameter: { order id }
export const ENDPOINT_ORDER_TRACKING = 'order/tracking/'; // method get parameter: {awb(airway bill number)}

// shipping endpoints
export const ENDPOINT_SET_SHIPPING = 'set_shipping'; // method put parameter: { address, city, city_name, district, district_name, province, province_name }
export const ENDPOINT_CITY_SHIPPING = 'city_shipping/'; // method get parameter province id
export const ENDPOINT_DISTRICT_SHIPPING = 'district_shipping/'; // method get parameter city_id
export const ENDPOINT_PROVINCE_SHIPPING = 'province_shipping'; // method get parameter: none

// whistlist endpoints
export const ENDPOINT_WISHLIST = 'wishlist'; // method post parameter: { limit, offset }
export const ENDPOINT_ISWISHLIST = 'iswishlist/'; // method get parameter: {product_id}
export const ENDPOINT_GET_WISHLIST = 'wishlist/'; // method get parameter: { product_id }

// Product endpoints
export const ENDPOINT_PRODUCT = 'product'; // method post parameter: { category, condition, limit, location, order, orderby, offset }
export const ENDPOINT_PRODUCT_SEARCH = 'product/search'; // method post parameter: { filter, limit }
export const ENDPOINT_PRODUCT_REFRESH_CACHE = 'product/refresh-cache'; // method post parameter: none
export const ENDPOINT_PRODUCT_DETAIL = 'product/'; // method get parameter: { sku }
export const ENDPOINT_PRODUCT_CITY = 'product_city'; // method get parameter: none
export const ENDPOINT_PRODUCT_LATEST = 'product_front/'; // method post parameter: { product type: 0 for latest, 1 for best seller }

// SLIDER
export const ENDPOINT_SLIDER = 'slider'; // method post parameter: { limit, offset }
export const ENDPOINT_SPLASH = 'slider/refresh'; // method get parameter: none

// voucher
export const ENDPOINT_VOUCHER = 'voucher'; // method get parameter: none
export const ENDPOINT_REMOVE_VOUCHER = 'voucher'; // method delete parameter: none
export const ENDPOINT_GET_VOUCHER = 'voucher/get'; // method get parameter: none
export const ENDPOINT_SET_VOUCHER = 'voucher/set/'; // method post parameter: { voucher id }
