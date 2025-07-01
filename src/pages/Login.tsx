import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
} from '@mui/material';
import { Person, Add } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/api';
import type { User } from '../context/UserContext';

const newUserSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['user', 'admin'], 'Invalid role'),
  avatar: Yup.string().url('Must be a valid URL').nullable(),
});

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    login(user);
    navigate('/');
  };

  const handleCreateUser = async (values: any) => {
    try {
      const newUser = await usersApi.create(values);
      setUsers(prev => [...prev, newUser]);
      login(newUser);
      navigate('/');
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {t('nav.login')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!showNewUserForm ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('auth.selectUser')}
            </Typography>
            
            <List>
              {users.map((user) => (
                <ListItemButton
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1 
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.username}
                    secondary={
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: user.role === 'admin' ? 'primary.light' : 'secondary.light',
                          color: user.role === 'admin' ? 'primary.contrastText' : 'secondary.contrastText',
                          display: 'inline-block',
                          fontSize: '0.75rem',
                        }}
                      >
                        {user.role}
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.or')}
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowNewUserForm(true)}
            >
              {t('auth.createNewUser')}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('auth.createNewUser')}
            </Typography>
            
            <Formik
              initialValues={{
                username: '',
                role: 'user',
                avatar: '',
              }}
              validationSchema={newUserSchema}
              onSubmit={handleCreateUser}
            >
              {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="username"
                    label={t('auth.enterUsername')}
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && !!errors.username}
                    helperText={touched.username && errors.username}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    name="role"
                    label={t('auth.selectRole')}
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
                    margin="normal"
                    name="avatar"
                    label={t('forms.avatar')}
                    value={values.avatar}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.avatar && !!errors.avatar}
                    helperText={touched.avatar && errors.avatar}
                    placeholder="https://example.com/avatar.jpg (optional)"
                  />
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowNewUserForm(false)}
                      sx={{ flex: 1 }}
                    >
                      {t('forms.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ flex: 1 }}
                    >
                      {t('auth.register')}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;
