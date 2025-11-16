import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

export const SyncIndicator = () => {
  const [syncStatus, setSyncStatus] = useState<'cached' | 'synced' | 'hidden'>('hidden');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setSyncStatus('cached');

      const checkUpdate = async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.update();
          
          setTimeout(() => {
            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('hidden'), 2000);
          }, 500);
        } catch (error) {
          console.error('Update check failed:', error);
          setTimeout(() => setSyncStatus('hidden'), 3000);
        }
      };

      checkUpdate();
    }
  }, []);

  if (syncStatus === 'hidden') return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300 ${
        syncStatus === 'cached'
          ? 'bg-red-500/90 text-white'
          : 'bg-green-500/90 text-white'
      }`}
    >
      <Icon 
        name={syncStatus === 'cached' ? 'WifiOff' : 'Wifi'} 
        size={14} 
      />
      <span>
        {syncStatus === 'cached' ? 'Загружено из кеша' : 'Синхронизировано'}
      </span>
    </div>
  );
};
