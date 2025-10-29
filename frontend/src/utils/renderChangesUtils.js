import React from 'react';
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Description,
  Visibility
} from '@mui/icons-material';

export const renderCSVImport = (parsed, onDetailsClick) => {
  const hasErrors = parsed.errors?.length > 0;
  const successCount = parsed.imported_count || 0;
  const totalCount = parsed.total_rows || 0;

  return (
    <>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1}
        sx={{ cursor: 'pointer' }}
        onClick={onDetailsClick}
      >
        <Description color="primary" fontSize="small" />
        <Typography variant="body2">
          Импорт CSV: <b>{successCount} из {totalCount} компьютеров</b>
        </Typography>
        <Visibility fontSize="small" color="action" />
        {hasErrors && (
          <Tooltip title={`Ошибки: ${parsed.errors.join(', ')}`}>
            <InfoIcon color="error" fontSize="small" />
          </Tooltip>
        )}
      </Box>
    </>
  );
};

export const renderCreate = (parsed) => (
  <Box display="flex" alignItems="center" gap={1}>
    <AddIcon color="success" fontSize="small" />
    <Typography variant="body2">
      Создан: <b>{parsed.changes?.computer_name || parsed.computer_data?.computer_name || 'Новый компьютер'}</b>
    </Typography>
  </Box>
);

export const renderUpdate = (parsed, renderValue, theme) => {
  if (!parsed.changes) return null;
  
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <EditIcon color="info" fontSize="small" />
        <Typography variant="subtitle2">Изменения:</Typography>
      </Box>
      <List dense sx={{ py: 0 }}>
        {Object.entries(parsed.changes).map(([field, change]) => (
          <React.Fragment key={field}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>
                      {{
                        computer_name: 'Имя',
                        ip_address: 'IP-адрес',
                        location_address: 'Адрес',
                        floor: 'Этаж',
                        office: 'Кабинет',
                        domain: 'Домен',
                        has_kaspersky: 'Касперский',
                        operating_system: 'ОС'
                      }[field] || field}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {renderValue(change.from)}
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        →
                      </Typography>
                      {renderValue(change.to)}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export const renderDelete = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <DeleteIcon color="error" fontSize="small" />
    <Typography variant="body2">
      Удалён
    </Typography>
  </Box>
);

export const parseDescription = (desc) => {
    try {
      if (typeof desc === 'string') {
        try {
          return JSON.parse(desc);
        } catch (e) {
          const fixedString = desc
            .replace(/'/g, '"')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false');
          return JSON.parse(fixedString);
        }
      }
      console.log(desc)
      return desc;
    } catch (e) {
      console.error('Ошибка парсинга change_description:', e, 'Исходные данные:', desc);
      return { raw: desc };
    }
  };
  
  export const renderValue = (value) => {
    if (value === null || value === undefined) {
      return <Chip label="не указано" size="small" variant="outlined" />;
    }
    if (typeof value === 'boolean') {
      return (
        <Chip
          icon={value ? <CheckIcon /> : <CloseIcon />}
          label={value ? 'Да' : 'Нет'}
          size="small"
          color={value ? 'success' : 'error'}
        />
      );
    }
    if (typeof value === 'object') {
      return (
        <Tooltip title={JSON.stringify(value, null, 2)}>
          <Chip label="Объект" size="small" variant="outlined" />
        </Tooltip>
      );
    }
    return <span>{value}</span>;
  };