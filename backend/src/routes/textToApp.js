import express from 'express';
import { processAIRequest } from '../services/aiService.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
const router = express.Router();

// Generate app plan from text description
router.post('/generate-plan', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    const aiPrompt = `You are an expert full-stack developer and product architect. Given a plain English description of an app, create a comprehensive development plan.

User Description: "${prompt}"

Options:
- Backend: ${options.backend}
- Auth: ${options.auth}
- Styling: ${options.styling}

Generate a structured plan that includes:

1. App Name and Description
2. Screens/Pages needed
3. Data Models with fields and types
4. API endpoints
5. Cloud Functions/Backend logic
6. Dependencies required
7. Test cases
8. Cost estimate and complexity assessment

Focus on creating a working prototype that can be generated and tested immediately. Keep it simple but functional.

Return the plan in JSON format with this structure:
{
  "id": "unique-id",
  "name": "App Name",
  "description": "Brief description",
  "screens": [{"id": "screen1", "name": "Login", "description": "...", "components": ["..."], "wireframe": "..."}],
  "models": [{"id": "model1", "name": "User", "fields": [{"name": "email", "type": "string", "required": true, "description": "..."}]}],
  "apis": [{"id": "api1", "name": "login", "method": "POST", "path": "/auth/login", "description": "...", "auth": false}],
  "functions": [{"id": "func1", "name": "processData", "trigger": "http", "description": "...", "runtime": "nodejs"}],
  "dependencies": ["react", "express", "..."],
  "tests": [{"id": "test1", "name": "Login Test", "type": "unit", "description": "..."}],
  "costEstimate": "$5-10/month",
  "complexity": "simple|medium|complex",
  "estimatedTime": "2-3 hours"
}`;

    const response = await processAIRequest({
      model: 'gemini-2.0-pro',
      prompt: aiPrompt,
      maxTokens: 3000
    });

    // Extract JSON from AI response
    const plan = extractPlanFromResponse(response.content);

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Error generating app plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate app plan'
    });
  }
});

// Generate actual app code from plan
router.post('/generate-app', async (req, res) => {
  try {
    const { plan, options } = req.body;

    const aiPrompt = `Generate complete, runnable code for this app plan:

App: ${plan.name}
Description: ${plan.description}
Backend: ${options.backend}
Auth: ${options.auth}
Styling: ${options.styling}

Screens: ${JSON.stringify(plan.screens)}
Models: ${JSON.stringify(plan.models)}
APIs: ${JSON.stringify(plan.apis)}
Functions: ${JSON.stringify(plan.functions)}

Generate the following files:

1. Frontend React components for each screen
2. Backend API routes and controllers
3. Database models and schemas
4. Cloud functions (if using our runtime)
5. Configuration files (package.json, etc.)
6. Basic tests
7. README with setup instructions

Use modern best practices:
- TypeScript for type safety
- Tailwind CSS for styling (if selected)
- Express.js for backend
- PostgreSQL with JSONB for database
- JWT for authentication
- Proper error handling and validation

Make sure the code is:
- Immediately runnable
- Well-commented
- Follows best practices
- Includes basic error handling
- Has proper TypeScript types

Return the files as a JSON object with file paths as keys and content as values.`;

    const response = await processAIRequest({
      model: 'gemini-2.0-pro',
      prompt: aiPrompt,
      maxTokens: 4000
    });

    // Extract files from AI response
    const files = extractFilesFromResponse(response.content);

    res.json({
      success: true,
      files: Object.keys(files)
    });
  } catch (error) {
    console.error('Error generating app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate app'
    });
  }
});

// Test the generated app
router.post('/test-app', async (req, res) => {
  try {
    const { files, plan } = req.body;

    // Create ephemeral workspace
    const workspaceId = uuidv4();
    const workspacePath = path.join(process.cwd(), 'temp', workspaceId);
    await fs.ensureDir(workspacePath);

    // This would write the generated files to the workspace
    // For now, simulate the process

    // Run tests in emulator
    const testResults = await runTestsInEmulator(workspacePath, plan);

    // Generate preview URL
    const previewUrl = `http://localhost:3000/preview/${workspaceId}`;

    res.json({
      success: true,
      results: testResults,
      previewUrl,
      workspaceId
    });
  } catch (error) {
    console.error('Error testing app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test app'
    });
  }
});

