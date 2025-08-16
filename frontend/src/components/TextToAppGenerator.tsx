import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Code,
  Database,
  Cloud,
  Users,
  FileText,
  Play,
  GitBranch,
  Save,
  Eye,
  Settings,
  Zap,
  ArrowRight,
  Copy,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  X,
  Plus,
  FolderOpen,
  Terminal,
  Lock,
  Unlock,
  Activity,
  DollarSign,
  BarChart3,
  Rocket,
  TestTube,
  AlertTriangle,
  Clock,
  Palette,
  Smartphone,
  Globe,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppPlan {
  id: string;
  name: string;
  description: string;
  screens: AppScreen[];
  models: DataModel[];
  apis: API[];
  functions: CloudFunction[];
  dependencies: string[];
  tests: Test[];
  costEstimate: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
}

interface AppScreen {
  id: string;
  name: string;
  description: string;
  components: string[];
  wireframe: string;
}

interface DataModel {
  id: string;
  name: string;
  fields: ModelField[];
  indexes: string[];
  rules: string[];
}

interface ModelField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface API {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  auth: boolean;
}

interface CloudFunction {
  id: string;
  name: string;
  trigger: string;
  description: string;
  runtime: string;
}

interface Test {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  description: string;
}

interface TextToAppGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onAppCreated: (appId: string) => void;
}

