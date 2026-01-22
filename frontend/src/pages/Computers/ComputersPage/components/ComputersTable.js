import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Checkbox,
  TablePagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export const ComputersTable = ({
  computers,
  filteredComputers,
  selectedComputers,
  isAuditor,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSelectAll,
  onSelectComputer,
  onEdit,
  onDelete,
  isSelected
}) => {
  const paginatedComputers = filteredComputers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper} sx={{ position: 'relative' }}>
      <Table>
        <TableHead>
          <TableRow>
            {!isAuditor && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedComputers.length > 0 && selectedComputers.length < paginatedComputers.length}
                  checked={paginatedComputers.length > 0 && selectedComputers.length === paginatedComputers.length}
                  onChange={() => onSelectAll(paginatedComputers)}
                />
              </TableCell>
            )}
            <TableCell>Имя компьютера</TableCell>
            <TableCell>IP-адрес</TableCell>
            <TableCell>Адрес</TableCell>
            <TableCell>Кабинет</TableCell>
            <TableCell>Пользователь</TableCell>
            <TableCell>Должность</TableCell>
            <TableCell>ОС</TableCell>
            <TableCell>Касперский</TableCell>
            <TableCell>Комментарий</TableCell>
            {!isAuditor && <TableCell>Действия</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedComputers.map((computer) => {
            const itemSelected = isSelected(computer.id);
            return (
              <TableRow
                key={computer.id}
                hover
                selected={itemSelected}
              >
                {!isAuditor && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={itemSelected}
                      onChange={() => onSelectComputer(computer.id)}
                    />
                  </TableCell>
                )}
                <TableCell>{computer.computer_name}</TableCell>
                <TableCell>{computer.ip_address}</TableCell>
                <TableCell>{computer.location_address}, {computer.floor} этаж</TableCell>
                <TableCell>{computer.office}</TableCell>
                <TableCell>{computer.pc_owner || '-'}</TableCell>
                <TableCell>{computer.pc_owner_position_at_work || '-'}</TableCell>
                <TableCell>{computer.operating_system}</TableCell>
                <TableCell>{computer.has_kaspersky ? 'Да' : 'Нет'}</TableCell>
                <TableCell>{computer.comment}</TableCell>
                {!isAuditor && (
                  <TableCell>
                    <Tooltip title="Редактировать">
                      <IconButton onClick={() => onEdit(computer)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton onClick={() => onDelete(computer.id)}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[8, 16, 24]}
        component="div"
        count={filteredComputers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Компьютеров на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
      />
    </TableContainer>
  );
};