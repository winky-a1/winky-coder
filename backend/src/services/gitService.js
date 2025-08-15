import { clone, log, add, commit, push, pull, listBranches, listFiles, readBlob } from 'isomorphic-git';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for cloned repositories
const REPOS_DIR = path.join(__dirname, '../../repos');

// Ensure repos directory exists
fs.ensureDirSync(REPOS_DIR);

/**
 * Import a GitHub repository
 * @param {string} repoUrl - GitHub repository URL
 * @param {string} token - GitHub personal access token
 * @param {string} branch - Branch to clone
 * @returns {Object} Repository information
 */
export async function importRepository(repoUrl, token, branch = 'main') {
  try {
    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const repoPath = path.join(REPOS_DIR, repoName);
    
    // Remove existing directory if it exists
    if (await fs.pathExists(repoPath)) {
      await fs.remove(repoPath);
    }

    // Clone repository
    await clone({
      fs,
      dir: repoPath,
      url: repoUrl,
      ref: branch,
      depth: 1,
      onAuth: () => ({
        username: token,
        password: 'x-oauth-basic'
      })
    });

    // Get repository info
    const branches = await listBranches({ fs, dir: repoPath });
    const files = await listFiles({ fs, dir: repoPath });

    return {
      name: repoName,
      path: repoPath,
      url: repoUrl,
      branch,
      branches: branches.map(b => b.replace('refs/heads/', '')),
      fileCount: files.length,
      importedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Import repository error:', error);
    throw new Error(`Failed to import repository: ${error.message}`);
  }
}

/**
 * Commit and push changes
 * @param {string} repoPath - Repository path
 * @param {string} message - Commit message
 * @param {Array} files - Array of file changes
 * @param {string} token - GitHub token
 * @returns {Object} Commit result
 */
export async function commitChanges(repoPath, message, files, token) {
  try {
    // Add files to staging
    for (const file of files) {
      await add({
        fs,
        dir: repoPath,
        filepath: file.path
      });
    }

    // Commit changes
    const commitHash = await commit({
      fs,
      dir: repoPath,
      author: {
        name: 'Winky-Coder',
        email: 'winky-coder@example.com'
      },
      message
    });

    // Push changes
    await push({
      fs,
      dir: repoPath,
      onAuth: () => ({
        username: token,
        password: 'x-oauth-basic'
      })
    });

    return {
      commitHash,
      message,
      files: files.map(f => f.path),
      pushedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Commit changes error:', error);
    throw new Error(`Failed to commit changes: ${error.message}`);
  }
}

/**
 * Get repository branches
 * @param {string} repoUrl - Repository URL
 * @param {string} token - GitHub token
 * @returns {Array} List of branches
 */
export async function getBranches(repoUrl, token) {
  try {
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const repoPath = path.join(REPOS_DIR, repoName);

    if (!await fs.pathExists(repoPath)) {
      throw new Error('Repository not found. Please import it first.');
    }

    const branches = await listBranches({ fs, dir: repoPath });
    return branches.map(b => b.replace('refs/heads/', ''));
  } catch (error) {
    console.error('Get branches error:', error);
    throw new Error(`Failed to get branches: ${error.message}`);
  }
}

/**
 * Get repository files
 * @param {string} repoPath - Repository path
 * @param {string} dirPath - Directory path (optional)
 * @returns {Array} List of files
 */
export async function getFiles(repoPath, dirPath = '') {
  try {
    const fullPath = path.join(repoPath, dirPath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error('Path does not exist');
    }

    const items = await fs.readdir(fullPath, { withFileTypes: true });
    const files = [];

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const fullItemPath = path.join(fullPath, item.name);
      
      if (item.isDirectory()) {
        files.push({
          name: item.name,
          path: itemPath,
          type: 'directory',
          size: null
        });
      } else {
        const stats = await fs.stat(fullItemPath);
        files.push({
          name: item.name,
          path: itemPath,
          type: 'file',
          size: stats.size,
          modified: stats.mtime
        });
      }
    }

    return files.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Get files error:', error);
    throw new Error(`Failed to get files: ${error.message}`);
  }
}

/**
 * Get file content
 * @param {string} repoPath - Repository path
 * @param {string} filePath - File path
 * @returns {Object} File content and metadata
 */
export async function getFileContent(repoPath, filePath) {
  try {
    const fullPath = path.join(repoPath, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error('File does not exist');
    }

    const stats = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf8');

    return {
      path: filePath,
      content,
      size: stats.size,
      modified: stats.mtime,
      encoding: 'utf8'
    };
  } catch (error) {
    console.error('Get file content error:', error);
    throw new Error(`Failed to get file content: ${error.message}`);
  }
}

/**
 * Update file content
 * @param {string} repoPath - Repository path
 * @param {string} filePath - File path
 * @param {string} content - New content
 * @param {string} token - GitHub token
 * @returns {Object} Update result
 */
export async function updateFile(repoPath, filePath, content, token) {
  try {
    const fullPath = path.join(repoPath, filePath);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));
    
    // Write file
    await fs.writeFile(fullPath, content, 'utf8');

    // Add to staging
    await add({
      fs,
      dir: repoPath,
      filepath: filePath
    });

    return {
      path: filePath,
      updated: true,
      size: content.length,
      modified: new Date().toISOString()
    };
  } catch (error) {
    console.error('Update file error:', error);
    throw new Error(`Failed to update file: ${error.message}`);
  }
}

/**
 * Get repository status
 * @param {string} repoPath - Repository path
 * @returns {Object} Repository status
 */
export async function getRepoStatus(repoPath) {
  try {
    const logResult = await log({
      fs,
      dir: repoPath,
      depth: 1
    });

    const branches = await listBranches({ fs, dir: repoPath });
    const files = await listFiles({ fs, dir: repoPath });

    return {
      lastCommit: logResult[0],
      branches: branches.map(b => b.replace('refs/heads/', '')),
      fileCount: files.length,
      path: repoPath
    };
  } catch (error) {
    console.error('Get repo status error:', error);
    throw new Error(`Failed to get repository status: ${error.message}`);
  }
}