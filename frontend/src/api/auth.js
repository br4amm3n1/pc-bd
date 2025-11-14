import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.66:8001/api/accounts/',
});

export const checkTokenExpiration = (tokenData) => {
  if (!tokenData || !tokenData.expires_at) return true; // Если нет данных, считаем токен валидным
  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);
  return now < expiresAt;
};

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login'; // Принудительный редирект
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(config => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const register = async (userData) => {
  try {
    const response = await api.post('register/', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('login/', credentials);
    // Убедимся, что expires_at есть в ответе
    if (!response.data.expires_at) {
      throw new Error('Сервер не вернул срок действия токена');
    }
    const tokenData = {
      expires_at: response.data.expires_at
    };
    localStorage.setItem('tokenData', JSON.stringify(tokenData));
    return response.data;
  } catch (error) {
    localStorage.removeItem('tokenData');
    throw error.response?.data || error.message;
  }
};

export const deleteToken = async () => {
  try {
    const response = await api.post('delete_token/');
    return response.data.message;
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
      return 'Token already invalidated';
    }
    throw error.response?.data || error.message;
  }
};

export const logout = async () => {
  try {
    if (isAuthenticated()) {
      await deleteToken();
    }
  } catch (error) {
    console.error('Error during token deletion:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenData');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getCurrentUser = async () => {
  const userResponse = await api.get('users/me/');
  const profileResponse = await api.get('profiles/me/');
  return {
      user: userResponse.data,
      profile: profileResponse.data,
  };
};

export const fetchProfile = async (userId) => {
    const response = await api.get(`profiles/${userId}/`);
    return response.data;
};
  
export const updateUserData = async (userId, data) => {
    const response = await api.patch(`users/${userId}/`, data);
    return response.data;
};
  
export const updateProfileData = async (profileId, data) => {
    const response = await api.patch(`profiles/${profileId}/`, data);
    return response.data;
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};

export default api;
