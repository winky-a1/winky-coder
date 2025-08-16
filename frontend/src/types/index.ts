// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Repository Types
export interface Repository {
  name: string;
  path: string;
  url: string;
  branch: string;
  branches: string[];
  fileCount: number;
  importedAt: string;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  children?: FileItem[];
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  modified: Date;
  encoding: string;
}

export interface FileStats {
  path: string;
  name: string;
  size: number;
  modified: Date;
  created: Date;
  lines: number;
  characters: number;
  words: number;
  extension: string;
  isBinary: boolean;
  encoding: string;
}

// AI Types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model: string;
  available: boolean;
}

export interface AIRequest {
  prompt: string;
  model: string;
  context?: any;
  files?: FileContent[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Git Types
export interface GitCommit {
  commitHash: string;
  message: string;
  files: string[];
  pushedAt: string;
}

export interface GitStatus {
  lastCommit: any;
  branches: string[];
  fileCount: number;
  path: string;
}

// UI State Types
export interface EditorState {
  currentFile: FileContent | null;
  isDirty: boolean;
  language: string;
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
}

export interface FileExplorerState {
  files: FileItem[];
  currentPath: string;
  selectedFile: string | null;
  expandedFolders: Set<string>;
  searchQuery: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
}

export interface AppState {
  currentRepository: Repository | null;
  editor: EditorState;
  fileExplorer: FileExplorerState;
  chat: ChatState;
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
}

// Component Props Types
export interface FileTreeProps {
  files: FileItem[];
  currentPath: string;
  selectedFile: string | null;
  onFileSelect: (file: FileItem) => void;
  onFolderToggle: (path: string) => void;
}

export interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

export interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export interface RepositoryImporterProps {
  onImport: (repoUrl: string, token: string, branch: string) => void;
  isLoading: boolean;
}

// Utility Types
export type FileExtension = '.js' | '.ts' | '.jsx' | '.tsx' | '.html' | '.css' | '.scss' | '.json' | '.md' | '.py' | '.java' | '.cpp' | '.c' | '.php' | '.rb' | '.go' | '.rs' | '.swift' | '.kt' | '.dart' | '.vue' | '.svelte' | '.astro' | '.sql' | '.yaml' | '.yml' | '.toml' | '.ini' | '.conf' | '.sh' | '.bash' | '.zsh' | '.fish' | '.ps1' | '.bat' | '.cmd' | '.dockerfile' | '.gitignore' | '.env' | '.lock' | '.txt' | '.log' | '.xml' | '.svg' | '.png' | '.jpg' | '.jpeg' | '.gif' | '.ico' | '.woff' | '.woff2' | '.ttf' | '.eot' | '.otf' | '.mp4' | '.mp3' | '.wav' | '.avi' | '.mov' | '.zip' | '.tar' | '.gz' | '.rar' | '.7z' | '.pdf' | '.doc' | '.docx' | '.xls' | '.xlsx' | '.ppt' | '.pptx';

export type Language = 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'html' | 'css' | 'scss' | 'json' | 'markdown' | 'python' | 'java' | 'cpp' | 'c' | 'php' | 'ruby' | 'go' | 'rust' | 'swift' | 'kotlin' | 'dart' | 'vue' | 'svelte' | 'astro' | 'sql' | 'yaml' | 'toml' | 'ini' | 'shell' | 'dockerfile' | 'gitignore' | 'env' | 'xml' | 'svg' | 'text';

export interface FileTypeMapping {
  [key: string]: Language;
}

// Error Types
export interface AppError {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp: Date;
  dismissible: boolean;
}

// Settings Types
export interface UserSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  tabSize: number;
  insertSpaces: boolean;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
}

// Command Palette Types
export interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  category: 'file' | 'edit' | 'view' | 'git' | 'ai' | 'settings';
  shortcut?: string;
}

// Search Types
export interface SearchResult {
  path: string;
  fullPath: string;
  size: number;
  modified: Date;
  matches: {
    line: number;
    content: string;
  }[];
  matchCount: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}