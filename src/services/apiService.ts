// src/services/apiService.ts
import axios, { AxiosRequestConfig } from 'axios';
import { getUserUid } from '../firebase'; // Import the function to get Firebase UID

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the Firebase UID to every request
api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const uid = await getUserUid(); // Retrieve the UID of the logged-in user
  if (uid) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${uid}`, // Add the UID to the Authorization header
    };
  }
  return config;
});

// Fetch stocks
export const fetchStocks = async () => {
  const response = await api.get('/portfolio/stockReferences');
  return response.data;
};

// Fetch sectors
export const fetchSectors = async () => {
  const response = await api.get('/portfolio/sectors');
  return response.data;
};

// Fetch consolidated portfolio
export const fetchPortfolio = async () => {
  const response = await api.get('/portfolio/all');
  return response.data;
};

// Update stock
export const updateStock = async (stockData: { stockId: number, stockReferenceId?: string; sector?: string }) => {
  const requestBody = JSON.stringify(stockData);
  const response = await api.put(`/stocks/`, requestBody);
  return response.data;
};

// Upload file
export const uploadFile = async (formData: FormData) => {
  const response = await api.post('/portfolio/upload', formData);
  return response.data;
};

// Delete stock
export const deleteStock = async (stockId: number) => {
  const requestBody = JSON.stringify({ stockId });
  const response = await api.delete(`/stocks/`, requestBody);
  return response.data;
}



export default api;
