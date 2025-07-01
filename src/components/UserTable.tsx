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
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import type { User } from '../context/UserContext';

interface UserTableProps {
  users: User[];
  onAdd: (user: Omit<User, 'id'>) => Promise<void>;
  onEdit: (id: number, user: Partial<User>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const userSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['user', 'admin'], 'Invalid role'),
  avatar: Yup.string().url('Must be a valid URL').nullable(),
});

const UserTable: React.FC<UserTableProps> = ({ users, onAdd, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleOpenDialog = (user?: User) => {
    setEditingUser(user || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await onEdit(editingUser.id, values);
      } else {
        await onAdd(values);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await onDelete(userToDelete.id);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t('admin.users')}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t('admin.addUser')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar 
                    src={user.avatar} 
                    sx={{ width: 40, height: 40 }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: user.role === 'admin' ? 'primary.light' : 'secondary.light',
                      color: user.role === 'admin' ? 'primary.contrastText' : 'secondary.contrastText',
                      display: 'inline-block',
                    }}
                  >
                    {user.role}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(user)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDeleteDialog(user)}
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

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? t('admin.editUser') : t('admin.addUser')}
        </DialogTitle>
        <Formik
          initialValues={{
            username: editingUser?.username || '',
            role: editingUser?.role || 'user',
            avatar: editingUser?.avatar || '',
          }}
          validationSchema={userSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  margin="dense"
                  name="username"
                  label={t('forms.username')}
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="role"
                  label={t('forms.role')}
                  select
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.role && !!errors.role}
                  helperText={touched.role && errors.role}
                >
                  <MenuItem value="user">{t('auth.user')}</MenuItem>
                  <MenuItem value="admin">{t('auth.admin')}</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  margin="dense"
                  name="avatar"
                  label={t('forms.avatar')}
                  value={values.avatar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.avatar && !!errors.avatar}
                  helperText={touched.avatar && errors.avatar}
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
            Are you sure you want to delete user "{userToDelete?.username}"?
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

export default UserTable;
