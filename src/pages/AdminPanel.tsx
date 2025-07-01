import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { productsApi, usersApi } from '../api/api';
import UserTable from '../components/UserTable';
import ProductTable from '../components/ProductTable';
import type { User } from '../context/UserContext';
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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, productsData] = await Promise.all([
        usersApi.getAll(),
        productsApi.getAll(),
      ]);
      setUsers(usersData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      const newUser = await usersApi.create(userData);
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      setError('Failed to add user');
    }
  };

  const handleEditUser = async (id: number, userData: Partial<User>) => {
    try {
      const updatedUser = await usersApi.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productsApi.create(productData);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError('Failed to add product');
    }
  };

  const handleEditProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const updatedProduct = await productsApi.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  if (!user || !isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading admin panel...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('admin.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label={`${t('admin.products')} (${products.length})`}
            id="admin-tab-0"
            aria-controls="admin-tabpanel-0"
          />
          <Tab 
            label={`${t('admin.users')} (${users.length})`}
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ProductTable
          products={products}
          onAdd={handleAddProduct}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <UserTable
          users={users}
          onAdd={handleAddUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </TabPanel>
    </Container>
  );
};

export default AdminPanel;
