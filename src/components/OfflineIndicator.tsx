import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-amber-500/30 px-3.5 py-2 text-xs text-[#F9FAFB] shadow-xl">
      <WifiOff className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
      <span className="font-medium">Offline — saving locally</span>
    </div>
  );
};
