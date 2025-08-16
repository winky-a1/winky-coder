# 🚀 Winky-Coder Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites
- [Vercel Account](https://vercel.com/signup)
- [GitHub Account](https://github.com)
- API Keys (see below)

### Step 1: Prepare Your Repository

1. **Fork or Clone** this repository to your GitHub account
2. **Add API Keys** to Vercel environment variables (see Step 3)

### Step 2: Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/winky-coder)

#### Option B: Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: winky-coder
# - Directory: ./
# - Override settings? No
```

### Step 3: Configure Environment Variables

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

```bash
# Required AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional GitHub OAuth (for enhanced features)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security
JWT_SECRET=your_random_jwt_secret_here
ENCRYPTION_KEY=your_random_encryption_key_here

# Server Configuration
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Get Your API Keys

#### 1. Gemini API Key (Required)
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Click "Create API Key"
- Copy the key to `GEMINI_API_KEY`

#### 2. OpenRouter API Key (Required)
- Go to [OpenRouter](https://openrouter.ai/keys)
- Sign up and get your API key
- Copy to `OPENROUTER_API_KEY`

### Step 5: Test Your Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Import a repository**: Use a public GitHub repo for testing
3. **Test AI features**: Try asking questions about your code
4. **Test vision**: Upload an image and analyze it

## 🔧 Alternative Deployment Options

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm start`

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=frontend/dist
```

## 🐛 Troubleshooting

### Common Issues

#### 1. API Key Errors
```
Error: API key not configured for model
```
**Solution**: Check your environment variables in Vercel dashboard

#### 2. CORS Errors
```
Access to fetch at '...' from origin '...' has been blocked
```
**Solution**: Ensure `FRONTEND_URL` is set correctly in environment variables

#### 3. Build Failures
```
Build failed: Module not found
```
**Solution**: Check that all dependencies are in `package.json`

#### 4. Git Operations Fail
```
Git clone failed
```
**Solution**: Use public repositories or add GitHub token for private repos

### Environment Variable Checklist

- [ ] `GEMINI_API_KEY` - Google AI Studio API key
- [ ] `OPENROUTER_API_KEY` - OpenRouter API key
- [ ] `JWT_SECRET` - Random string for JWT signing
- [ ] `ENCRYPTION_KEY` - Random string for encryption
- [ ] `NODE_ENV` - Set to "production"
- [ ] `FRONTEND_URL` - Your Vercel app URL

## 🔒 Security Notes

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** (automatic with Vercel)
4. **Set up proper CORS** (handled by the app)
5. **Use strong secrets** for JWT and encryption keys

## 📊 Monitoring

### Vercel Analytics
- View deployment status in Vercel dashboard
- Monitor API usage and performance
- Check error logs for debugging

### API Usage Monitoring
- Monitor AI API usage in respective dashboards
- Set up usage alerts to avoid unexpected costs
- Track token consumption and costs

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] API keys working
- [ ] Repository import tested
- [ ] AI chat functionality tested
- [ ] Vision analysis tested
- [ ] Git operations tested
- [ ] Error handling verified
- [ ] Performance optimized
- [ ] Security measures in place

## 💰 Cost Optimization

### Free Tier Limits
- **Gemini**: 15 requests/minute (free)
- **OpenRouter**: $5 free credits
- **Vercel**: 100GB bandwidth/month (free)

### Cost Monitoring
- Set up billing alerts
- Monitor API usage regularly
- Use free models when possible

## 🆘 Support

If you encounter issues:

1. **Check the logs** in Vercel dashboard
2. **Verify environment variables**
3. **Test with a simple repository first**
4. **Open an issue** on GitHub
5. **Check the troubleshooting section above**

---

**Happy coding with Winky-Coder! 🎉**