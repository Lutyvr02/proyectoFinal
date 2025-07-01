import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { UserProvider } from './context/UserContext';
import './i18n';

import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalChat from './components/GlobalChat';

import Home from './pages/Home';
import AuctionRoom from './pages/AuctionRoom';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/auction/:id" 
                    element={
                      <ProtectedRoute>
                        <AuctionRoom />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPanel />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              <GlobalChat />
            </div>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
