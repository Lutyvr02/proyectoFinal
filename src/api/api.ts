import axios from 'axios';
import type { Product, Bid, ChatMessage } from '../store/useAuctionStore';
import type { User } from '../context/UserContext';

const API_BASE_URL = 'http://localhost:3001';
const SSE_BASE_URL = 'http://localhost:3002';

// API Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data;
  },
  
  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const allProducts = await productsApi.getAll();
    const maxId = allProducts.length > 0 ? Math.max(...allProducts.map(p => Number(p.id) || 0)) : 0;
    const newId = maxId + 1;
    
    const productWithId = { ...product, id: newId };
    const response = await apiClient.post('/products', productWithId);
    return response.data;
  },
  
  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/usuarios');
    return response.data;
  },
  
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/usuarios/${id}`);
    return response.data;
  },
  
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await apiClient.post('/usuarios', user);
    return response.data;
  },
  
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/usuarios/${id}`, user);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },
};

// Bids API
export const bidsApi = {
  getAll: async (): Promise<Bid[]> => {
    const response = await apiClient.get('/bids');
    return response.data;
  },
  
  getByProduct: async (productId: number): Promise<Bid[]> => {
    const response = await apiClient.get(`/bids?productId=${productId}`);
    return response.data;
  },
  
  create: async (bid: Omit<Bid, 'id'>): Promise<Bid> => {
    const response = await apiClient.post('/bids', bid);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  getAll: async (): Promise<ChatMessage[]> => {
    const response = await apiClient.get('/chat');
    return response.data;
  },
  
  getByProduct: async (productId: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat?productId=${productId}`);
    return response.data;
  },
  
  create: async (message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    const response = await apiClient.post('/chat', message);
    return response.data;
  },
};

// SSE API
export const sseApi = {
  updateBid: async (productId: number, username: string, amount: number): Promise<void> => {
    await axios.post(`${SSE_BASE_URL}/update-bid`, {
      productId,
      username,
      amount,
    });
  },
  
  addMessage: async (productId: number, username: string, message: string): Promise<void> => {
    await axios.post(`${SSE_BASE_URL}/add-message`, {
      productId,
      username,
      message,
    });
  },
  
  connectToEvents: (): EventSource => {
    return new EventSource(`${SSE_BASE_URL}/events`);
  },
};
