import { useState, useCallback } from 'react';

export const useSelection = () => {
  const [selectedComputers, setSelectedComputers] = useState([]);

  const handleSelectAll = useCallback((computers) => {
    if (selectedComputers.length === computers.length) {
      setSelectedComputers([]);
    } else {
      const newSelected = computers.map((computer) => computer.id);
      setSelectedComputers(newSelected);
    }
  }, [selectedComputers]);

  const handleSelectComputer = useCallback((id) => {
    const selectedIndex = selectedComputers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedComputers, id];
    } else {
      newSelected = selectedComputers.filter((computerId) => computerId !== id);
    }

    setSelectedComputers(newSelected);
  }, [selectedComputers]);

  const isSelected = useCallback((id) => {
    return selectedComputers.indexOf(id) !== -1;
  }, [selectedComputers]);

  const clearSelection = useCallback(() => {
    setSelectedComputers([]);
  }, []);

  return {
    selectedComputers,
    setSelectedComputers,
    handleSelectAll,
    handleSelectComputer,
    isSelected,
    clearSelection
  };
};