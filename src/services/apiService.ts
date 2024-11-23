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
export const fetchStockReferences = async () => {
  const response = await api.get('/portfolio/stockReferences');
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

// Update stockMaster
export const updateStockMaster = async (stockData: { stockId: number, stockReferenceId?: number; }) => {
  const requestBody = JSON.stringify(stockData);
  const response = await api.put(`/portfolio/updateStockMaster/`, requestBody);
  return response.data;
};

// Update stockReference
export const updateStockReference = async (referenceData: { stockReferenceId: number, sectorId?: number; }) => {
  const requestBody = JSON.stringify(referenceData);
  const response = await api.put(`/portfolio/updateStockReference/`, requestBody);
  return response.data;
};

// Delete stockReference
export const deleteStockReference = async (stockReferenceId: number) => {
  const response = await api.delete(`/portfolio/deleteStockReference/`, { data: { stockReferenceId } });
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

// Add stock reference
export const addStockReference = async (stockData: { code: string, name: string, SectorId: number }) => {
  const requestBody = JSON.stringify(stockData);
  const response = await api.post('/portfolio/stockReference', requestBody);
  return response.data;
};

// Fetch stock master data
export const fetchStockMaster = async () => {
  const response = await api.get('/portfolio/stockMaster');
  return response.data;
};

// Update sector
export const updateSector = async (sectorId: number, sectorName: string) => {
  const requestBody = JSON.stringify({ sectorId: sectorId, sectorName: sectorName });
  const response = await api.put(`/portfolio/updateSector/`, requestBody);
  return response.data;
};

// Add sector
export const addSector = async (sectorName: string) => {
  const requestBody = JSON.stringify({ sectorName: sectorName });
  const response = await api.post('/portfolio/addSector', requestBody);
  return response.data;
};

// Delete sector
export const deleteSector = async (sectorId: number) => {
  const requestBody = JSON.stringify({ sectorId: sectorId });
  const response = await api.delete(`/portfolio/deleteSector/`, { data: requestBody });
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

export default api;
