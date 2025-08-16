import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  X, 
  Maximize2, 
  Minimize2,
  Play,
  Square,
  RotateCcw,
  Settings,
  Download,
  Upload
} from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  repoPath?: string;
}

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'running' | 'success' | 'error';
}

export const Terminal: React.FC<TerminalProps> = ({ isOpen, onToggle, repoPath }) => {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState(repoPath || '/');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common commands for development
  const commonCommands = [
    { name: 'npm install', description: 'Install dependencies' },
    { name: 'npm run dev', description: 'Start development server' },
    { name: 'npm run build', description: 'Build for production' },
    { name: 'npm test', description: 'Run tests' },
    { name: 'git status', description: 'Check git status' },
    { name: 'git add .', description: 'Stage all changes' },
    { name: 'git commit -m "message"', description: 'Commit changes' },
    { name: 'git push', description: 'Push to remote' },
    { name: 'ls', description: 'List files' },
    { name: 'cd', description: 'Change directory' },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const commandId = Date.now().toString();
    const newCommand: TerminalCommand = {
      id: commandId,
      command: command.trim(),
      output: '',
      timestamp: new Date(),
      status: 'running'
    };

    setCommands(prev => [...prev, newCommand]);
    setCommandHistory(prev => [...prev, command]);
    setCurrentCommand('');

    try {
      // Simulate command execution (replace with actual backend integration)
      const output = await simulateCommandExecution(command, currentDirectory);
      
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output, status: 'success' }
            : cmd
        )
      );

      // Update directory for cd commands
      if (command.startsWith('cd ')) {
        const newDir = command.substring(3).trim();
        setCurrentDirectory(prev => newDir === '..' ? prev.split('/').slice(0, -1).join('/') || '/' : `${prev}/${newDir}`);
      }
    } catch (error) {
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output: `Error: ${error}`, status: 'error' }
            : cmd
        )
      );
    }
  };

  const simulateCommandExecution = async (command: string, cwd: string): Promise<string> => {
    // Simulate different commands
    await new Promise(resolve => setTimeout(resolve, 500));

    const cmd = command.toLowerCase();
    
    if (cmd === 'ls' || cmd === 'dir') {
      return `📁 node_modules/
📁 src/
📁 public/
📄 package.json
📄 README.md
📄 .gitignore
📄 tsconfig.json`;
    }
    
    if (cmd.startsWith('npm install')) {
      return `✅ Installing dependencies...
📦 added 1234 packages in 2.3s
🎉 Installation complete!`;
    }
    
    if (cmd === 'npm run dev') {
      return `🚀 Starting development server...
📡 Server running on http://localhost:3000
⚡ Hot reload enabled
🎯 Ready for development!`;
    }
    
    if (cmd === 'npm run build') {
      return `🔨 Building for production...
📦 Optimizing bundle...
✅ Build complete! (2.1s)
📊 Bundle size: 245KB`;
    }
    
    if (cmd === 'git status') {
      return `🌿 On branch main
📝 Changes not staged for commit:
  📄 modified: src/components/ChatPanel.tsx
  📄 modified: src/services/api.ts
  
💡 Use "git add <file>" to stage changes`;
    }
    
    if (cmd === 'pwd') {
      return cwd;
    }
    
    if (cmd === 'clear') {
      setCommands([]);
      return '';
    }
    
    if (cmd === 'help') {
      return `Available commands:
${commonCommands.map(cmd => `  ${cmd.name} - ${cmd.description}`).join('\n')}

💡 Tip: Use ↑/↓ arrows to navigate command history`;
    }
    
    return `Command not found: ${command}
💡 Type 'help' for available commands`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const clearTerminal = () => {
    setCommands([]);
  };

  const runQuickCommand = (command: string) => {
    executeCommand(command);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-[#30363d] z-50"
      style={{ height: isMinimized ? '40px' : '300px' }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-[#1f6feb]" />
          <span className="text-sm font-medium text-white">Terminal</span>
          <span className="text-xs text-[#8b949e]">• {currentDirectory}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Quick Commands */}
          <div className="flex items-center space-x-1 mr-4">
            <button
              onClick={() => runQuickCommand('npm install')}
              className="px-2 py-1 text-xs bg-[#21262d] hover:bg-[#30363d] text-white rounded transition-colors"
              title="Install dependencies"
            >
              📦 Install
            </button>
            <button
              onClick={() => runQuickCommand('npm run dev')}
              className="px-2 py-1 text-xs bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded transition-colors"
              title="Start dev server"
            >
              🚀 Dev
            </button>
            <button
              onClick={() => runQuickCommand('npm run build')}
              className="px-2 py-1 text-xs bg-[#21262d] hover:bg-[#30363d] text-white rounded transition-colors"
              title="Build project"
            >
              🔨 Build
            </button>
          </div>
          
          {/* Terminal Controls */}
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-[#30363d] rounded transition-colors"
            title="Clear terminal"
          >
            <RotateCcw className="w-4 h-4 text-[#8b949e]" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[#30363d] rounded transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-[#8b949e]" />
            ) : (
              <Minimize2 className="w-4 h-4 text-[#8b949e]" />
            )}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-[#30363d] rounded transition-colors"
            title="Close terminal"
          >
            <X className="w-4 h-4 text-[#8b949e]" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isMinimized && (
        <div className="h-full flex flex-col">
          {/* Command Output */}
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm text-[#c9d1d9] bg-[#0d1117]"
          >
            {commands.map((cmd) => (
              <div key={cmd.id} className="mb-4">
                {/* Command Input */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[#1f6feb]">$</span>
                  <span className="text-white">{cmd.command}</span>
                  {cmd.status === 'running' && (
                    <div className="w-2 h-2 bg-[#1f6feb] rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Command Output */}
                {cmd.output && (
                  <div className={`ml-4 whitespace-pre-wrap ${
                    cmd.status === 'error' ? 'text-red-400' : 'text-[#8b949e]'
                  }`}>
                    {cmd.output}
                  </div>
                )}
              </div>
            ))}
            
            {/* Current Command Line */}
            <div className="flex items-center space-x-2">
              <span className="text-[#1f6feb]">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none"
                placeholder="Enter command..."
              />
            </div>
          </div>

          {/* Quick Commands Bar */}
          <div className="px-4 py-2 bg-[#161b22] border-t border-[#30363d]">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#8b949e]">Quick:</span>
              {commonCommands.slice(0, 5).map((cmd) => (
                <button
                  key={cmd.name}
                  onClick={() => runQuickCommand(cmd.name)}
                  className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded transition-colors"
                >
                  {cmd.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};