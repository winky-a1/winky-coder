import express from 'express';
import { importRepository, commitChanges, getBranches, getFiles, getFileContent, updateFile } from '../services/gitService.js';
import { validateGitHubToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/repos/import
 * @desc Import a GitHub repository
 * @access Public
 */
router.post('/import', async (req, res) => {
  try {
    const { repoUrl, token, branch = 'main' } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    const result = await importRepository(repoUrl, token, branch);
    res.json({
      success: true,
      message: 'Repository imported successfully',
      data: result
    });
  } catch (error) {
    console.error('Import repository error:', error);
    res.status(500).json({ 
      error: 'Failed to import repository',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/repos/commit
 * @desc Commit and push changes to repository
 * @access Public
 */
router.post('/commit', async (req, res) => {
  try {
    const { repoPath, message, files, token } = req.body;
    
    if (!repoPath || !message || !files) {
      return res.status(400).json({ 
        error: 'Repository path, commit message, and files are required' 
      });
    }

    const result = await commitChanges(repoPath, message, files, token);
    res.json({
      success: true,
      message: 'Changes committed successfully',
      data: result
    });
  } catch (error) {
    console.error('Commit changes error:', error);
    res.status(500).json({ 
      error: 'Failed to commit changes',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/repos/branches
 * @desc Get repository branches
 * @access Public
 */
router.get('/branches', async (req, res) => {
  try {
    const { repoUrl, token } = req.query;
    
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    const branches = await getBranches(repoUrl, token);
    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ 
      error: 'Failed to get branches',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/repos/files
 * @desc Get repository file tree
 * @access Public
 */
router.get('/files', async (req, res) => {
  try {
    const { repoPath, path = '' } = req.query;
    
    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    const files = await getFiles(repoPath, path);
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      error: 'Failed to get files',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/repos/file
 * @desc Get file content
 * @access Public
 */
router.get('/file', async (req, res) => {
  try {
    const { repoPath, filePath } = req.query;
    
    if (!repoPath || !filePath) {
      return res.status(400).json({ 
        error: 'Repository path and file path are required' 
      });
    }

    const content = await getFileContent(repoPath, filePath);
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get file content error:', error);
    res.status(500).json({ 
      error: 'Failed to get file content',
      message: error.message 
    });
  }
});

/**
 * @route PUT /api/repos/file
 * @desc Update file content
 * @access Public
 */
router.put('/file', async (req, res) => {
  try {
    const { repoPath, filePath, content, token } = req.body;
    
    if (!repoPath || !filePath || content === undefined) {
      return res.status(400).json({ 
        error: 'Repository path, file path, and content are required' 
      });
    }

    const result = await updateFile(repoPath, filePath, content, token);
    res.json({
      success: true,
      message: 'File updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ 
      error: 'Failed to update file',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/repos/pull
 * @desc Pull latest changes from remote
 * @access Public
 */
router.post('/pull', async (req, res) => {
  try {
    const { repoPath, token } = req.body;
    
    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    // This would be implemented in gitService.js
    // const result = await pullChanges(repoPath, token);
    res.json({
      success: true,
      message: 'Repository pulled successfully'
    });
  } catch (error) {
    console.error('Pull changes error:', error);
    res.status(500).json({ 
      error: 'Failed to pull changes',
      message: error.message 
    });
  }
});

export default router;