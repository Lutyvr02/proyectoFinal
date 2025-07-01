import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Paper,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import { ArrowBack, Timer, MonetizationOn } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuction } from '../hooks/useAuction';
import BidForm from '../components/BidForm';
import HistoryTable from '../components/HistoryTable';
import TimerComponent from '../components/Timer';

const AuctionRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const productId = id ? parseInt(id) : 0;
  const { product, productBids, loading, error, timeLeft, placeBid, setError } = useAuction(productId);

  useEffect(() => {
    if (!productId || productId === 0) {
      navigate('/');
    }
  }, [productId, navigate]);

  const handleBidSubmit = async (amount: number) => {
    const success = await placeBid(amount);
    setSnackbar({
      open: true,
      message: success ? t('messages.bidSuccess') : t('messages.bidError'),
      severity: success ? 'success' : 'error',
    });
    return success;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    if (error) {
      setError(null);
    }
  };

  if (loading || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading auction details...</Typography>
      </Container>
    );
  }

  const isAuctionActive = product.status === 'active' && timeLeft > 0;
  const isAuctionEnded = product.status === 'finished' || (product.status === 'active' && timeLeft === 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <ArrowBack
          sx={{ cursor: 'pointer', mr: 2 }}
          onClick={() => navigate('/')}
        />
        <Typography variant="h4" component="h1">
          {product.title}
        </Typography>
        <Box ml="auto">
          <Chip
            label={product.status}
            color={product.status === 'active' ? 'success' : 
                   product.status === 'upcoming' ? 'warning' : 'error'}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="400"
              image={product.image}
              alt={product.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {product.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MonetizationOn color="primary" />
                    <Typography variant="body2">
                      {t('auction.basePrice')}: ${product.basePrice}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MonetizationOn color="secondary" />
                    <Typography variant="h6" color="secondary">
                      {t('auction.currentBid')}: ${product.currentBid}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  {isAuctionActive && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Timer color="error" />
                      <TimerComponent timeLeft={timeLeft} />
                    </Box>
                  )}
                </Grid>
              </Grid>

              {isAuctionEnded && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light' }}>
                  <Typography variant="h6" color="success.contrastText">
                    🎉 {t('auction.auctionEnded')}
                  </Typography>
                  <Typography color="success.contrastText">
                    {product.currentBidder ? (
                      <>
                        {t('auction.winner')}: <strong>{product.currentBidder}</strong> | 
                        {t('auction.finalBid')}: <strong>${product.currentBid}</strong>
                      </>
                    ) : (
                      'No bids were placed on this auction.'
                    )}
                  </Typography>
                </Paper>
              )}
              
              {product.status === 'upcoming' && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}>
                  <Typography variant="h6" color="warning.contrastText">
                    ⏰ Auction Starting Soon
                  </Typography>
                  <Typography color="warning.contrastText">
                    This auction will start at: {new Date(product.startTime).toLocaleString()}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>

          <BidForm
            currentBid={product.currentBid}
            onSubmit={handleBidSubmit}
            disabled={!isAuctionActive}
          />

          <HistoryTable bids={productBids} />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AuctionRoom;
