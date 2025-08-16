import React from 'react';
import { 
  GitBranch, 
  FileText, 
  Wifi, 
  WifiOff,
  Settings,
  Clock
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const StatusBar: React.FC = () => {
  const { 
    currentRepository, 
    editor, 
    fileExplorer,
    theme 
  } = useAppStore();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  const getFileInfo = () => {
    if (!editor.currentFile) return 'No file selected';
    
    const lines = editor.currentFile.content.split('\n').length;
    const size = editor.currentFile.size;
    return `${lines} lines, ${size} bytes`;
  };

  const getRepositoryInfo = () => {
    if (!currentRepository) return 'No repository';
    return `${currentRepository.name} (${currentRepository.branch})`;
  };

  return (
    <div className="status-bar">
      <div className="flex items-center space-x-4">
        {/* Repository Info */}
        <div className="flex items-center space-x-1">
          <GitBranch className="w-3 h-3 text-white/60" />
          <span className="text-xs">{getRepositoryInfo()}</span>
        </div>

        {/* File Info */}
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3 text-white/60" />
          <span className="text-xs">{getFileInfo()}</span>
        </div>

        {/* File Count */}
        <span className="text-xs text-white/60">
          {fileExplorer.files.length} files
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3 text-success-400" />
          <span className="text-xs text-white/60">Connected</span>
        </div>

        {/* Theme */}
        <span className="text-xs text-white/60 capitalize">
          {theme} theme
        </span>

        {/* Current Time */}
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-white/60" />
          <span className="text-xs text-white/60">{getCurrentTime()}</span>
        </div>

        {/* Settings */}
        <button
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Settings"
        >
          <Settings className="w-3 h-3 text-white/60" />
        </button>
      </div>
    </div>
  );
};

export default StatusBar;