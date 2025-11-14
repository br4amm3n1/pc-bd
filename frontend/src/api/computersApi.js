import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = 'http://192.168.1.66:8001/api/computers/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

const logChange = async (computerId, action, changes = null) => {
  try {
    const changeDescription = {
      action,
      ...(changes && { changes })
    };
    
    await api.post(`computers/${computerId}/log_change/`, {
      change_description: JSON.stringify(changeDescription)
    });
  } catch (error) {
    console.error('Ошибка при записи изменения:', error);
  }
};

export const importComputersFromCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('computers/import_csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportComputersToCSV = async (filters) => {
  try {
    const response = await api.get('/computers/export_csv/', {
      params: filters,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getComputers = async () => {
  try {
    const response = await api.get('computers/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка компьютеров:', error);
    throw error;
  }
};

export const getComputer = async (id) => {
  try {
    const response = await api.get(`computers/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении компьютера с ID ${id}:`, error);
    throw error;
  }
};

export const createComputer = async (computerData) => {
  try {
    const response = await api.post('computers/', computerData);
    // Логируем создание компьютера
    await logChange(response.data.id, 'create', computerData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании компьютера:', error);
    throw error;
  }
};

export const updateComputer = async (id, computerData) => {
  try {
    // Получаем текущие данные компьютера для сравнения
    const currentComputer = await getComputer(id);
    const response = await api.put(`computers/${id}/`, computerData);
    
    // Находим измененные поля
    const changes = {};
    Object.keys(computerData).forEach(key => {
      if (JSON.stringify(currentComputer[key]) !== JSON.stringify(computerData[key])) {
        changes[key] = {
          from: currentComputer[key],
          to: computerData[key]
        };
      }
    });
    
    // Логируем изменения, если они есть
    if (Object.keys(changes).length > 0) {
      await logChange(id, 'update', changes);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении компьютера с ID ${id}:`, error);
    throw error;
  }
};

export const patchComputer = async (id, computerData) => {
  try {
    // Получаем текущие данные компьютера для сравнения
    const currentComputer = await getComputer(id);
    const response = await api.patch(`computers/${id}/`, computerData);
    
    // Находим измененные поля
    const changes = {};
    Object.keys(computerData).forEach(key => {
      if (JSON.stringify(currentComputer[key]) !== JSON.stringify(computerData[key])) {
        changes[key] = {
          from: currentComputer[key],
          to: computerData[key]
        };
      }
    });
    
    // Логируем изменения, если они есть
    if (Object.keys(changes).length > 0) {
      await logChange(id, 'update', changes);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при частичном обновлении компьютера с ID ${id}:`, error);
    throw error;
  }
};

export const deleteComputer = async (id) => {
  try {
    // Получаем данные компьютера перед удалением
    const computer = await getComputer(id);
    
    // Логируем удаление
    await logChange(id, 'delete', {
      computer_data: computer
    });

    await api.delete(`computers/${id}/`);
  } catch (error) {
    console.error(`Ошибка при удалении компьютера с ID ${id}:`, error);
    throw error;
  }
};

export const getComputerChanges = async (computerId) => {
  try {
    const response = await api.get(`computers/${computerId}/changes/`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении истории изменений для компьютера ${computerId}:`, error);
    throw error;
  }
};

export const getComputersChanges = async () => {
  try {
    const response = await api.get(`changes/`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении истории изменений для компьютеров:`, error);
    throw error;
  }
};


export default {
  getComputers,
  getComputer,
  createComputer,
  updateComputer,
  patchComputer,
  deleteComputer,
  getComputerChanges,
};
