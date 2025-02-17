// src/services/apiService.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '../firebase'; // Import the function to get Firebase UID

const env = import.meta.env
const API_BASE_URL = env.VITE_API_BASE_URL;

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Origin": "*",
  },
});

// Request interceptor to attach the Firebase UID to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const authToken = await getAuthToken(); // Retrieve the Firebase Auth token
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`); // Add the UID to the Authorization header
  }

  // Remove JSON Content-Type header for FormData requests
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Fetch stocks
export const fetchStockMasters = async () => {
  const response = await api.get('/portfolio/stockMasters');
  return response.data;
};

// Fetch sectors
export const fetchSectors = async () => {
  const response = await api.get('/portfolio/sectors');
  return response.data;
};

// Fetch consolidated portfolio
export const fetchPortfolio = async (date: string) => {
  const data = { date: date };
  const response = await api.get('/portfolio/all', { params: data });
  return response.data;
};

// Update stockMapper for multiple stocks
export const updateStockMapper = async (stocks: { stockId: number; stockMasterId?: number }[]) => {
  if (!Array.isArray(stocks) || stocks.length === 0) {
    throw new Error('The stocks array is required and must not be empty.');
  }

  const requestBody = JSON.stringify({ stocks });
  const response = await api.put(`/portfolio/updateStockMapper/`, requestBody);
  return response.data;
};


// Update stockMaster
export const updateStockMasters = async (
  updates: Array<{ stockMasterId: number; sectorId: number }>
): Promise<{ success: boolean; message?: string }> => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('The updates array is required and must not be empty.');
  }
  const requestBody = JSON.stringify({ updates });
  const response = await api.put(`/portfolio/updateStockMasters/`, requestBody);
  return response.data;
};

// Delete stockMaster
export const deleteStockMasters = async (
  stockMasterIds: number[]
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/portfolio/deleteStockMasters/`, { data: { stockMasterIds } });
  return response.data;
};

// Upload file
export const uploadFile = async (formData: FormData) => {
  const response = await api.post('/portfolio/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Ensure multipart form-data is set
    },
  });
  return response.data;
};

// Add stock master
export const addStockMaster = async (stockData: { code: string, SectorId: number }) => {
  const requestBody = JSON.stringify(stockData);
  const response = await api.post('/portfolio/stockMaster', requestBody);
  return response.data;
};

// Fetch stock master data
export const fetchStockMapper = async () => {
  const response = await api.get('/portfolio/stockMapper');
  return response.data;
};

// Update sector
export const updateSectors = async (updates: Array<{ sectorId: number, sectorName: string }>) => {
  const requestBody = JSON.stringify({ updates });
  const response = await api.put(`/portfolio/updateSectors/`, requestBody);
  return response.data;
};

// Add sector
export const addSector = async (sectorName: string) => {
  const requestBody = JSON.stringify({ sectorName: sectorName });
  const response = await api.post('/portfolio/addSector', requestBody);
  return response.data;
};

// Delete sector
export const deleteSectors = async (sectorIds: number[]) => {
  if (!Array.isArray(sectorIds)) {
    throw new Error('The sectorIds array is required.');
  }
  const requestBody = JSON.stringify({ sectorIds: sectorIds });
  const response = await api.delete(`/portfolio/deleteSectors/`, { data: requestBody });
  return response.data;
};

// Fetch brokerages
export const getBrokerages = async () => {
  const response = await api.get('/portfolio/brokerages');
  return response.data;
}

// Get default brokerage
export const getDefaultBrokerage = async () => {
  const response = await api.get('/user/defaultBrokerage');
  return response.data;
};

// Update default brokerage
export const updateDefaultBrokerage = async (brokerageId: number) => {
  const requestBody = JSON.stringify({ brokerageId: brokerageId });
  const response = await api.put('/user/defaultBrokerage', requestBody);
  return response.data;
};

// Add new user to database
export const addUser = async (email: string, name: string, password: string) => {
  const requestBody = JSON.stringify({ email: email, name: name, password: password });
  console.log('requestBody', requestBody);
  const response = await api.post('/auth/register', requestBody);
  console.log('response', response);
  return response.data;
};

// Get dates when portfolio data is available
export const getPortfolioDates = async () => {
  const response = await api.get('/portfolio/dates');
  return response.data;
};

// Delete portfolio data
export const deletePortfolio = async (data: { brokerageId: number, fromDate: string, toDate: string }) => {
  const requestBody = JSON.stringify(data);
  const response = await api.delete('/portfolio', { data: requestBody });
  return response.data;
};

// Fetch user data
export const getUserData = async () => {
  const response = await api.get('/user');
  return response.data;
};

export default api;
