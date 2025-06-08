import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataIntegration } from '@/contexts/DataIntegrationContext';
import { useRealTimeSync } from '@/hooks/use-real-time-sync';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';

interface DataSyncIndicatorProps {
  showFullStatus?: boolean;
  className?: string;
}

export function DataSyncIndicator({ showFullStatus = false, className = '' }: DataSyncIndicatorProps) {
  const { lastSync, isLoading } = useDataIntegration();
  const { forcSync } = useRealTimeSync();

  const getSyncStatus = () => {
    if (isLoading) return { status: 'syncing', color: 'bg-yellow-500', text: 'Syncing...' };
    if (!lastSync) return { status: 'disconnected', color: 'bg-red-500', text: 'No sync' };
    
    const timeDiff = Date.now() - lastSync.getTime();
    if (timeDiff > 120000) return { status: 'stale', color: 'bg-orange-500', text: 'Stale data' };
    if (timeDiff > 60000) return { status: 'outdated', color: 'bg-yellow-500', text: 'Outdated' };
    
    return { status: 'connected', color: 'bg-green-500', text: 'Live' };
  };

  const syncStatus = getSyncStatus();

  if (!showFullStatus) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${syncStatus.color}`} />
        {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {syncStatus.status === 'connected' ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : syncStatus.status === 'syncing' ? (
          <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <Badge variant={syncStatus.status === 'connected' ? 'default' : 'secondary'}>
          {syncStatus.text}
        </Badge>
      </div>
      
      {lastSync && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {lastSync.toLocaleTimeString()}
        </div>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={forcSync}
        disabled={isLoading}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Sync
      </Button>
    </div>
  );
}