import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.message) {
      message = error.response.data.message;
      if (error.response?.data?.errors?.length) {
        message += ` (${error.response.data.errors.join(', ')})`;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export const supplierApi = {
  getAll: (params) => apiClient.get('/suppliers', { params }),
  getById: (id) => apiClient.get(`/suppliers/${id}`),
  create: (data) => apiClient.post('/suppliers', data),
  update: (id, data) => apiClient.put(`/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/suppliers/${id}`),
  getTrash: () => apiClient.get('/suppliers/trash'),
  restore: (id) => apiClient.post(`/suppliers/${id}/restore`)
};

export const productApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  getTrash: () => apiClient.get('/products/trash'),
  restore: (id) => apiClient.post(`/products/${id}/restore`)
};

export const checkHealth = () => apiClient.get('/health');

export default apiClient;
