import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

/**
 * Search files in repository
 * @param {string} repoPath - Repository path
 * @param {string} query - Search query
 * @param {Array} fileTypes - File types to search
 * @returns {Array} Search results
 */
export async function searchFiles(repoPath, query, fileTypes = []) {
  try {
    const results = [];
    const searchPattern = path.join(repoPath, '**/*');
    
    // Get all files
    const files = await glob(searchPattern, {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**'
      ]
    });

    // Filter by file types if specified
    let filteredFiles = files;
    if (fileTypes.length > 0) {
      filteredFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return fileTypes.some(type => ext === type || ext === `.${type}`);
      });
    }

    // Search in each file
    for (const file of filteredFiles) {
      try {
        const stats = await fs.stat(file);
        if (!stats.isFile()) continue;

        const content = await fs.readFile(file, 'utf8');
        const relativePath = path.relative(repoPath, file);
        
        // Simple text search (case-insensitive)
        if (content.toLowerCase().includes(query.toLowerCase())) {
          const lines = content.split('\n');
          const matchingLines = [];
          
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              matchingLines.push({
                line: index + 1,
                content: line.trim()
              });
            }
          });

          if (matchingLines.length > 0) {
            results.push({
              path: relativePath,
              fullPath: file,
              size: stats.size,
              modified: stats.mtime,
              matches: matchingLines,
              matchCount: matchingLines.length
            });
          }
        }
      } catch (error) {
        console.warn(`Error reading file ${file}:`, error.message);
      }
    }

    return results.sort((a, b) => b.matchCount - a.matchCount);
  } catch (error) {
    console.error('Search files error:', error);
    throw new Error(`Failed to search files: ${error.message}`);
  }
}

/**
 * Get file statistics
 * @param {string} repoPath - Repository path
 * @param {string} filePath - File path
 * @returns {Object} File statistics
 */
export async function getFileStats(repoPath, filePath) {
  try {
    const fullPath = path.join(repoPath, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error('File does not exist');
    }

    const stats = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf8');
    
    // Calculate basic statistics
    const lines = content.split('\n');
    const characters = content.length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    
    // Detect file type
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    return {
      path: filePath,
      name: fileName,
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      lines: lines.length,
      characters,
      words,
      extension: ext,
      isBinary: !content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/),
      encoding: 'utf8'
    };
  } catch (error) {
    console.error('Get file stats error:', error);
    throw new Error(`Failed to get file statistics: ${error.message}`);
  }
}

/**
 * Create a new file
 * @param {string} repoPath - Repository path
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @param {string} token - GitHub token
 * @returns {Object} Creation result
 */
export async function createFile(repoPath, filePath, content = '', token) {
  try {
    const fullPath = path.join(repoPath, filePath);
    
    // Check if file already exists
    if (await fs.pathExists(fullPath)) {
      throw new Error('File already exists');
    }
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));
    
    // Write file
    await fs.writeFile(fullPath, content, 'utf8');
    
    const stats = await fs.stat(fullPath);
    
    return {
      path: filePath,
      created: true,
      size: stats.size,
      modified: stats.mtime
    };
  } catch (error) {
    console.error('Create file error:', error);
    throw new Error(`Failed to create file: ${error.message}`);
  }
}

/**
 * Delete a file
 * @param {string} repoPath - Repository path
 * @param {string} filePath - File path
 * @param {string} token - GitHub token
 * @returns {Object} Deletion result
 */
export async function deleteFile(repoPath, filePath, token) {
  try {
    const fullPath = path.join(repoPath, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error('File does not exist');
    }
    
    const stats = await fs.stat(fullPath);
    
    // Delete file
    await fs.remove(fullPath);
    
    return {
      path: filePath,
      deleted: true,
      size: stats.size,
      deletedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Delete file error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Move/rename a file
 * @param {string} repoPath - Repository path
 * @param {string} oldPath - Old file path
 * @param {string} newPath - New file path
 * @param {string} token - GitHub token
 * @returns {Object} Move result
 */
export async function moveFile(repoPath, oldPath, newPath, token) {
  try {
    const oldFullPath = path.join(repoPath, oldPath);
    const newFullPath = path.join(repoPath, newPath);
    
    if (!await fs.pathExists(oldFullPath)) {
      throw new Error('Source file does not exist');
    }
    
    if (await fs.pathExists(newFullPath)) {
      throw new Error('Destination file already exists');
    }
    
    // Ensure destination directory exists
    await fs.ensureDir(path.dirname(newFullPath));
    
    // Move file
    await fs.move(oldFullPath, newFullPath);
    
    const stats = await fs.stat(newFullPath);
    
    return {
      oldPath,
      newPath,
      moved: true,
      size: stats.size,
      modified: stats.mtime,
      movedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Move file error:', error);
    throw new Error(`Failed to move file: ${error.message}`);
  }
}

/**
 * Get recently modified files
 * @param {string} repoPath - Repository path
 * @param {number} limit - Number of files to return
 * @returns {Array} Recent files
 */
export async function getRecentFiles(repoPath, limit = 10) {
  try {
    const searchPattern = path.join(repoPath, '**/*');
    
    const files = await glob(searchPattern, {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**'
      ]
    });

    const fileStats = [];
    
    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        if (stats.isFile()) {
          const relativePath = path.relative(repoPath, file);
          fileStats.push({
            path: relativePath,
            fullPath: file,
            size: stats.size,
            modified: stats.mtime
          });
        }
      } catch (error) {
        console.warn(`Error getting stats for ${file}:`, error.message);
      }
    }

    // Sort by modification time (most recent first)
    return fileStats
      .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      .slice(0, limit);
  } catch (error) {
    console.error('Get recent files error:', error);
    throw new Error(`Failed to get recent files: ${error.message}`);
  }
}

/**
 * Get file tree structure
 * @param {string} repoPath - Repository path
 * @param {string} dirPath - Directory path (optional)
 * @returns {Object} File tree
 */
export async function getFileTree(repoPath, dirPath = '') {
  try {
    const fullPath = path.join(repoPath, dirPath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error('Path does not exist');
    }

    const items = await fs.readdir(fullPath, { withFileTypes: true });
    const tree = {
      name: path.basename(fullPath) || 'root',
      path: dirPath,
      type: 'directory',
      children: []
    };

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const fullItemPath = path.join(fullPath, item.name);
      
      if (item.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(item.name)) {
          continue;
        }
        
        const childTree = await getFileTree(repoPath, itemPath);
        tree.children.push(childTree);
      } else {
        const stats = await fs.stat(fullItemPath);
        tree.children.push({
          name: item.name,
          path: itemPath,
          type: 'file',
          size: stats.size,
          modified: stats.mtime
        });
      }
    }

    // Sort children (directories first, then files)
    tree.children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });

    return tree;
  } catch (error) {
    console.error('Get file tree error:', error);
    throw new Error(`Failed to get file tree: ${error.message}`);
  }
}