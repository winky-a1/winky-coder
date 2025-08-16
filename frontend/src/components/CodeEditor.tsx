import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  FileText, 
  Settings, 
  Maximize, 
  Minimize,
  Download,
  Upload
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/stores/appStore';
import { repositoryAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { FileContent } from '@/types';

const CodeEditor: React.FC = () => {
  const { 
    editor, 
    currentRepository, 
    setEditorDirty,
    setEditorLanguage 
  } = useAppStore();
  
  const editorRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle editor content changes
  const handleEditorChange = (value: string | undefined) => {
    if (!editor.currentFile || !value) return;
    
    const hasChanged = value !== editor.currentFile.content;
    setEditorDirty(hasChanged);
  };

  // Save file
  const handleSave = async () => {
    if (!editor.currentFile || !currentRepository) return;

    const token = localStorage.getItem('github_token');
    if (!token) {
      toast.error('GitHub token not found. Please add your token in settings.');
      return;
    }

    try {
      setIsSaving(true);
      const value = editorRef.current?.getValue();
      if (!value) return;

      await repositoryAPI.updateFile(
        currentRepository.path,
        editor.currentFile.path,
        value,
        token
      );

      // Update local file content
      const updatedFile: FileContent = {
        ...editor.currentFile,
        content: value,
        modified: new Date(),
      };
      useAppStore.getState().setCurrentFile(updatedFile);
      setEditorDirty(false);
      
      toast.success('File saved successfully');
    } catch (error) {
      toast.error('Failed to save file');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Focus editor
    editor.focus();
  };

  // Get language from file extension
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
      'vue': 'vue',
      'svelte': 'svelte',
      'astro': 'astro',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
      'ps1': 'powershell',
      'bat': 'batch',
      'cmd': 'batch',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore',
      'env': 'env',
      'xml': 'xml',
      'svg': 'svg',
    };
    
    return languageMap[ext || ''] || 'plaintext';
  };

  // Update language when file changes
  useEffect(() => {
    if (editor.currentFile) {
      const language = getLanguageFromPath(editor.currentFile.path);
      setEditorLanguage(language);
    }
  }, [editor.currentFile]);

  // Auto-save on blur (if enabled)
  const handleEditorBlur = () => {
    if (editor.isDirty && editor.currentFile) {
      // Auto-save could be implemented here
    }
  };

  if (!editor.currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center text-white/60">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No File Selected</h3>
          <p className="text-sm">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Editor Toolbar */}
      <div className="editor-toolbar flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80 font-mono truncate max-w-xs">
              {editor.currentFile.path}
            </span>
            {editor.isDirty && (
              <span className="text-xs text-yellow-400">•</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <span>{editor.language}</span>
            <span>•</span>
            <span>{editor.currentFile.size} bytes</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!editor.isDirty || isSaving}
            className="btn-ghost text-xs py-1 px-2"
            title="Save (Ctrl+S)"
          >
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-ghost text-xs py-1 px-2"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-3 h-3" />
            ) : (
              <Maximize className="w-3 h-3" />
            )}
          </button>
          
          <button
            className="btn-ghost text-xs py-1 px-2"
            title="Editor Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage={editor.language}
          value={editor.currentFile.content}
          theme={editor.theme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          onBlur={handleEditorBlur}
          options={{
            fontSize: editor.fontSize,
            wordWrap: editor.wordWrap,
            minimap: {
              enabled: editor.minimap,
            },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
            },
            selectOnLineNumbers: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEnd: false,
            contextmenu: true,
            mouseWheelZoom: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: true,
            parameterHints: {
              enabled: true,
            },
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            dragAndDrop: true,
            links: true,
            colorDecorators: true,
            lightbulb: {
              enabled: true,
            },
            codeActionsOnSave: {
              'source.fixAll': true,
              'source.organizeImports': true,
            },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-slate-800 text-xs text-white/60 border-t border-slate-700">
        <div className="flex items-center space-x-4">
          <span>Ln {editorRef.current?.getPosition()?.lineNumber || 1}, Col {editorRef.current?.getPosition()?.column || 1}</span>
          <span>•</span>
          <span>{editor.currentFile.encoding}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>{editor.language}</span>
          <span>•</span>
          <span>{editor.theme}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;