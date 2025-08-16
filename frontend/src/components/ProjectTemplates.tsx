import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Folder, 
  Code, 
  Smartphone, 
  Database, 
  Globe,
  Zap,
  Shield,
  Palette,
  Check,
  ExternalLink
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ai';
  icon: React.ReactNode;
  features: string[];
  dependencies: string[];
  commands: string[];
  color: string;
  popular?: boolean;
}

const templates: ProjectTemplate[] = [
  {
    id: 'react-app',
    name: 'React App',
    description: 'Modern React application with TypeScript, Vite, and Tailwind CSS',
    category: 'frontend',
    icon: <Code className="w-6 h-6" />,
    features: ['TypeScript', 'Vite', 'Tailwind CSS', 'ESLint', 'Prettier'],
    dependencies: ['react', 'react-dom', 'typescript', 'vite', 'tailwindcss'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-blue-500 to-cyan-500',
    popular: true
  },
  {
    id: 'nextjs-app',
    name: 'Next.js App',
    description: 'Full-stack React framework with server-side rendering',
    category: 'fullstack',
    icon: <Globe className="w-6 h-6" />,
    features: ['SSR/SSG', 'API Routes', 'TypeScript', 'Tailwind CSS', 'ESLint'],
    dependencies: ['next', 'react', 'react-dom', 'typescript', 'tailwindcss'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-black to-gray-800',
    popular: true
  },
  {
    id: 'node-api',
    name: 'Node.js API',
    description: 'Express.js API with TypeScript, MongoDB, and JWT auth',
    category: 'backend',
    icon: <Database className="w-6 h-6" />,
    features: ['Express.js', 'TypeScript', 'MongoDB', 'JWT Auth', 'CORS'],
    dependencies: ['express', 'typescript', 'mongoose', 'jsonwebtoken', 'cors'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'react-native',
    name: 'React Native',
    description: 'Cross-platform mobile app with Expo and TypeScript',
    category: 'mobile',
    icon: <Smartphone className="w-6 h-6" />,
    features: ['Expo', 'TypeScript', 'React Navigation', 'AsyncStorage'],
    dependencies: ['expo', 'react-native', 'typescript', '@react-navigation/native'],
    commands: ['npm install', 'npx expo start'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'mern-stack',
    name: 'MERN Stack',
    description: 'Complete full-stack app with MongoDB, Express, React, Node.js',
    category: 'fullstack',
    icon: <Zap className="w-6 h-6" />,
    features: ['MongoDB', 'Express', 'React', 'Node.js', 'JWT Auth'],
    dependencies: ['react', 'express', 'mongoose', 'jsonwebtoken', 'cors'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-yellow-500 to-orange-500',
    popular: true
  },
  {
    id: 'ai-chat-app',
    name: 'AI Chat App',
    description: 'ChatGPT-like app with AI integration and real-time chat',
    category: 'ai',
    icon: <Palette className="w-6 h-6" />,
    features: ['AI Integration', 'Real-time Chat', 'Markdown', 'Code Highlighting'],
    dependencies: ['react', 'openai', 'socket.io', 'react-markdown', 'prismjs'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Full e-commerce platform with Stripe payments',
    category: 'fullstack',
    icon: <Shield className="w-6 h-6" />,
    features: ['Stripe Payments', 'User Auth', 'Product Management', 'Order System'],
    dependencies: ['next', 'stripe', 'prisma', 'next-auth', 'tailwindcss'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    description: 'Modern admin dashboard with charts and data visualization',
    category: 'frontend',
    icon: <Folder className="w-6 h-6" />,
    features: ['Charts', 'Data Tables', 'Responsive Design', 'Dark Mode'],
    dependencies: ['react', 'recharts', 'react-table', 'tailwindcss'],
    commands: ['npm install', 'npm run dev'],
    color: 'from-teal-500 to-blue-500'
  }
];

interface ProjectTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (template: ProjectTemplate) => void;
}

export const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Folder className="w-4 h-4" /> },
    { id: 'frontend', name: 'Frontend', icon: <Code className="w-4 h-4" /> },
    { id: 'backend', name: 'Backend', icon: <Database className="w-4 h-4" /> },
    { id: 'fullstack', name: 'Full Stack', icon: <Globe className="w-4 h-4" /> },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'ai', name: 'AI/ML', icon: <Palette className="w-4 h-4" /> }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateProject = (template: ProjectTemplate) => {
    onCreateProject(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#0d1117] border border-[#30363d] rounded-lg w-full max-w-6xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Project</h2>
            <p className="text-[#8b949e] text-sm">Choose a template to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#8b949e]" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-[#30363d]">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] focus:outline-none focus:border-[#1f6feb]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#1f6feb] text-white'
                      : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#1f6feb] transition-colors cursor-pointer group"
                  onClick={() => handleCreateProject(template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-white`}>
                      {template.icon}
                    </div>
                    <div className="flex items-center space-x-2">
                      {template.popular && (
                        <span className="px-2 py-1 bg-[#1f6feb] text-white text-xs rounded-full">
                          Popular
                        </span>
                      )}
                      <ExternalLink className="w-4 h-4 text-[#8b949e] group-hover:text-[#1f6feb] transition-colors" />
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                    <p className="text-[#8b949e] text-sm leading-relaxed">{template.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-[#21262d] text-[#8b949e] text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="px-2 py-1 bg-[#21262d] text-[#8b949e] text-xs rounded">
                          +{template.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Commands */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Quick Start</h4>
                    <div className="space-y-1">
                      {template.commands.map((command) => (
                        <div
                          key={command}
                          className="px-3 py-1 bg-[#0d1117] border border-[#30363d] rounded text-[#8b949e] text-xs font-mono"
                        >
                          {command}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create Button */}
                  <button className="w-full mt-4 px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Project</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-[#8b949e] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
              <p className="text-[#8b949e]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};