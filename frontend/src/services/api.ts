import axios from 'axios';
import type { 
  Repository, 
  FileItem, 
  FileContent, 
  AIRequest, 
  AIResponse, 
  AIModel,
  GitCommit,
  SearchResult 
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('github_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
);

// Repository API
export const repositoryAPI = {
  // Import a GitHub repository
  importRepo: async (repoUrl: string, token: string, branch: string = 'main'): Promise<Repository> => {
    return api.post('/repos/import', { repoUrl, token, branch });
  },

  // Get repository files
  getFiles: async (repoPath: string, path: string = ''): Promise<FileItem[]> => {
    return api.get('/repos/files', { params: { repoPath, path } });
  },

  // Get file content
  getFileContent: async (repoPath: string, filePath: string): Promise<FileContent> => {
    return api.get('/repos/file', { params: { repoPath, filePath } });
  },

  // Update file content
  updateFile: async (repoPath: string, filePath: string, content: string, token: string): Promise<any> => {
    return api.put('/repos/file', { repoPath, filePath, content, token });
  },

  // Get repository branches
  getBranches: async (repoUrl: string, token: string): Promise<string[]> => {
    return api.get('/repos/branches', { params: { repoUrl, token } });
  },

  // Commit changes
  commitChanges: async (repoPath: string, message: string, files: any[], token: string): Promise<GitCommit> => {
    return api.post('/repos/commit', { repoPath, message, files, token });
  },

  // Pull changes
  pullChanges: async (repoPath: string, token: string): Promise<any> => {
    return api.post('/repos/pull', { repoPath, token });
  },
};

// AI API
export const aiAPI = {
  // Send AI request
  sendRequest: async (request: AIRequest): Promise<AIResponse> => {
    return api.post('/ai/chat', request);
  },

  // Get available models
  getModels: async (): Promise<AIModel[]> => {
    return api.get('/ai/models');
  },

  // Analyze codebase
  analyzeCodebase: async (repoPath: string, model: string, analysisType: string = 'general'): Promise<AIResponse> => {
    return api.post('/ai/analyze', { repoPath, model, analysisType });
  },

  // Refactor code
  refactorCode: async (filePath: string, content: string, model: string, refactorType: string = 'general'): Promise<AIResponse> => {
    return api.post('/ai/refactor', { filePath, content, model, refactorType });
  },

  // Fix code issues
  fixCode: async (filePath: string, content: string, model: string, errorMessage: string, errorType: string = 'runtime'): Promise<AIResponse> => {
    return api.post('/ai/fix', { filePath, content, model, errorMessage, errorType });
  },

  // Explain code
  explainCode: async (filePath: string, content: string, model: string, explanationType: string = 'general'): Promise<AIResponse> => {
    return api.post('/ai/explain', { filePath, content, model, explanationType });
  },

  // Analyze vision/image
  analyzeVision: async (imageData: string, prompt: string, model: string = 'gemini-2.0-pro'): Promise<AIResponse> => {
    return api.post('/ai/vision', { imageData, prompt, model });
  },
};

// File API
export const fileAPI = {
  // Search files
  searchFiles: async (repoPath: string, query: string, fileTypes: string[] = []): Promise<SearchResult[]> => {
    return api.get('/files/search', { params: { repoPath, query, fileTypes } });
  },

  // Get file statistics
  getFileStats: async (repoPath: string, filePath: string): Promise<any> => {
    return api.get('/files/stats', { params: { repoPath, filePath } });
  },

  // Create new file
  createFile: async (repoPath: string, filePath: string, content: string = '', token: string): Promise<any> => {
    return api.post('/files/create', { repoPath, filePath, content, token });
  },

  // Delete file
  deleteFile: async (repoPath: string, filePath: string, token: string): Promise<any> => {
    return api.delete('/files/delete', { data: { repoPath, filePath, token } });
  },

  // Move/rename file
  moveFile: async (repoPath: string, oldPath: string, newPath: string, token: string): Promise<any> => {
    return api.put('/files/move', { repoPath, oldPath, newPath, token });
  },

  // Get recent files
  getRecentFiles: async (repoPath: string, limit: number = 10): Promise<FileItem[]> => {
    return api.get('/files/recent', { params: { repoPath, limit } });
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<any> => {
    return api.get('/health');
  },
};

export default api;