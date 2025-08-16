import React from 'react';
import { TestTube, Play, Square, Settings } from 'lucide-react';

interface FirebaseEmulatorsProps {
  emulatorStatus: any;
  onStartEmulators: (services: string[]) => void;
  onStopEmulators: () => void;
}

export const FirebaseEmulators: React.FC<FirebaseEmulatorsProps> = ({
  emulatorStatus,
  onStartEmulators,
  onStopEmulators
}) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <TestTube className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Emulator Control</h3>
        <p className="text-slate-400 mb-4">
          Start and manage Firebase emulators for local development
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
            <Play className="w-4 h-4" />
            Start All
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-600 rounded-lg text-white text-sm">
            <Square className="w-4 h-4" />
            Stop All
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
            <Settings className="w-4 h-4" />
            Configure
          </div>
        </div>
      </div>
    </div>
  );
};