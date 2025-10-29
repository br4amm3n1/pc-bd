import React from 'react';
import { 
  Paper,
  Stack,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  FilterAlt as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

export default function ChangesFilter({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters, 
  loading 
}) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="Имя компьютера"
          size="small"
          value={filters.computer_name}
          onChange={(e) => onFilterChange('computer_name', e.target.value)}
          sx={{ width: 150 }}
        />
        <TextField
          label="Пользователь"
          size="small"
          value={filters.username}
          onChange={(e) => onFilterChange('username', e.target.value)}
          sx={{ width: 150 }}
        />
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Тип изменения</InputLabel>
          <Select
            value={filters.action || ''}
            onChange={(e) => onFilterChange('action', e.target.value)}
            label="Тип изменения"
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="create">Создание</MenuItem>
            <MenuItem value="update">Обновление</MenuItem>
            <MenuItem value="delete">Удаление</MenuItem>
            <MenuItem value="csv_import">Импорт CSV</MenuItem>
            <MenuItem value="csv_export">Экспорт CSV</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Дата от"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.date_from}
          onChange={(e) => onFilterChange('date_from', e.target.value)}
          sx={{ width: 180 }}
        />
        <TextField
          label="Дата до"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.date_to}
          onChange={(e) => onFilterChange('date_to', e.target.value)}
          sx={{ width: 180 }}
        />
        {/* <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={onApplyFilters}
          disabled={loading}
        >
          Применить
        </Button> */}
        <IconButton
          onClick={onClearFilters}
          color="error"
          title="Очистить фильтры"
        >
          <ClearIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}