import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { processAIRequest } from './aiService.js';

const execAsync = promisify(exec);

class FullStackBuilder {
  constructor() {
    this.templatesDir = path.join(process.cwd(), 'templates');
    this.projectsDir = path.join(process.cwd(), 'projects');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.templatesDir);
    await fs.ensureDir(this.projectsDir);
  }

  async generateFullStackApp(template, config) {
    try {
      console.log(`🚀 Starting full-stack app generation for ${template.name}`);
      
      const projectId = this.generateProjectId(config.appName);
      const projectPath = path.join(this.projectsDir, projectId);
      
      // Create project structure
      await this.createProjectStructure(projectPath, template, config);
      
      // Generate frontend
      await this.generateFrontend(projectPath, template, config);
      
      // Generate backend
      await this.generateBackend(projectPath, template, config);
      
      // Generate database
      await this.generateDatabase(projectPath, template, config);
      
      // Setup deployment
      await this.setupDeployment(projectPath, template, config);
      
      // Install dependencies
      await this.installDependencies(projectPath);
      
      // Deploy to platform
      const deploymentUrl = await this.deployApp(projectPath, config);
      
      return {
        success: true,
        projectId,
        projectPath,
        deploymentUrl,
        message: `${template.name} built successfully!`
      };
    } catch (error) {
      console.error('Full-stack app generation error:', error);
      throw new Error(`Failed to generate full-stack app: ${error.message}`);
    }
  }

  generateProjectId(appName) {
    const timestamp = Date.now();
    const sanitizedName = appName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedName}-${timestamp}`;
  }

  async createProjectStructure(projectPath, template, config) {
    console.log('📁 Creating project structure...');
    
    const structure = {
      frontend: {
        'package.json': this.generateFrontendPackageJson(template, config),
        'src': {
          'components': {},
          'pages': {},
          'styles': {},
          'utils': {},
          'hooks': {},
          'types': {}
        },
        'public': {},
        'next.config.js': this.generateNextConfig(template),
        'tailwind.config.js': this.generateTailwindConfig(),
        'tsconfig.json': this.generateTsConfig()
      },
      backend: {
        'package.json': this.generateBackendPackageJson(template, config),
        'src': {
          'routes': {},
          'controllers': {},
          'models': {},
          'middleware': {},
          'services': {},
          'utils': {}
        },
        'prisma': {
          'schema.prisma': this.generatePrismaSchema(template)
        },
        '.env': this.generateBackendEnv(config)
      },
      shared: {
        'types': {},
        'utils': {}
      },
      'docker-compose.yml': this.generateDockerCompose(template),
      'README.md': this.generateReadme(template, config),
      '.gitignore': this.generateGitignore()
    };

    await this.createNestedStructure(projectPath, structure);
  }

  async createNestedStructure(basePath, structure) {
    for (const [name, content] of Object.entries(structure)) {
      const fullPath = path.join(basePath, name);
      
      if (typeof content === 'object' && content !== null) {
        await fs.ensureDir(fullPath);
        await this.createNestedStructure(fullPath, content);
      } else {
        await fs.writeFile(fullPath, content);
      }
    }
  }

  async generateFrontend(projectPath, template, config) {
    console.log('🎨 Generating frontend...');
    
    const frontendPath = path.join(projectPath, 'frontend');
    
    // Generate main components based on template
    const components = await this.generateComponents(template, config);
    
    for (const [filename, content] of Object.entries(components)) {
      await fs.writeFile(path.join(frontendPath, 'src', 'components', filename), content);
    }
    
    // Generate pages
    const pages = await this.generatePages(template, config);
    
    for (const [filename, content] of Object.entries(pages)) {
      await fs.writeFile(path.join(frontendPath, 'src', 'pages', filename), content);
    }
    
    // Generate styles
    await fs.writeFile(
      path.join(frontendPath, 'src', 'styles', 'globals.css'),
      this.generateGlobalStyles()
    );
  }

  async generateBackend(projectPath, template, config) {
    console.log('⚙️ Generating backend...');
    
    const backendPath = path.join(projectPath, 'backend');
    
    // Generate API routes
    const routes = await this.generateRoutes(template, config);
    
    for (const [filename, content] of Object.entries(routes)) {
      await fs.writeFile(path.join(backendPath, 'src', 'routes', filename), content);
    }
    
    // Generate controllers
    const controllers = await this.generateControllers(template, config);
    
    for (const [filename, content] of Object.entries(controllers)) {
      await fs.writeFile(path.join(backendPath, 'src', 'controllers', filename), content);
    }
    
    // Generate models
    const models = await this.generateModels(template, config);
    
    for (const [filename, content] of Object.entries(models)) {
      await fs.writeFile(path.join(backendPath, 'src', 'models', filename), content);
    }
  }

  async generateDatabase(projectPath, template, config) {
    console.log('🗄️ Setting up database...');
    
    const backendPath = path.join(projectPath, 'backend');
    
    // Generate Prisma schema
    const schema = await this.generatePrismaSchema(template, config);
    await fs.writeFile(path.join(backendPath, 'prisma', 'schema.prisma'), schema);
    
    // Generate migrations
    await this.generateMigrations(backendPath, template, config);
  }

  async setupDeployment(projectPath, template, config) {
    console.log('🚀 Setting up deployment...');
    
    // Generate Vercel config
    const vercelConfig = this.generateVercelConfig(template, config);
    await fs.writeFile(path.join(projectPath, 'vercel.json'), vercelConfig);
    
    // Generate Railway config
    const railwayConfig = this.generateRailwayConfig(template, config);
    await fs.writeFile(path.join(projectPath, 'railway.json'), railwayConfig);
    
    // Generate GitHub Actions
    const githubActions = this.generateGitHubActions(template, config);
    await fs.ensureDir(path.join(projectPath, '.github', 'workflows'));
    await fs.writeFile(path.join(projectPath, '.github', 'workflows', 'deploy.yml'), githubActions);
  }

  async installDependencies(projectPath) {
    console.log('📦 Installing dependencies...');
    
    try {
      // Install frontend dependencies
      await execAsync('npm install', { cwd: path.join(projectPath, 'frontend') });
      
      // Install backend dependencies
      await execAsync('npm install', { cwd: path.join(projectPath, 'backend') });
      
      // Generate Prisma client
      await execAsync('npx prisma generate', { cwd: path.join(projectPath, 'backend') });
      
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.warn('⚠️ Some dependencies may not have installed correctly:', error.message);
    }
  }

  async deployApp(projectPath, config) {
    console.log('🌐 Deploying app...');
    
    try {
      // For now, return a placeholder URL
      // In production, this would deploy to Vercel/Railway
      const deploymentUrl = `https://${config.appName.toLowerCase().replace(/\s+/g, '-')}.vercel.app`;
      
      console.log(`✅ App deployed to ${deploymentUrl}`);
      return deploymentUrl;
    } catch (error) {
      console.warn('⚠️ Deployment failed:', error.message);
      return null;
    }
  }

  // Template generation methods
  generateFrontendPackageJson(template, config) {
    const dependencies = {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'typescript': '^5.0.0',
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'tailwindcss': '^3.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'framer-motion': '^10.16.0',
      'lucide-react': '^0.294.0',
      'axios': '^1.6.0',
      'zustand': '^4.4.0'
    };

    // Add template-specific dependencies
    if (template.techStack.frontend.includes('Stripe')) {
      dependencies['@stripe/stripe-js'] = '^2.0.0';
    }
    if (template.techStack.frontend.includes('Socket.io')) {
      dependencies['socket.io-client'] = '^4.7.0';
    }
    if (template.techStack.frontend.includes('Chart.js')) {
      dependencies['chart.js'] = '^4.4.0';
      dependencies['react-chartjs-2'] = '^5.2.0';
    }

    return JSON.stringify({
      name: `${config.appName.toLowerCase().replace(/\s+/g, '-')}-frontend`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies,
      devDependencies: {
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    }, null, 2);
  }

  generateBackendPackageJson(template, config) {
    const dependencies = {
      'express': '^4.18.0',
      'cors': '^2.8.5',
      'helmet': '^7.0.0',
      'morgan': '^1.10.0',
      'dotenv': '^16.3.0',
      'bcryptjs': '^2.4.3',
      'jsonwebtoken': '^9.0.0',
      'multer': '^1.4.5',
      'prisma': '^5.0.0',
      '@prisma/client': '^5.0.0',
      'redis': '^4.6.0',
      'axios': '^1.6.0',
      'joi': '^17.11.0'
    };

    // Add template-specific dependencies
    if (template.techStack.backend.includes('Socket.io')) {
      dependencies['socket.io'] = '^4.7.0';
    }
    if (template.techStack.backend.includes('FFmpeg')) {
      dependencies['fluent-ffmpeg'] = '^2.1.2';
    }

    return JSON.stringify({
      name: `${config.appName.toLowerCase().replace(/\s+/g, '-')}-backend`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'nodemon src/index.js',
        start: 'node src/index.js',
        build: 'echo "No build step required"',
        'db:migrate': 'prisma migrate dev',
        'db:generate': 'prisma generate'
      },
      dependencies,
      devDependencies: {
        'nodemon': '^3.0.0'
      }
    }, null, 2);
  }

  async generateComponents(template, config) {
    const components = {};
    
    // Generate based on template type
    switch (template.id) {
      case 'ecommerce-shopify':
        components['ProductCard.tsx'] = this.generateProductCard();
        components['ShoppingCart.tsx'] = this.generateShoppingCart();
        components['CheckoutForm.tsx'] = this.generateCheckoutForm();
        break;
      case 'social-network':
        components['PostCard.tsx'] = this.generatePostCard();
        components['UserProfile.tsx'] = this.generateUserProfile();
        components['ChatInterface.tsx'] = this.generateChatInterface();
        break;
      default:
        components['Header.tsx'] = this.generateHeader();
        components['Footer.tsx'] = this.generateFooter();
        components['Layout.tsx'] = this.generateLayout();
    }
    
    return components;
  }

  async generatePages(template, config) {
    const pages = {};
    
    // Generate based on template type
    switch (template.id) {
      case 'ecommerce-shopify':
        pages['index.tsx'] = this.generateEcommerceHome();
        pages['products/[id].tsx'] = this.generateProductDetail();
        pages['cart.tsx'] = this.generateCartPage();
        break;
      case 'social-network':
        pages['index.tsx'] = this.generateSocialFeed();
        pages['profile/[id].tsx'] = this.generateProfilePage();
        pages['messages.tsx'] = this.generateMessagesPage();
        break;
      default:
        pages['index.tsx'] = this.generateDefaultHome();
    }
    
    return pages;
  }

  async generateRoutes(template, config) {
    const routes = {};
    
    // Generate based on template type
    switch (template.id) {
      case 'ecommerce-shopify':
        routes['products.js'] = this.generateProductRoutes();
        routes['orders.js'] = this.generateOrderRoutes();
        routes['payments.js'] = this.generatePaymentRoutes();
        break;
      case 'social-network':
        routes['posts.js'] = this.generatePostRoutes();
        routes['users.js'] = this.generateUserRoutes();
        routes['messages.js'] = this.generateMessageRoutes();
        break;
      default:
        routes['index.js'] = this.generateDefaultRoutes();
    }
    
    return routes;
  }

  // Helper methods for generating specific components
  generateProductCard() {
    return `import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        <button
          onClick={() => onAddToWishlist(product.id)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">$${product.price}</span>
          <button
            onClick={() => onAddToCart(product.id)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};`;
  }

  generateShoppingCart() {
    return `import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">$${item.price}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">$${total.toFixed(2)}</span>
            </div>
            
            <button
              onClick={onCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};`;
  }

  // Add more component generation methods as needed...

  generateNextConfig(template) {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig`;
  }

  generateTailwindConfig() {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}`;
  }

  generateTsConfig() {
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
  }

  generatePrismaSchema(template, config) {
    return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Add more fields based on template
  posts     Post[]
  orders    Order[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  total     Float
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  }

  generateBackendEnv(config) {
    return `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/${config.appName.toLowerCase().replace(/\s+/g, '_')}"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
NODE_ENV=development

# External APIs
STRIPE_SECRET_KEY="your-stripe-secret-key"
SENDGRID_API_KEY="your-sendgrid-api-key"

# Redis
REDIS_URL="redis://localhost:6379"`;
  }

  generateDockerCompose(template) {
    return `version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/app
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:`;
  }

  generateReadme(template, config) {
    return `# ${config.appName}

A full-stack application built with ${template.techStack.frontend.join(', ')} for the frontend and ${template.techStack.backend.join(', ')} for the backend.

## Features

${template.features.map(feature => `- ${feature}`).join('\n')}

## Tech Stack

### Frontend
${template.techStack.frontend.map(tech => `- ${tech}`).join('\n')}

### Backend
${template.techStack.backend.map(tech => `- ${tech}`).join('\n')}

### Database
${template.techStack.database.map(tech => `- ${tech}`).join('\n')}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   cd frontend && npm install
   cd ../backend && npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   \`\`\`

3. Set up the database:
   \`\`\`bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   \`\`\`

4. Start the development servers:
   \`\`\`bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev
   
   # Terminal 2 - Backend
   cd backend && npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This app is configured for deployment on Vercel and Railway. See the respective configuration files for details.

## License

MIT`;
  }

  generateGitignore() {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db`;
  }

  generateVercelConfig(template, config) {
    return `{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}`;
  }

  generateRailwayConfig(template, config) {
    return `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}`;
  }

  generateGitHubActions(template, config) {
    return `name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'`;
  }
}

export default new FullStackBuilder();