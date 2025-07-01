import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Language, AccountCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useUser();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangClose = () => {
    setLangAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleLangClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          AuctionApp
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              fontWeight: isActive('/') ? 'bold' : 'normal',
              textDecoration: isActive('/') ? 'underline' : 'none',
            }}
          >
            {t('nav.home')}
          </Button>
          
          {user && isAdmin && (
            <Button
              color="inherit"
              onClick={() => navigate('/admin')}
              sx={{
                fontWeight: isActive('/admin') ? 'bold' : 'normal',
                textDecoration: isActive('/admin') ? 'underline' : 'none',
              }}
            >
              {t('nav.admin')}
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Selector */}
          <IconButton
            size="large"
            onClick={handleLangMenu}
            color="inherit"
          >
            <Language />
          </IconButton>
          <Menu
            anchorEl={langAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(langAnchorEl)}
            onClose={handleLangClose}
          >
            <MenuItem onClick={() => handleLanguageChange('en')}>
              🇺🇸 English
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('es')}>
              🇪🇸 Español
            </MenuItem>
          </Menu>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user.username}
              </Typography>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                {user.avatar ? (
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2">{user.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.role}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  {t('nav.logout')}
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              variant="outlined"
            >
              {t('nav.login')}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
