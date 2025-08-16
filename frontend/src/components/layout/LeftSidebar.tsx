/**
 * Left Sidebar Component
 * 
 * Contains project explorer, git controls, and AI quick actions
 * Slim, vertical panel with expandable sections
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, GitBranch, GitPullRequest, GitCommit,
  Sparkles, Code, Bug, TestTube, Zap, ChevronRight, ChevronDown,
  Plus, RefreshCw, Settings, Search, Star, Clock
} from 'lucide-react';

interface LeftSidebarProps {
  activeFile: string | null;
  setActiveFile: (file: string) => void;
  openFiles: string[];
  setOpenFiles: (files: string[]) => void;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  language?: string;
  isOpen?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeFile,
  setActiveFile,
  openFiles,
  setOpenFiles
}) => {
  const [expandedSections, setExpandedSections] = useState({
    explorer: true,
    git: true,
    aiTools: true
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Mock project structure
  const projectFiles: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: 'src',
      isOpen: true,
      children: [
        {
          id: 'src/components',
          name: 'components',
          type: 'folder',
          path: 'src/components',
          isOpen: false,
          children: [
            { id: 'src/components/App.tsx', name: 'App.tsx', type: 'file', path: 'src/components/App.tsx', language: 'typescript' },
            { id: 'src/components/Header.tsx', name: 'Header.tsx', type: 'file', path: 'src/components/Header.tsx', language: 'typescript' }
          ]
        },
        {
          id: 'src/pages',
          name: 'pages',
          type: 'folder',
          path: 'src/pages',
          isOpen: false,
          children: [
            { id: 'src/pages/index.tsx', name: 'index.tsx', type: 'file', path: 'src/pages/index.tsx', language: 'typescript' },
            { id: 'src/pages/about.tsx', name: 'about.tsx', type: 'file', path: 'src/pages/about.tsx', language: 'typescript' }
          ]
        },
        { id: 'src/styles', name: 'styles', type: 'folder', path: 'src/styles', isOpen: false, children: [] },
        { id: 'src/utils', name: 'utils', type: 'folder', path: 'src/utils', isOpen: false, children: [] }
      ]
    },
    {
      id: 'public',
      name: 'public',
      type: 'folder',
      path: 'public',
      isOpen: false,
      children: [
        { id: 'public/index.html', name: 'index.html', type: 'file', path: 'public/index.html', language: 'html' },
        { id: 'public/favicon.ico', name: 'favicon.ico', type: 'file', path: 'public/favicon.ico', language: 'binary' }
      ]
    },
    { id: 'package.json', name: 'package.json', type: 'file', path: 'package.json', language: 'json' },
    { id: 'tsconfig.json', name: 'tsconfig.json', type: 'file', path: 'tsconfig.json', language: 'json' },
    { id: 'README.md', name: 'README.md', type: 'file', path: 'README.md', language: 'markdown' }
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFolder = (nodeId: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    // In a real app, you'd update the state here
  };

  const openFile = (filePath: string) => {
    if (!openFiles.includes(filePath)) {
      setOpenFiles([...openFiles, filePath]);
    }
    setActiveFile(filePath);
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return node.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;
    }

    const language = node.language;
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

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-800 rounded transition-colors ${
            activeFile === node.path ? 'bg-blue-600/20 text-blue-400' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              openFile(node.path);
            }
          }}
        >
          {getFileIcon(node)}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  const aiQuickActions = [
    { id: 'generate', name: 'Generate Component', icon: Code, color: 'text-blue-400' },
    { id: 'explain', name: 'Explain Code', icon: Sparkles, color: 'text-green-400' },
    { id: 'debug', name: 'Debug Code', icon: Bug, color: 'text-red-400' },
    { id: 'test', name: 'Generate Tests', icon: TestTube, color: 'text-purple-400' },
    { id: 'optimize', name: 'Optimize Code', icon: Zap, color: 'text-yellow-400' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Search */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Project Explorer */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {/* Explorer Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('explorer')}
              className="flex items-center gap-2 w-full text-left font-medium text-gray-300 hover:text-white transition-colors"
            >
              {expandedSections.explorer ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className="w-4 h-4" />
              <span>EXPLORER</span>
            </button>
            
            <AnimatePresence>
              {expandedSections.explorer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  {renderFileTree(projectFiles)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Git Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('git')}
              className="flex items-center gap-2 w-full text-left font-medium text-gray-300 hover:text-white transition-colors"
            >
              {expandedSections.git ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <GitBranch className="w-4 h-4" />
              <span>GIT</span>
            </button>
            
            <AnimatePresence>
              {expandedSections.git && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 space-y-1"
                >
                  <button className="flex items-center gap-2 w-full px-2 py-1 text-left text-sm hover:bg-gray-800 rounded transition-colors">
                    <RefreshCw className="w-4 h-4 text-green-400" />
                    <span>Pull</span>
                  </button>
                  <button className="flex items-center gap-2 w-full px-2 py-1 text-left text-sm hover:bg-gray-800 rounded transition-colors">
                    <GitCommit className="w-4 h-4 text-blue-400" />
                    <span>Commit</span>
                  </button>
                  <button className="flex items-center gap-2 w-full px-2 py-1 text-left text-sm hover:bg-gray-800 rounded transition-colors">
                    <GitPullRequest className="w-4 h-4 text-purple-400" />
                    <span>Push</span>
                  </button>
                  <div className="border-t border-gray-700 my-2" />
                  <div className="px-2 py-1 text-xs text-gray-400">
                    <div>Branch: main</div>
                    <div>Status: Clean</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Tools Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('aiTools')}
              className="flex items-center gap-2 w-full text-left font-medium text-gray-300 hover:text-white transition-colors"
            >
              {expandedSections.aiTools ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Sparkles className="w-4 h-4" />
              <span>AI TOOLS</span>
            </button>
            
            <AnimatePresence>
              {expandedSections.aiTools && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 space-y-1"
                >
                  {aiQuickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        className="flex items-center gap-2 w-full px-2 py-1 text-left text-sm hover:bg-gray-800 rounded transition-colors"
                      >
                        <Icon className={`w-4 h-4 ${action.color}`} />
                        <span>{action.name}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="p-3 border-t border-gray-800 bg-gray-950">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>2m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;