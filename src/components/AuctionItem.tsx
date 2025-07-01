import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { Timer, MonetizationOn, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Product } from '../store/useAuctionStore';

interface AuctionItemProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  timeLeft?: string;
}

const AuctionItem: React.FC<AuctionItemProps> = ({ 
  product, 
  onViewDetails, 
  timeLeft 
}) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'warning';
      case 'finished':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'finished':
        return 'Finished';
      default:
        return status;
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="h3" noWrap>
            {product.title}
          </Typography>
          <Chip
            label={getStatusText(product.status)}
            color={getStatusColor(product.status) as any}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.description}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <MonetizationOn color="primary" fontSize="small" />
          <Typography variant="body2">
            {t('auction.basePrice')}: ${product.basePrice}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <MonetizationOn color="secondary" fontSize="small" />
          <Typography variant="body2" color="secondary">
            {t('auction.currentBid')}: ${product.currentBid}
          </Typography>
        </Box>
        
        {product.currentBidder && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Person fontSize="small" />
            <Typography variant="body2">
              {product.currentBidder}
            </Typography>
          </Box>
        )}
        
        {product.status === 'active' && timeLeft && (
          <Box display="flex" alignItems="center" gap={1}>
            <Timer color="error" fontSize="small" />
            <Typography variant="body2" color="error" fontWeight="bold">
              {timeLeft}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={() => onViewDetails(product)}
        >
          {t('home.viewDetails')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default AuctionItem;
