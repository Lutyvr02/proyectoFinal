import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import type { Product } from '../store/useAuctionStore';

interface ProductTableProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  onEdit: (id: number, product: Partial<Product>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const productSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  image: Yup.string()
    .required('Image URL is required')
    .url('Must be a valid URL'),
  basePrice: Yup.number()
    .required('Base price is required')
    .positive('Base price must be positive'),
  duration: Yup.number()
    .required('Duration is required')
    .positive('Duration must be positive'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'upcoming', 'finished'], 'Invalid status'),
});

const ProductTable: React.FC<ProductTableProps> = ({ products, onAdd, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleOpenDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) {
      const now = new Date();
      return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleSubmit = async (values: any) => {
    try {
      let startTime = values.startTime;
      
      if (startTime) {
        const localDate = new Date(startTime);
        startTime = localDate.toISOString();
      } else {
        startTime = new Date().toISOString();
      }
      
      const now = new Date();
      let status = values.status;
      const startDateTime = new Date(startTime);
      const endDateTime = new Date(startDateTime.getTime() + (values.duration * 1000));
      
      if (now >= endDateTime) {
        status = 'finished';
      } else if (now >= startDateTime) {
        status = 'active';
      } else {
        status = 'upcoming';
      }

      const productData = {
        ...values,
        startTime,
        status,
        currentBid: values.currentBid || values.basePrice,
        currentBidder: values.currentBidder || null,
        basePrice: Number(values.basePrice),
        duration: Number(values.duration),
      };

      if (editingProduct) {
        await onEdit(editingProduct.id, productData);
      } else {
        await onAdd(productData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await onDelete(productToDelete.id);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t('admin.products')}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t('admin.addProduct')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Base Price</TableCell>
              <TableCell>Current Bid</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Avatar 
                    src={product.image} 
                    sx={{ width: 60, height: 60 }}
                    variant="rounded"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{product.title}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.description}
                  </Typography>
                </TableCell>
                <TableCell>${product.basePrice}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ${product.currentBid}
                  </Typography>
                  {product.currentBidder && (
                    <Typography variant="caption" color="text.secondary">
                      by {product.currentBidder}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.status}
                    color={getStatusColor(product.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(product)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDeleteDialog(product)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
        </DialogTitle>
        <Formik
          initialValues={{
            title: editingProduct?.title || '',
            description: editingProduct?.description || '',
            image: editingProduct?.image || '',
            basePrice: editingProduct?.basePrice || 0,
            duration: editingProduct?.duration || 3600,
            status: editingProduct?.status || 'upcoming',
            startTime: editingProduct?.startTime 
              ? formatDateTimeLocal(editingProduct.startTime)
              : formatDateTimeLocal(),
            currentBid: editingProduct?.currentBid || 0,
            currentBidder: editingProduct?.currentBidder || '',
          }}
          validationSchema={productSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  margin="dense"
                  name="title"
                  label={t('forms.title')}
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="description"
                  label={t('forms.description')}
                  multiline
                  rows={3}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="image"
                  label={t('forms.image')}
                  value={values.image}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.image && !!errors.image}
                  helperText={touched.image && errors.image}
                />
                <Box display="flex" gap={2}>
                  <TextField
                    margin="dense"
                    name="basePrice"
                    label={t('forms.basePrice')}
                    type="number"
                    value={values.basePrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.basePrice && !!errors.basePrice}
                    helperText={touched.basePrice && errors.basePrice}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    margin="dense"
                    name="duration"
                    label={t('forms.duration')}
                    type="number"
                    value={values.duration}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.duration && !!errors.duration}
                    helperText={touched.duration && errors.duration}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    margin="dense"
                    name="status"
                    label="Status"
                    select
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.status && !!errors.status}
                    helperText={touched.status && errors.status}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="finished">Finished</MenuItem>
                  </TextField>
                </Box>
                <TextField
                  fullWidth
                  margin="dense"
                  name="startTime"
                  label={t('forms.startTime')}
                  type="datetime-local"
                  value={values.startTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputLabelProps={{ shrink: true }}
                  helperText="Set when the auction should start. You can set any date/time (past, present, or future)."
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>{t('forms.cancel')}</Button>
                <Button type="submit" variant="contained">
                  {t('forms.save')}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete product "{productToDelete?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>{t('forms.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t('forms.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductTable;
