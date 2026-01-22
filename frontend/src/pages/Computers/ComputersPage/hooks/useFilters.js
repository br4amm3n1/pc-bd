import { useState, useMemo } from 'react';

export const useFilters = (computers, isLoading) => {
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

   const filteredComputers = useMemo(() => {
    if (isLoading || computers.length === 0) {
      return [];
    }
    
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
    
    return result;
  }, [computers, filters, isLoading]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const toggleFilters = () => {
    setFiltersOpen(prev => !prev);
  };

  return {
    filters,
    filteredComputers,
    filtersOpen,
    handleFilterChange,
    handleClearFilters,
    toggleFilters
  };
};