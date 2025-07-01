import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              width: '100%',
            }}
          >
            <ErrorIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  bgcolor: 'grey.100',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <Typography variant="body2" color="error">
                  {this.state.error.message}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {this.state.error.stack}
                </Typography>
              </Paper>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
                color="primary"
              >
                Try Again
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                color="secondary"
              >
                Refresh Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
