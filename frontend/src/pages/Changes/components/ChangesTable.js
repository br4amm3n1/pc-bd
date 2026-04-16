import { useContext } from 'react';
import { Avatar, Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { AuthContext } from '../../../context/AuthContext';
import { formatDateTime } from '../../../utils/dateUtils';
import ChangeDescription from '../ChangesFormat';

export const ChangesTable = ({ filteredChanges, isLoading, isFetching, filters, onClearFilters }) => {
  const { user } = useContext(AuthContext);
  const showLoading = isLoading || (isFetching && filteredChanges.length === 0);

  return (
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
          {showLoading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Box sx={{ py: 4 }}><Typography>Загрузка данных...</Typography></Box>
              </TableCell>
            </TableRow>
          ) : filteredChanges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Box sx={{ py: 4 }}>
                  <Typography>Нет данных для отображения</Typography>
                  {Object.values(filters).some(v => v) && (
                    <Button size="small" onClick={onClearFilters} sx={{ mt: 1 }}>Сбросить фильтры</Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            filteredChanges.map(change => (
              <TableRow key={change.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={change.computer_name || 'Импорт из CSV'} variant="outlined" size="small" />
                    {change.computer_ip && <Typography variant="body2" color="text.secondary">{change.computer_ip}</Typography>}
                  </Box>
                </TableCell>
                <TableCell><ChangeDescription description={change.change_description} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: change.user.id === user?.id ? 'primary.main' : 'grey.400', fontSize: '0.875rem' }}>
                      {change.user.username?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="body2">{change.user.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {`${change.user.first_name || ''} ${change.user.last_name || ''}`.trim() || '-'}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2" noWrap>{formatDateTime(change.change_date)}</Typography></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};