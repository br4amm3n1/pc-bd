import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getComputersChanges, getChangesVersion } from '../api/computersApi';

// Ключи для кэширования
export const changesKeys = {
  all: ['changes'],
  lists: () => [...changesKeys.all, 'list'],
  list: (filters) => [...changesKeys.lists(), { filters }],
  details: () => [...changesKeys.all, 'detail'],
  detail: (id) => [...changesKeys.details(), id],
  version: () => [...changesKeys.all, 'version'],
};

// Основной хук для получения изменений с кэшированием
export const useChangesQuery = (filters = {}) => {
  return useQuery({
    queryKey: changesKeys.list(filters),
    queryFn: async () => {
      const data = await getComputersChanges();
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useChangesVersionQuery = () => {
  return useQuery({
    queryKey: changesKeys.version(),
    queryFn: getChangesVersion,
    refetchInterval: 15000,
    staleTime: 10000,
    gcTime: 30000,
  });
};

// Хук для мутации (создание/обновление/удаление с автоматической инвалидацией)
export const useInvalidateChanges = () => {
  const queryClient = useQueryClient();
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: changesKeys.all });
    queryClient.invalidateQueries({ queryKey: changesKeys.version() });
  };
  
  return invalidate;
};

// Хук для ручного обновления данных
export const useRefreshChanges = () => {
  const queryClient = useQueryClient();
  
  const refresh = async () => {
    await queryClient.refetchQueries({ queryKey: changesKeys.all });
    await queryClient.refetchQueries({ queryKey: changesKeys.version() });
  };
  
  return refresh;
};