/**
 * Get file extension from path
 */
export function getFileExtension(path: string): string {
  return path.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get language from file extension
 */
export function getLanguageFromExtension(extension: string): string {
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
  
  return languageMap[extension] || 'plaintext';
}

/**
 * Get language from file path
 */
export function getLanguageFromPath(path: string): string {
  const extension = getFileExtension(path);
  return getLanguageFromExtension(extension);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is binary
 */
export function isBinaryFile(content: string): boolean {
  // Check for null bytes or other binary indicators
  return content.includes('\x00') || 
         content.length > 1000 && content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(extension: string): string {
  const iconMap: { [key: string]: string } = {
    'js': '📄',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'json': '📋',
    'md': '📝',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'php': '🐘',
    'rb': '💎',
    'go': '🐹',
    'rs': '🦀',
    'swift': '🍎',
    'kt': '🤖',
    'dart': '🎯',
    'vue': '💚',
    'svelte': '🔥',
    'astro': '🚀',
    'sql': '🗄️',
    'yaml': '⚙️',
    'yml': '⚙️',
    'toml': '⚙️',
    'ini': '⚙️',
    'sh': '🐚',
    'bash': '🐚',
    'zsh': '🐚',
    'fish': '🐟',
    'ps1': '💻',
    'bat': '💻',
    'cmd': '💻',
    'dockerfile': '🐳',
    'gitignore': '📁',
    'env': '🔧',
    'xml': '📄',
    'svg': '🖼️',
  };
  
  return iconMap[extension] || '📄';
}

/**
 * Validate GitHub URL
 */
export function validateGitHubUrl(url: string): boolean {
  const githubUrlRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
  return githubUrlRegex.test(url);
}

/**
 * Extract repository info from GitHub URL
 */
export function extractRepoInfo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/);
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
}