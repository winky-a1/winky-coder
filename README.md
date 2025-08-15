# Winky-Coder 🚀

A full AI-powered Web IDE that replicates the core features of Cursor AI agent with multi-model support and GitHub integration.

## ✨ Features

### Core MVP Features
- **Full GitHub Project Integration**
  - Import entire repositories (public & private via token)
  - View file tree, open/edit files, and search through codebase
  - Git commit, push, pull functionality directly from the IDE

- **AI Agent Core**
  - AI panel for sending prompts and getting code assistance
  - AI reads entire project context
  - Apply code changes directly into the repo
  - Auto-fix build/runtime errors
  - Multi-model support:
    - Gemini 2.0 Pro
    - Gemini 1.5 Flash
    - OpenRouter -2 model
    - Qwen Coder
    - DeepSeek TGN R1T2

- **Agent Behavior**
  - Reason over codebase and make step-by-step commits
  - Suggest & apply refactors
  - Run commands in secure sandbox for builds/tests
  - Auto-handle merge conflicts

- **Modern UI/UX**
  - Apple-like glassmorphism & liquid animations
  - Dark/light mode
  - Split-screen editor (code on left, AI chat on right)
  - Floating command palette for agent commands

## 🛠 Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **State Management**: Zustand
- **Code Editor**: Monaco Editor (VSCode's component)
- **Git Operations**: isomorphic-git
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- GitHub Personal Access Token (for private repos)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd winky-coder
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Frontend (.env.local)
   VITE_API_URL=http://localhost:3001
   VITE_GITHUB_CLIENT_ID=your_github_client_id

   # Backend (.env)
   PORT=3001
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
winky-coder/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

- `POST /api/repos/import` - Import GitHub repository
- `POST /api/repos/commit` - Commit and push changes
- `POST /api/ai/chat` - Send AI request
- `GET /api/repos/files` - Get repository files
- `GET /api/repos/branches` - Get repository branches

## 🤖 AI Models Integration

The AI service layer supports multiple models through adapter pattern:

- **Gemini Models**: Google's latest AI models
- **OpenRouter**: Access to various open-source models
- **Qwen Coder**: Specialized for code generation
- **DeepSeek**: Advanced reasoning capabilities

## 🔒 Security

- API keys stored locally in browser (MVP)
- Sandboxed code execution
- Encrypted local storage for user settings
- Secure GitHub token handling

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy frontend and backend functions

### Environment Variables for Production
```bash
# Frontend
VITE_API_URL=https://your-backend.vercel.app
VITE_GITHUB_CLIENT_ID=your_github_client_id

# Backend
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [ ] GPT-4 and Claude 3/4 integration
- [ ] Advanced code analysis features
- [ ] Team collaboration features
- [ ] Plugin system
- [ ] Mobile app version

---

Built with ❤️ for the developer community
