import { useState, useCallback } from 'react';
import { 
  getComputers, 
  createComputer, 
  updateComputer, 
  deleteComputer,
  importComputersFromCSV,
  exportComputersToCSV 
} from '../../api/computersApi';

export const useComputersData = (showSnackbar) => {
  const [computers, setComputers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState({
    isImporting: false,
    importedCount: 0,
    totalRows: 0,
    errors: [],
    successMessage: ''
  });

  const fetchComputers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getComputers();
      setComputers(data);
    } catch (error) {
      showSnackbar('Ошибка при загрузке компьютеров', 'error');
      console.error('Ошибка при загрузке компьютеров:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  const addComputer = useCallback(async (values) => {
    try {
      const newComputer = await createComputer(values);
      setComputers(prev => [...prev, newComputer]);
      showSnackbar('Компьютер успешно добавлен');
      return newComputer;
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Произошла ошибка при сохранении', 'error');
      throw error;
    }
  }, [showSnackbar]);

  const editComputer = useCallback(async (id, values) => {
    try {
      const updatedComputer = await updateComputer(id, values);
      setComputers(prev => prev.map(c => c.id === id ? updatedComputer : c));
      showSnackbar('Компьютер успешно обновлен');
      return updatedComputer;
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Произошла ошибка при обновлении', 'error');
      throw error;
    }
  }, [showSnackbar]);

  const removeComputer = useCallback(async (id) => {
    try {
      await deleteComputer(id);
      setComputers(prev => prev.filter(c => c.id !== id));
      showSnackbar('Компьютер успешно удален');
    } catch (error) {
      showSnackbar('Ошибка при удалении компьютера', 'error');
      throw error;
    }
  }, [showSnackbar]);

  const bulkDeleteComputers = useCallback(async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteComputer(id)));
      setComputers(prev => prev.filter(c => !ids.includes(c.id)));
      showSnackbar(`Удалено ${ids.length} компьютеров`);
    } catch (error) {
      showSnackbar('Ошибка при удалении компьютеров', 'error');
      throw error;
    }
  }, [showSnackbar]);

  const handleCSVImport = useCallback(async (file) => {
    setImportStatus({
      isImporting: true,
      importedCount: 0,
      totalRows: 0,
      errors: [],
      successMessage: ''
    });

    try {
      const result = await importComputersFromCSV(file);
      setImportStatus({
        isImporting: false,
        importedCount: result.imported_count,
        totalRows: result.total_rows,
        errors: result.errors || [],
        successMessage: result.message
      });
      await fetchComputers();
      return result;
    } catch (error) {
      setImportStatus({
        isImporting: false,
        importedCount: 0,
        totalRows: 0,
        errors: [error.response?.data?.message || 'Ошибка при импорте CSV файла'],
        successMessage: ''
      });
      throw error;
    }
  }, [fetchComputers]);

  const handleExportCSV = useCallback(async (filters) => {
    try {
      const data = await exportComputersToCSV(filters);
      return data;
    } catch (error) {
      showSnackbar('Ошибка при экспорте в CSV', 'error');
      throw error;
    }
  }, [showSnackbar]);

  return {
    computers,
    setComputers,
    isLoading,
    importStatus,
    fetchComputers,
    addComputer,
    editComputer,
    removeComputer,
    bulkDeleteComputers,
    handleCSVImport,
    handleExportCSV
  };
};