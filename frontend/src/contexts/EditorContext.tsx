/**
 * Editor Context Provider
 * 
 * Manages editor state, file operations, and Monaco editor instances
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface EditorState {
  activeFile: string | null;
  openFiles: string[];
  fileContents: Record<string, string>;
  isDirty: Record<string, boolean>;
  cursorPosition: { line: number; column: number };
  selectedText: string;
}

interface EditorContextType {
  state: EditorState;
  setActiveFile: (file: string) => void;
  openFile: (file: string, content?: string) => void;
  closeFile: (file: string) => void;
  saveFile: (file: string, content: string) => void;
  updateFileContent: (file: string, content: string) => void;
  setCursorPosition: (position: { line: number; column: number }) => void;
  setSelectedText: (text: string) => void;
  isFileDirty: (file: string) => boolean;
  markFileDirty: (file: string, dirty: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

interface EditorProviderProps {
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [state, setState] = useState<EditorState>({
    activeFile: null,
    openFiles: [],
    fileContents: {},
    isDirty: {},
    cursorPosition: { line: 1, column: 1 },
    selectedText: ''
  });

  const setActiveFile = useCallback((file: string) => {
    setState(prev => ({
      ...prev,
      activeFile: file
    }));
  }, []);

  const openFile = useCallback((file: string, content?: string) => {
    setState(prev => {
      const newOpenFiles = prev.openFiles.includes(file) 
        ? prev.openFiles 
        : [...prev.openFiles, file];

      const newFileContents = content 
        ? { ...prev.fileContents, [file]: content }
        : prev.fileContents;

      return {
        ...prev,
        openFiles: newOpenFiles,
        activeFile: file,
        fileContents: newFileContents,
        isDirty: { ...prev.isDirty, [file]: false }
      };
    });
  }, []);

  const closeFile = useCallback((file: string) => {
    setState(prev => {
      const newOpenFiles = prev.openFiles.filter(f => f !== file);
      const newFileContents = { ...prev.fileContents };
      const newIsDirty = { ...prev.isDirty };
      
      delete newFileContents[file];
      delete newIsDirty[file];

      let newActiveFile = prev.activeFile;
      if (prev.activeFile === file && newOpenFiles.length > 0) {
        newActiveFile = newOpenFiles[newOpenFiles.length - 1];
      } else if (newOpenFiles.length === 0) {
        newActiveFile = null;
      }

      return {
        ...prev,
        openFiles: newOpenFiles,
        activeFile: newActiveFile,
        fileContents: newFileContents,
        isDirty: newIsDirty
      };
    });
  }, []);

  const saveFile = useCallback((file: string, content: string) => {
    setState(prev => ({
      ...prev,
      fileContents: { ...prev.fileContents, [file]: content },
      isDirty: { ...prev.isDirty, [file]: false }
    }));
  }, []);

  const updateFileContent = useCallback((file: string, content: string) => {
    setState(prev => ({
      ...prev,
      fileContents: { ...prev.fileContents, [file]: content },
      isDirty: { ...prev.isDirty, [file]: true }
    }));
  }, []);

  const setCursorPosition = useCallback((position: { line: number; column: number }) => {
    setState(prev => ({
      ...prev,
      cursorPosition: position
    }));
  }, []);

  const setSelectedText = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      selectedText: text
    }));
  }, []);

  const isFileDirty = useCallback((file: string) => {
    return state.isDirty[file] || false;
  }, [state.isDirty]);

  const markFileDirty = useCallback((file: string, dirty: boolean) => {
    setState(prev => ({
      ...prev,
      isDirty: { ...prev.isDirty, [file]: dirty }
    }));
  }, []);

  const value: EditorContextType = {
    state,
    setActiveFile,
    openFile,
    closeFile,
    saveFile,
    updateFileContent,
    setCursorPosition,
    setSelectedText,
    isFileDirty,
    markFileDirty
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};