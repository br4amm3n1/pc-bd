import React from 'react';
import { Box, Button } from '@mui/material';
import { FilterList, CloudUpload, Download, Add } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

export const ComputersToolbar = ({
  isAuditor,
  selectedCount,
  onToggleFilters,
  onBulkDelete,
  onImportCSV,
  onExportCSV,
  onAddComputer,
  onOpenImportModal
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
      {isAuditor ? (
        <Button 
          variant="outlined" 
          startIcon={<FilterList />}
          onClick={onToggleFilters}
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
            onClick={onBulkDelete}
            disabled={selectedCount === 0}
            sx={{ mr: 2 }}
          >
            Удалить выбранные ({selectedCount})
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FilterList />}
            onClick={onToggleFilters}
            sx={{ mr: 2 }}
          >
            Фильтры
          </Button>
          <Button 
            variant="outlined" 
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mr: 2 }}
            onClick={onOpenImportModal}
          >
            Загрузка из CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={onImportCSV}
            />
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={onExportCSV}
            sx={{ mr: 2 }}
          >
            Выгрузка в CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={onAddComputer}
          >
            Добавить
          </Button>
        </>
      )}
    </Box>
  );
};