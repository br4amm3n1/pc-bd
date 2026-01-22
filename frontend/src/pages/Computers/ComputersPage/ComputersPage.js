import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import ComputerForm from '../../../components/ComputerForm';
import CsvImportModal from '../CsvImportModal';
import { useSnackbar } from './hooks/useSnackbar';
import { useComputersData } from './hooks/useComputersData';
import { useFilters } from './hooks/useFilters';
import { useSelection } from './hooks/useSelection';
import { ComputersTable } from './components/ComputersTable';
import { ComputersToolbar } from './components/ComputersToolbar';
import { FiltersSection } from './components/FiltersSection';
import { AuthContext } from '../../../context/AuthContext'

export default function ComputersPage() {
  const { profile, isLoading: authLoading } = useContext(AuthContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [openForm, setOpenForm] = useState(false);
  const [editingComputer, setEditingComputer] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const { snackbar, showSnackbar, handleCloseSnackbar } = useSnackbar();
  const {
    computers,
    isLoading: dataLoading,
    importStatus,
    fetchComputers,
    addComputer,
    editComputer,
    removeComputer,
    bulkDeleteComputers,
    handleCSVImport,
    handleExportCSV
  } = useComputersData(showSnackbar);

  const {
    filters,
    filteredComputers,
    filtersOpen,
    handleFilterChange,
    handleClearFilters,
    toggleFilters
  } = useFilters(computers, dataLoading || authLoading);

  const {
    selectedComputers,
    handleSelectAll,
    handleSelectComputer,
    isSelected,
    clearSelection
  } = useSelection();

  useEffect(() => {
    if (!authLoading) {
      fetchComputers();
    }
  }, [authLoading, fetchComputers]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (computer) => {
    setEditingComputer(computer);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    await removeComputer(id);
  };

  const handleBulkDelete = async () => {
    if (selectedComputers.length === 0) return;
    await bulkDeleteComputers(selectedComputers);
    clearSelection();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingComputer) {
        await editComputer(editingComputer.id, values);
      } else {
        await addComputer(values);
      }
      setOpenForm(false);
      setEditingComputer(null);
    } catch (error) {
      console.error('Ошибка при сохранении компьютера:', error);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingComputer(null);
  };

  const handleCSVImportWrapper = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImportModalOpen(true);
    await handleCSVImport(file);
    event.target.value = '';
  };

  const handleExportCSVWrapper = async () => {
    try {
      const blob = await handleExportCSV(filters);
      
      // Используем FileReader для чтения Blob и добавления BOM
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Добавляем BOM к содержимому
        const BOM = '\uFEFF';
        const content = BOM + e.target.result;
        
        // Создаем новый Blob с BOM
        const newBlob = new Blob([content], { 
          type: 'text/csv;charset=utf-8;' 
        });
        
        // Скачиваем
        const url = URL.createObjectURL(newBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `computers_export_${new Date().toISOString().slice(0,10)}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showSnackbar('Экспорт в CSV выполнен успешно');
      };
      
      reader.readAsText(blob, 'UTF-8');
      
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showSnackbar('Ошибка при экспорте в CSV', 'error');
    }
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
  };

  if (authLoading || !profile) {
    return <CircularProgress />;
  }

  const isAuditor = profile.role === 'auditor';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Список компьютеров</Typography>
      
      <ComputersToolbar
        isAuditor={isAuditor}
        selectedCount={selectedComputers.length}
        onToggleFilters={toggleFilters}
        onBulkDelete={handleBulkDelete}
        onImportCSV={handleCSVImportWrapper}
        onExportCSV={handleExportCSVWrapper}
        onAddComputer={() => setOpenForm(true)}
        onOpenImportModal={() => setImportModalOpen(true)}
      />

      <FiltersSection
        filtersOpen={filtersOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <ComputersTable
        computers={computers}
        filteredComputers={filteredComputers}
        selectedComputers={selectedComputers}
        isAuditor={isAuditor}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSelectAll={handleSelectAll}
        onSelectComputer={handleSelectComputer}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isSelected={isSelected}
      />

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