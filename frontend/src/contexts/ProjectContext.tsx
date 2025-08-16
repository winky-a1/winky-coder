/**
 * Project Context Provider
 * 
 * Manages project state, file tree, and project operations
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  size?: number;
  modified?: Date;
  children?: ProjectFile[];
}

interface ProjectState {
  id: string;
  name: string;
  path: string;
  files: ProjectFile[];
  gitStatus: {
    branch: string;
    status: 'clean' | 'dirty' | 'conflict';
    stagedFiles: string[];
    unstagedFiles: string[];
  };
  isLoaded: boolean;
}

interface ProjectContextType {
  state: ProjectState;
  loadProject: (projectPath: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  updateGitStatus: (status: Partial<ProjectState['gitStatus']>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [state, setState] = useState<ProjectState>({
    id: 'default-project',
    name: 'Winky Coder Project',
    path: '/workspace/winky-coder',
    files: [
      {
        id: 'src',
        name: 'src',
        path: 'src',
        type: 'folder',
        children: [
          {
            id: 'src/components',
            name: 'components',
            path: 'src/components',
            type: 'folder',
            children: [
              {
                id: 'src/components/App.tsx',
                name: 'App.tsx',
                path: 'src/components/App.tsx',
                type: 'file',
                language: 'typescript',
                size: 2048,
                modified: new Date()
              },
              {
                id: 'src/components/Header.tsx',
                name: 'Header.tsx',
                path: 'src/components/Header.tsx',
                type: 'file',
                language: 'typescript',
                size: 1024,
                modified: new Date()
              }
            ]
          },
          {
            id: 'src/pages',
            name: 'pages',
            path: 'src/pages',
            type: 'folder',
            children: [
              {
                id: 'src/pages/index.tsx',
                name: 'index.tsx',
                path: 'src/pages/index.tsx',
                type: 'file',
                language: 'typescript',
                size: 512,
                modified: new Date()
              }
            ]
          }
        ]
      },
      {
        id: 'public',
        name: 'public',
        path: 'public',
        type: 'folder',
        children: [
          {
            id: 'public/index.html',
            name: 'index.html',
            path: 'public/index.html',
            type: 'file',
            language: 'html',
            size: 256,
            modified: new Date()
          }
        ]
      },
      {
        id: 'package.json',
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        language: 'json',
        size: 1024,
        modified: new Date()
      },
      {
        id: 'README.md',
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        language: 'markdown',
        size: 2048,
        modified: new Date()
      }
    ],
    gitStatus: {
      branch: 'main',
      status: 'clean',
      stagedFiles: [],
      unstagedFiles: []
    },
    isLoaded: true
  });

  const loadProject = useCallback(async (projectPath: string) => {
    try {
      // Simulate loading project
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        path: projectPath,
        isLoaded: true
      }));
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    try {
      // Simulate refreshing files
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        files: [...prev.files] // Trigger re-render
      }));
    } catch (error) {
      console.error('Error refreshing files:', error);
    }
  }, []);

  const createFile = useCallback(async (path: string, content?: string) => {
    try {
      const fileName = path.split('/').pop() || 'untitled';
      const language = getLanguageFromPath(path);
      
      const newFile: ProjectFile = {
        id: path,
        name: fileName,
        path,
        type: 'file',
        language,
        size: content?.length || 0,
        modified: new Date()
      };

      setState(prev => ({
        ...prev,
        files: addFileToTree(prev.files, newFile)
      }));
    } catch (error) {
      console.error('Error creating file:', error);
    }
  }, []);

  const deleteFile = useCallback(async (path: string) => {
    try {
      setState(prev => ({
        ...prev,
        files: removeFileFromTree(prev.files, path)
      }));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, []);

  const renameFile = useCallback(async (oldPath: string, newPath: string) => {
    try {
      setState(prev => ({
        ...prev,
        files: renameFileInTree(prev.files, oldPath, newPath)
      }));
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  }, []);

  const updateGitStatus = useCallback((status: Partial<ProjectState['gitStatus']>) => {
    setState(prev => ({
      ...prev,
      gitStatus: { ...prev.gitStatus, ...status }
    }));
  }, []);

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  const addFileToTree = (files: ProjectFile[], newFile: ProjectFile): ProjectFile[] => {
    // Simple implementation - in real app, you'd traverse the tree properly
    return [...files, newFile];
  };

  const removeFileFromTree = (files: ProjectFile[], path: string): ProjectFile[] => {
    return files.filter(file => file.path !== path);
  };

  const renameFileInTree = (files: ProjectFile[], oldPath: string, newPath: string): ProjectFile[] => {
    return files.map(file => 
      file.path === oldPath 
        ? { ...file, path: newPath, name: newPath.split('/').pop() || file.name }
        : file
    );
  };

  const value: ProjectContextType = {
    state,
    loadProject,
    refreshFiles,
    createFile,
    deleteFile,
    renameFile,
    updateGitStatus
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};