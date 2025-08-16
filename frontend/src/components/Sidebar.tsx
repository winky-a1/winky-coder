import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  File, 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Upload, 
  Download,
  Search,
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { repositoryAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { FileItem } from '@/types';

const Sidebar: React.FC = () => {
  const { 
    currentRepository, 
    fileExplorer, 
    setFiles, 
    setSelectedFile, 
    toggleFolder,
    setSearchQuery 
  } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Load files when repository changes
  useEffect(() => {
    if (currentRepository) {
      loadFiles();
    }
  }, [currentRepository]);

  const loadFiles = async () => {
    if (!currentRepository) return;
    
    try {
      setIsLoading(true);
      const files = await repositoryAPI.getFiles(currentRepository.path, fileExplorer.currentPath);
      setFiles(files);
    } catch (error) {
      toast.error('Failed to load files');
      console.error('Load files error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: FileItem) => {
    if (file.type === 'directory') {
      toggleFolder(file.path);
      return;
    }

    if (!currentRepository) return;

    try {
      const content = await repositoryAPI.getFileContent(currentRepository.path, file.path);
      useAppStore.getState().setCurrentFile(content);
      setSelectedFile(file.path);
    } catch (error) {
      toast.error('Failed to load file');
      console.error('Load file error:', error);
    }
  };

  const handleGitAction = async (action: 'commit' | 'push' | 'pull') => {
    if (!currentRepository) return;

    const token = localStorage.getItem('github_token');
    if (!token) {
      toast.error('GitHub token not found. Please add your token in settings.');
      return;
    }

    try {
      setIsLoading(true);
      
      switch (action) {
        case 'commit':
          // This would open a commit dialog
          toast.success('Commit dialog would open here');
          break;
        case 'push':
          await repositoryAPI.commitChanges(
            currentRepository.path, 
            'Auto-commit from Winky-Coder', 
            [], 
            token
          );
          toast.success('Changes pushed successfully');
          break;
        case 'pull':
          await repositoryAPI.pullChanges(currentRepository.path, token);
          await loadFiles(); // Reload files after pull
          toast.success('Changes pulled successfully');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} changes`);
      console.error(`${action} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileTree = (files: FileItem[], level: number = 0) => {
    return files.map((file) => {
      const isExpanded = fileExplorer.expandedFolders.has(file.path);
      const isSelected = fileExplorer.selectedFile === file.path;
      
      return (
        <div key={file.path}>
          <motion.div
            className={`file-item ${isSelected ? 'active' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => handleFileSelect(file)}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.98 }}
          >
            {file.type === 'directory' ? (
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                <Folder className="file-icon text-blue-400" />
                <span className="truncate">{file.name}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <File className="file-icon text-gray-400" />
                <span className="truncate">{file.name}</span>
              </div>
            )}
          </motion.div>
          
          {file.type === 'directory' && isExpanded && file.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderFileTree(file.children, level + 1)}
            </motion.div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="sidebar h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white truncate">
            {currentRepository?.name || 'No Repository'}
          </h2>
          <button
            onClick={() => setSearchVisible(!searchVisible)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search Bar */}
        {searchVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4"
          >
            <input
              type="text"
              placeholder="Search files..."
              className="input-dark w-full text-sm"
              value={fileExplorer.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        )}

        {/* Git Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => handleGitAction('commit')}
            disabled={isLoading}
            className="btn-ghost flex-1 text-xs py-1"
            title="Commit Changes"
          >
            <GitCommit className="w-3 h-3 mr-1" />
            Commit
          </button>
          <button
            onClick={() => handleGitAction('push')}
            disabled={isLoading}
            className="btn-ghost flex-1 text-xs py-1"
            title="Push Changes"
          >
            <Upload className="w-3 h-3 mr-1" />
            Push
          </button>
          <button
            onClick={() => handleGitAction('pull')}
            disabled={isLoading}
            className="btn-ghost flex-1 text-xs py-1"
            title="Pull Changes"
          >
            <Download className="w-3 h-3 mr-1" />
            Pull
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="loading-spinner"></div>
            <span className="ml-2 text-sm text-white/60">Loading...</span>
          </div>
        ) : (
          <div className="p-2">
            {fileExplorer.files.length > 0 ? (
              renderFileTree(fileExplorer.files)
            ) : (
              <div className="text-center text-white/40 text-sm p-4">
                No files found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>
            {fileExplorer.files.length} items
          </span>
          <button
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;