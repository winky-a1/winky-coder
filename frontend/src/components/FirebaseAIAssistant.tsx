import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Code,
  Shield,
  Database,
  Cloud,
  Users,
  TestTube,
  GitBranch,
  Rocket,
  Settings,
  FileText,
  Zap,
  Play,
  CheckCircle,
  X,
  ArrowRight,
  Eye,
  Copy,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Terminal,
  Lock,
  Unlock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
  config: {
    firestoreRules: string;
    storageRules: string;
    functions: any[];
  };
}

interface FirebaseAIAssistantProps {
  project: FirebaseProject;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'function' | 'database' | 'deployment' | 'testing' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  costImpact?: string;
  prompt: string;
}

export const FirebaseAIAssistant: React.FC<FirebaseAIAssistantProps> = ({ project }) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [costEstimate, setCostEstimate] = useState('');
  const [riskAssessment, setRiskAssessment] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const suggestions: AISuggestion[] = [
    {
      id: '1',
      title: 'Generate Firestore Security Rules',
      description: 'Create comprehensive security rules for user authentication and data access',
      category: 'security',
      priority: 'high',
      estimatedTime: '5-10 minutes',
      prompt: `Generate Firestore security rules for a social media app with the following requirements:
- Users can only read/write their own profile data
- Posts are publicly readable but only editable by the author
- Admin users can access all data
- Rate limiting for write operations
- Data validation rules`
    },
    {
      id: '2',
      title: 'Create Image Processing Cloud Function',
      description: 'Generate a Cloud Function that processes uploaded images with resizing and optimization',
      category: 'function',
      priority: 'medium',
      estimatedTime: '10-15 minutes',
      costImpact: '$2-5/month for 1000 images',
      prompt: `Create a Cloud Function that:
- Triggers on Storage finalize events
- Resizes images to multiple sizes (thumbnail, medium, large)
- Optimizes image quality and format
- Updates Firestore with image metadata
- Handles errors gracefully
- Includes unit tests`
    },
    {
      id: '3',
      title: 'Set up CI/CD Pipeline',
      description: 'Create GitHub Actions workflow with emulator testing and automated deployment',
      category: 'deployment',
      priority: 'high',
      estimatedTime: '15-20 minutes',
      prompt: `Create a GitHub Actions workflow that:
- Starts Firebase emulators
- Runs security rule tests
- Tests Cloud Functions
- Deploys to staging on PR merge
- Requires approval for production deployment
- Includes cost monitoring`
    },
    {
      id: '4',
      title: 'Database Index Optimization',
      description: 'Analyze query patterns and generate optimal Firestore indexes',
      category: 'database',
      priority: 'medium',
      estimatedTime: '5-8 minutes',
      prompt: `Analyze the following query patterns and generate optimal Firestore indexes:
- Posts by user with date range
- Comments by post with pagination
- User search by name/email
- Analytics queries by date
Include composite indexes and explain the reasoning.`
    },
    {
      id: '5',
      title: 'Authentication Flow Setup',
      description: 'Create comprehensive authentication with multiple providers and user management',
      category: 'security',
      priority: 'high',
      estimatedTime: '10-12 minutes',
      prompt: `Set up Firebase Authentication with:
- Email/password authentication
- Google OAuth integration
- User profile management
- Role-based access control
- Password reset functionality
- Email verification
Include security rules and user data structure.`
    },
    {
      id: '6',
      title: 'Real-time Data Sync',
      description: 'Implement real-time data synchronization with Firestore and client-side caching',
      category: 'database',
      priority: 'medium',
      estimatedTime: '8-12 minutes',
      prompt: `Create a real-time data synchronization system that:
- Uses Firestore real-time listeners
- Implements offline persistence
- Handles conflict resolution
- Optimizes for performance
- Includes error handling
- Provides data validation`
    }
  ];

  const generateWithAI = async (suggestion: AISuggestion) => {
    setIsGenerating(true);
    setSelectedSuggestion(suggestion);
    
    try {
      const response = await fetch('/api/firebase/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: suggestion.prompt,
          projectContext: {
            projectId: project.projectId,
            currentRules: project.config.firestoreRules,
            functions: project.config.functions,
            requirements: {
              security: suggestion.category === 'security',
              performance: suggestion.category === 'optimization',
              testing: true,
              deployment: suggestion.category === 'deployment'
            }
          },
          category: suggestion.category
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedCode(result.code);
        setGeneratedTests(result.tests);
        setCostEstimate(result.costEstimate);
        setRiskAssessment(result.riskAssessment);
        setShowPreview(true);
        toast.success('AI generation completed successfully!');
      } else {
        toast.error('Failed to generate with AI');
      }
    } catch (error) {
      console.error('Error generating with AI:', error);
      toast.error('Error generating with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyChanges = async () => {
    try {
      const response = await fetch('/api/firebase/apply-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          changes: {
            code: generatedCode,
            tests: generatedTests,
            category: selectedSuggestion?.category
          },
          commitMessage: `Apply AI-generated ${selectedSuggestion?.title}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Changes applied successfully!');
        setShowPreview(false);
        setSelectedSuggestion(null);
      } else {
        toast.error('Failed to apply changes');
      }
    } catch (error) {
      console.error('Error applying changes:', error);
      toast.error('Error applying changes');
    }
  };

  const runInEmulator = async () => {
    try {
      const response = await fetch('/api/firebase/emulator-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedCode,
          tests: generatedTests,
          category: selectedSuggestion?.category
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Emulator test completed successfully!');
      } else {
        toast.error('Emulator test failed');
      }
    } catch (error) {
      console.error('Error running emulator test:', error);
      toast.error('Error running emulator test');
    }
  };

  const createPR = async () => {
    try {
      const response = await fetch('/api/firebase/create-ai-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          title: selectedSuggestion?.title,
          description: selectedSuggestion?.description,
          code: generatedCode,
          tests: generatedTests,
          costEstimate,
          riskAssessment
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Pull request created successfully!');
      } else {
        toast.error('Failed to create pull request');
      }
    } catch (error) {
      console.error('Error creating PR:', error);
      toast.error('Error creating PR');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'function': return <Code className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'deployment': return <Rocket className="w-4 h-4" />;
      case 'testing': return <TestTube className="w-4 h-4" />;
      case 'optimization': return <Zap className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <p className="text-slate-400 text-sm">Firebase-specific AI suggestions and code generation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Suggestions */}
        <div className="w-96 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">AI Suggestions</h3>
            
            {/* Custom Prompt */}
            <div className="mb-4">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                className="w-full h-20 p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
              />
              <button
                onClick={() => generateWithAI({
                  id: 'custom',
                  title: 'Custom Request',
                  description: customPrompt,
                  category: 'function',
                  priority: 'medium',
                  estimatedTime: '5-10 minutes',
                  prompt: customPrompt
                })}
                disabled={!customPrompt.trim() || isGenerating}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white text-sm font-medium transition-colors"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Custom'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-slate-700 rounded-lg border border-slate-600 cursor-pointer hover:border-blue-500/50 transition-colors"
                  onClick={() => generateWithAI(suggestion)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(suggestion.category)}
                      <h4 className="text-sm font-medium text-white">{suggestion.title}</h4>
                    </div>
                    <span className={`text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-3">{suggestion.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{suggestion.estimatedTime}</span>
                    {suggestion.costImpact && (
                      <span className="text-green-400">{suggestion.costImpact}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview & Actions */}
        <div className="flex-1 flex flex-col">
          {!showPreview ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Suggestion</h3>
                <p className="text-slate-400">
                  Choose an AI suggestion from the left panel to generate Firebase-specific code and configurations.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Preview Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedSuggestion?.title}</h3>
                    <p className="text-sm text-slate-400">{selectedSuggestion?.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={runInEmulator}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Test in Emulator
                    </button>
                    
                    <button
                      onClick={createPR}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      <GitBranch className="w-4 h-4" />
                      Create PR
                    </button>
                    
                    <button
                      onClick={applyChanges}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Apply Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Generated Code */}
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-slate-700">
                    <h4 className="text-sm font-semibold text-white">Generated Code</h4>
                  </div>
                  <div className="flex-1 p-4">
                    <pre className="w-full h-full bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-auto">
                      {generatedCode}
                    </pre>
                  </div>
                </div>

                {/* Tests & Analysis */}
                <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
                  <div className="p-4 border-b border-slate-700">
                    <h4 className="text-sm font-semibold text-white">Tests & Analysis</h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Generated Tests */}
                    <div>
                      <h5 className="text-xs font-medium text-slate-300 mb-2">Generated Tests</h5>
                      <pre className="w-full bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-auto max-h-32">
                        {generatedTests}
                      </pre>
                    </div>

                    {/* Cost Estimate */}
                    {costEstimate && (
                      <div>
                        <h5 className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Cost Estimate
                        </h5>
                        <div className="p-3 bg-slate-900 rounded text-xs text-green-400">
                          {costEstimate}
                        </div>
                      </div>
                    )}

                    {/* Risk Assessment */}
                    {riskAssessment && (
                      <div>
                        <h5 className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Risk Assessment
                        </h5>
                        <div className="p-3 bg-slate-900 rounded text-xs text-yellow-400">
                          {riskAssessment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};