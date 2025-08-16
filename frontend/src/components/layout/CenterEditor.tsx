/**
 * Center Editor Component
 * 
 * Main coding area with Monaco Editor, tabs, and toolbar
 * Features line numbers, syntax highlighting, autocomplete
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Play, GitCommit, Settings, Maximize2, Minimize2,
  FileText, Code, Bug, Search, Replace, Terminal
} from 'lucide-react';
import * as monaco from 'monaco-editor';

interface CenterEditorProps {
  activeFile: string | null;
  openFiles: string[];
  setOpenFiles: (files: string[]) => void;
  setActiveFile: (file: string) => void;
}

interface EditorTab {
  id: string;
  name: string;
  path: string;
  language: string;
  isDirty: boolean;
  content: string;
}

const CenterEditor: React.FC<CenterEditorProps> = ({
  activeFile,
  openFiles,
  setOpenFiles,
  setActiveFile
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Mock file contents
  const mockFileContents: Record<string, string> = {
    'src/components/App.tsx': `import React from 'react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Winky Coder
        </h1>
        <p className="text-gray-300 text-lg">
          Your AI-powered development environment
        </p>
      </motion.div>
    </div>
  );
};

export default App;`,
    'src/components/Header.tsx': `import React from 'react';
import { Zap, Settings, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onSettingsClick }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;`,
    'package.json': `{
  "name": "winky-coder-app",
  "version": "1.0.0",
  "description": "AI-powered development environment",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "monaco-editor": "^0.44.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0"
  }
}`,
    'README.md': `# Winky Coder

An AI-powered development environment that combines the best of Firebase Studio, Cursor, and modern IDEs.

## Features

- **AI-Powered Development**: Generate code, debug, and optimize with AI assistance
- **500k Token Context**: Understand large codebases with intelligent context assembly
- **Real-time Collaboration**: Work together with your team in real-time
- **Built-in Terminal**: Run commands and manage your development environment
- **Git Integration**: Seamless version control with visual diff tools

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the development server: \`npm run dev\`
4. Open your browser and start coding!

## Tech Stack

- React 18
- TypeScript
- Monaco Editor
- Framer Motion
- Tailwind CSS
- Vite

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting a pull request.

## License

MIT License - see LICENSE file for details.
`
  };

  // Initialize tabs when openFiles changes
  useEffect(() => {
    const newTabs: EditorTab[] = openFiles.map(filePath => {
      const fileName = filePath.split('/').pop() || filePath;
      const language = getLanguageFromPath(filePath);
      const content = mockFileContents[filePath] || `// ${fileName}\n\n// Start coding here...`;
      
      return {
        id: filePath,
        name: fileName,
        path: filePath,
        language,
        isDirty: false,
        content
      };
    });
    
    setTabs(newTabs);
  }, [openFiles]);

  // Initialize Monaco Editor
  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: '',
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Consolas, monospace',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible'
        },
        wordWrap: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        parameterHints: {
          enabled: true
        },
        autoIndent: 'full',
        formatOnPaste: true,
        formatOnType: true
      });

      // Handle content changes
      monacoEditorRef.current.onDidChangeModelContent(() => {
        const currentTab = tabs.find(tab => tab.path === activeFile);
        if (currentTab) {
          setTabs(prev => prev.map(tab => 
            tab.path === activeFile 
              ? { ...tab, isDirty: true, content: monacoEditorRef.current?.getValue() || '' }
              : tab
          ));
        }
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  // Update editor content when active file changes
  useEffect(() => {
    if (monacoEditorRef.current && activeFile) {
      const currentTab = tabs.find(tab => tab.path === activeFile);
      if (currentTab) {
        const language = getLanguageFromPath(activeFile);
        monaco.editor.setModelLanguage(monacoEditorRef.current.getModel()!, language);
        monacoEditorRef.current.setValue(currentTab.content);
      }
    }
  }, [activeFile, tabs]);

  const getLanguageFromPath = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
      case 'cc':
        return 'cpp';
      case 'c':
        return 'c';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'swift':
        return 'swift';
      case 'kt':
        return 'kotlin';
      case 'scala':
        return 'scala';
      case 'cs':
        return 'csharp';
      case 'sql':
        return 'sql';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'toml':
        return 'toml';
      case 'xml':
        return 'xml';
      default:
        return 'plaintext';
    }
  };

  const closeTab = (filePath: string) => {
    const newOpenFiles = openFiles.filter(f => f !== filePath);
    setOpenFiles(newOpenFiles);
    
    if (activeFile === filePath && newOpenFiles.length > 0) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  const saveFile = () => {
    if (monacoEditorRef.current && activeFile) {
      const content = monacoEditorRef.current.getValue();
      setTabs(prev => prev.map(tab => 
        tab.path === activeFile 
          ? { ...tab, isDirty: false, content }
          : tab
      ));
      console.log('File saved:', activeFile);
    }
  };

  const runCode = () => {
    console.log('Running code...');
  };

  const commitChanges = () => {
    console.log('Committing changes...');
  };

  const getFileIcon = (language: string) => {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'html':
        return <FileText className="w-4 h-4 text-orange-400" />;
      case 'css':
      case 'scss':
        return <FileText className="w-4 h-4 text-pink-400" />;
      case 'json':
        return <FileText className="w-4 h-4 text-green-400" />;
      case 'markdown':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gray-950 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Editor Toolbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveFile}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runCode}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              title="Run (Ctrl+Enter)"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Run</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={commitChanges}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
            >
              <GitCommit className="w-4 h-4" />
              <span className="hidden sm:inline">Commit</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              title="Search (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* File Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-800 min-w-0 ${
                activeFile === tab.path 
                  ? 'bg-gray-950 text-white' 
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveFile(tab.path)}
              whileHover={{ backgroundColor: activeFile === tab.path ? '#111827' : '#374151' }}
            >
              {getFileIcon(tab.language)}
              <span className="text-sm truncate">{tab.name}</span>
              {tab.isDirty && <div className="w-2 h-2 bg-yellow-400 rounded-full" />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.path);
                }}
                className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-900 border-b border-gray-800 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in current file..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
              />
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
                Replace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <div ref={editorRef} className="w-full h-full" />
        
        {/* Editor Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>TypeScript</span>
              <span>UTF-8</span>
              <span>LF</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Ln 1, Col 1</span>
              <span>Spaces: 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterEditor;