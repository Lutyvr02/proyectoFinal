import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { useUser } from '../context/UserContext';
import { productsApi, bidsApi, chatApi, sseApi } from '../api/api';
import type { Product, Bid, ChatMessage } from '../store/useAuctionStore';

export const useAuction = (productId?: number) => {
  const { user } = useUser();
  const {
    products,
    bids,
    chatMessages,
    setProducts,
    setBids,
    setChatMessages,
    updateProduct,
    addBid,
    addChatMessage,
    getProductById,
    getBidsByProduct,
    getChatByProduct,
    getGlobalChat,
  } = useAuctionStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const product = useMemo(() => {
    return productId ? getProductById(productId) : null;
  }, [productId, getProductById, products]);

  const productBids = useMemo(() => {
    return productId ? getBidsByProduct(productId) : [];
  }, [productId, getBidsByProduct, bids]);

  const productChat = useMemo(() => {
    return productId ? getChatByProduct(productId) : [];
  }, [productId, getChatByProduct, chatMessages]);

  const globalChat = useMemo(() => {
    return getGlobalChat();
  }, [getGlobalChat, chatMessages]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, bidsData, chatData] = await Promise.all([
        productsApi.getAll(),
        bidsApi.getAll(),
        chatApi.getAll(),
      ]);
      
      setProducts(productsData);
      setBids(bidsData);
      setChatMessages(chatData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [setProducts, setBids, setChatMessages]);

  const placeBid = useCallback(async (amount: number) => {
    if (!user || !product) {
      setError('User or product not found');
      return false;
    }

    if (amount <= product.currentBid) {
      setError('Bid must be higher than current bid');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedProduct = {
        ...product,
        currentBid: amount,
        currentBidder: user.username,
      };
      updateProduct(updatedProduct);

      const newBid: Bid = {
        id: Date.now(),
        productId: product.id,
        username: user.username,
        amount,
        timestamp: new Date().toISOString(),
      };
      addBid(newBid);

      await sseApi.updateBid(product.id, user.username, amount);
      return true;
    } catch (err) {
      setError('Failed to place bid');
      console.error('Error placing bid:', err);
      
      await loadData();
      return false;
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, product, updateProduct, addBid, loadData]);

  const sendMessage = useCallback(async (message: string, isGlobal = false) => {
    if (!user || !message.trim()) {
      setError('Invalid message or user not logged in');
      return false;
    }

    if (!isGlobal && !productId) {
      setError('Product ID required for product-specific chat');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      await sseApi.addMessage(isGlobal ? 0 : productId!, user.username, message);
      return true;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, productId]);

  const calculateTimeLeft = useCallback(() => {
    if (!product || product.status !== 'active') {
      setTimeLeft(0);
      return;
    }

    const startTime = new Date(product.startTime);
    const endTime = new Date(startTime.getTime() + (product.duration * 1000));
    const now = new Date();
    const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    
    setTimeLeft(remaining);
  }, [product]);

  useEffect(() => {
    const eventSource = sseApi.connectToEvents();

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'bid_update':
            const currentProducts = useAuctionStore.getState().products;
            const updatedProducts = currentProducts.map(p => 
              p.id === data.productId 
                ? {
                    ...p,
                    currentBid: data.currentBid,
                    currentBidder: data.currentBidder,
                  }
                : p
            );
            setProducts(updatedProducts);
            
            const newBid: Bid = {
              id: Date.now(),
              productId: data.productId,
              username: data.currentBidder,
              amount: data.currentBid,
              timestamp: data.timestamp,
            };
            addBid(newBid);
            break;
            
          case 'chat_message':
            const newMessage: ChatMessage = {
              id: data.id || Date.now(),
              productId: data.productId === 0 ? undefined : data.productId,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp,
            };
            addChatMessage(newMessage);
            break;
            
          case 'auction_ended':
            const currentProductsEnd = useAuctionStore.getState().products;
            const updatedProductsEnd = currentProductsEnd.map(p => 
              p.id === data.productId 
                ? { ...p, status: 'finished' as const }
                : p
            );
            setProducts(updatedProductsEnd);
            break;
            
          case 'auction_started':
            const currentProductsStart = useAuctionStore.getState().products;
            const updatedProductsStart = currentProductsStart.map(p => 
              p.id === data.productId 
                ? { ...p, status: 'active' as const }
                : p
            );
            setProducts(updatedProductsStart);
            break;
            
          case 'timer_update':
            if (data.productId === productId) {
              setTimeLeft(data.timeLeft);
            }
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [productId, setProducts, addBid, addChatMessage]);

  useEffect(() => {
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const formatTimeLeft = useCallback((seconds: number): string => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    product,
    productBids,
    productChat,
    globalChat,
    loading,
    error,
    timeLeft,
    formatTimeLeft: formatTimeLeft(timeLeft),
    loadData,
    placeBid,
    sendMessage,
    setError,
  };
};
