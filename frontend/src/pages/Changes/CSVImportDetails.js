import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  ListItemIcon
} from '@mui/material';
import {
  Computer,
  Dns,
  LocationOn,
  Settings,
  Security,
  Person,
  Work
} from '@mui/icons-material';

const CSVImportDetails = ({ importData }) => {
  if (!importData?.imported_computers) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <List dense>
        {importData.imported_computers.map((computer, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Computer color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={computer.computer_name}
                secondary={
                  <>
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Dns fontSize="small" sx={{ mr: 1 }} />
                      {computer.ip_address}
                    </Box>
                    {computer.location && (
                      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LocationOn fontSize="small" sx={{ mr: 1 }} />
                        {computer.location}
                      </Box>
                    )}
                    {computer.pc_owner && (
                      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Person fontSize="small" sx={{ mr: 1 }} />
                        Пользователь: {computer.pc_owner}
                      </Box>
                    )}
                    {computer.position && (
                      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Work fontSize="small" sx={{ mr: 1 }} />
                        Должность: {computer.position}
                      </Box>
                    )}
                    {computer.os && (
                      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Settings fontSize="small" sx={{ mr: 1 }} />
                        ОС: {computer.os}
                      </Box>
                    )}
                    {computer.kaspersky && (
                      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Security fontSize="small" sx={{ mr: 1 }} />
                        Касперский: {computer.kaspersky}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
            {index < importData.imported_computers.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      {importData.errors?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="error">
            Ошибки при импорте:
          </Typography>
          <List dense>
            {importData.errors.map((error, i) => (
              <ListItem key={i} sx={{ color: 'error.main' }}>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default CSVImportDetails;