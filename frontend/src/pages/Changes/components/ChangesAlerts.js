import { Alert, Box, Button, Collapse, IconButton, Snackbar, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon, CloudQueue as CloudQueueIcon, Close as CloseIcon } from '@mui/icons-material';

export const ChangesAlerts = ({
  showRefreshSuccess, autoUpdateEnabled, isStale, isFetching,
  importInfo, onCloseImportInfo, onSoftRefresh, error, onForceRefresh,
}) => (
  <>
    <Snackbar open={showRefreshSuccess} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity="success" icon={<CheckCircleIcon />}>Данные успешно обновлены</Alert>
    </Snackbar>

    <Alert severity="info" sx={{ mb: 2 }} icon={<CloudQueueIcon />}>
      <Typography variant="body2">
        Данные автоматически обновляются каждые 15 секунд.
        {autoUpdateEnabled ? ' ✅ Автообновление активно' : ' ❌ Автообновление отключено'}
      </Typography>
    </Alert>

    {isStale && !isFetching && (
      <Alert severity="warning" sx={{ mb: 2 }}
        action={<Button color="inherit" size="small" onClick={onSoftRefresh}>Обновить</Button>}>
        Доступна новая версия данных.
      </Alert>
    )}

    <Collapse in={importInfo.open && importInfo.importedComputers.length > 0}>
      <Alert severity="info" sx={{ mb: 2 }}
        action={<IconButton size="small" onClick={onCloseImportInfo}><CloseIcon fontSize="inherit" /></IconButton>}>
        <Typography variant="subtitle2">Недавно импортированные компьютеры:</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, maxHeight: 200, overflow: 'auto' }}>
          {importInfo.importedComputers.slice(0, 5).map((c, i) => (
            <li key={i}>{c.computer_name} ({c.ip_address})</li>
          ))}
          {importInfo.importedComputers.length > 5 && <li>...и ещё {importInfo.importedComputers.length - 5}</li>}
        </Box>
      </Alert>
    </Collapse>

    {error && (
      <Alert severity="error" sx={{ mb: 2 }}
        action={<Button color="inherit" size="small" onClick={onForceRefresh}>Повторить</Button>}>
        {error.message || 'Не удалось загрузить историю изменений'}
      </Alert>
    )}
  </>
);