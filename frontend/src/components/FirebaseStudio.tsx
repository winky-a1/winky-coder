import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Shield,
  Code,
  Cloud,
  Users,
  FileText,
  Play,
  Settings,
  Zap,
  GitBranch,
  Upload,
  Download,
  TestTube,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  FolderOpen,
  Terminal,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  Activity,
  DollarSign,
  BarChart3,
  Rocket,
  Bot,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { FirebaseRulesEditor } from './FirebaseRulesEditor';
import { FirebaseFunctionsEditor } from './FirebaseFunctionsEditor';
import { FirebaseDataExplorer } from './FirebaseDataExplorer';
import { FirebaseStorageUI } from './FirebaseStorageUI';
import { FirebaseAuthUI } from './FirebaseAuthUI';
import { FirebaseEmulators } from './FirebaseEmulators';
import { FirebaseDeploy } from './FirebaseDeploy';
import { FirebaseAIAssistant } from './FirebaseAIAssistant';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
  billingTier: string;
  lastDeploy: string;
  services: {
    firestore: boolean;
    rtdb: boolean;
    storage: boolean;
    functions: boolean;
    hosting: boolean;
    auth: boolean;
  };
  config: {
    firebaseJson: any;
    firestoreRules: string;
    storageRules: string;
    functions: any[];
    indexes: any[];
  };
}

