import { Box, LinearProgress } from '@mui/material';
import { useChangesPage } from './hooks/useChangesPage';
import { ChangesHeader } from './components/ChangesHeader';
import { ChangesAlerts } from './components/ChangesAlerts';
import { ChangesTable } from './components/ChangesTable';
import ChangesFilter from './ChangesFilter';

export default function ChangesPage() {
  const {
    filters, filteredChanges, changes,
    importInfo, setImportInfo,
    showRefreshSuccess, autoUpdateEnabled, setAutoUpdateEnabled,
    isLoading, isFetching, isStale, error,
    isVersionFetching, currentVersion, totalCount,
    handleForceRefresh, handleSoftRefresh, handleCheckVersion,
    handleFilterChange, handleClearFilters,
  } = useChangesPage();

  return (
    <Box sx={{ p: 3 }}>
      {(isFetching || isVersionFetching) && !isLoading && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}

      <ChangesHeader
        changes={changes} filteredChanges={filteredChanges}
        currentVersion={currentVersion} serverTotalCount={totalCount}
        isStale={isStale} isVersionFetching={isVersionFetching} isFetching={isFetching}
        autoUpdateEnabled={autoUpdateEnabled}
        onToggleAutoUpdate={() => setAutoUpdateEnabled(p => !p)}
        onCheckVersion={handleCheckVersion}
        onSoftRefresh={handleSoftRefresh}
        onForceRefresh={handleForceRefresh}
      />

      <ChangesAlerts
        showRefreshSuccess={showRefreshSuccess}
        autoUpdateEnabled={autoUpdateEnabled}
        isStale={isStale} isFetching={isFetching}
        importInfo={importInfo}
        onCloseImportInfo={() => setImportInfo(p => ({ ...p, open: false }))}
        onSoftRefresh={handleSoftRefresh}
        error={error}
        onForceRefresh={handleForceRefresh}
      />

      <ChangesFilter
        filters={filters} onFilterChange={handleFilterChange}
        onApplyFilters={() => {}} onClearFilters={handleClearFilters}
        loading={isLoading}
      />

      <ChangesTable
        filteredChanges={filteredChanges}
        isLoading={isLoading} isFetching={isFetching}
        filters={filters} onClearFilters={handleClearFilters}
      />
    </Box>
  );
}