export const TextToAppGenerator: React.FC<TextToAppGeneratorProps> = ({
  isOpen,
  onClose,
  onAppCreated
}) => {
  const [step, setStep] = useState<'input' | 'plan' | 'preview' | 'generate' | 'test' | 'commit'>('input');
  const [prompt, setPrompt] = useState('');
  const [appPlan, setAppPlan] = useState<AppPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({
    backend: 'our-runtime',
    auth: 'email',
    persistence: 'persistent',
    styling: 'tailwind',
    deployment: 'local'
  });

  const examplePrompts = [
    "A notes app with email login, markdown editor, tags filter, and images. Home screen shows notes list, tapping opens editor. Notes are private by default and can be shared via public link.",
    "A tiny e-commerce prototype: product list, product page, cart, checkout with mock payment, admin-only product create.",
    "A chat app with username-based login, public rooms, messages saved in DB, and simple push-notification placeholder.",
    "A recipe app with login, add recipes with photos, categories, and search functionality.",
    "A task management app with teams, projects, kanban boards, and real-time collaboration."
  ];

  const generateAppPlan = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the app you want to create');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/text-to-app/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          options: selectedOptions
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAppPlan(result.plan);
        setStep('plan');
        toast.success('App plan generated successfully!');
      } else {
        toast.error('Failed to generate app plan');
      }
    } catch (error) {
      console.error('Error generating app plan:', error);
      toast.error('Error generating app plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateApp = async () => {
    if (!appPlan) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/text-to-app/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: appPlan,
          options: selectedOptions
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedFiles(result.files);
        setStep('generate');
        toast.success('App generated successfully!');
      } else {
        toast.error('Failed to generate app');
      }
    } catch (error) {
      console.error('Error generating app:', error);
      toast.error('Error generating app');
    } finally {
      setIsGenerating(false);
    }
  };

  const testApp = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/text-to-app/test-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: generatedFiles,
          plan: appPlan
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(result.results);
        setPreviewUrl(result.previewUrl);
        setStep('test');
        toast.success('App tested successfully!');
      } else {
        toast.error('Failed to test app');
      }
    } catch (error) {
      console.error('Error testing app:', error);
      toast.error('Error testing app');
    } finally {
      setIsTesting(false);
    }
  };

  const commitApp = async () => {
    try {
      const response = await fetch('/api/text-to-app/commit-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: appPlan,
          files: generatedFiles,
          testResults,
          options: selectedOptions
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('App committed successfully!');
        onAppCreated(result.appId);
        onClose();
      } else {
        toast.error('Failed to commit app');
      }
    } catch (error) {
      console.error('Error committing app:', error);
      toast.error('Error committing app');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'complex': return 'text-red-400';
      default: return 'text-slate-400';
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
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Text-to-App Generator</h2>
              <p className="text-slate-400 text-sm">
                Describe your app in plain English and get a working prototype
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input & Plan */}
          <div className="w-96 bg-slate-800 border-r border-slate-700 flex flex-col">
            {/* Step Indicator */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className={`${step === 'input' ? 'text-blue-400' : ''}`}>1. Describe</span>
                <span className={`${step === 'plan' ? 'text-blue-400' : ''}`}>2. Plan</span>
                <span className={`${step === 'preview' ? 'text-blue-400' : ''}`}>3. Preview</span>
                <span className={`${step === 'generate' ? 'text-blue-400' : ''}`}>4. Generate</span>
                <span className={`${step === 'test' ? 'text-blue-400' : ''}`}>5. Test</span>
                <span className={`${step === 'commit' ? 'text-blue-400' : ''}`}>6. Commit</span>
              </div>
            </div>

            {/* Input Step */}
            {step === 'input' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Describe Your App
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: A notes app with email login, markdown editor, tags, and images. Home screen shows notes list, tapping opens editor. Notes are private by default and can be shared via public link."
                      className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Quick Examples
                    </label>
                    <div className="space-y-2">
                      {examplePrompts.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setPrompt(example)}
                          className="w-full text-left p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                        >
                          {example.substring(0, 80)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Options
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Backend</label>
                        <select
                          value={selectedOptions.backend}
                          onChange={(e) => setSelectedOptions({...selectedOptions, backend: e.target.value})}
                          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        >
                          <option value="our-runtime">Our Runtime (Recommended)</option>
                          <option value="firebase-adapter">Firebase Adapter</option>
                          <option value="aws-adapter">AWS Adapter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Authentication</label>
                        <select
                          value={selectedOptions.auth}
                          onChange={(e) => setSelectedOptions({...selectedOptions, auth: e.target.value})}
                          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        >
                          <option value="email">Email/Password</option>
                          <option value="google">Google OAuth</option>
                          <option value="none">No Auth</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Styling</label>
                        <select
                          value={selectedOptions.styling}
                          onChange={(e) => setSelectedOptions({...selectedOptions, styling: e.target.value})}
                          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        >
                          <option value="tailwind">Tailwind CSS</option>
                          <option value="material">Material UI</option>
                          <option value="basic">Basic CSS</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateAppPlan}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 rounded-lg text-white font-medium transition-colors"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Generating Plan...' : 'Generate App Plan'}
                  </button>
                </div>
              </div>
            )}

            {/* Plan Step */}
            {step === 'plan' && appPlan && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{appPlan.name}</h3>
                    <p className="text-sm text-slate-300 mb-3">{appPlan.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`${getComplexityColor(appPlan.complexity)}`}>
                        {appPlan.complexity} complexity
                      </span>
                      <span className="text-slate-400">{appPlan.estimatedTime}</span>
                      <span className="text-green-400">{appPlan.costEstimate}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Screens</h4>
                    <div className="space-y-2">
                      {appPlan.screens.map((screen) => (
                        <div key={screen.id} className="p-2 bg-slate-700 rounded text-xs">
                          <div className="font-medium text-white">{screen.name}</div>
                          <div className="text-slate-400">{screen.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Data Models</h4>
                    <div className="space-y-2">
                      {appPlan.models.map((model) => (
                        <div key={model.id} className="p-2 bg-slate-700 rounded text-xs">
                          <div className="font-medium text-white">{model.name}</div>
                          <div className="text-slate-400">
                            {model.fields.map(f => f.name).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Functions</h4>
                    <div className="space-y-2">
                      {appPlan.functions.map((func) => (
                        <div key={func.id} className="p-2 bg-slate-700 rounded text-xs">
                          <div className="font-medium text-white">{func.name}</div>
                          <div className="text-slate-400">{func.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('input')}
                      className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('preview')}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {step === 'preview' && appPlan && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">App Preview</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-xs text-slate-400 mb-2">Generated Files:</div>
                      <div className="space-y-1">
                        {appPlan.screens.map((screen) => (
                          <div key={screen.id} className="text-xs text-slate-300">
                            📱 {screen.name}.tsx
                          </div>
                        ))}
                        {appPlan.models.map((model) => (
                          <div key={model.id} className="text-xs text-slate-300">
                            🗄️ {model.name}.ts
                          </div>
                        ))}
                        {appPlan.functions.map((func) => (
                          <div key={func.id} className="text-xs text-slate-300">
                            ⚡ {func.name}.ts
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('plan')}
                      className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={generateApp}
                      disabled={isGenerating}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded text-white text-sm transition-colors"
                    >
                      {isGenerating ? 'Generating...' : 'Generate App'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Step */}
            {step === 'generate' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Generated Files</h3>
                    <div className="bg-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {generatedFiles.map((file, index) => (
                        <div key={index} className="text-xs text-slate-300 mb-1">
                          ✅ {file}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('preview')}
                      className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={testApp}
                      disabled={isTesting}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white text-sm transition-colors"
                    >
                      {isTesting ? 'Testing...' : 'Test App'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Step */}
            {step === 'test' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Test Results</h3>
                    <div className="bg-slate-700 rounded-lg p-4 max-h-32 overflow-y-auto">
                      {testResults.map((result, index) => (
                        <div key={index} className="text-xs mb-1">
                          <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                            {result.passed ? '✅' : '❌'} {result.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {previewUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Live Preview</h3>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm text-center transition-colors"
                      >
                        Open Preview
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('generate')}
                      className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('commit')}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                    >
                      Commit App
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Commit Step */}
            {step === 'commit' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="text-sm font-medium text-white">Ready to Commit</h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Your app has been generated and tested successfully. Ready to commit to Git and create a pull request.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('test')}
                      className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={commitApp}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                    >
                      Commit & Push
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Visual Preview */}
          <div className="flex-1 flex flex-col">
            {step === 'input' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Describe Your App</h3>
                  <p className="text-slate-400 mb-4">
                    Tell us what you want to build in plain English
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
                      <Bot className="w-4 h-4" />
                      AI-Powered
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
                      <Code className="w-4 h-4" />
                      Working Code
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-white text-sm">
                      <TestTube className="w-4 h-4" />
                      Tested
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'plan' && appPlan && (
              <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">{appPlan.name}</h2>
                    <p className="text-slate-400">{appPlan.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Screens
                      </h3>
                      <div className="space-y-3">
                        {appPlan.screens.map((screen) => (
                          <div key={screen.id} className="p-3 bg-slate-700 rounded">
                            <h4 className="font-medium text-white">{screen.name}</h4>
                            <p className="text-sm text-slate-400">{screen.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Data Models
                      </h3>
                      <div className="space-y-3">
                        {appPlan.models.map((model) => (
                          <div key={model.id} className="p-3 bg-slate-700 rounded">
                            <h4 className="font-medium text-white">{model.name}</h4>
                            <div className="text-sm text-slate-400">
                              {model.fields.map(f => f.name).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Functions & APIs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appPlan.functions.map((func) => (
                        <div key={func.id} className="p-3 bg-slate-700 rounded">
                          <h4 className="font-medium text-white">{func.name}</h4>
                          <p className="text-sm text-slate-400">{func.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'preview' && appPlan && (
              <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">App Preview</h2>
                    <p className="text-slate-400">Preview of your generated app structure</p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">File Structure</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-300">📁 src/</div>
                      <div className="text-sm text-slate-300 ml-4">📁 components/</div>
                      {appPlan.screens.map((screen) => (
                        <div key={screen.id} className="text-sm text-slate-300 ml-8">
                          📱 {screen.name}.tsx
                        </div>
                      ))}
                      <div className="text-sm text-slate-300 ml-4">📁 models/</div>
                      {appPlan.models.map((model) => (
                        <div key={model.id} className="text-sm text-slate-300 ml-8">
                          🗄️ {model.name}.ts
                        </div>
                      ))}
                      <div className="text-sm text-slate-300 ml-4">📁 functions/</div>
                      {appPlan.functions.map((func) => (
                        <div key={func.id} className="text-sm text-slate-300 ml-8">
                          ⚡ {func.name}.ts
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(step === 'generate' || step === 'test' || step === 'commit') && (
              <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">App Generated Successfully!</h2>
                    <p className="text-slate-400">Your app is ready to test and deploy</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center">
                      <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="font-medium text-white">Code Generated</h3>
                      <p className="text-sm text-slate-400">{generatedFiles.length} files</p>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center">
                      <TestTube className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h3 className="font-medium text-white">Tests Included</h3>
                      <p className="text-sm text-slate-400">{appPlan?.tests.length || 0} test cases</p>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center">
                      <Rocket className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="font-medium text-white">Ready to Deploy</h3>
                      <p className="text-sm text-slate-400">One-click deployment</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};