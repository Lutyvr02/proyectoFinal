import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { Send, Chat } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import type { ChatMessage } from '../store/useAuctionStore';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, isGlobal?: boolean) => Promise<boolean>;
  productId?: number;
  isGlobal?: boolean;
  title?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  productId, 
  isGlobal = false, 
  title 
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || isSubmitting) return;

    const messageToSend = message.trim();
    setMessage(''); // Clear immediately for better UX
    setIsSubmitting(true);
    
    try {
      const success = await onSendMessage(messageToSend, isGlobal);
      if (!success) {
        setMessage(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageToSend); // Restore message on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          {t('messages.loginRequired')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <Chat color="primary" />
          {title || (isGlobal ? t('auction.globalChat') : t('auction.chat'))}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {messages.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography color="text.secondary" align="center">
                    No messages yet. Start the conversation!
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            messages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {msg.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" color="primary">
                          {msg.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {msg.message}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < messages.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('auction.typeMessage')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              multiline
              maxRows={3}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!message.trim() || isSubmitting}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <Send />
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default ChatPanel;
