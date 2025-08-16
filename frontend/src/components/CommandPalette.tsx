import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Settings, 
  GitCommit, 
  GitBranch,
  Bot,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Folder
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Command } from '@/types';

const CommandPalette: React.FC = () => {
  const { 
    setCommandPaletteOpen,
    currentRepository,
    editor,
    setTheme,
    toggleSidebar
  } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define available commands
  const commands: Command[] = [
    // File commands
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new file',
      icon: 'plus',
      action: () => {
        // TODO: Implement new file creation
        console.log('New file');
      },
      category: 'file',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'save-file',
      title: 'Save File',
      description: 'Save current file',
      icon: 'save',
      action: () => {
        // TODO: Implement save
        console.log('Save file');
      },
      category: 'file',
      shortcut: 'Ctrl+S'
    },
    {
      id: 'open-file',
      title: 'Open File',
      description: 'Open a file from the repository',
      icon: 'file-text',
      action: () => {
        console.log('Open file');
      },
      category: 'file',
      shortcut: 'Ctrl+O'
    },

    // Git commands
    {
      id: 'commit-changes',
      title: 'Commit Changes',
      description: 'Commit staged changes',
      icon: 'git-commit',
      action: () => {
        console.log('Commit changes');
      },
      category: 'git',
      shortcut: 'Ctrl+Shift+C'
    },
    {
      id: 'push-changes',
      title: 'Push Changes',
      description: 'Push commits to remote',
      icon: 'upload',
      action: () => {
        console.log('Push changes');
      },
      category: 'git',
      shortcut: 'Ctrl+Shift+P'
    },
    {
      id: 'pull-changes',
      title: 'Pull Changes',
      description: 'Pull latest changes from remote',
      icon: 'download',
      action: () => {
        console.log('Pull changes');
      },
      category: 'git',
      shortcut: 'Ctrl+Shift+L'
    },

    // AI commands
    {
      id: 'ai-chat',
      title: 'AI Chat',
      description: 'Open AI assistant chat',
      icon: 'bot',
      action: () => {
        console.log('AI chat');
      },
      category: 'ai',
      shortcut: 'Ctrl+Shift+A'
    },
    {
      id: 'ai-analyze',
      title: 'Analyze Code',
      description: 'Analyze current file with AI',
      icon: 'bot',
      action: () => {
        console.log('Analyze code');
      },
      category: 'ai',
      shortcut: 'Ctrl+Shift+E'
    },

    // View commands
    {
      id: 'toggle-sidebar',
      title: 'Toggle Sidebar',
      description: 'Show/hide the file explorer sidebar',
      icon: 'folder',
      action: () => {
        toggleSidebar();
        setCommandPaletteOpen(false);
      },
      category: 'view',
      shortcut: 'Ctrl+B'
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark themes',
      icon: 'settings',
      action: () => {
        setTheme(editor.theme === 'vs-dark' ? 'light' : 'dark');
        setCommandPaletteOpen(false);
      },
      category: 'view',
      shortcut: 'Ctrl+Shift+T'
    },

    // Settings commands
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Open application settings',
      icon: 'settings',
      action: () => {
        console.log('Open settings');
      },
      category: 'settings',
      shortcut: 'Ctrl+,'
    },
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setCommandPaletteOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setCommandPaletteOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, setCommandPaletteOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'plus': Plus,
      'save': Save,
      'file-text': FileText,
      'git-commit': GitCommit,
      'upload': Upload,
      'download': Download,
      'bot': Bot,
      'folder': Folder,
      'settings': Settings,
    };
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'file': 'text-blue-400',
      'git': 'text-green-400',
      'ai': 'text-purple-400',
      'view': 'text-yellow-400',
      'settings': 'text-gray-400',
    };
    return colorMap[category] || 'text-gray-400';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={() => setCommandPaletteOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-dark">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands..."
                className="input-primary w-full pl-10"
              />
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((command, index) => (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === selectedIndex 
                          ? 'bg-white/10 border border-white/20' 
                          : 'hover:bg-white/5'
                      }`}
                      onClick={() => {
                        command.action();
                        setCommandPaletteOpen(false);
                      }}
                    >
                      <div className={`flex-shrink-0 ${getCategoryColor(command.category)}`}>
                        {getIcon(command.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white truncate">
                            {command.title}
                          </h3>
                          {command.shortcut && (
                            <span className="text-xs text-white/40 font-mono">
                              {command.shortcut}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 truncate">
                          {command.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No commands found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
              <div className="flex items-center justify-between">
                <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
                <span>{filteredCommands.length} commands</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;