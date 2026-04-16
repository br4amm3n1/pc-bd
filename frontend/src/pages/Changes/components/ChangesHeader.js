import { Box, Typography, Badge, Button, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, CloudQueue as CloudQueueIcon, Update as UpdateIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export const ChangesHeader = ({
  changes, filteredChanges, currentVersion, serverTotalCount,
  isStale, isVersionFetching, isFetching,
  autoUpdateEnabled, onToggleAutoUpdate,
  onCheckVersion, onSoftRefresh, onForceRefresh,
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Box>
      <Typography variant="h4" component="h1">
        История изменений
        {changes.length > 0 && (
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
            ({filteredChanges.length} из {changes.length} записей)
          </Typography>
        )}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Версия: {currentVersion || '—'} · Всего: {serverTotalCount || changes.length}
        </Typography>
        <Badge color={isStale ? 'warning' : 'success'} variant="dot">
          <CloudQueueIcon fontSize="small" color="action" />
        </Badge>
        {isVersionFetching && <Typography variant="caption" color="info.main">(Проверка...)</Typography>}
        {isFetching && !isVersionFetching && <Typography variant="caption" color="info.main">(Загрузка...)</Typography>}
      </Box>
    </Box>

    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title={autoUpdateEnabled ? 'Автообновление включено' : 'Автообновление выключено'}>
        <Button variant={autoUpdateEnabled ? 'contained' : 'outlined'} color={autoUpdateEnabled ? 'success' : 'default'}
          startIcon={<UpdateIcon />} onClick={onToggleAutoUpdate} size="small">
          Авто {autoUpdateEnabled ? '✓' : '✗'}
        </Button>
      </Tooltip>
      <Button variant="outlined" startIcon={<CloudQueueIcon />} onClick={onCheckVersion} disabled={isVersionFetching} size="small">
        Проверить
      </Button>
      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onSoftRefresh} disabled={isFetching}>
        {isFetching ? 'Обновление...' : 'Обновить'}
      </Button>
      <Button variant="contained" startIcon={<RefreshIcon />} onClick={onForceRefresh} disabled={isFetching}>
        Сбросить кэш
      </Button>
    </Box>
  </Box>
);