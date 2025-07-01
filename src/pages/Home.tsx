import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuction } from '../hooks/useAuction';
import AuctionItem from '../components/AuctionItem';
import type { Product } from '../store/useAuctionStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auction-tabpanel-${index}`}
      aria-labelledby={`auction-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const { getCurrentAuctions, getUpcomingAuctions, getPastAuctions } = useAuctionStore();
  const { loading, error, loadData } = useAuction();

  const currentAuctions = getCurrentAuctions();
  const upcomingAuctions = getUpcomingAuctions();
  const pastAuctions = getPastAuctions();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/auction/${product.id}`);
  };

  const renderAuctionGrid = (auctions: Product[], showTimer: boolean = false) => {
    if (auctions.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            {t('home.noAuctions')}
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {auctions.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <AuctionItem
              product={product}
              onViewDetails={handleViewDetails}
              timeLeft={showTimer && product.status === 'active' ? '00:05:30' : undefined}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading auctions...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        {t('home.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab 
            label={`${t('home.currentAuctions')} (${currentAuctions.length})`}
            id="auction-tab-0"
            aria-controls="auction-tabpanel-0"
          />
          <Tab 
            label={`${t('home.upcomingAuctions')} (${upcomingAuctions.length})`}
            id="auction-tab-1"
            aria-controls="auction-tabpanel-1"
          />
          <Tab 
            label={`${t('home.pastAuctions')} (${pastAuctions.length})`}
            id="auction-tab-2"
            aria-controls="auction-tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderAuctionGrid(currentAuctions, true)}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderAuctionGrid(upcomingAuctions)}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderAuctionGrid(pastAuctions)}
      </TabPanel>
    </Container>
  );
};

export default Home;
