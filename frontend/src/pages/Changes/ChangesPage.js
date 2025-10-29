import React, { useEffect, useState, useContext } from 'react';
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
  Chip,
  Avatar,
  Button,
  Collapse,
  Alert,
  IconButton
} from '@mui/material';
import { Refresh as RefreshIcon, Close as CloseIcon } from '@mui/icons-material';
import { getComputersChanges } from '../../api/computersApi';
import { formatDateTime } from '../../utils/dateUtils';
import { AuthContext } from '../../context/AuthContext';
import ChangesFilter from './ChangesFilter';
import ChangeDescription from './ChangesFormat'
import { parseDescription } from '../../utils/renderChangesUtils';

export default function ChangesPage() {
  const { user } = useContext(AuthContext); 
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    computer_name: '',
    username: '',
    action: '',
    date_from: '',
    date_to: ''
  });
  const [importInfo, setImportInfo] = useState({
    open: false,
    importedComputers: []
  });

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComputersChanges();
      
      // Находим записи об импорте CSV
      const csvImports = data.filter(change => 
        change.change_description?.action === 'csv_import'
      );
      
      if (csvImports.length > 0) {
        const lastImport = csvImports[0];
        setImportInfo({
          open: true,
          importedComputers: lastImport.change_description?.imported_computers || []
        });
      }
      
      setChanges(data);
    } catch (err) {
      setError('Не удалось загрузить историю изменений');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseImportInfo = () => {
    setImportInfo(prev => ({...prev, open: false}));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchChanges();
  };

  const handleClearFilters = () => {
    setFilters({
      computer_name: '',
      username: '',
      action: '',
      date_from: '',
      date_to: ''
    });
    fetchChanges();
  };

  const filteredChanges = changes.filter(change => {
    const parsed = parseDescription(change.change_description);
    const changeAction = parsed.action;

    const matchesComputerName = !filters.computer_name || 
    (change.computer_name && change.computer_name.toString().toLowerCase().includes(filters.computer_name.toLowerCase()));
    const matchesUsername = !filters.username || 
      change.user.username.toString().toLowerCase().includes(filters.username.toLowerCase());
    const matchesAction = !filters.action || 
      (changeAction && changeAction.toLowerCase() === filters.action.toLowerCase());
    const matchesDateFrom = !filters.date_from || 
      new Date(change.change_date) >= new Date(filters.date_from);
    const matchesDateTo = !filters.date_to || 
      new Date(change.change_date) <= new Date(filters.date_to + 'T23:59:59'); // Учитываем весь день

    return (
      matchesComputerName &&
      matchesUsername &&
      matchesAction &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">История изменений</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchChanges}
          disabled={loading}
        >
          Обновить
        </Button>
      </Box>

      <Collapse in={importInfo.open && importInfo.importedComputers.length > 0}>
        <Alert
          severity="info"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseImportInfo}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Недавно были импортированы компьютеры через CSV:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            {importInfo.importedComputers.map((computer, index) => (
              <li key={index}>
                {computer.computer_name} ({computer.ip_address})
              </li>
            ))}
          </Box>
        </Alert>
      </Collapse>

      <ChangesFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Компьютер</TableCell>
              <TableCell>Изменение</TableCell>
              <TableCell>Никнейм</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Дата</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filteredChanges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            ) : (
              filteredChanges.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={change.computer_name || 'Импорт из CSV'} 
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {change.computer_ip || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <ChangeDescription description={change.change_description} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          mr: 1,
                          bgcolor: change.user.id === user?.id ? 'primary.main' : 'default'
                        }}
                      >
                        {change.user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography>
                        {change.user.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>
                        {change.user.first_name + " " + change.user.last_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(change.change_date)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}