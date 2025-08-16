import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Shield,
  Play,
  TestTube,
  Bot,
  Sparkles,
  CheckCircle,
  X,
  AlertTriangle,
  GitBranch,
  Save,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  FileText,
  Settings,
  Zap,
  ArrowRight,
  Copy,
  Download,
  Upload,
  Database,
  Cloud
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
  config: {
    firestoreRules: string;
    storageRules: string;
  };
}

interface RulesTest {
  id: string;
  name: string;
  description: string;
  request: {
    method: 'get' | 'list' | 'create' | 'update' | 'delete';
    path: string;
    auth: any;
    data?: any;
  };
  expected: {
    allow: boolean;
    reason?: string;
  };
  result?: {
    allow: boolean;
    reason?: string;
    passed: boolean;
  };
}

interface FirebaseRulesEditorProps {
  project: FirebaseProject;
}

export const FirebaseRulesEditor: React.FC<FirebaseRulesEditorProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'firestore' | 'storage'>('firestore');
  const [firestoreRules, setFirestoreRules] = useState(project.config.firestoreRules);
  const [storageRules, setStorageRules] = useState(project.config.storageRules);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [tests, setTests] = useState<RulesTest[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const tabs = [
    { id: 'firestore', name: 'Firestore Rules', icon: <Database className="w-4 h-4" /> },
    { id: 'storage', name: 'Storage Rules', icon: <Cloud className="w-4 h-4" /> }
  ];

  const defaultTests: RulesTest[] = [
    {
      id: '1',
      name: 'Authenticated User Read',
      description: 'Test if authenticated users can read their own documents',
      request: {
        method: 'get',
        path: '/users/{uid}/profile',
        auth: { uid: 'user123', email: 'user@example.com' }
      },
      expected: { allow: true }
    },
    {
      id: '2',
      name: 'Unauthenticated Access Denied',
      description: 'Test if unauthenticated users are denied access',
      request: {
        method: 'get',
        path: '/users/{uid}/profile',
        auth: null
      },
      expected: { allow: false }
    },
    {
      id: '3',
      name: 'Admin Write Access',
      description: 'Test if admin users can write to admin collections',
      request: {
        method: 'create',
        path: '/admin/settings',
        auth: { uid: 'admin123', email: 'admin@example.com', role: 'admin' },
        data: { setting: 'value' }
      },
      expected: { allow: true }
    }
  ];

  useEffect(() => {
    setTests(defaultTests);
  }, []);

  const generateRulesWithAI = async (prompt: string) => {
    setIsGenerating(true);
    try {
      // This would call the AI service to generate rules
      const response = await fetch('/api/firebase/generate-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentRules: activeTab === 'firestore' ? firestoreRules : storageRules,
          projectSnapshot: {
            collections: ['users', 'posts', 'admin'],
            authProviders: ['email', 'google'],
            securityRequirements: ['user-owned documents', 'admin access', 'public read']
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        if (activeTab === 'firestore') {
          setFirestoreRules(result.rules);
        } else {
          setStorageRules(result.rules);
        }
        
        // Generate tests for the new rules
        const generatedTests = await generateTestsForRules(result.rules);
        setTests(generatedTests);
        
        toast.success('Rules generated successfully!');
      } else {
        toast.error('Failed to generate rules');
      }
    } catch (error) {
      console.error('Error generating rules:', error);
      toast.error('Error generating rules');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTestsForRules = async (rules: string): Promise<RulesTest[]> => {
    try {
      const response = await fetch('/api/firebase/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, type: activeTab })
      });

      const result = await response.json();
      return result.tests || defaultTests;
    } catch (error) {
      console.error('Error generating tests:', error);
      return defaultTests;
    }
  };

  const runTests = async () => {
    setIsTesting(true);
    try {
      const rules = activeTab === 'firestore' ? firestoreRules : storageRules;
      
      const response = await fetch('/api/firebase/test-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules,
          tests,
          type: activeTab
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(result.results);
        toast.success(`Tests completed: ${result.results.filter((r: any) => r.passed).length}/${result.results.length} passed`);
      } else {
        toast.error('Failed to run tests');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Error running tests');
    } finally {
      setIsTesting(false);
    }
  };

  const saveRules = async () => {
    try {
      const response = await fetch('/api/firebase/save-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          firestoreRules,
          storageRules
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Rules saved successfully!');
      } else {
        toast.error('Failed to save rules');
      }
    } catch (error) {
      console.error('Error saving rules:', error);
      toast.error('Error saving rules');
    }
  };

  const createBranchAndPR = async () => {
    try {
      const response = await fetch('/api/firebase/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          changes: {
            firestoreRules,
            storageRules
          },
          testResults,
          commitMessage: `Update ${activeTab} security rules with AI assistance`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Branch and PR created successfully!');
      } else {
        toast.error('Failed to create PR');
      }
    } catch (error) {
      console.error('Error creating PR:', error);
      toast.error('Error creating PR');
    }
  };

  const getAISuggestions = async () => {
    try {
      const response = await fetch('/api/firebase/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRules: activeTab === 'firestore' ? firestoreRules : storageRules,
          projectContext: {
            collections: ['users', 'posts', 'admin'],
            authProviders: ['email', 'google']
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'firestore' | 'storage')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <Bot className="w-4 h-4" />
            Ask AI
          </button>
          
          <button
            onClick={runTests}
            disabled={isTesting}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            {isTesting ? 'Running Tests...' : 'Run Tests'}
          </button>
          
          <button
            onClick={saveRules}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={activeTab === 'firestore' ? firestoreRules : storageRules}
              onChange={(value) => {
                if (activeTab === 'firestore') {
                  setFirestoreRules(value || '');
                } else {
                  setStorageRules(value || '');
                }
              }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                wordWrap: 'on',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                lightbulb: { enabled: true }
              }}
            />
          </div>
        </div>

        {/* Right Panel - Tests & AI */}
        <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* AI Panel */}
          {showAIPanel && (
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the security rules you want to generate..."
                className="w-full h-20 p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
              />
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => generateRulesWithAI(aiPrompt)}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white text-sm font-medium transition-colors"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Rules'}
                </button>
                
                <button
                  onClick={getAISuggestions}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-slate-300 mb-2">Suggestions:</h4>
                  <div className="space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setAiPrompt(suggestion)}
                        className="w-full text-left p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tests Panel */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Security Tests
                </h3>
                <button
                  onClick={runTests}
                  disabled={isTesting}
                  className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {tests.map((test) => {
                  const result = testResults.find((r: any) => r.testId === test.id);
                  return (
                    <div
                      key={test.id}
                      className="p-3 bg-slate-700 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">{test.name}</h4>
                        {result && (
                          <div className={`flex items-center gap-1 ${
                            result.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-2">{test.description}</p>
                      
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Method:</span>
                          <span className="text-slate-300">{test.request.method}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Path:</span>
                          <span className="text-slate-300 font-mono">{test.request.path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Expected:</span>
                          <span className={`${test.expected.allow ? 'text-green-400' : 'text-red-400'}`}>
                            {test.expected.allow ? 'Allow' : 'Deny'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-slate-700">
              <div className="space-y-2">
                <button
                  onClick={createBranchAndPR}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  Create Branch & PR
                </button>
                
                <button
                  onClick={() => {/* Deploy to staging */}}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Deploy to Staging
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};