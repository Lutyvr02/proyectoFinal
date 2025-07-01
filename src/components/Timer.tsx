import React from 'react';
import { Typography, Box } from '@mui/material';
import { Timer } from '@mui/icons-material';

interface TimerProps {
  timeLeft: number;
  onTimeUp?: () => void;
}

const TimerComponent: React.FC<TimerProps> = ({ timeLeft, onTimeUp }) => {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) {
      onTimeUp?.();
      return '00:00:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (timeLeft <= 60) return 'error';
    if (timeLeft <= 300) return 'warning';
    return 'primary';
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Timer color={getColor() as any} />
      <Typography 
        variant="h6" 
        color={getColor() as any}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
};

export default TimerComponent;
