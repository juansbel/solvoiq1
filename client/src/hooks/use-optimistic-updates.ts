import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  queryKey: string[];
  updateFn: (oldData: T[] | undefined, newItem: T) => T[];
  revertFn?: (oldData: T[] | undefined, item: T) => T[];
}

export function useOptimisticUpdates<T extends { id: number | string }>() {
  const queryClient = useQueryClient();

  const optimisticCreate = useCallback(
    <TData extends T>(
      options: OptimisticUpdateOptions<TData>,
      newItem: TData,
      mutationFn: () => Promise<TData>
    ) => {
      const { queryKey, updateFn, revertFn } = options;
      
      // Store the previous data for rollback
      const previousData = queryClient.getQueryData<TData[]>(queryKey);
      
      // Optimistically update the cache
      queryClient.setQueryData<TData[]>(queryKey, (oldData) => 
        updateFn(oldData, newItem)
      );

      return mutationFn().catch((error) => {
        // Revert on error
        if (revertFn) {
          queryClient.setQueryData<TData[]>(queryKey, (oldData) => 
            revertFn(oldData, newItem)
          );
        } else {
          queryClient.setQueryData<TData[]>(queryKey, previousData);
        }
        throw error;
      });
    },
    [queryClient]
  );

  const optimisticUpdate = useCallback(
    <TData extends T>(
      options: OptimisticUpdateOptions<TData>,
      updatedItem: TData,
      mutationFn: () => Promise<TData>
    ) => {
      const { queryKey } = options;
      
      // Store the previous data for rollback
      const previousData = queryClient.getQueryData<TData[]>(queryKey);
      
      // Optimistically update the cache
      queryClient.setQueryData<TData[]>(queryKey, (oldData) => 
        oldData?.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ) || []
      );

      return mutationFn().catch((error) => {
        // Revert on error
        queryClient.setQueryData<TData[]>(queryKey, previousData);
        throw error;
      });
    },
    [queryClient]
  );

  const optimisticDelete = useCallback(
    <TData extends T>(
      queryKey: string[],
      itemId: number | string,
      mutationFn: () => Promise<void>
    ) => {
      // Store the previous data for rollback
      const previousData = queryClient.getQueryData<TData[]>(queryKey);
      
      // Optimistically remove from cache
      queryClient.setQueryData<TData[]>(queryKey, (oldData) => 
        oldData?.filter(item => item.id !== itemId) || []
      );

      return mutationFn().catch((error) => {
        // Revert on error
        queryClient.setQueryData<TData[]>(queryKey, previousData);
        throw error;
      });
    },
    [queryClient]
  );

  return {
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete
  };
}