# 🚀 **Winky-Coder: Production-Ready AI-Powered IDE**

**Own Backend Runtime + Text-to-App Prototype Generator**

[![CI/CD Pipeline](https://github.com/winky-a1/winky-coder/workflows/CI/badge.svg)](https://github.com/winky-a1/winky-coder/actions)
[![Security](https://img.shields.io/badge/security-audited-brightgreen)](https://github.com/winky-a1/winky-coder/security)
[![Production](https://img.shields.io/badge/production-ready-success)](https://winky-coder.com)

## 🎯 **What is Winky-Coder?**

Winky-Coder is a **production-ready, AI-powered Web IDE** that runs on **our own backend infrastructure**. It combines the power of AI with full-stack development capabilities, featuring:

- **🏠 Own Backend Runtime**: Complete control over infrastructure (no Firebase dependency)
- **🤖 Text-to-App Prototype Generator**: Turn ideas into working apps instantly
- **🧪 Production Emulator**: Safe testing with parity to production
- **🔒 Enterprise Security**: Vault integration, audit logs, RBAC
- **🚀 CI/CD Pipeline**: 8-gate comprehensive deployment pipeline

## ✨ **Key Features**

### **🎯 Text-to-App Prototype Generator**
Describe your app in plain English and get a working prototype:
```
"A notes app with email login, markdown editor, tags, and images"
→ Generates complete React + Node.js + PostgreSQL app
→ Runs in emulator with live preview
→ One-click deployment to production
```

### **🏗️ Own Backend Runtime**
- **Authentication**: JWT-based with bcrypt password hashing
- **Document Store**: PostgreSQL with JSONB (Firestore-like)
- **Storage**: S3-compatible object storage with signed URLs
- **Functions**: Docker-based serverless execution
- **Rules Engine**: Custom security rules with RBAC
- **Event System**: Redis-based triggers and events

### **🧪 Production Emulator**
- **Parity Tests**: Ensures local behavior matches production
- **Smoke Tests**: Comprehensive service testing
- **State Management**: Export/import emulator state
- **Container Orchestration**: Docker-based service management

### **🔒 Enterprise Security**
- **Vault Integration**: Secure secret management
- **Audit Logging**: Complete action history
- **RBAC**: Role-based access control
- **AI Safety**: Sandboxed execution with approvals
- **No Secrets in Prompts**: Service keys never sent to LLMs

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Docker
- PostgreSQL 15+
- Redis 7+

### **Local Development**

```bash
# Clone the repository
git clone https://github.com/winky-a1/winky-coder.git
cd winky-coder

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the production emulator
cd backend
npm run emulator:start

# Start the development server
npm run dev
```

### **Production Deployment**

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production (requires approval)
npm run deploy:production
```

## 🏗️ **Architecture**

### **Backend Services**
```
API Gateway (Express.js + JWT)
├── Auth Service (Passport.js + JWT)
├── Document Store (PostgreSQL + JSONB)
├── Storage Service (MinIO/S3)
├── Functions Runner (Docker containers)
├── Rules Engine (Custom DSL)
├── Event Queue (Redis + Bull)
└── Emulator (Local Docker compose)
```

### **Frontend**
```
React + TypeScript + Vite
├── Monaco Editor (Code editing)
├── Text-to-App Generator
├── Firebase Studio Integration
├── Real-time WebSocket connections
└── Local emulator integration
```

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/winky_coder

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=winky-coder-storage

# AI Models
GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
```

### **Production Configuration**

```bash
# Production settings
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://winky-coder.com

# Security
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
RATE_LIMIT_MAX_REQUESTS=1000
```

## 🧪 **Testing**

### **Run All Tests**

```bash
# Unit tests
npm run test:unit

# Integration tests (with emulator)
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Security tests
npm run test:security
```

### **Emulator Testing**

```bash
# Start emulator
npm run emulator:start

# Run parity tests
npm run test:emulator:parity

# Run smoke tests
npm run test:emulator:smoke

# Stop emulator
npm run emulator:stop
```

## 🔒 **Security**

### **Security Features**
- **Vault Integration**: HashiCorp Vault for secret management
- **Audit Logging**: Complete action history
- **RBAC**: Role-based access control
- **AI Safety**: Sandboxed execution with approvals
- **No Secrets in Prompts**: Service keys never sent to LLMs

### **Security Scans**
- **SAST**: Static Application Security Testing
- **Dependency Audit**: Vulnerability scanning
- **Container Scan**: Docker image security
- **Secret Detection**: TruffleHog integration

## 📊 **Monitoring & Observability**

### **Metrics Dashboard**
- **Uptime**: Real-time service health
- **Latency**: API response times
- **Token Usage**: AI model consumption
- **Error Rates**: Application errors
- **Performance**: Function execution times

### **Logging**
- **Centralized Logs**: Searchable with correlation IDs
- **AI Sessions**: Complete AI interaction history
- **Emulator Runs**: Full emulator execution logs
- **Audit Trail**: All user and AI actions

## 🚀 **CI/CD Pipeline**

### **8-Gate Deployment Pipeline**
1. **Dependency Installation & Security Scans**
2. **Lint & Format Check**
3. **Unit Tests** (≥95% coverage)
4. **Integration Tests** (Emulator)
5. **Performance Smoke Tests**
6. **Container Security Scan**
7. **End-to-End Tests**
8. **Security Review**

### **Deployment Stages**
- **Staging**: Automated deployment with smoke tests
- **Production**: Manual approval required with audit trail

### **Rollback Mechanisms**
- **Instant Rollback**: Revert to previous version
- **Database Rollback**: Restore from backup
- **Service Rollback**: Deploy previous version

## 📈 **Performance**

### **SLA Requirements**
- **API Response Time**: < 100ms average
- **Function Cold Start**: < 500ms
- **Database Query Time**: < 50ms
- **Emulator Startup**: < 30 seconds
- **Text-to-App Generation**: < 2 minutes

### **Scalability**
- **Horizontal Scaling**: Auto-scaling based on load
- **Database**: Read replicas and connection pooling
- **Storage**: CDN integration for static assets
- **Functions**: Container orchestration

## 🤝 **Contributing**

### **Development Workflow**
1. **Branch Naming**: `winky/<type>-<short-desc>-<id>`
2. **Commit Messages**: Conventional commits format
3. **Code Review**: At least one approval required
4. **Security Review**: Required for infrastructure changes
5. **CI Gates**: All tests must pass

### **Code Standards**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Test Coverage**: ≥95% for critical modules

## 📚 **Documentation**

### **API Documentation**
- **REST API**: Complete endpoint documentation
- **WebSocket API**: Real-time communication
- **Model Adapter API**: AI model integration
- **Emulator API**: Local testing interface

### **Developer Guides**
- **Getting Started**: Quick setup guide
- **Architecture**: System design documentation
- **Security**: Security best practices
- **Deployment**: Production deployment guide

## 🆘 **Support**

### **Getting Help**
- **Documentation**: [docs.winky-coder.com](https://docs.winky-coder.com)
- **Issues**: [GitHub Issues](https://github.com/winky-a1/winky-coder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/winky-a1/winky-coder/discussions)
- **Security**: [Security Policy](SECURITY.md)

### **Emergency Contacts**
- **Production Issues**: [oncall@winky-coder.com](mailto:oncall@winky-coder.com)
- **Security Issues**: [security@winky-coder.com](mailto:security@winky-coder.com)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **CEO**: For the vision and production-ready mandate
- **Winky-Coder Team**: For world-class engineering execution
- **Open Source Community**: For the amazing tools and libraries

---

## 🎉 **Production-Ready Status**

✅ **Own Backend Runtime** - Complete control over infrastructure  
✅ **Text-to-App Prototype** - First-class feature  
✅ **AI Agent Safety** - Sandboxed with approvals  
✅ **Git-First Workflow** - Branch/PR conventions enforced  
✅ **Production-Grade Quality** - All CI gates implemented  

**Winky-Coder is now a BANGER production-ready AI-powered IDE!** 🚀

---

**Built with ❤️ by the Winky-Coder Team**
