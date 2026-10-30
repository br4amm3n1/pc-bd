import { Box, Button, Menu, MenuItem } from '@mui/material';
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
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const isExportMenuOpen = Boolean(exportAnchorEl);

  const handleExportMenuOpen = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    handleExportMenuClose();
    onExportCSV();
  };

  const handleExportJSON = () => {
    handleExportMenuClose();
    // onExportJSON();
  };

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
            onClick={handleExportMenuOpen}
            sx={{ mr: 2 }}
          >
            Выгрузка
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={isExportMenuOpen}
            onClose={handleExportMenuClose}
          >
            <MenuItem onClick={handleExportCSV}>Выгрузка в CSV</MenuItem>
            <MenuItem onClick={handleExportJSON}>Выгрузка в JSON</MenuItem>
          </Menu>
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