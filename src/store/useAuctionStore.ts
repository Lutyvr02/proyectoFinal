import { create } from 'zustand';

export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  basePrice: number;
  duration: number;
  startTime: string;
  currentBid: number;
  currentBidder: string | null;
  status: 'active' | 'upcoming' | 'finished';
}

export interface Bid {
  id: number;
  productId: number;
  username: string;
  amount: number;
  timestamp: string;
}

export interface ChatMessage {
  id: number;
  productId?: number;
  username: string;
  message: string;
  timestamp: string;
}

interface AuctionState {
  products: Product[];
  bids: Bid[];
  chatMessages: ChatMessage[];
  lastReadGlobalChat: number;
  setProducts: (products: Product[]) => void;
  setBids: (bids: Bid[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  updateProduct: (product: Product) => void;
  addBid: (bid: Bid) => void;
  addChatMessage: (message: ChatMessage) => void;
  getProductById: (id: number) => Product | undefined;
  getBidsByProduct: (productId: number) => Bid[];
  getChatByProduct: (productId: number) => ChatMessage[];
  getGlobalChat: () => ChatMessage[];
  getGlobalChatUnreadCount: () => number;
  markGlobalChatAsRead: () => void;
  getCurrentAuctions: () => Product[];
  getUpcomingAuctions: () => Product[];
  getPastAuctions: () => Product[];
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  products: [],
  bids: [],
  chatMessages: [],
  lastReadGlobalChat: Date.now(),
  
  setProducts: (products) => set({ products }),
  setBids: (bids) => set({ bids }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  
  updateProduct: (product) => set((state) => ({
    products: state.products.map(p => Number(p.id) === Number(product.id) ? product : p)
  })),
  
  addBid: (bid) => set((state) => ({
    bids: [...state.bids, bid]
  })),
  
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  
  getProductById: (id) => get().products.find(p => Number(p.id) === Number(id)),
  
  getBidsByProduct: (productId) => 
    get().bids.filter(bid => Number(bid.productId) === Number(productId)),
  
  getChatByProduct: (productId) => 
    get().chatMessages.filter(msg => Number(msg.productId) === Number(productId)),
  
  getGlobalChat: () => 
    get().chatMessages.filter(msg => !msg.productId || msg.productId === 0),
  
  getGlobalChatUnreadCount: () => {
    const state = get();
    const globalMessages = state.chatMessages.filter(msg => !msg.productId || msg.productId === 0);
    return globalMessages.filter(msg => new Date(msg.timestamp).getTime() > state.lastReadGlobalChat).length;
  },
  
  markGlobalChatAsRead: () => set({ lastReadGlobalChat: Date.now() }),
  
  getCurrentAuctions: () => get().products.filter(p => p.status === 'active'),
  getUpcomingAuctions: () => get().products.filter(p => p.status === 'upcoming'),
  getPastAuctions: () => get().products.filter(p => p.status === 'finished'),
}));
