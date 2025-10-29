import React from 'react';
import { 
  TextField, 
  Box, 
  IconButton,
  Stack,
  Paper,
  InputAdornment,
  Typography
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DnsIcon from '@mui/icons-material/Dns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AppsIcon from '@mui/icons-material/Apps';
import SecurityIcon from '@mui/icons-material/Security';

export const ComputersFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const hasFilters = Object.values(filters).some(value => value !== '' && value !== undefined);

  return (
    <Paper elevation={1} sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        mb: 1
      }}>
        <FilterListIcon color="action" />
        <Typography variant="subtitle1" color="text.secondary">
          Фильтры
        </Typography>
        {hasFilters && (
          <IconButton
            onClick={onClearFilters}
            size="small"
            sx={{ ml: 'auto' }}
            title="Очистить все фильтры"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <TextField
          label="Имя"
          variant="outlined"
          size="small"
          value={filters.computer_name || ''}
          onChange={(e) => onFilterChange('computer_name', e.target.value)}
          sx={{ width: 150 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DnsIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="IP-адрес"
          variant="outlined"
          size="small"
          value={filters.ip_address || ''}
          onChange={(e) => onFilterChange('ip_address', e.target.value)}
          sx={{ width: 150 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Адрес"
          variant="outlined"
          size="small"
          value={filters.location_address || ''}
          onChange={(e) => onFilterChange('location_address', e.target.value)}
          sx={{ width: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Этаж"
          variant="outlined"
          size="small"
          type="number"
          value={filters.floor || ''}
          onChange={(e) => onFilterChange('floor', e.target.value)}
          sx={{ width: 100 }}
          InputProps={{
            inputProps: { min: 0 },
            startAdornment: (
              <InputAdornment position="start">
                <AppsIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Кабинет"
          variant="outlined"
          size="small"
          value={filters.office || ''}
          onChange={(e) => onFilterChange('office', e.target.value)}
          sx={{ width: 120 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MeetingRoomIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="ОС"
          variant="outlined"
          size="small"
          value={filters.operating_system || ''}
          onChange={(e) => onFilterChange('operating_system', e.target.value)}
          sx={{ width: 150 }}
        />

        <TextField
          label="Касперский"
          variant="outlined"
          size="small"
          select
          SelectProps={{ native: true }}
          value={filters.has_kaspersky || ''}
          onChange={(e) => onFilterChange('has_kaspersky', e.target.value)}
          sx={{ width: 140 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SecurityIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        >
          <option value="">Все</option>
          <option value="true">Установлен</option>
          <option value="false">Не установлен</option>
        </TextField>
      </Stack>
    </Paper>
  );
};