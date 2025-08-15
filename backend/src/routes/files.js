import express from 'express';
import { searchFiles, getFileStats, createFile, deleteFile, moveFile } from '../services/fileService.js';

const router = express.Router();

/**
 * @route GET /api/files/search
 * @desc Search files in repository
 * @access Public
 */
router.get('/search', async (req, res) => {
  try {
    const { repoPath, query, fileTypes = [] } = req.query;
    
    if (!repoPath || !query) {
      return res.status(400).json({ 
        error: 'Repository path and search query are required' 
      });
    }

    const results = await searchFiles(repoPath, query, fileTypes);
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('File search error:', error);
    res.status(500).json({ 
      error: 'Failed to search files',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/files/stats
 * @desc Get file statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const { repoPath, filePath } = req.query;
    
    if (!repoPath || !filePath) {
      return res.status(400).json({ 
        error: 'Repository path and file path are required' 
      });
    }

    const stats = await getFileStats(repoPath, filePath);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get file statistics',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/files/create
 * @desc Create a new file
 * @access Public
 */
router.post('/create', async (req, res) => {
  try {
    const { repoPath, filePath, content = '', token } = req.body;
    
    if (!repoPath || !filePath) {
      return res.status(400).json({ 
        error: 'Repository path and file path are required' 
      });
    }

    const result = await createFile(repoPath, filePath, content, token);
    res.json({
      success: true,
      message: 'File created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({ 
      error: 'Failed to create file',
      message: error.message 
    });
  }
});

/**
 * @route DELETE /api/files/delete
 * @desc Delete a file
 * @access Public
 */
router.delete('/delete', async (req, res) => {
  try {
    const { repoPath, filePath, token } = req.body;
    
    if (!repoPath || !filePath) {
      return res.status(400).json({ 
        error: 'Repository path and file path are required' 
      });
    }

    const result = await deleteFile(repoPath, filePath, token);
    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      message: error.message 
    });
  }
});

/**
 * @route PUT /api/files/move
 * @desc Move/rename a file
 * @access Public
 */
router.put('/move', async (req, res) => {
  try {
    const { repoPath, oldPath, newPath, token } = req.body;
    
    if (!repoPath || !oldPath || !newPath) {
      return res.status(400).json({ 
        error: 'Repository path, old path, and new path are required' 
      });
    }

    const result = await moveFile(repoPath, oldPath, newPath, token);
    res.json({
      success: true,
      message: 'File moved successfully',
      data: result
    });
  } catch (error) {
    console.error('Move file error:', error);
    res.status(500).json({ 
      error: 'Failed to move file',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/files/recent
 * @desc Get recently modified files
 * @access Public
 */
router.get('/recent', async (req, res) => {
  try {
    const { repoPath, limit = 10 } = req.query;
    
    if (!repoPath) {
      return res.status(400).json({ 
        error: 'Repository path is required' 
      });
    }

    // This would be implemented in fileService.js
    // const recentFiles = await getRecentFiles(repoPath, parseInt(limit));
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Get recent files error:', error);
    res.status(500).json({ 
      error: 'Failed to get recent files',
      message: error.message 
    });
  }
});

export default router;