import axios from "axios";
import {
  BASE_URL,
  ENDPOINT_LEDGER,
  ENDPOINT_SLIDER,
  ENDPOINT_SPLASH,
  ENDPOINT_EVENT,
  ENDPOINT_ARTICLE,
  ENDPOINT_EVENT_BY_ID,
  ENDPOINT_CITY_GET_CITY,
  ENDPOINT_EVENT_GET_BY_CUSTOMER,
  ENDPOINT_EVENT_REGISTER_MERCHANT,
  ENDPOINT_EVENT_REGISTER_PUBLIC,
  ENDPOINT_EVENT_REGISTER
} from "./constants";

export const getLedger = async (authToken: string) => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_LEDGER}`, {}, {
    headers: {
      'X-auth-token': authToken,
    },
  });
  return response.data;
};

export const getSlider = async () => {
  const response = await axios.get(`${BASE_URL}${ENDPOINT_SLIDER}`);
  return response.data;
};

export const getSplash = async () => {
  const response = await axios.get(`${BASE_URL}${ENDPOINT_SPLASH}`);
  return response.data;
};

export const postEvent = async (data?: any) => {
  const defaultPayload = {
    status: "1",
    limit: 300,
    offset: 0,
    chapter: ""
  };
  const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT}`, payload);
  return response.data;
};

export const getEventById = async (id: string) => {
  const response = await axios.get(`${BASE_URL}${ENDPOINT_EVENT_BY_ID}${id}`);
  return response.data;
};

export const postArticle = async (data?: any) => {
  const defaultPayload = {"category":24,"limit":10,"offset":0,"orderby":"","order":"asc"};
  const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
  const response = await axios.post(`${BASE_URL}${ENDPOINT_ARTICLE}`, payload);
  return response.data;
};

export const getCity = async () => {
  const url = `${BASE_URL}${ENDPOINT_CITY_GET_CITY}`;
  
  const response = await axios.get(url);
  return response.data;
};

export const getEventsByCustomer = async (authToken: string, data?: any) => {
  const defaultPayload = {
    "limit": 30,
    "offset": 0
  };
  const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
  
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_GET_BY_CUSTOMER}`, payload, {
    headers: {
      'X-auth-token': authToken,
    },
  });
  return response.data;
};

export const registerMerchant = async (authToken: string, formData: FormData) => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_REGISTER_MERCHANT}`, formData, {
    headers: {
      'X-auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Return both data and status code
  return {
    ...response.data,
    status: response.status
  };
};

export const registerPublic = async (authToken: string, formData: FormData) => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_REGISTER_PUBLIC}`, formData, {
    headers: {
      'X-auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Return both data and status code
  return {
    ...response.data,
    status: response.status
  };
};


export const getEventRegister = async (authToken: string, eventId: string) => {
  const response = await axios.get(`${BASE_URL}${ENDPOINT_EVENT_REGISTER}/${eventId}`, {
    headers: {
      'X-auth-token': authToken,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const registerEvent = async (authToken: string, eventId: string) => {
  try {
    // Validate inputs
    if (!authToken || authToken.trim() === '') {
      throw new Error('Authentication token is required');
    }
    
    if (!eventId || eventId.trim() === '') {
      throw new Error('Event ID is required');
    }

    // Validate eventId is numeric
    if (!eventId.match(/^\d+$/)) {
      throw new Error('Invalid Event ID format');
    }

    console.log('🎫 Registering for event:', eventId);
    console.log('🔐 Using token:', authToken.substring(0, 20) + '...');

    const formData = new FormData();
    formData.append('eventid', eventId);
    
    const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_REGISTER}`, formData, {
      headers: {
        'X-auth-token': authToken,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Event registration API response:', response.data);
    
    // Return both data and status code
    return {
      ...response.data,
      status: response.status
    };
  } catch (error: any) {
    console.error('❌ Event registration API error:', error);
    
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      const statusCode = error.response.status;
      
      console.error('❌ Server error:', statusCode, errorData);
      
      // Create more informative error message
      let errorMessage = 'Registration failed';
      
      if (statusCode === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (statusCode === 404) {
        errorMessage = 'Event not found. Please check the event ID.';
      } else if (statusCode === 400) {
        errorMessage = errorData.error || errorData.message || 'Invalid request. Please check your data.';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // Network error
      console.error('❌ Network error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw error;
    }
  }
};