import express from 'express';
import { processAIRequest, getAvailableModels } from '../services/aiService.js';

const router = express.Router();

/**
 * @route POST /api/ai/chat
 * @desc Send AI request to selected model
 * @access Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { 
      prompt, 
      model, 
      context, 
      files, 
      temperature = 0.7,
      maxTokens = 4000 
    } = req.body;
    
    if (!prompt || !model) {
      return res.status(400).json({ 
        error: 'Prompt and model are required' 
      });
    }

    const result = await processAIRequest({
      prompt,
      model,
      context,
      files,
      temperature,
      maxTokens
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/analyze
 * @desc Analyze codebase with AI
 * @access Public
 */
router.post('/analyze', async (req, res) => {
  try {
    const { 
      repoPath, 
      model, 
      analysisType = 'general',
      specificFiles = []
    } = req.body;
    
    if (!repoPath || !model) {
      return res.status(400).json({ 
        error: 'Repository path and model are required' 
      });
    }

    const result = await processAIRequest({
      prompt: `Analyze this codebase for ${analysisType}. Focus on: ${specificFiles.join(', ')}`,
      model,
      context: { repoPath, analysisType, specificFiles },
      temperature: 0.3
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze codebase',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/refactor
 * @desc Get AI suggestions for code refactoring
 * @access Public
 */
router.post('/refactor', async (req, res) => {
  try {
    const { 
      filePath, 
      content, 
      model, 
      refactorType = 'general'
    } = req.body;
    
    if (!filePath || !content || !model) {
      return res.status(400).json({ 
        error: 'File path, content, and model are required' 
      });
    }

    const prompt = `Refactor this code for ${refactorType} improvements. Focus on:
    - Code readability
    - Performance optimization
    - Best practices
    - Error handling
    
    File: ${filePath}
    Content:
    ${content}`;

    const result = await processAIRequest({
      prompt,
      model,
      context: { filePath, refactorType },
      temperature: 0.4
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI refactor error:', error);
    res.status(500).json({ 
      error: 'Failed to get refactoring suggestions',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/fix
 * @desc Auto-fix code issues
 * @access Public
 */
router.post('/fix', async (req, res) => {
  try {
    const { 
      filePath, 
      content, 
      model, 
      errorMessage,
      errorType = 'runtime'
    } = req.body;
    
    if (!filePath || !content || !model) {
      return res.status(400).json({ 
        error: 'File path, content, and model are required' 
      });
    }

    const prompt = `Fix the ${errorType} error in this code:
    
    Error: ${errorMessage}
    File: ${filePath}
    Content:
    ${content}
    
    Provide the corrected code with explanations.`;

    const result = await processAIRequest({
      prompt,
      model,
      context: { filePath, errorMessage, errorType },
      temperature: 0.2
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI fix error:', error);
    res.status(500).json({ 
      error: 'Failed to fix code issues',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/ai/models
 * @desc Get available AI models
 * @access Public
 */
router.get('/models', async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ 
      error: 'Failed to get available models',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/explain
 * @desc Get AI explanation of code
 * @access Public
 */
router.post('/explain', async (req, res) => {
  try {
    const { 
      filePath, 
      content, 
      model, 
      explanationType = 'general'
    } = req.body;
    
    if (!filePath || !content || !model) {
      return res.status(400).json({ 
        error: 'File path, content, and model are required' 
      });
    }

    const prompt = `Explain this code in detail:
    
    File: ${filePath}
    Type: ${explanationType}
    Content:
    ${content}
    
    Provide a comprehensive explanation including:
    - What the code does
    - How it works
    - Key concepts used
    - Potential improvements`;

    const result = await processAIRequest({
      prompt,
      model,
      context: { filePath, explanationType },
      temperature: 0.5
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI explain error:', error);
    res.status(500).json({ 
      error: 'Failed to explain code',
      message: error.message 
    });
  }
});

export default router;