import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Badge,
  Typography,
  Fab,
} from '@mui/material';
import { Chat, Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGlobalChat } from '../hooks/useGlobalChat';
import ChatPanel from './ChatPanel';

const GlobalChat: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, unreadCount, markAsRead } = useGlobalChat();

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

  const handleSendMessage = async (message: string) => {
    return await sendMessage(message);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={handleToggleChat}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Chat />
        </Badge>
      </Fab>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h6" component="div">
              {t('chat.globalChat')}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setIsOpen(false)}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>

          {/* Chat Panel */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isGlobal={true}
              title={t('chat.globalChat')}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default GlobalChat;
