import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Collapse,
  Divider,
  TablePagination,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Download } from '@mui/icons-material';
import { CloudUpload } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ComputerForm from '../../components/ComputerForm';
import CsvImportModal from './CsvImportModal';
import { 
  getComputers, 
  createComputer, 
  updateComputer, 
  deleteComputer, 
  importComputersFromCSV,
  exportComputersToCSV, 
} from '../../api/computersApi';
import { ComputersFilter } from './ComputersFilter';
import { AuthContext } from '../../context/AuthContext';

export default function ComputersPage() {
  const [computers, setComputers] = useState([]);
  const [filteredComputers, setFilteredComputers] = useState([]);
  const [filters, setFilters] = useState({});
  const [openForm, setOpenForm] = useState(false);
  const [editingComputer, setEditingComputer] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [importStatus, setImportStatus] = useState({
    isImporting: false,
    importedCount: 0,
    totalRows: 0,
    errors: [],
    successMessage: ''
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedComputers, setSelectedComputers] = useState([]);
  const { profile, isLoading } = useContext(AuthContext);

  const fetchComputers = useCallback(async () => {
    try {
      const data = await getComputers();
      setComputers(data);
    } catch (error) {
      showSnackbar('Ошибка при загрузке компьютеров', 'error');
      console.error('Ошибка при загрузке компьютеров:', error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...computers];
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(computer => {
          const value = computer[key];
          const filterValue = filters[key].toString().toLowerCase();
          
          if (key === 'has_kaspersky') {
            return value.toString() === filterValue;
          }
          
          return value.toString().toLowerCase().includes(filterValue);
        });
      }
    });
    
    setFilteredComputers(result);
    setPage(0);
  }, [computers, filters]);

  useEffect(() => {
    if (!isLoading) {
      fetchComputers();
    }
  }, [fetchComputers, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      applyFilters();
    }
  }, [applyFilters, computers, filters, isLoading]);

  if (isLoading || !profile) {
    return <CircularProgress />;
  }

  const isAuditor = profile.role === 'auditor';

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Вычисляем компьютеры для текущей страницы
  const paginatedComputers = filteredComputers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleEdit = (computer) => {
    setEditingComputer(computer);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteComputer(id);
      setComputers(computers.filter(c => c.id !== id));
      showSnackbar('Компьютер успешно удален');
    } catch (error) {
      showSnackbar('Ошибка при удалении компьютера', 'error');
      console.error('Ошибка при удалении компьютера:', error);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingComputer(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingComputer) {
        const updatedComputer = await updateComputer(editingComputer.id, values);
        setComputers(computers.map(c => 
          c.id === editingComputer.id ? updatedComputer : c
        ));
        showSnackbar('Компьютер успешно обновлен');
      } else {
        const newComputer = await createComputer(values);
        setComputers([...computers, newComputer]);
        showSnackbar('Компьютер успешно добавлен');
      }
      handleFormClose();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Произошла ошибка при сохранении', 
        'error'
      );
      console.error('Ошибка при сохранении компьютера:', error);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedComputers.map((computer) => computer.id);
      setSelectedComputers(newSelected);
    } else {
      setSelectedComputers([]);
    }
  };
  
  const handleSelectComputer = (event, id) => {
    const selectedIndex = selectedComputers.indexOf(id);
    let newSelected = [];
  
    if (selectedIndex === -1) {
      newSelected = [...selectedComputers, id];
    } else {
      newSelected = selectedComputers.filter((computerId) => computerId !== id);
    }
  
    setSelectedComputers(newSelected);
  };
  
  const isSelected = (id) => selectedComputers.indexOf(id) !== -1;

  const handleBulkDelete = async () => {
    if (selectedComputers.length === 0) return;
  
    try {
      await Promise.all(selectedComputers.map(id => deleteComputer(id)));
      
      setComputers(computers.filter(c => !selectedComputers.includes(c.id)));
      setSelectedComputers([]);
      showSnackbar(`Удалено ${selectedComputers.length} компьютеров`);
    } catch (error) {
      showSnackbar('Ошибка при удалении компьютеров', 'error');
      console.error('Ошибка при удалении компьютеров:', error);
    }
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleCSVImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportStatus({
      isImporting: true,
      importedCount: 0,
      totalRows: 0,
      errors: [],
      successMessage: ''
    });
    setImportModalOpen(true);

    try {
      const result = await importComputersFromCSV(file);
      setImportStatus({
        isImporting: false,
        importedCount: result.imported_count,
        totalRows: result.total_rows,
        errors: result.errors || [],
        successMessage: result.message
      });
      fetchComputers(); // Обновляем список компьютеров
    } catch (error) {
      setImportStatus({
        isImporting: false,
        importedCount: 0,
        totalRows: 0,
        errors: [error.response?.data?.message || 'Ошибка при импорте CSV файла'],
        successMessage: ''
      });
      console.error('Ошибка при импорте CSV:', error);
    } finally {
      event.target.value = '';
    }
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
  };

  const handleExportCSV = async () => {
    try {
      // Вариант с бэкенд экспортом
      const data = await exportComputersToCSV(filters);
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `computers_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      showSnackbar('Экспорт в CSV выполнен успешно');
    } catch (error) {
      showSnackbar('Ошибка при экспорте в CSV', 'error');
      console.error('Ошибка при экспорте:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Список компьютеров</Typography>
        <Box>
          {isAuditor ? (
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              onClick={toggleFilters}
              sx={{ mr: 2 }}
            >
              Фильтры
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                disabled={selectedComputers.length === 0}
                sx={{ mr: 2 }}
              >
                Удалить выбранные ({selectedComputers.length})
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<FilterList />}
                onClick={toggleFilters}
                sx={{ mr: 2 }}
              >
                Фильтры
              </Button>
              <Button 
                variant="outlined" 
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mr: 2 }}
              >
                Загрузка из CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleCSVImport}
                />
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={handleExportCSV}
                sx={{ mr: 2 }}
              >
                Выгрузка в CSV
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setOpenForm(true)}
              >
                Добавить
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Collapse in={filtersOpen}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <ComputersFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={handleClearFilters}
          />
        </Paper>
        <Divider sx={{ mb: 2 }} />
      </Collapse>
      
      <TableContainer component={Paper} sx={{ position: 'relative' }}>
        {selectedComputers.length > 0 && (
          <Box sx={{
            position: 'absolute',
            top: -56,
            left: 0,
            right: 0,
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            px: 2,
            py: 1,
            borderRadius: '4px 4px 0 0'
          }}>
            <Typography>Выбрано: {selectedComputers.length}</Typography>
          </Box>
        )}
        <Table>
          <TableHead>
            <TableRow>
              {!isAuditor && (
                <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedComputers.length > 0 && selectedComputers.length < paginatedComputers.length}
                  checked={paginatedComputers.length > 0 && selectedComputers.length === paginatedComputers.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              )}
              <TableCell>Имя компьютера</TableCell>
              <TableCell>IP-адрес</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Кабинет</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>ОС</TableCell>
              <TableCell>Касперский</TableCell>
              <TableCell>Комментарий</TableCell>
              {!isAuditor && (
                <TableCell>Действия</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedComputers.map((computer) => {
              const isItemSelected = isSelected(computer.id);
              return (
                <TableRow
                  key={computer.id}
                  hover
                  selected={isItemSelected}
                >
                  {!isAuditor && (
                    <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={(event) => handleSelectComputer(event, computer.id)}
                    />
                  </TableCell>
                  )}
                  <TableCell>{computer.computer_name}</TableCell>
                  <TableCell>{computer.ip_address}</TableCell>
                  <TableCell>{computer.location_address}, {computer.floor} этаж</TableCell>
                  <TableCell>{computer.office}</TableCell>
                  <TableCell>{computer.pc_owner || '-'}</TableCell>
                  <TableCell>{computer.pc_owner_position_at_work || '-'}</TableCell>
                  <TableCell>{computer.operating_system}</TableCell>
                  <TableCell>{computer.has_kaspersky ? 'Да' : 'Нет'}</TableCell>
                  <TableCell>{computer.comment}</TableCell>
                  {!isAuditor && (
                    <TableCell>
                    <Tooltip title="Редактировать">
                      <IconButton onClick={() => handleEdit(computer)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton onClick={() => handleDelete(computer.id)}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[8, 16, 24]}
          component="div"
          count={filteredComputers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Компьютеров на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </TableContainer>
      
      <ComputerForm 
        open={openForm} 
        onClose={handleFormClose} 
        computer={editingComputer} 
        onSubmit={handleSubmit}
      />

      <CsvImportModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        status={importStatus}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}