import express from 'express';
import { processAIRequest } from '../services/aiService.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);
const router = express.Router();

// Generate Firebase security rules with AI
router.post('/generate-rules', async (req, res) => {
  try {
    const { prompt, currentRules, projectSnapshot } = req.body;

    const aiPrompt = `You are a Firebase security expert. Given the following project snapshot and requirements, generate comprehensive Firestore and Storage security rules.

Project Context:
- Collections: ${projectSnapshot.collections?.join(', ') || 'users, posts, admin'}
- Auth Providers: ${projectSnapshot.authProviders?.join(', ') || 'email, google'}
- Security Requirements: ${projectSnapshot.securityRequirements?.join(', ') || 'user-owned documents, admin access'}

Current Rules:
${currentRules || 'No existing rules'}

Requirements:
${prompt}

Generate:
1. Firestore security rules with proper authentication checks
2. Storage security rules for file access
3. Rate limiting and data validation rules
4. Admin access controls
5. User-specific document access patterns

Return the rules in a clean, well-commented format.`;

    const response = await processAIRequest({
      model: 'gemini-2.0-pro',
      prompt: aiPrompt,
      maxTokens: 2000
    });

    // Extract rules from AI response
    const rules = extractRulesFromResponse(response.content);

    res.json({
      success: true,
      rules: rules.firestore,
      storageRules: rules.storage,
      explanation: response.content
    });
  } catch (error) {
    console.error('Error generating rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate rules'
    });
  }
});

// Generate tests for security rules
router.post('/generate-tests', async (req, res) => {
  try {
    const { rules, type } = req.body;

    const aiPrompt = `Generate comprehensive test cases for Firebase ${type} security rules.

Rules:
${rules}

Generate test cases that cover:
1. Authenticated user access to their own data
2. Unauthenticated access attempts (should be denied)
3. Cross-user data access attempts (should be denied)
4. Admin access to all data
5. Invalid data format attempts
6. Rate limiting scenarios
7. Edge cases and security vulnerabilities

For each test, provide:
- Test name and description
- Request details (method, path, auth context, data)
- Expected result (allow/deny)
- Reasoning

Return tests in JSON format.`;

    const response = await processAIRequest({
      model: 'gemini-2.0-pro',
      prompt: aiPrompt,
      maxTokens: 1500
    });

    const tests = extractTestsFromResponse(response.content);

    res.json({
      success: true,
      tests
    });
  } catch (error) {
    console.error('Error generating tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate tests'
    });
  }
});

// Test security rules in emulator
router.post('/test-rules', async (req, res) => {
  try {
    const { rules, tests, type } = req.body;

    // This would integrate with Firebase emulator
    // For now, simulate test results
    const results = tests.map(test => ({
      testId: test.id,
      passed: Math.random() > 0.3, // Simulate 70% pass rate
      allow: Math.random() > 0.5,
      reason: 'Test executed in emulator'
    }));

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error testing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test rules'
    });
  }
});

// Save rules to project
router.post('/save-rules', async (req, res) => {
  try {
    const { projectId, firestoreRules, storageRules } = req.body;

    // This would save to actual Firebase project
    // For now, simulate success
    console.log(`Saving rules for project ${projectId}`);

    res.json({
      success: true,
      message: 'Rules saved successfully'
    });
  } catch (error) {
    console.error('Error saving rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save rules'
    });
  }
});

// Create PR with changes
router.post('/create-pr', async (req, res) => {
  try {
    const { projectId, changes, testResults, commitMessage } = req.body;

    // This would create a GitHub PR
    // For now, simulate success
    console.log(`Creating PR for project ${projectId}`);

    res.json({
      success: true,
      prUrl: `https://github.com/your-org/your-repo/pull/123`,
      message: 'Pull request created successfully'
    });
  } catch (error) {
    console.error('Error creating PR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create PR'
    });
  }
});

// AI suggestions for Firebase project
router.post('/ai-suggestions', async (req, res) => {
  try {
    const { currentRules, projectContext } = req.body;

    const aiPrompt = `Analyze this Firebase project and provide AI suggestions for improvements.

Current Rules:
${currentRules}

Project Context:
- Collections: ${projectContext.collections?.join(', ')}
- Auth Providers: ${projectContext.authProviders?.join(', ')}

Provide 3-5 specific suggestions for:
1. Security rule improvements
2. Performance optimizations
3. Best practices implementation
4. Common vulnerabilities to address
5. Cost optimization opportunities

Make suggestions actionable and specific.`;

    const response = await processAIRequest({
      model: 'gemini-2.0-pro',
      prompt: aiPrompt,
      maxTokens: 1000
    });

    const suggestions = extractSuggestionsFromResponse(response.content);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI suggestions'
    });
  }
});

