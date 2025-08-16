import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Database, 
  Server, 
  Globe, 
  Smartphone, 
  Zap, 
  Play, 
  Download,
  Eye,
  Settings,
  FileText,
  GitBranch,
  Shield,
  Cloud,
  Monitor,
  Smartphone as Mobile,
  Palette,
  Users,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Calendar,
  MapPin,
  Camera,
  Music,
  Video,
  Gamepad2,
  BookOpen,
  GraduationCap,
  Briefcase,
  Heart,
  Star,
  TrendingUp,
  Target,
  Rocket,
  CheckCircle,
  ArrowRight,
  Plus,
  X,
  Terminal as TerminalIcon,
  FolderOpen,
  Wrench,
  Palette as DesignIcon
} from 'lucide-react';
import { Terminal } from './components/Terminal';
import { ProjectTemplates } from './components/ProjectTemplates';
import { FullStackBuilder } from './components/FullStackBuilder';
import { FirebaseStudio } from './components/FirebaseStudio';

export default function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isProjectTemplatesOpen, setIsProjectTemplatesOpen] = useState(false);
  const [isFullStackBuilderOpen, setIsFullStackBuilderOpen] = useState(false);
  const [isFirebaseStudioOpen, setIsFirebaseStudioOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'editor' | 'builder' | 'templates' | 'firebase'>('editor');

  const handleBuildApp = (template: any) => {
    console.log('Building app with template:', template);
    // This would trigger the full-stack builder
    setIsFullStackBuilderOpen(true);
  };

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">Winky-Coder</h1>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">v2.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'editor' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Code className="w-4 h-4" />
              Editor
            </button>
            
            <button
              onClick={() => setCurrentView('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'builder' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Full-Stack Builder
            </button>
            
                                    <button
                          onClick={() => setCurrentView('templates')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            currentView === 'templates'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          <FolderOpen className="w-4 h-4" />
                          Templates
                        </button>

                        <button
                          onClick={() => setCurrentView('firebase')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            currentView === 'firebase'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          <Database className="w-4 h-4" />
                          Firebase Studio
                        </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTerminal}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Terminal"
            >
              <TerminalIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsProjectTemplatesOpen(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Project Templates"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            
                                    <button
                          onClick={() => setIsFullStackBuilderOpen(true)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                          title="Full-Stack Builder"
                        >
                          <Rocket className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setIsFirebaseStudioOpen(true)}
                          className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                          title="Firebase Studio"
                        >
                          <Database className="w-4 h-4" />
                        </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {currentView === 'editor' && (
          <div className="flex-1 flex flex-col">
            {/* Editor Toolbar */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-3">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors">
                  <Play className="w-4 h-4" />
                  Run
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Save
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors">
                  <GitBranch className="w-4 h-4" />
                  Commit
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-slate-900 p-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold">Code Editor</h2>
                </div>
                <p className="text-slate-400">
                  Welcome to Winky-Coder! Use the Full-Stack Builder to create complete applications from scratch.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'builder' && (
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Full-Stack App Builder</h1>
                <p className="text-slate-400 text-lg">
                  Build complete applications from frontend to backend in minutes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Start Cards */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setIsFullStackBuilderOpen(true)}
                >
                  <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">E-commerce Store</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Complete online store with payment processing, inventory management, and admin dashboard
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">Free</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                      Build Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setIsFullStackBuilderOpen(true)}
                >
                  <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Social Network</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Full-featured social platform with posts, comments, likes, and real-time chat
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">Free</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                      Build Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setIsFullStackBuilderOpen(true)}
                >
                  <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">CRM System</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Customer relationship management with leads, deals, and analytics dashboard
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">Free</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                      Build Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setIsFullStackBuilderOpen(true)}
                >
                  <div className="p-3 bg-yellow-500/20 rounded-lg w-fit mb-4">
                    <GraduationCap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Learning Platform</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Online education platform with courses, quizzes, and certificates
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">Free</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                      Build Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setIsFullStackBuilderOpen(true)}
                >
                  <div className="p-3 bg-red-500/20 rounded-lg w-fit mb-4">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Dating App</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Modern dating platform with matching algorithm, chat, and video calls
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">Free</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                      Build Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setIsFullStackBuilderOpen(true)}
                >
                  <div className="p-3 bg-indigo-500/20 rounded-lg w-fit mb-4">
                    <Music className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Music Streaming</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Spotify-like music streaming platform with playlists and recommendations
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">Free</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                      Build Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => setIsFullStackBuilderOpen(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all transform hover:scale-105 mx-auto"
                >
                  <Rocket className="w-5 h-5" />
                  View All 50+ Templates
                </button>
              </div>
            </div>
          </div>
        )}

                            {currentView === 'templates' && (
                      <div className="flex-1 p-6">
                        <div className="max-w-6xl mx-auto">
                          <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Project Templates</h1>
                            <p className="text-slate-400 text-lg">
                              Choose from 50+ pre-built templates to jumpstart your development
                            </p>
                          </div>

                          <ProjectTemplates
                            isOpen={true}
                            onClose={() => setCurrentView('editor')}
                            onCreateProject={handleBuildApp}
                          />
                        </div>
                      </div>
                    )}

                    {currentView === 'firebase' && (
                      <div className="flex-1 p-6">
                        <div className="max-w-6xl mx-auto">
                          <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Firebase Studio</h1>
                            <p className="text-slate-400 text-lg">
                              AI-powered Firebase development with emulator testing and deployment
                            </p>
                          </div>

                          <FirebaseStudio
                            isOpen={true}
                            onClose={() => setCurrentView('editor')}
                          />
                        </div>
                      </div>
                    )}
      </main>

      {/* Modals */}
                        <FullStackBuilder
                    isOpen={isFullStackBuilderOpen}
                    onClose={() => setIsFullStackBuilderOpen(false)}
                    onBuildApp={handleBuildApp}
                  />

                  <FirebaseStudio
                    isOpen={isFirebaseStudioOpen}
                    onClose={() => setIsFirebaseStudioOpen(false)}
                  />

      <ProjectTemplates
        isOpen={isProjectTemplatesOpen}
        onClose={() => setIsProjectTemplatesOpen(false)}
        onCreateProject={handleBuildApp}
      />

      <Terminal
        isOpen={isTerminalOpen}
        onToggle={toggleTerminal}
        repoPath={undefined}
      />
    </div>
  );
}