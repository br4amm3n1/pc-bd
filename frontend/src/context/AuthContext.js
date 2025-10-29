import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  getAuthToken, setAuthToken, 
  logout as apiLogout, 
  getCurrentUser, 
  checkTokenExpiration,
} from '../api/auth';
import { Snackbar, Alert } from '@mui/material';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
      isAuthenticated: !!getAuthToken(),
      user: null,
      profile: null,
      isLoading: true
    });
    const [tokenExpiryWarning, setTokenExpiryWarning] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    
    const loadUserData = async () => {
      try {
          const { user, profile } = await getCurrentUser();
          setAuthState(prev => ({
              ...prev,
              user,
              profile,
              isLoading: false
          }));
      } catch (error) {
          apiLogout();
          setAuthState({
              isAuthenticated: false,
              user: null,
              profile: null,
              isLoading: false
          });
      }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = getAuthToken();
      const tokenData = JSON.parse(localStorage.getItem('tokenData') || '{}');
      
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (!checkTokenExpiration(tokenData)) {
        apiLogout();
        setAuthState({
          isAuthenticated: false,
          user: null,
          profile: null,
          isLoading: false
        });
        return;
      }

      try {
        await loadUserData();
      } catch (error) {
        apiLogout();
        setAuthState({
          isAuthenticated: false,
          user: null,
          profile: null,
          isLoading: false
        });
      }
    };

  verifyToken();
  }, []);

  const handleLogout = useCallback(() => {
    apiLogout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      profile: null,
      isLoading: false
    });
    setTokenExpiryWarning(false);
    setTokenExpired(false);
  }, []);

  useEffect(() => {
    let interval;
    
    const checkToken = () => {
      if (authState.isAuthenticated) {
        const tokenDataStr = localStorage.getItem('tokenData');
        const tokenData = tokenDataStr ? JSON.parse(tokenDataStr) : {};
        
        if (!tokenData.expires_at || !checkTokenExpiration(tokenData)) {
          setTokenExpired(true);
          handleLogout();
          return;
        }

      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      const timeLeft = expiresAt - now;

      if (timeLeft <= 0) {
        setTokenExpired(true);
        setTokenExpiryWarning(false);
        handleLogout();
      } else if (timeLeft < 5 * 60 * 1000) {
        setTokenExpiryWarning(true);
      } else {
        setTokenExpiryWarning(false);
      }
    }
  };
    
  if (authState.isAuthenticated) {
    interval = setInterval(checkToken, 60000); 
    checkToken();
  }
    
  return () => {
    if (interval) clearInterval(interval);
    };
  }, [authState.isAuthenticated, handleLogout]);

  const handleLogin = async (token) => {
    try {
      setAuthToken(token); 
      const { user, profile } = await getCurrentUser(); 
      
      setAuthState({
        isAuthenticated: true,
        user,
        profile,
        isLoading: false
      });
      
      return true; 
    } catch (error) {
      apiLogout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: false
      });
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
      const { user, profile } = await getCurrentUser();
      setAuthState(prev => ({
          ...prev,
          user: { ...user, ...updates.user },
          profile: { ...profile, ...updates.profile }
      }));
  };

  const updateAuthState = (newData) => {
      setAuthState(prev => ({
          ...prev,
          user: newData.user || prev.user,
          profile: newData.profile || prev.profile,
      }));
  };

    return (
        <AuthContext.Provider value={{
          ...authState,
          handleLogin,
          handleLogout,
          updateUserProfile,
          updateAuthState,
        }}>
          {!authState.isLoading && children}
          
          {/* Уведомление о скором истечении токена */}
          <Snackbar
            open={tokenExpiryWarning}
            autoHideDuration={null}
            onClose={() => setTokenExpiryWarning(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity="warning" 
              onClose={() => setTokenExpiryWarning(false)}
            >
              Ваша сессия скоро истечет
            </Alert>
          </Snackbar>
          
          {/* Уведомление об истекшем токене */}
          <Snackbar
            open={tokenExpired}
            autoHideDuration={6000}
            onClose={() => {
              setTokenExpired(false);
              handleLogout();
            }}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="error">
              Ваша сессия истекла. Пожалуйста, войдите снова.
            </Alert>
          </Snackbar>
        </AuthContext.Provider>
    );
};