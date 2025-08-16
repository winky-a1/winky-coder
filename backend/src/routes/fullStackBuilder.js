import express from 'express';
import fullStackBuilder from '../services/fullStackBuilder.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// Get all available app templates
router.get('/templates', async (req, res) => {
  try {
    // This would return the templates from the frontend component
    // For now, return a simplified list
    const templates = [
      {
        id: 'ecommerce-shopify',
        name: 'E-commerce Store',
        description: 'Complete online store with payment processing',
        category: 'E-commerce',
        features: ['Product catalog', 'Shopping cart', 'Payment processing'],
        techStack: {
          frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'TypeScript', 'Prisma'],
          database: ['PostgreSQL', 'Redis'],
          deployment: ['Vercel', 'Railway']
        },
        estimatedTime: '2-3 hours',
        complexity: 'Intermediate',
        price: 'Free'
      },
      {
        id: 'social-network',
        name: 'Social Network',
        description: 'Full-featured social platform with real-time chat',
        category: 'Social',
        features: ['User profiles', 'Posts & stories', 'Real-time chat'],
        techStack: {
          frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'TypeScript', 'Prisma'],
          database: ['PostgreSQL', 'Redis'],
          deployment: ['Vercel', 'Railway']
        },
        estimatedTime: '3-4 hours',
        complexity: 'Advanced',
        price: 'Free'
      },
      {
        id: 'crm-system',
        name: 'CRM System',
        description: 'Customer relationship management with analytics',
        category: 'Business',
        features: ['Lead management', 'Deal pipeline', 'Analytics dashboard'],
        techStack: {
          frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'TypeScript', 'Prisma'],
          database: ['PostgreSQL', 'Redis'],
          deployment: ['Vercel', 'Railway']
        },
        estimatedTime: '3-4 hours',
        complexity: 'Intermediate',
        price: 'Free'
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// Build a full-stack app
router.post('/build', async (req, res) => {
  try {
    const { template, config } = req.body;

    if (!template || !config) {
      return res.status(400).json({
        success: false,
        error: 'Template and configuration are required'
      });
    }

    console.log(`🚀 Building full-stack app: ${template.name}`);

    // Start the building process
    const result = await fullStackBuilder.generateFullStackApp(template, config);

    res.json({
      success: true,
      data: result,
      message: 'Full-stack app built successfully!'
    });
  } catch (error) {
    console.error('Error building full-stack app:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to build full-stack app'
    });
  }
});

// Get build status
router.get('/status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and get its status
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    const exists = await fs.pathExists(projectPath);
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Get project info
    const packageJsonPath = path.join(projectPath, 'frontend', 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    res.json({
      success: true,
      data: {
        projectId,
        name: packageJson.name,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting build status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get build status'
    });
  }
});

// Download project
router.get('/download/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    
    const exists = await fs.pathExists(projectPath);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Create a zip file of the project
    const archiver = await import('archiver');
    const archive = archiver.default('zip', { zlib: { level: 9 } });
    
    res.attachment(`${projectId}.zip`);
    archive.pipe(res);
    archive.directory(projectPath, false);
    await archive.finalize();
    
  } catch (error) {
    console.error('Error downloading project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download project'
    });
  }
});

// Deploy project
router.post('/deploy/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { platform } = req.body; // 'vercel', 'railway', etc.
    
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    const exists = await fs.pathExists(projectPath);
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Deploy to the specified platform
    let deploymentUrl;
    
    switch (platform) {
      case 'vercel':
        deploymentUrl = await deployToVercel(projectPath, projectId);
        break;
      case 'railway':
        deploymentUrl = await deployToRailway(projectPath, projectId);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported deployment platform'
        });
    }

    res.json({
      success: true,
      data: {
        projectId,
        platform,
        deploymentUrl,
        message: `Successfully deployed to ${platform}`
      }
    });
  } catch (error) {
    console.error('Error deploying project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deploy project'
    });
  }
});

// Helper functions for deployment
async function deployToVercel(projectPath, projectId) {
  // This would integrate with Vercel CLI or API
  // For now, return a placeholder URL
  return `https://${projectId}.vercel.app`;
}

async function deployToRailway(projectPath, projectId) {
  // This would integrate with Railway CLI or API
  // For now, return a placeholder URL
  return `https://${projectId}.railway.app`;
}

export default router;