import React, { useState, useCallback } from 'react';
import { useVirtualScrolling } from '@/hooks/use-performance-optimization';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  loading = false,
  emptyMessage = "No items found",
  className = "",
  overscan = 5
}: VirtualListProps<T>) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  } = useVirtualScrolling(items, itemHeight, containerHeight, overscan);

  if (loading) {
    return (
      <div className={`${className} space-y-2`}>
        {Array.from({ length: Math.ceil(containerHeight / itemHeight) }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center h-full`}>
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`${className} overflow-auto`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={keyExtractor(item, index)}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VirtualClientListProps {
  clients: Array<{
    id: number;
    name: string;
    company?: string;
    status: string;
    kpis?: Array<{ met: boolean; actual?: number }>;
  }>;
  onClientClick?: (clientId: number) => void;
  loading?: boolean;
}

export function VirtualClientList({ clients, onClientClick, loading }: VirtualClientListProps) {
  const renderClient = useCallback((client: any, index: number) => {
    const healthScore = client.kpis 
      ? (client.kpis.filter((kpi: any) => kpi.met).length / client.kpis.length) * 100 
      : 100;
    
    const revenue = client.kpis?.reduce((sum: number, kpi: any) => {
      return sum + (typeof kpi.actual === 'number' ? kpi.actual : 0);
    }, 0) || 0;

    return (
      <Card 
        className="w-full cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClientClick?.(client.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-600">{client.company || 'Company not specified'}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                ${revenue.toLocaleString()}
              </div>
              <div className={`text-sm font-medium ${
                healthScore >= 80 ? 'text-green-600' : 
                healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthScore.toFixed(1)}% Health
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [onClientClick]);

  const keyExtractor = useCallback((client: any) => client.id.toString(), []);

  return (
    <VirtualList
      items={clients}
      itemHeight={120}
      containerHeight={600}
      renderItem={renderClient}
      keyExtractor={keyExtractor}
      loading={loading}
      emptyMessage="No clients found. Add your first client to get started."
      className="space-y-2"
      overscan={3}
    />
  );
}