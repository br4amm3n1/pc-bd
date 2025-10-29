import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Chip } from '@mui/material';
import { Description } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  renderCSVImport,
  renderCreate,
  renderUpdate,
  renderDelete,
  parseDescription, 
  renderValue,
 } from '../../utils/renderChangesUtils';
import CSVImportDetails from './CSVImportDetails';

const ChangeDescription = ({ description }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const theme = useTheme();
  const parsed = parseDescription(description);

  if (!description) {
    return (
      <Typography variant="body2" color="textSecondary">
        Нет описания изменений
      </Typography>
    );
  }

  const renderContent = () => {
    if (!parsed) return null;

    if (parsed.raw) {
      return (
        <Tooltip title={parsed.raw}>
          <Typography variant="body2" noWrap>
            {parsed.raw.length > 50 
              ? `${parsed.raw.substring(0, 50)}...` 
              : parsed.raw}
          </Typography>
        </Tooltip>
      );
    }

    if (parsed.action) {
      switch (parsed.action) {
        case 'create':
          return renderCreate(parsed);
        case 'update':
          return renderUpdate(parsed, renderValue, theme);
        case 'delete':
          return renderDelete();
        case 'csv_import':
          return renderCSVImport(parsed, () => setOpenDetails(true));
        default:
          return (
            <Tooltip title={JSON.stringify(parsed, null, 2)}>
              <Typography variant="body2">
                Действие: {parsed.action}
              </Typography>
            </Tooltip>
          );
      }
    }

    return (
      <Tooltip title={JSON.stringify(parsed, null, 2)}>
        <Paper variant="outlined" sx={{ p: 1 }}>
          <Typography variant="body2">
            {parsed.computer_name ? `Изменение: ${parsed.computer_name}` : 'Изменение конфигурации'}
          </Typography>
        </Paper>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      {renderContent()}
      
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Description color="primary" sx={{ mr: 1 }} />
          Детали импорта из CSV
          <Chip 
            label={`${parsed.imported_count || 0}/${parsed.total_rows || 0} успешно`} 
            color={parsed.errors?.length ? 'warning' : 'success'}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent dividers>
          <CSVImportDetails importData={parsed} />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDetails(false)}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeDescription;