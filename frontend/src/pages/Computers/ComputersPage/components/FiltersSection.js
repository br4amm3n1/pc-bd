import React from 'react';
import { Paper, Collapse, Divider } from '@mui/material';
import { ComputersFilter } from '../../ComputersFilter';

export const FiltersSection = ({
  filtersOpen,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  return (
    <Collapse in={filtersOpen}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <ComputersFilter 
          filters={filters} 
          onFilterChange={onFilterChange} 
          onClearFilters={onClearFilters}
        />
      </Paper>
      <Divider sx={{ mb: 2 }} />
    </Collapse>
  );
};