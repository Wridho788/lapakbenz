import axios from "axios";
import {
  BASE_URL,
  ENDPOINT_LEDGER,
  ENDPOINT_SLIDER,
  ENDPOINT_SPLASH,
  ENDPOINT_EVENT,
} from "./constants";

export const getLedger = async () => {
  const response = await axios.get(`${BASE_URL}${ENDPOINT_LEDGER}`);
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

export const postEvent = async (data: any) => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT}`, data);
  return response.data;
};
