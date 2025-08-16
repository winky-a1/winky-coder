/**
 * Winky Coder - Production-Ready AI-Powered IDE
 * 
 * Main application component with 4-zone layout:
 * 1. Left Sidebar (Project Explorer + Git + AI Tools)
 * 2. Center Editor (Monaco Editor with tabs)
 * 3. Right Sidebar (AI Assistant Chat)
 * 4. Bottom Panel (Console/Terminal)
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Play, Save, GitBranch, Settings, User, Zap,
  FileText, Folder, Search, MessageSquare, Terminal,
  Code, Database, Sparkles, Bot, X, Maximize2, Minimize2
} from 'lucide-react';

// Core Components
import LeftSidebar from './components/layout/LeftSidebar';
import CenterEditor from './components/layout/CenterEditor';
import RightSidebar from './components/layout/RightSidebar';
import BottomPanel from './components/layout/BottomPanel';
import TopNavigation from './components/layout/TopNavigation';

// Context Providers
import { EditorProvider } from './contexts/EditorContext';
import { AIContextProvider } from './contexts/AIContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TerminalProvider } from './contexts/TerminalContext';

// Types
interface LayoutState {
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  bottomPanelHeight: number;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  bottomPanelCollapsed: boolean;
}

const App: React.FC = () => {
  // Layout state
  const [layout, setLayout] = useState<LayoutState>({
    leftSidebarWidth: 280,
    rightSidebarWidth: 400,
    bottomPanelHeight: 300,
    leftSidebarCollapsed: false,
    rightSidebarCollapsed: false,
    bottomPanelCollapsed: false
  });

  // Active states
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState('gpt-4');
  const [isAiRunning, setIsAiRunning] = useState(false);

  // Resize handlers
  const handleLeftSidebarResize = useCallback((newWidth: number) => {
    setLayout(prev => ({
      ...prev,
      leftSidebarWidth: Math.max(200, Math.min(500, newWidth))
    }));
  }, []);

  const handleRightSidebarResize = useCallback((newWidth: number) => {
    setLayout(prev => ({
      ...prev,
      rightSidebarWidth: Math.max(300, Math.min(600, newWidth))
    }));
  }, []);

  const handleBottomPanelResize = useCallback((newHeight: number) => {
    setLayout(prev => ({
      ...prev,
      bottomPanelHeight: Math.max(200, Math.min(500, newHeight))
    }));
  }, []);

  // Toggle handlers
  const toggleLeftSidebar = useCallback(() => {
    setLayout(prev => ({
      ...prev,
      leftSidebarCollapsed: !prev.leftSidebarCollapsed
    }));
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setLayout(prev => ({
      ...prev,
      rightSidebarCollapsed: !prev.rightSidebarCollapsed
    }));
  }, []);

  const toggleBottomPanel = useCallback(() => {
    setLayout(prev => ({
      ...prev,
      bottomPanelCollapsed: !prev.bottomPanelCollapsed
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save
        console.log('Save triggered');
      }

      // Ctrl/Cmd + Enter = Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Trigger run
        console.log('Run triggered');
      }

      // Ctrl/Cmd + B = Toggle left sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      }

      // Ctrl/Cmd + J = Toggle bottom panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        toggleBottomPanel();
      }

      // Ctrl/Cmd + K = Toggle right sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleRightSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar, toggleBottomPanel]);

  // Calculate dynamic layout
  const leftSidebarWidth = layout.leftSidebarCollapsed ? 0 : layout.leftSidebarWidth;
  const rightSidebarWidth = layout.rightSidebarCollapsed ? 0 : layout.rightSidebarWidth;
  const bottomPanelHeight = layout.bottomPanelCollapsed ? 0 : layout.bottomPanelHeight;

  return (
    <ProjectProvider>
      <EditorProvider>
        <AIContextProvider>
          <TerminalProvider>
            <div className="h-screen w-screen bg-black text-white overflow-hidden font-mono">
              {/* Top Navigation */}
              <TopNavigation 
                aiModel={aiModel}
                setAiModel={setAiModel}
                isAiRunning={isAiRunning}
                setIsAiRunning={setIsAiRunning}
              />

              {/* Main Layout Container */}
              <div className="flex h-[calc(100vh-64px)]">
                {/* Left Sidebar */}
                <AnimatePresence>
                  {!layout.leftSidebarCollapsed && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: leftSidebarWidth, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="relative bg-gray-900 border-r border-gray-800"
                    >
                      <LeftSidebar 
                        activeFile={activeFile}
                        setActiveFile={setActiveFile}
                        openFiles={openFiles}
                        setOpenFiles={setOpenFiles}
                      />
                      
                      {/* Resize Handle */}
                      <div
                        className="absolute right-0 top-0 w-1 h-full bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startWidth = layout.leftSidebarWidth;
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaX = e.clientX - startX;
                            handleLeftSidebarResize(startWidth + deltaX);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Center Editor */}
                <div className="flex-1 flex flex-col bg-gray-950">
                  <CenterEditor 
                    activeFile={activeFile}
                    openFiles={openFiles}
                    setOpenFiles={setOpenFiles}
                    setActiveFile={setActiveFile}
                  />
                  
                  {/* Bottom Panel */}
                  <AnimatePresence>
                    {!layout.bottomPanelCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: bottomPanelHeight, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="relative border-t border-gray-800"
                      >
                        <BottomPanel />
                        
                        {/* Resize Handle */}
                        <div
                          className="absolute top-0 left-0 w-full h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const startY = e.clientY;
                            const startHeight = layout.bottomPanelHeight;
                            
                            const handleMouseMove = (e: MouseEvent) => {
                              const deltaY = startY - e.clientY;
                              handleBottomPanelResize(startHeight + deltaY);
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Sidebar */}
                <AnimatePresence>
                  {!layout.rightSidebarCollapsed && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: rightSidebarWidth, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="relative bg-gray-900 border-l border-gray-800"
                    >
                      <RightSidebar 
                        aiModel={aiModel}
                        isAiRunning={isAiRunning}
                      />
                      
                      {/* Resize Handle */}
                      <div
                        className="absolute left-0 top-0 w-1 h-full bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startWidth = layout.rightSidebarWidth;
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaX = startX - e.clientX;
                            handleRightSidebarResize(startWidth + deltaX);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Toggle Buttons */}
              <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLeftSidebar}
                  className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Toggle Left Sidebar (Ctrl+B)"
                >
                  {layout.leftSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleBottomPanel}
                  className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Toggle Bottom Panel (Ctrl+J)"
                >
                  {layout.bottomPanelCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </motion.button>
              </div>

              <div className="fixed bottom-4 right-4 z-50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleRightSidebar}
                  className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Toggle Right Sidebar (Ctrl+K)"
                >
                  {layout.rightSidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </motion.button>
              </div>

              {/* Context Usage Bar (500k Token System) */}
              <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40">
                <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-400" />
                      <span className="text-gray-300">Context Usage:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                          style={{ width: '65%' }}
                        />
                      </div>
                      <span className="text-gray-300 font-mono">325,420 / 500,000</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>Full chunks: 298,000</span>
                      <span>•</span>
                      <span>Summaries: 27,420</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TerminalProvider>
        </AIContextProvider>
      </EditorProvider>
    </ProjectProvider>
  );
};

export default App;