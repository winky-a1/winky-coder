import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Model configurations
const AI_MODELS = {
  // Gemini Models
  'gemini-2.0-pro': {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  'gemini-1.5-flash': {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  
  // OpenRouter Models
  'openrouter-2': {
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1'
  },
  
  // Qwen Models
  'qwen-coder': {
    provider: 'qwen',
    model: 'qwen/Qwen2.5-Coder-7B-Instruct',
    apiKey: process.env.QWEN_API_KEY,
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
  },
  
  // DeepSeek Models
  'deepseek-tgn-r1t2': {
    provider: 'deepseek',
    model: 'deepseek-ai/deepseek-coder-33b-instruct',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: 'https://api.deepseek.com/v1'
  }
};

/**
 * Get available AI models
 * @returns {Array} List of available models
 */
export async function getAvailableModels() {
  return Object.keys(AI_MODELS).map(key => ({
    id: key,
    name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    provider: AI_MODELS[key].provider,
    model: AI_MODELS[key].model,
    available: !!AI_MODELS[key].apiKey
  }));
}

/**
 * Process AI request with selected model
 * @param {Object} params - Request parameters
 * @returns {Object} AI response
 */
export async function processAIRequest(params) {
  const { prompt, model, context, files, temperature = 0.7, maxTokens = 4000 } = params;
  
  if (!AI_MODELS[model]) {
    throw new Error(`Model ${model} not supported`);
  }

  const modelConfig = AI_MODELS[model];
  
  if (!modelConfig.apiKey) {
    throw new Error(`API key not configured for model ${model}`);
  }

  try {
    switch (modelConfig.provider) {
      case 'gemini':
        return await processGeminiRequest(modelConfig, prompt, context, files, temperature);
      case 'openrouter':
        return await processOpenRouterRequest(modelConfig, prompt, context, files, temperature, maxTokens);
      case 'qwen':
        return await processQwenRequest(modelConfig, prompt, context, files, temperature);
      case 'deepseek':
        return await processDeepSeekRequest(modelConfig, prompt, context, files, temperature, maxTokens);
      default:
        throw new Error(`Provider ${modelConfig.provider} not implemented`);
    }
  } catch (error) {
    console.error(`AI request error for model ${model}:`, error);
    throw new Error(`Failed to process AI request: ${error.message}`);
  }
}

/**
 * Process Gemini request
 */
async function processGeminiRequest(config, prompt, context, files, temperature) {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ 
    model: config.model,
    generationConfig: {
      temperature,
      maxOutputTokens: 4000,
    }
  });

  // Build context from files and context
  let fullPrompt = prompt;
  
  if (context) {
    fullPrompt = `Context: ${JSON.stringify(context)}\n\n${prompt}`;
  }
  
  if (files && files.length > 0) {
    const fileContext = files.map(file => 
      `File: ${file.path}\nContent:\n${file.content}\n`
    ).join('\n');
    fullPrompt = `${fileContext}\n\n${fullPrompt}`;
  }

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  
  return {
    content: response.text(),
    model: config.model,
    provider: 'gemini',
    usage: {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    }
  };
}

/**
 * Process OpenRouter request
 */
async function processOpenRouterRequest(config, prompt, context, files, temperature, maxTokens) {
  const messages = buildMessages(prompt, context, files);
  
  const response = await axios.post(`${config.baseUrl}/chat/completions`, {
    model: config.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: response.data.choices[0].message.content,
    model: config.model,
    provider: 'openrouter',
    usage: response.data.usage
  };
}

/**
 * Process Qwen request
 */
async function processQwenRequest(config, prompt, context, files, temperature) {
  const messages = buildMessages(prompt, context, files);
  
  const response = await axios.post(`${config.baseUrl}/services/aigc/text-generation/generation`, {
    model: config.model,
    input: {
      messages
    },
    parameters: {
      temperature,
      max_tokens: 4000
    }
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: response.data.output.text,
    model: config.model,
    provider: 'qwen',
    usage: {
      promptTokens: response.data.usage?.input_tokens || 0,
      completionTokens: response.data.usage?.output_tokens || 0,
      totalTokens: response.data.usage?.total_tokens || 0
    }
  };
}

/**
 * Process DeepSeek request
 */
async function processDeepSeekRequest(config, prompt, context, files, temperature, maxTokens) {
  const messages = buildMessages(prompt, context, files);
  
  const response = await axios.post(`${config.baseUrl}/chat/completions`, {
    model: config.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: response.data.choices[0].message.content,
    model: config.model,
    provider: 'deepseek',
    usage: response.data.usage
  };
}

/**
 * Build messages array for chat-based models
 */
function buildMessages(prompt, context, files) {
  const messages = [];
  
  // Add system message with context
  if (context) {
    messages.push({
      role: 'system',
      content: `You are an AI coding assistant. Context: ${JSON.stringify(context)}`
    });
  }
  
  // Add file contents as context
  if (files && files.length > 0) {
    const fileContext = files.map(file => 
      `File: ${file.path}\nContent:\n${file.content}`
    ).join('\n\n');
    
    messages.push({
      role: 'user',
      content: `Here are the relevant files:\n\n${fileContext}`
    });
  }
  
  // Add the main prompt
  messages.push({
    role: 'user',
    content: prompt
  });
  
  return messages;
}

/**
 * Analyze codebase with AI
 * @param {string} repoPath - Repository path
 * @param {string} model - AI model to use
 * @param {string} analysisType - Type of analysis
 * @returns {Object} Analysis result
 */
export async function analyzeCodebase(repoPath, model, analysisType = 'general') {
  const prompt = `Analyze this codebase for ${analysisType} improvements. 
  Focus on:
  - Code quality and best practices
  - Performance optimizations
  - Security considerations
  - Architecture improvements
  - Documentation needs
  
  Provide specific, actionable recommendations.`;
  
  return await processAIRequest({
    prompt,
    model,
    context: { repoPath, analysisType },
    temperature: 0.3
  });
}

/**
 * Generate code documentation
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @param {string} model - AI model to use
 * @returns {Object} Documentation result
 */
export async function generateDocumentation(filePath, content, model) {
  const prompt = `Generate comprehensive documentation for this code file:
  
  File: ${filePath}
  Content:
  ${content}
  
  Include:
  - Function/class descriptions
  - Parameter explanations
  - Usage examples
  - Important notes
  
  Format the documentation clearly and professionally.`;
  
  return await processAIRequest({
    prompt,
    model,
    context: { filePath },
    temperature: 0.4
  });
}