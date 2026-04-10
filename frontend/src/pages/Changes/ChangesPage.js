import { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Chip, Avatar, Button, Collapse, Alert, IconButton,
  Tooltip, Badge, LinearProgress, Snackbar
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Close as CloseIcon,
  CloudQueue as CloudQueueIcon,
  CheckCircle as CheckCircleIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useChangesQuery, useRefreshChanges, useInvalidateChanges, useCheckVersion } from '../../hooks/useChangesQuery';
import { AuthContext } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/dateUtils';
import ChangesFilter from './ChangesFilter';
import ChangeDescription from './ChangesFormat';
import { parseDescription } from '../../utils/renderChangesUtils';

export default function ChangesPage() {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    computer_name: '',
    username: '',
    action: '',
    date_from: '',
    date_to: ''
  });
  const [importInfo, setImportInfo] = useState({ open: false, importedComputers: [] });
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  
  const { 
    data: changes = [], 
    isLoading, 
    isFetching, 
    isStale,
    error,
    refetch,
    isVersionFetching,
    currentVersion,
    totalCount: serverTotalCount
  } = useChangesQuery(filters);
  
  const refreshChanges = useRefreshChanges();
  const invalidateChanges = useInvalidateChanges();
  const checkVersion = useCheckVersion();

  const filteredChanges = useMemo(() => {
    return changes.filter(change => {
      const parsed = parseDescription(change.change_description);
      const changeAction = parsed.action;

      const matchesComputerName = !filters.computer_name || 
        (change.computer_name && change.computer_name.toString().toLowerCase()
          .includes(filters.computer_name.toLowerCase()));
      const matchesUsername = !filters.username || 
        change.user.username.toString().toLowerCase()
          .includes(filters.username.toLowerCase());
      const matchesAction = !filters.action || 
        (changeAction && changeAction.toLowerCase() === filters.action.toLowerCase());
      const matchesDateFrom = !filters.date_from || 
        new Date(change.change_date) >= new Date(filters.date_from);
      const matchesDateTo = !filters.date_to || 
        new Date(change.change_date) <= new Date(filters.date_to + 'T23:59:59');

      return matchesComputerName && matchesUsername && 
             matchesAction && matchesDateFrom && matchesDateTo;
    });
  }, [changes, filters]);

  useEffect(() => {
    const csvImports = changes.filter(change => {
      const parsed = parseDescription(change.change_description);
      return parsed?.action === 'csv_import';
    });
    
    if (csvImports.length > 0) {
      const lastImport = csvImports[0];
      setImportInfo({
        open: true,
        importedComputers: lastImport.change_description?.imported_computers || []
      });
    }
  }, [changes]);

  const handleForceRefresh = useCallback(async () => {
    invalidateChanges();

    await refreshChanges();
 
    setShowRefreshSuccess(true);
    setTimeout(() => setShowRefreshSuccess(false), 3000);
  }, [invalidateChanges, refreshChanges]);

  const handleSoftRefresh = useCallback(async () => {
    await refreshChanges();
    setShowRefreshSuccess(true);
    setTimeout(() => setShowRefreshSuccess(false), 3000);
  }, [refreshChanges]);

  const handleCheckVersion = useCallback(async () => {
    const versionInfo = await checkVersion();
    if (versionInfo) {
      setShowRefreshSuccess(true);
      setTimeout(() => setShowRefreshSuccess(false), 3000);
    }
  }, [checkVersion]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      computer_name: '',
      username: '',
      action: '',
      date_from: '',
      date_to: ''
    });
  };

  const handleCloseImportInfo = () => {
    setImportInfo(prev => ({ ...prev, open: false }));
  };

  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(prev => !prev);
  };

  const showLoadingOverlay = isLoading || (isFetching && changes.length === 0);

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={showRefreshSuccess}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" icon={<CheckCircleIcon />}>
          Данные успешно обновлены
        </Alert>
      </Snackbar>

      {(isFetching || isVersionFetching) && !isLoading && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            История изменений
            {!isLoading && changes.length > 0 && (
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
                ({filteredChanges.length} из {changes.length} записей)
              </Typography>
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Версия данных: {currentVersion || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Всего на сервере: {serverTotalCount || changes.length}
            </Typography>
            <Badge 
              color={isStale ? "warning" : "success"} 
              variant="dot"
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <CloudQueueIcon fontSize="small" color="action" />
            </Badge>
            {isVersionFetching && (
              <Typography variant="caption" color="info.main">
                (Проверка версии...)
              </Typography>
            )}
            {isFetching && !isVersionFetching && (
              <Typography variant="caption" color="info.main">
                (Загрузка данных...)
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={autoUpdateEnabled ? "Автообновление включено" : "Автообновление выключено"}>
            <Button
              variant={autoUpdateEnabled ? "contained" : "outlined"}
              color={autoUpdateEnabled ? "success" : "default"}
              startIcon={<UpdateIcon />}
              onClick={toggleAutoUpdate}
              size="small"
            >
              Авто {autoUpdateEnabled ? "✓" : "✗"}
            </Button>
          </Tooltip>
          
          <Tooltip title="Проверить версию данных">
            <Button
              variant="outlined"
              startIcon={<CloudQueueIcon />}
              onClick={handleCheckVersion}
              disabled={isVersionFetching}
              size="small"
            >
              Проверить
            </Button>
          </Tooltip>
          
          <Tooltip title="Обычное обновление (проверка новых данных)">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleSoftRefresh}
              disabled={isFetching}
            >
              {isFetching ? 'Обновление...' : 'Обновить'}
            </Button>
          </Tooltip>
          
          <Tooltip title="Принудительное обновление (сброс кэша)">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleForceRefresh}
              disabled={isFetching}
              color="primary"
            >
              Сбросить кэш
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Alert 
        severity="info" 
        sx={{ mb: 2 }}
        icon={<CloudQueueIcon />}
      >
        <Typography variant="body2">
          Данные автоматически обновляются при изменении версии на сервере. 
          Проверка версии происходит каждые 15 секунд.
          {autoUpdateEnabled ? ' ✅ Автообновление активно' : ' ⏸ Автообновление отключено'}
        </Typography>
      </Alert>

      {isStale && !isFetching && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleSoftRefresh}>
              Обновить
            </Button>
          }
        >
          Доступна новая версия данных. Нажмите "Обновить" для загрузки.
        </Alert>
      )}

      <Collapse in={importInfo.open && importInfo.importedComputers.length > 0}>
        <Alert
          severity="info"
          action={
            <IconButton size="small" onClick={handleCloseImportInfo}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">Недавно импортированные компьютеры:</Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0, maxHeight: 200, overflow: 'auto' }}>
            {importInfo.importedComputers.slice(0, 5).map((computer, index) => (
              <li key={index}>
                {computer.computer_name} ({computer.ip_address})
              </li>
            ))}
            {importInfo.importedComputers.length > 5 && (
              <li>... и еще {importInfo.importedComputers.length - 5}</li>
            )}
          </Box>
        </Alert>
      </Collapse>

      <ChangesFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={() => {}}
        onClearFilters={handleClearFilters}
        loading={isLoading}
      />

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleForceRefresh}>
              Повторить
            </Button>
          }
        >
          {error.message || 'Не удалось загрузить историю изменений'}
        </Alert>
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
            {showLoadingOverlay ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography>Загрузка данных...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredChanges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography>Нет данных для отображения</Typography>
                    {Object.values(filters).some(v => v) && (
                      <Button size="small" onClick={handleClearFilters} sx={{ mt: 1 }}>
                        Сбросить фильтры
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredChanges.map((change) => (
                <TableRow key={change.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={change.computer_name || 'Импорт из CSV'} 
                        variant="outlined"
                        size="small"
                      />
                      {change.computer_ip && (
                        <Typography variant="body2" color="text.secondary">
                          {change.computer_ip}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <ChangeDescription description={change.change_description} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: change.user.id === user?.id ? 'primary.main' : 'grey.400',
                          fontSize: '0.875rem'
                        }}
                      >
                        {change.user.username?.charAt(0).toUpperCase() || '?'}
                      </Avatar>
                      <Typography variant="body2">
                        {change.user.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {`${change.user.first_name || ''} ${change.user.last_name || ''}`.trim() || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {formatDateTime(change.change_date)}
                    </Typography>
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