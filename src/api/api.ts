import axios from "axios";
import {
  BASE_URL,
  ENDPOINT_LEDGER,
  ENDPOINT_SLIDER,
  ENDPOINT_SPLASH,
  ENDPOINT_EVENT,
  ENDPOINT_ARTICLE,
  ENDPOINT_EVENT_BY_ID
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
    limit: 100,
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