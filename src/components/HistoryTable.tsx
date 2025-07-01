import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Bid } from '../store/useAuctionStore';

interface HistoryTableProps {
  bids: Bid[];
  title?: string;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ bids, title }) => {
  const { t } = useTranslation();

  if (bids.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title || t('auction.bidHistory')}
        </Typography>
        <Typography color="text.secondary">
          {t('auction.noBidsYet')}
        </Typography>
      </Paper>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">
          {title || t('auction.bidHistory')}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBids.map((bid, index) => (
              <TableRow 
                key={bid.id}
                sx={{ 
                  backgroundColor: index === 0 ? 'action.hover' : 'inherit',
                  '&:hover': { backgroundColor: 'action.focus' }
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                      {bid.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      {bid.username}
                      {index === 0 && (
                        <Typography 
                          component="span" 
                          color="primary" 
                          sx={{ ml: 1, fontWeight: 'bold' }}
                        >
                          (Highest)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight={index === 0 ? 'bold' : 'normal'}
                    color={index === 0 ? 'primary' : 'inherit'}
                  >
                    ${bid.amount}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(bid.timestamp)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HistoryTable;
