import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Client, Task } from "@shared/schema";

// Cache management hook for optimized data fetching
export function useCacheOptimization() {
  const queryClient = useQueryClient();

  const prefetchData = useCallback(async (keys: string[]) => {
    const prefetchPromises = keys.map(key => 
      queryClient.prefetchQuery({
        queryKey: [key],
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      })
    );
    
    await Promise.allSettled(prefetchPromises);
  }, [queryClient]);

  const invalidateMultiple = useCallback((patterns: string[]) => {
    patterns.forEach(pattern => {
      queryClient.invalidateQueries({ 
        queryKey: [pattern],
        exact: false 
      });
    });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    prefetchData,
    invalidateMultiple,
    clearCache
  };
}

// Virtual scrolling hook for large datasets
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + (2 * overscan);
    const end = Math.min(items.length, start + visibleCount);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    apiCallCount: number;
    cacheHitRate: number;
    memoryUsage?: number;
  }>({
    renderTime: 0,
    apiCallCount: 0,
    cacheHitRate: 0
  });

  const startTime = useRef<number>();
  const apiCalls = useRef(0);
  const cacheHits = useRef(0);

  const startRenderTimer = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endRenderTimer = useCallback(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    }
  }, []);

  const trackApiCall = useCallback((fromCache: boolean = false) => {
    apiCalls.current++;
    if (fromCache) cacheHits.current++;
    
    const cacheHitRate = apiCalls.current > 0 ? (cacheHits.current / apiCalls.current) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      apiCallCount: apiCalls.current,
      cacheHitRate
    }));
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedPercentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const memoryInfo = getMemoryUsage();
      if (memoryInfo) {
        setMetrics(prev => ({ ...prev, memoryUsage: memoryInfo.usedPercentage }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [getMemoryUsage]);

  return {
    metrics,
    startRenderTimer,
    endRenderTimer,
    trackApiCall,
    getMemoryUsage
  };
}

// Debounced search with caching
export function useOptimizedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchCache = useRef(new Map<string, T[]>());
  const debounceTimer = useRef<NodeJS.Timeout>();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Check cache first
    if (searchCache.current.has(searchQuery)) {
      setResults(searchCache.current.get(searchQuery) || []);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchResults = await searchFn(searchQuery);
      searchCache.current.set(searchQuery, searchResults);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchFn]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      search(searchQuery);
    }, delay);
  }, [search, delay]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    updateQuery,
    clearSearch
  };
}

export function usePerformanceOptimization() {

  const getClientHealth = useCallback((client: Client, tasks: Task[]) => {
    const clientTasks = tasks.filter(task => 
      task.assignedTo && task.assignedTo.includes(client.name)
    );
    
    const completedTasks = clientTasks.filter(task => task.status === "completed").length;
    const totalTasks = clientTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const kpis = client.kpis || [];
    const metKpis = kpis.filter(kpi => kpi.met).length;
    const kpiHealth = kpis.length > 0 ? (metKpis / kpis.length) * 100 : 100;
    
    const overallHealth = (completionRate + kpiHealth) / 2;
    
    let status: "excellent" | "good" | "warning" | "critical";
    if (overallHealth >= 80) status = "excellent";
    else if (overallHealth >= 60) status = "good";
    else if (overallHealth >= 40) status = "warning";
    else status = "critical";
    
    return { status, score: Math.round(overallHealth) };
  }, []);

  const getTeamEfficiency = useCallback((teamMembers, tasks) => {
    // Placeholder for more complex calculation
    if (!teamMembers || !tasks) return [];
    return teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        efficiency: Math.floor(Math.random() * 30) + 70, // Random efficiency between 70-100%
    }));
  }, []);
  
  const getRevenueTrend = useCallback(() => {
    // Placeholder for real data fetching
    return [
      { month: "Jan", value: 180000, target: 200000 },
      { month: "Feb", value: 195000, target: 210000 },
      { month: "Mar", value: 210000, target: 220000 },
      { month: "Apr", value: 225000, target: 230000 }
    ];
  }, []);

  const getTaskDistribution = useCallback((tasks: Task[]) => {
    if(!tasks) return { completed: 0, in_progress: 0, overdue: 0 };
    return tasks.reduce((acc, task) => {
      if (task.status === 'completed') acc.completed++;
      else if (new Date(task.dueDate) < new Date()) acc.overdue++;
      else acc.in_progress++;
      return acc;
    }, { completed: 0, in_progress: 0, overdue: 0 });
  }, []);

  return {
    getClientHealth,
    getTeamEfficiency,
    getRevenueTrend,
    getTaskDistribution,
  };
}