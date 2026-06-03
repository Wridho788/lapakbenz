import axios from 'axios';
import { BASE_URL, ENDPOINT_WISHLIST, ENDPOINT_ISWISHLIST, ENDPOINT_GET_WISHLIST } from './constants';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export interface WishlistItem {
  id: string;
  product_id: string;
  customer_id: string;
  created: string;
}

export interface WishlistResponse {
  success?: boolean;
  message?: string;
  result?: WishlistItem[];
  content?: {
    content?: WishlistItem[];
    result?: WishlistItem[];
  };
}

export interface IsWishlistResponse {
  success?: boolean;
  message?: string;
  result?: boolean;
  content?: boolean;
  status?: boolean;
}

export interface GetWishlistResponse {
  success?: boolean;
  message?: string;
  result?: WishlistItem | WishlistItem[];
}

export interface RemoveWishlistResponse {
  success?: boolean;
  message?: string;
}

export const wishlistApi = {
  // GET - Add product to wishlist (set product as wishlist)
  addToWishlist: async (authToken: string, productId: string): Promise<GetWishlistResponse> => {
    try {
      const response = await apiClient.get(
        `${ENDPOINT_GET_WISHLIST}${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Add to Wishlist API Error:', error);
      throw error;
    }
  },

  // POST - Get all wishlist
  getAllWishlist: async (authToken: string, payload?: { limit?: string; offset?: string }): Promise<WishlistResponse> => {
    try {
      const response = await apiClient.post(
        ENDPOINT_WISHLIST,
        JSON.stringify(payload || { limit: '50', offset: '0' }),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get All Wishlist API Error:', error);
      throw error;
    }
  },

  // GET - Check if product is wishlisted
  isWishlist: async (authToken: string, productId: string): Promise<IsWishlistResponse> => {
    try {
      const response = await apiClient.get(
        `${ENDPOINT_ISWISHLIST}${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Is Wishlist API Error:', error);
      throw error;
    }
  },

  // GET - Get wishlist by product ID
  getWishlist: async (authToken: string, productId: string): Promise<GetWishlistResponse> => {
    try {
      const response = await apiClient.get(
        `${ENDPOINT_GET_WISHLIST}${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get Wishlist API Error:', error);
      throw error;
    }
  },

  // DELETE - Remove from wishlist by product ID
  removeFromWishlist: async (authToken: string, productId: string): Promise<RemoveWishlistResponse> => {
    try {
      const response = await apiClient.get(
        `${ENDPOINT_WISHLIST}/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Remove Wishlist API Error:', error);
      throw error;
    }
  },
};

export default wishlistApi;