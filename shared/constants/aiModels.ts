export const AI_MODELS = {
  // Gemini Models
  'gemini-2.0-pro': {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    description: 'Google\'s latest and most capable AI model',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    description: 'Fast and efficient Gemini model',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
  },
  
  // OpenRouter Models
  'openrouter-2': {
    id: 'openrouter-2',
    name: 'OpenRouter -2',
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    description: 'OpenRouter\'s GPT-4o Mini model',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
  },
  
  // Qwen Models
  'qwen-coder': {
    id: 'qwen-coder',
    name: 'Qwen Coder',
    provider: 'qwen',
    model: 'qwen/Qwen2.5-Coder-7B-Instruct',
    description: 'Specialized for code generation and analysis',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
  },
  
  // DeepSeek Models
  'deepseek-tgn-r1t2': {
    id: 'deepseek-tgn-r1t2',
    name: 'DeepSeek TGN R1T2',
    provider: 'deepseek',
    model: 'deepseek-ai/deepseek-coder-33b-instruct',
    description: 'Advanced reasoning and coding capabilities',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
  },
} as const;

export const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
  },
  qwen: {
    name: 'Qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    apiKeyEnv: 'QWEN_API_KEY',
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
  },
} as const;

export type AIModelId = keyof typeof AI_MODELS;
export type AIProvider = keyof typeof AI_PROVIDERS;