interface FirebaseStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStudio: React.FC<FirebaseStudioProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'functions' | 'database' | 'storage' | 'auth' | 'emulators' | 'deploy' | 'ai'>('overview');
  const [project, setProject] = useState<FirebaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emulatorStatus, setEmulatorStatus] = useState({
    firestore: false,
    rtdb: false,
    storage: false,
    functions: false,
    hosting: false,
    auth: false
  });

  const tabs = [
    { id: 'overview', name: 'Project Overview', icon: <Database className="w-4 h-4" /> },
    { id: 'rules', name: 'Security Rules', icon: <Shield className="w-4 h-4" /> },
    { id: 'functions', name: 'Cloud Functions', icon: <Code className="w-4 h-4" /> },
    { id: 'database', name: 'Database', icon: <Database className="w-4 h-4" /> },
    { id: 'storage', name: 'Storage', icon: <Cloud className="w-4 h-4" /> },
    { id: 'auth', name: 'Authentication', icon: <Users className="w-4 h-4" /> },
    { id: 'emulators', name: 'Emulators', icon: <TestTube className="w-4 h-4" /> },
    { id: 'deploy', name: 'Deployments', icon: <Rocket className="w-4 h-4" /> },
    { id: 'ai', name: 'AI Assistant', icon: <Bot className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (isOpen) {
      detectFirebaseProject();
    }
  }, [isOpen]);

  const detectFirebaseProject = async () => {
    setIsLoading(true);
    try {
      // This would detect Firebase project files
      const mockProject: FirebaseProject = {
        id: 'winky-coder-app',
        name: 'Winky Coder App',
        projectId: 'winky-coder-app-12345',
        billingTier: 'Blaze (Pay as you go)',
        lastDeploy: '2024-01-15T10:30:00Z',
        services: {
          firestore: true,
          rtdb: false,
          storage: true,
          functions: true,
          hosting: true,
          auth: true
        },
        config: {
          firebaseJson: {
            firestore: { rules: 'firestore.rules', indexes: 'firestore.indexes.json' },
            storage: { rules: 'storage.rules' },
            functions: { source: 'functions' },
            hosting: { public: 'public', ignore: ['firebase.json', '**/.*', '**/node_modules/**'] }
          },
          firestoreRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`,
          storageRules: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`,
          functions: [],
          indexes: []
        }
      };
      setProject(mockProject);
    } catch (error) {
      console.error('Failed to detect Firebase project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEmulators = async (services: string[] = []) => {
    try {
      // This would start Firebase emulators
      const newStatus = { ...emulatorStatus };
      services.forEach(service => {
        if (service in newStatus) {
          newStatus[service as keyof typeof newStatus] = true;
        }
      });
      setEmulatorStatus(newStatus);
    } catch (error) {
      console.error('Failed to start emulators:', error);
    }
  };

  const stopEmulators = async () => {
    try {
      // This would stop all emulators
      setEmulatorStatus({
        firestore: false,
        rtdb: false,
        storage: false,
        functions: false,
        hosting: false,
        auth: false
      });
    } catch (error) {
      console.error('Failed to stop emulators:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Database className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Firebase Studio</h2>
              <p className="text-slate-400 text-sm">
                {project ? `${project.name} (${project.projectId})` : 'No Firebase project detected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Emulator Status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${Object.values(emulatorStatus).some(Boolean) ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-slate-300">
                {Object.values(emulatorStatus).some(Boolean) ? 'Emulators Running' : 'Emulators Stopped'}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            {/* Project Info */}
            {project && (
              <div className="p-4 border-b border-slate-700">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Billing</span>
                    <span className="text-xs text-green-400">{project.billingTier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Last Deploy</span>
                    <span className="text-xs text-slate-300">
                      {new Date(project.lastDeploy).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav className="flex-1 p-2">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-slate-700">
              <div className="space-y-2">
                <button
                  onClick={() => startEmulators(['firestore', 'functions', 'auth'])}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Emulators
                </button>
                <button
                  onClick={stopEmulators}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Stop Emulators
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Detecting Firebase project...</p>
                </div>
              </div>
            ) : !project ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Firebase Project Found</h3>
                  <p className="text-slate-400 mb-4">
                    Create a new Firebase project or open an existing one to get started.
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors mx-auto">
                    <Plus className="w-4 h-4" />
                    Create Firebase Project
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 overflow-hidden"
                >
                  {activeTab === 'overview' && (
                    <FirebaseOverview project={project} emulatorStatus={emulatorStatus} />
                  )}
                  {activeTab === 'rules' && (
                    <FirebaseRulesEditor project={project} />
                  )}
                  {activeTab === 'functions' && (
                    <FirebaseFunctionsEditor project={project} />
                  )}
                  {activeTab === 'database' && (
                    <FirebaseDataExplorer project={project} />
                  )}
                  {activeTab === 'storage' && (
                    <FirebaseStorageUI project={project} />
                  )}
                  {activeTab === 'auth' && (
                    <FirebaseAuthUI project={project} />
                  )}
                  {activeTab === 'emulators' && (
                    <FirebaseEmulators 
                      emulatorStatus={emulatorStatus}
                      onStartEmulators={startEmulators}
                      onStopEmulators={stopEmulators}
                    />
                  )}
                  {activeTab === 'deploy' && (
                    <FirebaseDeploy project={project} />
                  )}
                  {activeTab === 'ai' && (
                    <FirebaseAIAssistant project={project} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Firebase Overview Component
const FirebaseOverview: React.FC<{ project: FirebaseProject; emulatorStatus: any }> = ({ project, emulatorStatus }) => {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Services Active</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.values(project.services).filter(Boolean).length}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">Billing Tier</span>
            </div>
            <div className="text-sm font-medium text-white">{project.billingTier}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Last Deploy</span>
            </div>
            <div className="text-sm font-medium text-white">
              {new Date(project.lastDeploy).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Services Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(project.services).map(([service, enabled]) => (
              <div key={service} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-slate-300 capitalize">{service}</span>
                {emulatorStatus[service] && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
              <Code className="w-4 h-4" />
              Create Function
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors">
              <Shield className="w-4 h-4" />
              Generate Rules
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors">
              <Database className="w-4 h-4" />
              Create Index
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm font-medium transition-colors">
              <Rocket className="w-4 h-4" />
              Deploy to Staging
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Generate Firestore security rules for user authentication</p>
                <p className="text-xs text-slate-400">Based on your current project structure</p>
              </div>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors">
                Generate
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Create Cloud Function for image processing</p>
                <p className="text-xs text-slate-400">Optimize uploaded images automatically</p>
              </div>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors">
                Generate
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Set up CI/CD pipeline with emulator tests</p>
                <p className="text-xs text-slate-400">Automate testing and deployment</p>
              </div>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};