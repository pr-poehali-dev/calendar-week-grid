import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

interface SyncIndicatorProps {
  isSyncing?: boolean;
}

export const SyncIndicator = ({ isSyncing }: SyncIndicatorProps) => {
  const [syncStatus, setSyncStatus] = useState<'cached' | 'syncing' | 'synced' | 'hidden'>('hidden');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      const cachedData = localStorage.getItem('calendar_events_local_user');
      if (cachedData) {
        setSyncStatus('cached');
      }
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (isSyncing) {
      setSyncStatus('syncing');
    } else if (syncStatus === 'syncing' || syncStatus === 'cached') {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('hidden'), 2000);
    }
  }, [isSyncing]);

  if (syncStatus === 'hidden') return null;

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'cached':
        return { bg: 'bg-red-500/90', icon: 'WifiOff', text: 'Загружено из кеша' };
      case 'syncing':
        return { bg: 'bg-yellow-500/90', icon: 'RefreshCw', text: 'Синхронизация...' };
      case 'synced':
        return { bg: 'bg-green-500/90', icon: 'Wifi', text: 'Синхронизировано' };
      default:
        return { bg: '', icon: 'Wifi', text: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300 ${config.bg} text-white`}
    >
      <Icon 
        name={config.icon as any} 
        size={14}
        className={syncStatus === 'syncing' ? 'animate-spin' : ''}
      />
      <span>{config.text}</span>
    </div>
  );
};