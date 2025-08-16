/**
 * Top Navigation Bar Component
 * 
 * Contains logo, file menu, AI controls, and profile menu
 * Styled like Firebase Studio + Cursor with Winky Coder branding
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, FileText, FolderOpen, Save, Download, 
  GitBranch, Settings, User, Bot, Play, 
  ChevronDown, Plus, Search, Sparkles,
  Code, Database, Terminal, Globe
} from 'lucide-react';

interface TopNavigationProps {
  aiModel: string;
  setAiModel: (model: string) => void;
  isAiRunning: boolean;
  setIsAiRunning: (running: boolean) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  aiModel,
  setAiModel,
  isAiRunning,
  setIsAiRunning
}) => {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' }
  ];

  const handleNewFile = () => {
    console.log('New file');
    setShowFileMenu(false);
  };

  const handleOpenFile = () => {
    console.log('Open file');
    setShowFileMenu(false);
  };

  const handleImportRepo = () => {
    console.log('Import Git repo');
    setShowFileMenu(false);
  };

  const handleSave = () => {
    console.log('Save');
  };

  const handleRunAgent = () => {
    setIsAiRunning(!isAiRunning);
  };

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      {/* Left Section - Logo & App Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Winky Coder
            </h1>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-mono">
              v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Center Section - File Menu */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>File</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showFileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-2">
                  <button
                    onClick={handleNewFile}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New File</span>
                  </button>
                  <button
                    onClick={handleOpenFile}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Open File</span>
                  </button>
                  <button
                    onClick={handleImportRepo}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Import Git Repository</span>
                  </button>
                  <div className="border-t border-gray-700 my-2" />
                  <button
                    onClick={handleSave}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                    <span className="ml-auto text-xs text-gray-400">Ctrl+S</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            title="Run (Ctrl+Enter)"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Run</span>
          </motion.button>
        </div>
      </div>

      {/* Right Section - AI Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* AI Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAiMenu(!showAiMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-sm">{aiModels.find(m => m.id === aiModel)?.name}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showAiMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700 mb-2">
                    AI Models
                  </div>
                  {aiModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setAiModel(model.id);
                        setShowAiMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors ${
                        aiModel === model.id ? 'bg-blue-600/20 text-blue-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-sm">{model.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{model.provider}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Agent Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunAgent}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isAiRunning 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            title={isAiRunning ? 'Stop AI Agent' : 'Start AI Agent'}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isAiRunning ? 'Stop Agent' : 'Run Agent'}
            </span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files, docs, or ask AI..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors w-64"
          />
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <div className="text-sm font-medium">Winky Developer</div>
                    <div className="text-xs text-gray-400">winky@coder.com</div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors">
                      <Code className="w-4 h-4" />
                      <span className="text-sm">API Keys</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors">
                      <Database className="w-4 h-4" />
                      <span className="text-sm">Projects</span>
                    </button>
                    <div className="border-t border-gray-700 my-2" />
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-md transition-colors text-red-400">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showFileMenu || showAiMenu || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFileMenu(false);
            setShowAiMenu(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default TopNavigation;