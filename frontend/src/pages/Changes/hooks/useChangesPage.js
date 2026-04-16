import { useState, useMemo, useEffect, useCallback } from 'react';
import { useChangesQuery, useRefreshChanges, useInvalidateChanges, useCheckVersion } from '../../../hooks/useChangesQuery';
import { parseDescription } from '../../../utils/renderChangesUtils';

export const useChangesPage = () => {
  const [filters, setFilters] = useState({
    computer_name: '', username: '', action: '',
    date_from: '', date_to: ''
  });
  const [importInfo, setImportInfo] = useState({ open: false, importedComputers: [] });
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  const queryResult = useChangesQuery(filters);
  const { data: changes = [], isLoading, isFetching, isStale, error, refetch } = queryResult;

  const refreshChanges = useRefreshChanges();
  const invalidateChanges = useInvalidateChanges();
  const checkVersion = useCheckVersion();

  const filteredChanges = useMemo(() => {
    return changes.filter(change => {
      const parsed = parseDescription(change.change_description);
      const changeAction = parsed.action;
      const matchesComputerName = !filters.computer_name ||
        change.computer_name?.toString().toLowerCase().includes(filters.computer_name.toLowerCase());
      const matchesUsername = !filters.username ||
        change.user.username.toString().toLowerCase().includes(filters.username.toLowerCase());
      const matchesAction = !filters.action ||
        changeAction?.toLowerCase() === filters.action.toLowerCase();
      const matchesDateFrom = !filters.date_from ||
        new Date(change.change_date) >= new Date(filters.date_from);
      const matchesDateTo = !filters.date_to ||
        new Date(change.change_date) <= new Date(filters.date_to + 'T23:59:59');
      return matchesComputerName && matchesUsername && matchesAction && matchesDateFrom && matchesDateTo;
    });
  }, [changes, filters]);

  useEffect(() => {
    const csvImports = changes.filter(change => {
      const parsed = parseDescription(change.change_description);
      return parsed?.action === 'csv_import';
    });
    if (csvImports.length > 0) {
      const lastImport = csvImports[0];
      setImportInfo({
        open: true,
        importedComputers: lastImport.change_description?.imported_computers || []
      });
    }
  }, [changes]);

  const notifySuccess = useCallback(() => {
    setShowRefreshSuccess(true);
    setTimeout(() => setShowRefreshSuccess(false), 3000);
  }, []);

  const handleForceRefresh = useCallback(async () => {
    invalidateChanges();
    await refreshChanges();
    notifySuccess();
  }, [invalidateChanges, refreshChanges, notifySuccess]);

  const handleSoftRefresh = useCallback(async () => {
    await refreshChanges();
    notifySuccess();
  }, [refreshChanges, notifySuccess]);

  const handleCheckVersion = useCallback(async () => {
    const versionInfo = await checkVersion();
    if (versionInfo) notifySuccess();
  }, [checkVersion, notifySuccess]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ computer_name: '', username: '', action: '', date_from: '', date_to: '' });
  }, []);

  return {
    filters, filteredChanges, changes,
    importInfo, setImportInfo,
    showRefreshSuccess,
    autoUpdateEnabled, setAutoUpdateEnabled,
    ...queryResult,
    handleForceRefresh, handleSoftRefresh, handleCheckVersion,
    handleFilterChange, handleClearFilters,
  };
};