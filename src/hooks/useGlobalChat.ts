import { useCallback } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { useUser } from '../context/UserContext';
import { sseApi } from '../api/api';

export const useGlobalChat = () => {
  const { user } = useUser();
  const { 
    getGlobalChat, 
    getGlobalChatUnreadCount, 
    markGlobalChatAsRead 
  } = useAuctionStore();

  const globalMessages = getGlobalChat();
  const unreadCount = getGlobalChatUnreadCount();

  const sendGlobalMessage = useCallback(async (message: string) => {
    if (!user || !message.trim()) {
      return false;
    }

    try {
      await sseApi.addMessage(0, user.username, message);
      return true;
    } catch (error) {
      console.error('Error sending global message:', error);
      return false;
    }
  }, [user]);

  const markAsRead = useCallback(() => {
    markGlobalChatAsRead();
  }, [markGlobalChatAsRead]);

  return {
    messages: globalMessages,
    sendMessage: sendGlobalMessage,
    unreadCount,
    markAsRead,
  };
};
