# Winky-Coder MVP Setup Guide

This guide will help you set up and run the Winky-Coder MVP locally.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **GitHub Personal Access Token** (Create at [GitHub Settings](https://github.com/settings/tokens))

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd winky-coder

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment (.env)

Create `backend/.env` file:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# GitHub Configuration (Optional for public repos)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Model API Keys (Add your keys here)
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
QWEN_API_KEY=your_qwen_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Storage
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

#### Frontend Environment (.env.local)

Create `frontend/.env.local` file:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api

# GitHub Configuration
VITE_GITHUB_CLIENT_ID=your_github_client_id

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_GIT=true
VITE_ENABLE_FILE_EDITOR=true

# Development
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true
```

### 3. Start Development Servers

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Configuration Details

### GitHub Token Setup

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read organization data)
4. Copy the token and use it in the app

### AI Model API Keys

#### Gemini (Google)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `GEMINI_API_KEY` in backend `.env`

#### OpenRouter
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Create an API key
3. Add to `OPENROUTER_API_KEY` in backend `.env`

#### Qwen (Alibaba)
1. Go to [DashScope](https://dashscope.console.aliyun.com/)
2. Create an API key
3. Add to `QWEN_API_KEY` in backend `.env`

#### DeepSeek
1. Go to [DeepSeek](https://platform.deepseek.com/)
2. Create an API key
3. Add to `DEEPSEEK_API_KEY` in backend `.env`

## 📁 Project Structure

```
winky-coder/
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── .env
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── .env.local
├── shared/                 # Shared utilities
│   ├── utils/             # Common utilities
│   ├── types/             # Shared types
│   └── constants/         # Shared constants
└── README.md
```

## 🛠 Available Scripts

### Backend Scripts
```bash
cd backend
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
```

### Frontend Scripts
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🔌 API Endpoints

### Repository Management
- `POST /api/repos/import` - Import GitHub repository
- `GET /api/repos/files` - Get repository files
- `GET /api/repos/file` - Get file content
- `PUT /api/repos/file` - Update file content
- `POST /api/repos/commit` - Commit changes
- `POST /api/repos/pull` - Pull changes

### AI Services
- `POST /api/ai/chat` - Send AI request
- `GET /api/ai/models` - Get available models
- `POST /api/ai/analyze` - Analyze codebase
- `POST /api/ai/refactor` - Refactor code
- `POST /api/ai/fix` - Fix code issues
- `POST /api/ai/explain` - Explain code

### File Operations
- `GET /api/files/search` - Search files
- `GET /api/files/stats` - Get file statistics
- `POST /api/files/create` - Create new file
- `DELETE /api/files/delete` - Delete file
- `PUT /api/files/move` - Move/rename file

## 🎯 Features

### ✅ Implemented (Phase 1)
- [x] GitHub repository import
- [x] File tree navigation
- [x] Monaco Editor integration
- [x] AI chat panel with multi-model support
- [x] Git operations (commit, push, pull)
- [x] File editing and saving
- [x] Command palette (Ctrl+K)
- [x] Modern UI with glassmorphism
- [x] Dark/light theme support
- [x] Responsive design

### 🚧 Planned (Phase 2)
- [ ] Real AI model integrations
- [ ] Advanced code analysis
- [ ] Auto-completion and suggestions
- [ ] Terminal integration
- [ ] Debugging support
- [ ] Extensions system
- [ ] Collaboration features

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

#### Node Version Issues
```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm use 18
```

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

#### Git Issues
```bash
# Clear git cache
git config --global credential.helper cache
git config --global --unset credential.helper
```

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_ENABLE_LOGGING=true npm run dev
```

## 🔒 Security Notes

- GitHub tokens are stored locally in browser localStorage
- API keys are stored in backend environment variables
- All API requests are rate-limited
- CORS is configured for development
- Input validation is implemented on all endpoints

## 📝 Development Notes

### Adding New AI Models

1. Add model configuration to `shared/constants/aiModels.ts`
2. Implement provider in `backend/src/services/aiService.js`
3. Update frontend model selector

### Adding New File Types

1. Update language mapping in `shared/utils/fileUtils.ts`
2. Add syntax highlighting support in Monaco Editor
3. Update file icons and colors

### Styling Guidelines

- Use Tailwind CSS classes
- Follow glassmorphism design principles
- Maintain dark theme compatibility
- Use Framer Motion for animations

## 🚀 Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy frontend and backend functions

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Verify environment variables are set correctly

## 📄 License

MIT License - see LICENSE file for details