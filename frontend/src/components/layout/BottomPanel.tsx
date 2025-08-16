/**
 * Bottom Panel Component
 * 
 * Terminal, Git Output, and Build Logs
 * Black background with neon-colored text output
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, GitBranch, Play, AlertCircle, CheckCircle, X,
  ChevronDown, ChevronUp, Plus, Settings, Trash2, Copy
} from 'lucide-react';

interface TerminalTab {
  id: string;
  name: string;
  type: 'terminal' | 'git' | 'build' | 'logs';
  content: string[];
  isActive: boolean;
}

const BottomPanel: React.FC = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
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
      isActive: true
    },
    {
      id: 'git-1',
      name: 'Git',
      type: 'git',
      content: [
        '$ git status',
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
      ],
      isActive: false
    },
    {
      id: 'build-1',
      name: 'Build',
      type: 'build',
      content: [
        '$ npm run build',
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
      ],
      isActive: false
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [tabs]);

  const activeTab = tabs.find(tab => tab.isActive);

  const switchTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return; // Keep at least one tab
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    if (tabs.find(tab => tab.id === tabId)?.isActive && newTabs.length > 0) {
      newTabs[0].isActive = true;
    }
    setTabs(newTabs);
  };

  const addTab = (type: TerminalTab['type']) => {
    const newTab: TerminalTab = {
      id: `${type}-${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      content: [],
      isActive: true
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab));
  };

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    const activeTabIndex = tabs.findIndex(tab => tab.isActive);
    if (activeTabIndex === -1) return;

    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Add command to terminal
    const newTabs = [...tabs];
    newTabs[activeTabIndex].content.push(`$ ${command}`);

    // Simulate command output based on type
    const output = generateCommandOutput(command, newTabs[activeTabIndex].type);
    newTabs[activeTabIndex].content.push(...output);

    setTabs(newTabs);
    setInputValue('');
  };

  const generateCommandOutput = (command: string, type: TerminalTab['type']): string[] => {
    const cmd = command.toLowerCase();
    
    switch (type) {
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
            '/workspace/winky-coder',
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
        } else if (cmd.includes('add')) {
          return [
            '',
            ''
          ];
        } else if (cmd.includes('commit')) {
          return [
            '[main abc1234] Update components',
            ' 2 files changed, 45 insertions(+), 12 deletions(-)',
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const clearTerminal = () => {
    const activeTabIndex = tabs.findIndex(tab => tab.isActive);
    if (activeTabIndex === -1) return;

    const newTabs = [...tabs];
    newTabs[activeTabIndex].content = [];
    setTabs(newTabs);
  };

  const copyOutput = () => {
    if (!activeTab) return;
    
    const output = activeTab.content.join('\n');
    navigator.clipboard.writeText(output);
  };

  const getTabIcon = (type: TerminalTab['type']) => {
    switch (type) {
      case 'terminal':
        return <Terminal className="w-4 h-4" />;
      case 'git':
        return <GitBranch className="w-4 h-4" />;
      case 'build':
        return <Play className="w-4 h-4" />;
      case 'logs':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  const getOutputColor = (line: string): string => {
    if (line.includes('error') || line.includes('Error')) return 'text-red-400';
    if (line.includes('warning') || line.includes('Warning')) return 'text-yellow-400';
    if (line.includes('success') || line.includes('✓')) return 'text-green-400';
    if (line.includes('$')) return 'text-blue-400';
    if (line.includes('➜')) return 'text-cyan-400';
    return 'text-gray-300';
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Tab Bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-800 ${
                  tab.isActive 
                    ? 'bg-black text-white' 
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => switchTab(tab.id)}
              >
                {getTabIcon(tab.type)}
                <span className="text-sm">{tab.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Add Tab Button */}
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="p-1">
                  <button
                    onClick={() => addTab('terminal')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-700 rounded transition-colors"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>New Terminal</span>
                  </button>
                  <button
                    onClick={() => addTab('git')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-700 rounded transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Git Output</span>
                  </button>
                  <button
                    onClick={() => addTab('build')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-700 rounded transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Build Logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Controls */}
          <div className="flex items-center gap-2 px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearTerminal}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Clear Terminal"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyOutput}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Copy Output"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Terminal Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
      >
        {activeTab?.content.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap ${getOutputColor(line)}`}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Command Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;