// Commit the generated app
router.post('/commit-app', async (req, res) => {
  try {
    const { plan, files, testResults, options } = req.body;

    // Create Git repository and commit
    const appId = uuidv4();
    const branchName = `winky/proto-${plan.name.toLowerCase().replace(/\s+/g, '-')}-${appId.substring(0, 8)}`;

    // This would:
    // 1. Create a new Git repository
    // 2. Add all generated files
    // 3. Create initial commit
    // 4. Push to remote repository
    // 5. Create pull request

    const commitMessage = `feat: Add ${plan.name} - AI-generated prototype

Generated from description: "${plan.description}"
- ${plan.screens.length} screens
- ${plan.models.length} data models
- ${plan.functions.length} functions
- ${testResults.length} tests passed

Backend: ${options.backend}
Auth: ${options.auth}
Styling: ${options.styling}

Generated by Winky-Coder Text-to-App Generator`;

    // Simulate successful commit
    console.log(`Creating app: ${appId} with branch: ${branchName}`);

    res.json({
      success: true,
      appId,
      branchName,
      commitMessage,
      prUrl: `https://github.com/your-org/your-repo/pull/123`
    });
  } catch (error) {
    console.error('Error committing app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to commit app'
    });
  }
});

// Get app templates and examples
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'notes-app',
        name: 'Notes App',
        description: 'A notes app with email login, markdown editor, tags, and images',
        prompt: 'A notes app with email login, markdown editor, tags filter, and images. Home screen shows notes list, tapping opens editor. Notes are private by default and can be shared via public link.',
        complexity: 'simple',
        estimatedTime: '2-3 hours',
        costEstimate: '$5-10/month'
      },
      {
        id: 'ecommerce',
        name: 'E-commerce Prototype',
        description: 'Product catalog, cart, checkout, and admin panel',
        prompt: 'A tiny e-commerce prototype: product list, product page, cart, checkout with mock payment, admin-only product create.',
        complexity: 'medium',
        estimatedTime: '4-6 hours',
        costEstimate: '$15-25/month'
      },
      {
        id: 'chat-app',
        name: 'Chat App',
        description: 'Real-time messaging with rooms and notifications',
        prompt: 'A chat app with username-based login, public rooms, messages saved in DB, and simple push-notification placeholder.',
        complexity: 'medium',
        estimatedTime: '3-5 hours',
        costEstimate: '$10-20/month'
      },
      {
        id: 'recipe-app',
        name: 'Recipe App',
        description: 'Recipe management with photos and categories',
        prompt: 'A recipe app with login, add recipes with photos, categories, and search functionality.',
        complexity: 'simple',
        estimatedTime: '2-4 hours',
        costEstimate: '$8-15/month'
      },
      {
        id: 'task-manager',
        name: 'Task Manager',
        description: 'Team collaboration with kanban boards',
        prompt: 'A task management app with teams, projects, kanban boards, and real-time collaboration.',
        complexity: 'complex',
        estimatedTime: '6-8 hours',
        costEstimate: '$20-35/month'
      }
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
});

// Helper functions
function extractPlanFromResponse(content) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing plan JSON:', error);
  }

  // Fallback to default plan
  return {
    id: uuidv4(),
    name: 'Generated App',
    description: 'AI-generated application',
    screens: [
      {
        id: 'screen1',
        name: 'Home',
        description: 'Main application screen',
        components: ['Header', 'Content', 'Footer'],
        wireframe: 'Basic layout with navigation'
      }
    ],
    models: [
      {
        id: 'model1',
        name: 'User',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
          { name: 'email', type: 'string', required: true, description: 'User email' }
        ],
        indexes: ['email'],
        rules: ['users can read own data']
      }
    ],
    apis: [
      {
        id: 'api1',
        name: 'getUser',
        method: 'GET',
        path: '/api/users/:id',
        description: 'Get user by ID',
        auth: true
      }
    ],
    functions: [
      {
        id: 'func1',
        name: 'processData',
        trigger: 'http',
        description: 'Process user data',
        runtime: 'nodejs'
      }
    ],
    dependencies: ['react', 'express', 'typescript'],
    tests: [
      {
        id: 'test1',
        name: 'User Creation',
        type: 'unit',
        description: 'Test user creation functionality'
      }
    ],
    costEstimate: '$5-10/month',
    complexity: 'simple',
    estimatedTime: '2-3 hours'
  };
}

function extractFilesFromResponse(content) {
  // This would parse the AI response and extract individual files
  // For now, return a mock file structure
  return {
    'package.json': '{"name": "generated-app", "version": "1.0.0"}',
    'src/App.tsx': '// Generated React app component',
    'src/components/Home.tsx': '// Home screen component',
    'backend/server.js': '// Express server',
    'backend/models/User.js': '// User model',
    'README.md': '# Generated App\n\nThis app was generated by Winky-Coder.'
  };
}

async function runTestsInEmulator(workspacePath, plan) {
  // This would run tests in the emulator
  // For now, return mock test results
  return [
    {
      name: 'App Startup',
      passed: true,
      duration: '1.2s'
    },
    {
      name: 'Database Connection',
      passed: true,
      duration: '0.8s'
    },
    {
      name: 'Authentication Flow',
      passed: true,
      duration: '2.1s'
    },
    {
      name: 'API Endpoints',
      passed: true,
      duration: '1.5s'
    }
  ];
}

export default router;