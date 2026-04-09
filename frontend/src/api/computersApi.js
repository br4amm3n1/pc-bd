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
  
  // Читаем файл и убираем BOM если есть
  const fileContent = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target.result;
      // Удаляем BOM если он есть
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.substring(1);
      }
      resolve(content);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
  
  // Создаем новый Blob без BOM
  const cleanBlob = new Blob([fileContent], { type: 'text/csv' });
  const cleanFile = new File([cleanBlob], file.name, { type: 'text/csv' });
  
  formData.append('file', cleanFile);

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
    await logChange(response.data.id, 'create', computerData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании компьютера:', error);
    throw error;
  }
};

export const updateComputer = async (id, computerData) => {
  try {
    const currentComputer = await getComputer(id);
    const response = await api.put(`computers/${id}/`, computerData);

    const changes = {};
    Object.keys(computerData).forEach(key => {
      if (JSON.stringify(currentComputer[key]) !== JSON.stringify(computerData[key])) {
        changes[key] = {
          from: currentComputer[key],
          to: computerData[key]
        };
      }
    });
    
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
    const currentComputer = await getComputer(id);
    const response = await api.patch(`computers/${id}/`, computerData);
    
    const changes = {};
    Object.keys(computerData).forEach(key => {
      if (JSON.stringify(currentComputer[key]) !== JSON.stringify(computerData[key])) {
        changes[key] = {
          from: currentComputer[key],
          to: computerData[key]
        };
      }
    });
    
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
    const computer = await getComputer(id);
    
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

export const getChangesVersion = async () => {
  try {
    const response = await api.get('changes/version/');
    return {
      version: response.data.version,
      totalCount: response.data.total_count,
      lastModified: response.data.last_modified,
      etag: response.data.etag
    };
  } catch (error) {
    console.error('Version endpoint failed, trying HEAD request:', error);
    
    try {
      const headResponse = await api.head('changes/');
      return {
        version: headResponse.headers['x-version'] || 
                 headResponse.headers['etag'] || 
                 Date.now().toString(),
        totalCount: parseInt(headResponse.headers['x-total-count'] || '0'),
        lastModified: headResponse.headers['last-modified'],
        etag: headResponse.headers['etag']
      };
    } catch (headError) {
      console.error('HEAD request failed, trying GET with limit:', headError);
      const response = await api.get('changes/', { 
        params: { limit: 1, ordering: '-change_date' }
      });
      return {
        version: response.data[0]?.change_date || '0',
        totalCount: response.data.length,
        lastModified: response.data[0]?.change_date,
        etag: null
      };
    }
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
