/**
 * Terminal Context Provider
 * 
 * Manages terminal state, command history, and output
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TerminalTab {
  id: string;
  name: string;
  type: 'terminal' | 'git' | 'build' | 'logs';
  content: string[];
  isActive: boolean;
  workingDirectory: string;
}

interface TerminalState {
  tabs: TerminalTab[];
  commandHistory: string[];
  historyIndex: number;
  isRunning: boolean;
}

interface TerminalContextType {
  state: TerminalState;
  executeCommand: (command: string, tabId?: string) => Promise<void>;
  addTab: (type: TerminalTab['type']) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  clearTab: (tabId: string) => void;
  addOutput: (tabId: string, output: string[]) => void;
  navigateHistory: (direction: 'up' | 'down') => string;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};

interface TerminalProviderProps {
  children: React.ReactNode;
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({ children }) => {
  const [state, setState] = useState<TerminalState>({
    tabs: [
      {
        id: 'terminal-1',
        name: 'Terminal',
        type: 'terminal',
        content: [
          '$ npm install',
          'added 1234 packages, and audited 1234 packages in 2s',
          '123 packages are looking for funding',
          'run `npm fund` for details',
          '',
          '$ npm run dev',
          '  VITE v4.5.0  ready in 234 ms',
          '',
          '  ➜  Local:   http://localhost:5173/',
          '  ➜  Network: use --host to expose',
          '  ➜  press h to show help',
          ''
        ],
        isActive: true,
        workingDirectory: '/workspace/winky-coder'
      }
    ],
    commandHistory: ['npm install', 'npm run dev', 'ls', 'pwd'],
    historyIndex: -1,
    isRunning: false
  });

  const executeCommand = useCallback(async (command: string, tabId?: string) => {
    if (!command.trim()) return;

    const targetTabId = tabId || state.tabs.find(tab => tab.isActive)?.id;
    if (!targetTabId) return;

    // Add command to history
    setState(prev => ({
      ...prev,
      commandHistory: [...prev.commandHistory, command],
      historyIndex: -1
    }));

    // Add command to terminal
    const newTabs = state.tabs.map(tab => {
      if (tab.id === targetTabId) {
        return {
          ...tab,
          content: [...tab.content, `$ ${command}`]
        };
      }
      return tab;
    });

    setState(prev => ({
      ...prev,
      tabs: newTabs,
      isRunning: true
    }));

    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      const output = generateCommandOutput(command, targetTabId);
      
      setState(prev => ({
        ...prev,
        tabs: prev.tabs.map(tab => {
          if (tab.id === targetTabId) {
            return {
              ...tab,
              content: [...tab.content, ...output]
            };
          }
          return tab;
        }),
        isRunning: false
      }));
    } catch (error) {
      console.error('Error executing command:', error);
      setState(prev => ({
        ...prev,
        isRunning: false
      }));
    }
  }, [state.tabs]);

  const addTab = useCallback((type: TerminalTab['type']) => {
    const newTab: TerminalTab = {
      id: `${type}-${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      content: [],
      isActive: true,
      workingDirectory: '/workspace/winky-coder'
    };

    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
    }));
  }, []);

  const closeTab = useCallback((tabId: string) => {
    if (state.tabs.length <= 1) return; // Keep at least one tab

    const newTabs = state.tabs.filter(tab => tab.id !== tabId);
    if (state.tabs.find(tab => tab.id === tabId)?.isActive && newTabs.length > 0) {
      newTabs[0].isActive = true;
    }

    setState(prev => ({
      ...prev,
      tabs: newTabs
    }));
  }, [state.tabs]);

  const switchTab = useCallback((tabId: string) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    }));
  }, []);

  const clearTab = useCallback((tabId: string) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, content: [] }
          : tab
      )
    }));
  }, []);

  const addOutput = useCallback((tabId: string, output: string[]) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, content: [...tab.content, ...output] }
          : tab
      )
    }));
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string => {
    setState(prev => {
      let newIndex = prev.historyIndex;
      
      if (direction === 'up') {
        newIndex = Math.min(newIndex + 1, prev.commandHistory.length - 1);
      } else {
        newIndex = Math.max(newIndex - 1, -1);
      }

      return {
        ...prev,
        historyIndex: newIndex
      };
    });

    const currentHistory = state.commandHistory;
    const currentIndex = state.historyIndex;
    
    if (direction === 'up' && currentIndex < currentHistory.length - 1) {
      return currentHistory[currentHistory.length - 1 - (currentIndex + 1)];
    } else if (direction === 'down' && currentIndex > 0) {
      return currentHistory[currentHistory.length - 1 - (currentIndex - 1)];
    } else if (direction === 'down' && currentIndex === 0) {
      return '';
    }
    
    return '';
  }, [state.commandHistory, state.historyIndex]);

  const generateCommandOutput = (command: string, tabId: string): string[] => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) return [];

    const cmd = command.toLowerCase();
    
    switch (tab.type) {
      case 'terminal':
        if (cmd.includes('npm install')) {
          return [
            'added 1234 packages, and audited 1234 packages in 2s',
            '123 packages are looking for funding',
            'run `npm fund` for details',
            ''
          ];
        } else if (cmd.includes('npm run dev')) {
          return [
            '  VITE v4.5.0  ready in 234 ms',
            '',
            '  ➜  Local:   http://localhost:5173/',
            '  ➜  Network: use --host to expose',
            '  ➜  press h to show help',
            ''
          ];
        } else if (cmd.includes('ls')) {
          return [
            'src/',
            'public/',
            'package.json',
            'tsconfig.json',
            'README.md',
            ''
          ];
        } else if (cmd.includes('pwd')) {
          return [
            tab.workingDirectory,
            ''
          ];
        }
        break;

      case 'git':
        if (cmd.includes('status')) {
          return [
            'On branch main',
            'Your branch is up to date with \'origin/main\'.',
            '',
            'Changes not staged for commit:',
            '  (use "git add <file>..." to update what will be committed)',
            '  (use "git restore <file>..." to discard changes in working directory)',
            '        modified:   src/components/App.tsx',
            '        modified:   src/components/Header.tsx',
            '',
            'no changes added to commit (use "git add" and/or "git commit -a")',
            ''
          ];
        }
        break;

      case 'build':
        if (cmd.includes('build')) {
          return [
            '',
            '> winky-coder-app@1.0.0 build',
            '> tsc && vite build',
            '',
            '✓ 123 files checked in 2.34s',
            '✓ built in 1.23s',
            '',
            'dist/index.html                   0.45 kB │ gzip: 0.30 kB',
            'dist/assets/index-abc123.js       1.23 MB │ gzip: 0.45 MB',
            'dist/assets/index-def456.css      0.12 MB │ gzip: 0.03 MB',
            '✓ built successfully',
            ''
          ];
        }
        break;
    }

    return [
      `Command not found: ${command}`,
      ''
    ];
  };

  const value: TerminalContextType = {
    state,
    executeCommand,
    addTab,
    closeTab,
    switchTab,
    clearTab,
    addOutput,
    navigateHistory
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};