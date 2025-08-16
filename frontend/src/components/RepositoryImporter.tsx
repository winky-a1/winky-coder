import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  Download, 
  Key, 
  GitBranch,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { repositoryAPI } from '@/services/api';
import toast from 'react-hot-toast';

const RepositoryImporter: React.FC = () => {
  const { setCurrentRepository } = useAppStore();
  
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [branch, setBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'loading' | 'success'>('input');

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL');
      return;
    }

    if (!token.trim()) {
      toast.error('Please enter your GitHub token');
      return;
    }

    // Validate GitHub URL
    const githubUrlRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    if (!githubUrlRegex.test(repoUrl)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    try {
      setIsLoading(true);
      setStep('loading');

      // Store token in localStorage
      localStorage.setItem('github_token', token);

      // Import repository
      const repository = await repositoryAPI.importRepo(repoUrl, token, branch);
      
      setCurrentRepository(repository);
      setStep('success');
      
      toast.success('Repository imported successfully!');
      
      // Reset form
      setTimeout(() => {
        setRepoUrl('');
        setToken('');
        setBranch('main');
        setStep('input');
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import repository. Please check your URL and token.');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };

  if (step === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-dark text-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner"></div>
          <h3 className="text-lg font-medium text-white">Importing Repository</h3>
          <p className="text-sm text-white/60">
            Cloning {repoUrl}...
          </p>
        </div>
      </motion.div>
    );
  }

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-dark text-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="w-16 h-16 text-success-400" />
          <h3 className="text-lg font-medium text-white">Repository Imported!</h3>
          <p className="text-sm text-white/60">
            Your repository is ready to use
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-dark"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Github className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome to Winky-Coder
        </h1>
        <p className="text-white/60">
          Import your GitHub repository to get started
        </p>
      </div>

      <div className="space-y-4">
        {/* Repository URL */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Repository URL
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://github.com/username/repository"
              className="input-primary w-full pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* GitHub Token */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            GitHub Token
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="input-primary w-full pl-10"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-white/40 mt-1">
            Create a personal access token at{' '}
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              GitHub Settings
            </a>
          </p>
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Branch
          </label>
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="main"
              className="input-primary w-full pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={isLoading || !repoUrl.trim() || !token.trim()}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="loading-spinner"></div>
              <span>Importing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Import Repository</span>
            </div>
          )}
        </button>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-white/70">
              <p className="font-medium text-blue-400 mb-1">Getting Started</p>
              <p>
                Your GitHub token will be stored locally in your browser. 
                Make sure to grant the necessary permissions for repository access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RepositoryImporter;