import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  AppState, 
  Repository, 
  EditorState, 
  FileExplorerState, 
  ChatState, 
  FileContent, 
  FileItem, 
  ChatMessage, 
  AIModel,
  UserSettings 
} from '@/types';

interface AppStore extends AppState {
  // Actions
  setCurrentRepository: (repo: Repository | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Editor actions
  setCurrentFile: (file: FileContent | null) => void;
  setEditorDirty: (dirty: boolean) => void;
  setEditorLanguage: (language: string) => void;
  setEditorTheme: (theme: 'vs-dark' | 'vs-light') => void;
  setEditorFontSize: (size: number) => void;
  setEditorWordWrap: (wrap: 'on' | 'off') => void;
  setEditorMinimap: (enabled: boolean) => void;
  
  // File explorer actions
  setFiles: (files: FileItem[]) => void;
  setCurrentPath: (path: string) => void;
  setSelectedFile: (file: string | null) => void;
  toggleFolder: (path: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Chat actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setChatLoading: (loading: boolean) => void;
  setSelectedModel: (model: string) => void;
  setChatTemperature: (temperature: number) => void;
  setChatMaxTokens: (maxTokens: number) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Utility actions
  resetState: () => void;
}

const defaultEditorState: EditorState = {
  currentFile: null,
  isDirty: false,
  language: 'typescript',
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'off',
  minimap: true,
};

const defaultFileExplorerState: FileExplorerState = {
  files: [],
  currentPath: '',
  selectedFile: null,
  expandedFolders: new Set(),
  searchQuery: '',
};

const defaultChatState: ChatState = {
  messages: [],
  isLoading: false,
  selectedModel: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 4000,
};

const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  wordWrap: false,
  minimap: true,
  autoSave: true,
  tabSize: 2,
  insertSpaces: true,
  trimTrailingWhitespace: true,
  insertFinalNewline: true,
  aiModel: 'gemini-1.5-flash',
  aiTemperature: 0.7,
  aiMaxTokens: 4000,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentRepository: null,
      editor: defaultEditorState,
      fileExplorer: defaultFileExplorerState,
      chat: defaultChatState,
      theme: 'dark',
      sidebarCollapsed: false,
      commandPaletteOpen: false,

      // Repository actions
      setCurrentRepository: (repo) => set({ currentRepository: repo }),

      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Editor actions
      setCurrentFile: (file) => set((state) => ({
        editor: { ...state.editor, currentFile: file, isDirty: false }
      })),
      setEditorDirty: (dirty) => set((state) => ({
        editor: { ...state.editor, isDirty: dirty }
      })),
      setEditorLanguage: (language) => set((state) => ({
        editor: { ...state.editor, language }
      })),
      setEditorTheme: (theme) => set((state) => ({
        editor: { ...state.editor, theme }
      })),
      setEditorFontSize: (size) => set((state) => ({
        editor: { ...state.editor, fontSize: size }
      })),
      setEditorWordWrap: (wrap) => set((state) => ({
        editor: { ...state.editor, wordWrap: wrap }
      })),
      setEditorMinimap: (enabled) => set((state) => ({
        editor: { ...state.editor, minimap: enabled }
      })),

      // File explorer actions
      setFiles: (files) => set((state) => ({
        fileExplorer: { ...state.fileExplorer, files }
      })),
      setCurrentPath: (path) => set((state) => ({
        fileExplorer: { ...state.fileExplorer, currentPath: path }
      })),
      setSelectedFile: (file) => set((state) => ({
        fileExplorer: { ...state.fileExplorer, selectedFile: file }
      })),
      toggleFolder: (path) => set((state) => {
        const expandedFolders = new Set(state.fileExplorer.expandedFolders);
        if (expandedFolders.has(path)) {
          expandedFolders.delete(path);
        } else {
          expandedFolders.add(path);
        }
        return {
          fileExplorer: { ...state.fileExplorer, expandedFolders }
        };
      }),
      setSearchQuery: (query) => set((state) => ({
        fileExplorer: { ...state.fileExplorer, searchQuery: query }
      })),

      // Chat actions
      addMessage: (message) => set((state) => ({
        chat: {
          ...state.chat,
          messages: [
            ...state.chat.messages,
            {
              ...message,
              id: uuidv4(),
              timestamp: new Date(),
            }
          ]
        }
      })),
      clearMessages: () => set((state) => ({
        chat: { ...state.chat, messages: [] }
      })),
      setChatLoading: (loading) => set((state) => ({
        chat: { ...state.chat, isLoading: loading }
      })),
      setSelectedModel: (model) => set((state) => ({
        chat: { ...state.chat, selectedModel: model }
      })),
      setChatTemperature: (temperature) => set((state) => ({
        chat: { ...state.chat, temperature }
      })),
      setChatMaxTokens: (maxTokens) => set((state) => ({
        chat: { ...state.chat, maxTokens }
      })),

      // Settings actions
      updateSettings: (settings) => set((state) => {
        const newSettings = { ...defaultSettings, ...settings };
        return {
          theme: newSettings.theme,
          editor: {
            ...state.editor,
            theme: newSettings.theme === 'dark' ? 'vs-dark' : 'vs-light',
            fontSize: newSettings.fontSize,
            wordWrap: newSettings.wordWrap ? 'on' : 'off',
            minimap: newSettings.minimap,
          },
          chat: {
            ...state.chat,
            selectedModel: newSettings.aiModel,
            temperature: newSettings.aiTemperature,
            maxTokens: newSettings.aiMaxTokens,
          }
        };
      }),

      // Utility actions
      resetState: () => set({
        currentRepository: null,
        editor: defaultEditorState,
        fileExplorer: defaultFileExplorerState,
        chat: defaultChatState,
        theme: 'dark',
        sidebarCollapsed: false,
        commandPaletteOpen: false,
      }),
    }),
    {
      name: 'winky-coder-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        editor: {
          theme: state.editor.theme,
          fontSize: state.editor.fontSize,
          wordWrap: state.editor.wordWrap,
          minimap: state.editor.minimap,
        },
        chat: {
          selectedModel: state.chat.selectedModel,
          temperature: state.chat.temperature,
          maxTokens: state.chat.maxTokens,
        },
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentRepository = () => useAppStore((state) => state.currentRepository);
export const useEditor = () => useAppStore((state) => state.editor);
export const useFileExplorer = () => useAppStore((state) => state.fileExplorer);
export const useChat = () => useAppStore((state) => state.chat);
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useCommandPaletteOpen = () => useAppStore((state) => state.commandPaletteOpen);