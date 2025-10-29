import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  DialogActions,
  Button
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

export default function CsvImportModal({ open, onClose, status }) {
  const { isImporting, importedCount, totalRows, errors, successMessage } = status;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Импорт компьютеров из CSV</DialogTitle>
      
      <DialogContent>
        {isImporting ? (
          <>
            <DialogContentText>
              Идет обработка файла: {importedCount} из {totalRows} строк
            </DialogContentText>
            <LinearProgress />
          </>
        ) : (
          <>
            {successMessage && (
              <Typography color="primary" paragraph>
                {successMessage}
              </Typography>
            )}

            {errors.length > 0 && (
              <>
                <Typography color="error" paragraph>
                  Найдены ошибки в {errors.length} строках:
                </Typography>
                
                <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {errors.map((error, index) => (
                    <ListItem key={index}>
                      <Error color="error" sx={{ mr: 1 }} />
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {errors.length === 0 && (
              <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                Все строки успешно обработаны
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}