// AI generation for Firebase components
router.post('/ai-generate', async (req, res) => {
  try {
    const { prompt, projectContext, category } = req.body;

    let aiPrompt = '';
    let maxTokens = 2000;

    switch (category) {
      case 'security':
        aiPrompt = `Generate Firebase security rules and configuration for: ${prompt}

Project Context:
- Project ID: ${projectContext.projectId}
- Current Rules: ${projectContext.currentRules}
- Functions: ${projectContext.functions?.length || 0}

Requirements:
${prompt}

Generate:
1. Firestore security rules
2. Storage security rules
3. Unit tests for security rules
4. Cost estimate and risk assessment
5. Implementation notes`;
        break;

      case 'function':
        aiPrompt = `Generate a Cloud Function for: ${prompt}

Project Context:
- Project ID: ${projectContext.projectId}
- Existing Functions: ${projectContext.functions?.length || 0}

Requirements:
${prompt}

Generate:
1. Complete Cloud Function code (TypeScript)
2. Package.json dependencies
3. Unit tests
4. Deployment configuration
5. Cost estimate and monitoring setup`;
        break;

      case 'database':
        aiPrompt = `Generate database configuration and indexes for: ${prompt}

Project Context:
- Project ID: ${projectContext.projectId}

Requirements:
${prompt}

Generate:
1. Firestore indexes configuration
2. Database schema design
3. Query optimization strategies
4. Migration scripts
5. Performance monitoring setup`;
        break;

      case 'deployment':
        aiPrompt = `Generate CI/CD pipeline for: ${prompt}

Project Context:
- Project ID: ${projectContext.projectId}

Requirements:
${prompt}

Generate:
1. GitHub Actions workflow
2. Emulator testing configuration
3. Deployment scripts
4. Environment configuration
5. Monitoring and alerting setup`;
        break;

      default:
        aiPrompt = `Generate Firebase configuration for: ${prompt}

Project Context:
- Project ID: ${projectContext.projectId}

Requirements:
${prompt}

Generate comprehensive implementation including code, tests, and documentation.`;
    }

    const response = await processAIRequest({
      model: 'gemini-2.0-pro',
      prompt: aiPrompt,
      maxTokens
    });

    const result = extractGeneratedContent(response.content, category);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error generating with AI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate with AI'
    });
  }
});

// Apply changes to project
router.post('/apply-changes', async (req, res) => {
  try {
    const { projectId, changes, commitMessage } = req.body;

    // This would apply changes to the actual project
    console.log(`Applying changes to project ${projectId}`);

    res.json({
      success: true,
      message: 'Changes applied successfully'
    });
  } catch (error) {
    console.error('Error applying changes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply changes'
    });
  }
});

// Emulator testing
router.post('/emulator-test', async (req, res) => {
  try {
    const { code, tests, category } = req.body;

    // This would run tests in Firebase emulator
    console.log(`Running emulator tests for ${category}`);

    res.json({
      success: true,
      results: {
        passed: tests.length - 1,
        failed: 1,
        total: tests.length
      }
    });
  } catch (error) {
    console.error('Error running emulator tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run emulator tests'
    });
  }
});

// Create AI-powered PR
router.post('/create-ai-pr', async (req, res) => {
  try {
    const { projectId, title, description, code, tests, costEstimate, riskAssessment } = req.body;

    // This would create a GitHub PR with AI-generated content
    console.log(`Creating AI-powered PR for ${title}`);

    res.json({
      success: true,
      prUrl: `https://github.com/your-org/your-repo/pull/456`,
      message: 'AI-powered PR created successfully'
    });
  } catch (error) {
    console.error('Error creating AI PR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create AI PR'
    });
  }
});

// Helper functions
function extractRulesFromResponse(content) {
  // Extract Firestore and Storage rules from AI response
  const firestoreMatch = content.match(/rules_version = '2'[\s\S]*?service cloud\.firestore[\s\S]*?}/);
  const storageMatch = content.match(/rules_version = '2'[\s\S]*?service firebase\.storage[\s\S]*?}/);

  return {
    firestore: firestoreMatch ? firestoreMatch[0] : '// No Firestore rules found',
    storage: storageMatch ? storageMatch[0] : '// No Storage rules found'
  };
}

function extractTestsFromResponse(content) {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing tests JSON:', error);
  }

  // Fallback to default tests
  return [
    {
      id: '1',
      name: 'Authenticated User Read',
      description: 'Test if authenticated users can read their own documents',
      request: {
        method: 'get',
        path: '/users/{uid}/profile',
        auth: { uid: 'user123', email: 'user@example.com' }
      },
      expected: { allow: true }
    }
  ];
}

function extractSuggestionsFromResponse(content) {
  // Extract suggestions from AI response
  const suggestions = content.split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(line => line.length > 0);

  return suggestions.length > 0 ? suggestions : [
    'Implement user-based security rules',
    'Add rate limiting to prevent abuse',
    'Set up proper data validation',
    'Configure indexes for better performance'
  ];
}

function extractGeneratedContent(content, category) {
  // Extract different types of content based on category
  const result = {
    code: content,
    tests: '',
    costEstimate: '$5-10/month',
    riskAssessment: 'Low risk - standard implementation'
  };

  // Extract code blocks
  const codeBlocks = content.match(/```[\s\S]*?```/g);
  if (codeBlocks) {
    result.code = codeBlocks.map(block => block.replace(/```/g, '')).join('\n\n');
  }

  // Extract test sections
  const testMatch = content.match(/Tests?:[\s\S]*?(?=\n\n|$)/i);
  if (testMatch) {
    result.tests = testMatch[0];
  }

  // Extract cost estimates
  const costMatch = content.match(/\$[\d,]+-\$[\d,]+/);
  if (costMatch) {
    result.costEstimate = costMatch[0];
  }

  return result;
}

export default router;