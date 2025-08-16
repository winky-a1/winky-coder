import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  Trash2, 
  Download,
  Copy,
  Sparkles,
  Image,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { aiAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { AIModel, ChatMessage } from '@/types';

const ChatPanel: React.FC = () => {
  const { 
    chat, 
    currentRepository, 
    editor,
    addMessage, 
    setChatLoading, 
    setSelectedModel,
    setChatTemperature,
    setChatMaxTokens 
  } = useAppStore();
  
  const [inputValue, setInputValue] = useState('');
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available models
  useEffect(() => {
    loadModels();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const loadModels = async () => {
    try {
      setIsLoadingModels(true);
      const availableModels = await aiAPI.getModels();
      setModels(availableModels);
    } catch (error) {
      console.error('Failed to load models:', error);
      // Fallback to default models
      setModels([
        { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro (Vision)', provider: 'gemini', model: 'gemini-2.0-flash-exp', available: true, supportsVision: true },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', model: 'gemini-1.5-flash', available: true, supportsVision: false },
        { id: 'deepseek-r1t2-chimera', name: 'DeepSeek R1T2 Chimera', provider: 'openrouter', model: 'tngtech/deepseek-r1t2-chimera:free', available: true, supportsVision: false },
        { id: 'qwen3-coder', name: 'Qwen3 Coder', provider: 'openrouter', model: 'qwen/qwen3-coder:free', available: true, supportsVision: false },
        { id: 'deepseek-r1-0528', name: 'DeepSeek R1 0528', provider: 'openrouter', model: 'deepseek/deepseek-r1-0528:free', available: true, supportsVision: false },
        { id: 'deepseek-r1-qwen3-8b', name: 'DeepSeek R1 Qwen3 8B', provider: 'openrouter', model: 'deepseek/deepseek-r1-0528-qwen3-8b:free', available: true, supportsVision: false },
      ]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chat.isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    try {
      setChatLoading(true);
      
      // Prepare context
      const context = {
        repository: currentRepository?.name,
        currentFile: editor.currentFile?.path,
        language: editor.language,
      };

      // Prepare files for context
      const files = editor.currentFile ? [{
        path: editor.currentFile.path,
        content: editor.currentFile.content,
      }] : [];

      // Send AI request
      const response = await aiAPI.sendRequest({
        prompt: userMessage,
        model: chat.selectedModel,
        context,
        files,
        temperature: chat.temperature,
        maxTokens: chat.maxTokens,
        imageData: selectedImage, // Add image data for vision
      });

      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.content,
        model: response.model,
        usage: response.usage,
      });

      // Clear image after sending
      setSelectedImage(null);
      setIsVisionMode(false);

    } catch (error) {
      console.error('AI request error:', error);
      toast.error('Failed to get AI response');
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setIsVisionMode(true);
        
        // Auto-select vision model if available
        const visionModel = models.find(m => m.supportsVision);
        if (visionModel) {
          setSelectedModel(visionModel.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVisionAnalysis = async () => {
    if (!selectedImage) return;

    try {
      setChatLoading(true);
      
      const response = await aiAPI.analyzeVision({
        imageData: selectedImage,
        prompt: 'Analyze this UI design and provide the HTML/CSS/JavaScript code to recreate it',
        model: 'gemini-2.0-pro'
      });

      addMessage({
        role: 'user',
        content: 'Analyze this UI design and provide the code to recreate it',
      });

      addMessage({
        role: 'assistant',
        content: response.content,
        model: response.model,
        usage: response.usage,
      });

      setSelectedImage(null);
      setIsVisionMode(false);

    } catch (error) {
      console.error('Vision analysis error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const clearChat = () => {
    useAppStore.getState().clearMessages();
    toast.success('Chat history cleared');
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-accent-400" />
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4 text-white/60" />
            </button>
            <button
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <label className="block text-xs text-white/60">AI Model</label>
          <div className="flex gap-2">
            <select
              value={chat.selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-dark flex-1 text-sm"
              disabled={isLoadingModels}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.supportsVision && '(Vision)'} {!model.available && '(Unavailable)'}
                </option>
              ))}
            </select>
            
            {/* Vision Upload Button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors" title="Upload UI Design">
                <Image className="w-4 h-4 text-white" />
              </div>
            </label>
          </div>
        </div>

        {/* Vision Mode Indicator */}
        {isVisionMode && selectedImage && (
          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Vision Mode Active</span>
            </div>
            <div className="flex items-center gap-3">
              <img 
                src={selectedImage} 
                alt="Uploaded design" 
                className="w-16 h-16 object-cover rounded border border-gray-600"
              />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">UI Design uploaded for analysis</p>
                <button
                  onClick={handleVisionAnalysis}
                  disabled={chat.isLoading}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-xs text-white rounded transition-colors"
                >
                  {chat.isLoading ? 'Analyzing...' : 'Analyze Design'}
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setIsVisionMode(false);
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Model Settings */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-xs text-white/60">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={chat.temperature}
              onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-white/40">{chat.temperature}</span>
          </div>
          <div>
            <label className="block text-xs text-white/60">Max Tokens</label>
            <input
              type="number"
              min="100"
              max="8000"
              step="100"
              value={chat.maxTokens}
              onChange={(e) => setChatMaxTokens(parseInt(e.target.value))}
              className="input-dark w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <AnimatePresence>
          {chat.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`chat-message ${message.role}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <User className="w-6 h-6 text-primary-400" />
                  ) : (
                    <Bot className="w-6 h-6 text-accent-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white/80">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {message.usage && (
                        <span className="text-xs text-white/40">
                          {message.usage.totalTokens} tokens
                        </span>
                      )}
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3 text-white/60" />
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="text-sm text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  
                  {message.model && (
                    <div className="mt-2 text-xs text-white/40">
                      Model: {message.model}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {chat.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="chat-message assistant"
          >
            <div className="flex items-start space-x-3">
              <Bot className="w-6 h-6 text-accent-400" />
              <div className="flex items-center space-x-2">
                <div className="loading-spinner"></div>
                <span className="text-sm text-white/60">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI to help with your code..."
            className="chat-input flex-1 resize-none"
            rows={3}
            disabled={chat.isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || chat.isLoading}
            className="btn-accent px-4 py-2 self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-white/40">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;