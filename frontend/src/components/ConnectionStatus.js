import React from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Snackbar, Alert, CircularProgress, Box, Typography } from '@mui/material';
import { CloudOff } from '@mui/icons-material';

export const ConnectionStatus = () => {
  const isFetching = useIsFetching({ queryKey: ['changes'] });
  const isMutating = useIsMutating();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showOffline, setShowOffline] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
      setTimeout(() => setShowOffline(false), 3000);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showOffline) {
    return (
      <Snackbar open={true} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="warning" icon={<CloudOff />}>
          Нет соединения с сервером. Данные загружены из кэша.
        </Alert>
      </Snackbar>
    );
  }

  if (isFetching > 0) {
    return (
      <Box sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        zIndex: 9999,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <CircularProgress size={20} />
        <Typography variant="caption">
          {isMutating > 0 ? 'Сохранение...' : 'Обновление данных...'}
        </Typography>
      </Box>
    );
  }

  return null;
};