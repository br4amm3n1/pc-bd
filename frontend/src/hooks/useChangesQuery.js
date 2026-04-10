import { useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getComputersChanges, getChangesVersion } from '../api/computersApi';

// Ключи для кэширования
export const changesKeys = {
  all: ['changes'],
  lists: () => [...changesKeys.all, 'list'],
  list: (filters) => [...changesKeys.lists(), { filters }],
  version: () => [...changesKeys.all, 'version'],
};


export const useChangesQuery = (filters = {}) => {
  const queryClient = useQueryClient();
  const lastVersionRef = useRef(null);
  
  const { data: versionData, isFetching: isVersionFetching } = useChangesVersionQuery();
  
  const query = useQuery({
    queryKey: changesKeys.list(filters),
    queryFn: async () => {
      const data = await getComputersChanges();
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
  });

  useEffect(() => {
    if (!versionData || isVersionFetching) return;
    
    const currentVersion = versionData.version;
    
    if (lastVersionRef.current === null && query.data) {
      lastVersionRef.current = currentVersion;
      return;
    }
    
    if (lastVersionRef.current !== null && 
        lastVersionRef.current !== currentVersion &&
        !query.isFetching) {
      lastVersionRef.current = currentVersion;
      query.refetch();
    }
  }, [versionData, isVersionFetching, query.data, query.isFetching]);

  return {
    ...query,
    isVersionFetching,
    currentVersion: versionData?.version,
    totalCount: versionData?.totalCount,
    lastModified: versionData?.lastModified,
  };
};

export const useCheckVersion = () => {
  const queryClient = useQueryClient();
  
  const checkVersion = async () => {
    // Принудительно перезапрашиваем версию
    const versionData = await queryClient.fetchQuery({
      queryKey: changesKeys.version(),
      queryFn: getChangesVersion,
    });
    
    return versionData;
  };
  
  return checkVersion;
};

export const useChangesVersionQuery = () => {
  return useQuery({
    queryKey: changesKeys.version(),
    queryFn: getChangesVersion,
    refetchInterval: 15000,
    staleTime: 10000,
    gcTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
};

export const useInvalidateChanges = () => {
  const queryClient = useQueryClient();
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: changesKeys.all });
    queryClient.invalidateQueries({ queryKey: changesKeys.version() });
  };
  
  return invalidate;
};

export const useRefreshChanges = () => {
  const queryClient = useQueryClient();
  
  const refresh = async () => {
    await queryClient.refetchQueries({ queryKey: changesKeys.all });
    await queryClient.refetchQueries({ queryKey: changesKeys.version() });
  };
  
  return refresh;
};