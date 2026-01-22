import { useState, useEffect, useCallback } from 'react';

export const useFilters = (computers, isLoading) => {
  const [filters, setFilters] = useState({});
  const [filteredComputers, setFilteredComputers] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const applyFilters = useCallback(() => {
    if (isLoading) return;
    
    let result = [...computers];
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(computer => {
          const value = computer[key];
          const filterValue = filters[key].toString().toLowerCase();
          
          if (key === 'has_kaspersky') {
            return value.toString() === filterValue;
          }
          
          return value.toString().toLowerCase().includes(filterValue);
        });
      }
    });
    
    setFilteredComputers(result);
  }, [computers, filters, isLoading]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleFilters = useCallback(() => {
    setFiltersOpen(prev => !prev);
  }, []);

  return {
    filters,
    filteredComputers,
    filtersOpen,
    handleFilterChange,
    handleClearFilters,
    toggleFilters
  };
};