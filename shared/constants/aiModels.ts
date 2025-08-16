export const AI_MODELS = {
  // Gemini Models (Vision + Text)
  'gemini-2.0-pro': {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro (Vision)',
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    description: 'Google\'s latest model with vision capabilities for UI analysis',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
    supportsVision: true,
    useCase: 'vision',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    description: 'Fast and efficient Gemini model for coding',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
    supportsVision: false,
    useCase: 'coding',
  },
  
  // OpenRouter Free Models
  'deepseek-r1t2-chimera': {
    id: 'deepseek-r1t2-chimera',
    name: 'DeepSeek R1T2 Chimera',
    provider: 'openrouter',
    model: 'tngtech/deepseek-r1t2-chimera:free',
    description: 'Free DeepSeek model for code generation',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
    supportsVision: false,
    useCase: 'coding',
  },
  'qwen3-coder': {
    id: 'qwen3-coder',
    name: 'Qwen3 Coder',
    provider: 'openrouter',
    model: 'qwen/qwen3-coder:free',
    description: 'Free Qwen model specialized for coding',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
    supportsVision: false,
    useCase: 'coding',
  },
  'deepseek-r1-0528': {
    id: 'deepseek-r1-0528',
    name: 'DeepSeek R1 0528',
    provider: 'openrouter',
    model: 'deepseek/deepseek-r1-0528:free',
    description: 'Free DeepSeek model for general coding tasks',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
    supportsVision: false,
    useCase: 'coding',
  },
  'deepseek-r1-qwen3-8b': {
    id: 'deepseek-r1-qwen3-8b',
    name: 'DeepSeek R1 Qwen3 8B',
    provider: 'openrouter',
    model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    description: 'Free hybrid DeepSeek-Qwen model',
    maxTokens: 4000,
    temperature: 0.7,
    available: true,
    supportsVision: false,
    useCase: 'coding',
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
} as const;

export type AIModelId = keyof typeof AI_MODELS;
export type AIProvider = keyof typeof AI_PROVIDERS;