/**
 * Validate GitHub token
 * @param {string} token - GitHub personal access token
 * @returns {boolean} Token validity
 */
export function validateGitHubToken(token) {
  if (!token) {
    return false;
  }
  
  // Basic validation - GitHub tokens are typically 40 characters
  if (token.length < 20) {
    return false;
  }
  
  // Check if it's a valid GitHub token format
  // GitHub tokens start with 'ghp_' for fine-grained tokens or are 40 chars for classic tokens
  if (!token.startsWith('ghp_') && token.length !== 40) {
    return false;
  }
  
  return true;
}

/**
 * GitHub token validation middleware
 */
export function validateGitHubTokenMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  
  if (!validateGitHubToken(token)) {
    return res.status(401).json({
      error: 'Invalid or missing GitHub token',
      message: 'Please provide a valid GitHub personal access token'
    });
  }
  
  req.githubToken = token;
  next();
}

/**
 * Optional GitHub token validation middleware
 */
export function optionalGitHubTokenMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  
  if (token && !validateGitHubToken(token)) {
    return res.status(401).json({
      error: 'Invalid GitHub token',
      message: 'Please provide a valid GitHub personal access token'
    });
  }
  
  req.githubToken = token;
  next();
}

/**
 * API key validation middleware
 */
export function validateApiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API key',
      message: 'Please provide a valid API key'
    });
  }
  
  // Add your API key validation logic here
  // For MVP, we'll accept any non-empty string
  if (apiKey.length < 10) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'Please provide a valid API key'
    });
  }
  
  req.apiKey = apiKey;
  next();
}

/**
 * Rate limiting middleware for AI requests
 */
export function aiRateLimitMiddleware(req, res, next) {
  // This would integrate with a rate limiting library
  // For MVP, we'll just pass through
  next();
}

/**
 * CORS middleware for development
 */
export function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}