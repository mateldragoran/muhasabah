import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#FFFFFF] border border-[#E8DFD0] px-3.5 py-2 text-xs text-[#1E293B] shadow-md">
      <WifiOff className="w-3.5 h-3.5 text-[#B88728] shrink-0" />
      <span className="font-medium">Offline — saved locally</span>
    </div>
  );
};
