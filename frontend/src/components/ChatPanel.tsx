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
  Upload,
  Link,
  GitBranch,
  ChevronDown,
  X,
  Paperclip
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
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [attachedLink, setAttachedLink] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        files: files.map(f => ({
          path: f.path,
          content: f.content,
          size: f.content.length,
          modified: new Date(),
          encoding: 'utf-8'
        })),
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
      
      const response = await aiAPI.analyzeVision(
        selectedImage,
        "Analyze this UI design and provide a detailed description of the layout, components, and styling that can be used for coding implementation.",
        'gemini-2.0-pro'
      );

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
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
    <div className="h-full flex flex-col bg-[#0d1117] border-l border-[#30363d]">
      {/* Header - Cursor Style */}
      <div className="px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
              <p className="text-xs text-[#8b949e]">Powered by multiple AI models</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={clearChat}
              className="p-2 hover:bg-[#21262d] rounded-md transition-colors group"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4 text-[#8b949e] group-hover:text-white" />
            </button>
            <button
              className="p-2 hover:bg-[#21262d] rounded-md transition-colors group"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-[#8b949e] group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Model Selector - Cursor Style */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors text-sm text-white"
            disabled={isLoadingModels}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{models.find(m => m.id === chat.selectedModel)?.name || 'Select Model'}</span>
              {models.find(m => m.id === chat.selectedModel)?.supportsVision && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Vision</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-[#8b949e] transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Model Dropdown */}
          {showModelDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#21262d] border border-[#30363d] rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#30363d] transition-colors ${
                    chat.selectedModel === model.id ? 'bg-[#30363d] text-white' : 'text-[#c9d1d9]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{model.name}</span>
                    {model.supportsVision && (
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Vision</span>
                    )}
                  </div>
                  {!model.available && (
                    <span className="text-xs text-[#8b949e]">Unavailable</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vision Mode Indicator - Cursor Style */}
        {isVisionMode && selectedImage && (
          <div className="mt-3 p-3 bg-[#0c2d6b] border border-[#1f6feb] rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-[#1f6feb]" />
              <span className="text-sm font-medium text-[#1f6feb]">Vision Mode Active</span>
            </div>
            <div className="flex items-center gap-3">
              <img 
                src={selectedImage} 
                alt="Uploaded design" 
                className="w-16 h-16 object-cover rounded border border-[#30363d]"
              />
              <div className="flex-1">
                <p className="text-xs text-[#8b949e] mb-1">UI Design uploaded for analysis</p>
                <button
                  onClick={handleVisionAnalysis}
                  disabled={chat.isLoading}
                  className="px-3 py-1 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] text-xs text-white rounded transition-colors"
                >
                  {chat.isLoading ? 'Analyzing...' : 'Analyze Design'}
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setIsVisionMode(false);
                }}
                className="p-1 text-[#8b949e] hover:text-red-400 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Model Settings - Cursor Style */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Temperature</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={chat.temperature}
                onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-[#30363d] rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-[#c9d1d9] w-8 text-right">{chat.temperature}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Max Tokens</label>
            <input
              type="number"
              min="100"
              max="8000"
              step="100"
              value={chat.maxTokens}
              onChange={(e) => setChatMaxTokens(parseInt(e.target.value))}
              className="w-full px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-white focus:outline-none focus:border-[#1f6feb]"
            />
          </div>
        </div>
      </div>

      {/* Messages - Cursor Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {chat.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                {message.role === 'user' ? (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-[#21262d] rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-[#8b949e]" />
                    </div>
                    <span className="text-sm font-medium text-[#c9d1d9]">You</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-[#c9d1d9]">AI Assistant</span>
                    {message.model && (
                      <span className="text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded">({message.model})</span>
                    )}
                  </div>
                )}
                <div 
                  className={`p-3 rounded-lg text-sm leading-relaxed ${
                    message.role === 'user' 
                      ? 'bg-[#1f6feb] text-white' 
                      : 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d]'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                <div className="flex items-center justify-between mt-2">
                  {message.usage && (
                    <div className="text-xs text-[#8b949e] flex items-center space-x-4">
                      <span>Tokens: {message.usage.totalTokens}</span>
                      <span>Cost: ~${((message.usage.totalTokens / 1000) * 0.002).toFixed(4)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="p-1 hover:bg-[#30363d] rounded transition-colors"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3 text-[#8b949e] hover:text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator - Cursor Style */}
        {chat.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start space-x-4"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 max-w-[85%]">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-[#c9d1d9]">AI Assistant</span>
              </div>
              <div className="p-3 bg-[#21262d] border border-[#30363d] rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#1f6feb] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-[#8b949e]">AI is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style Input */}
      <div className="p-4 border-t border-[#30363d] bg-[#0d1117]">
        {/* Attachments */}
        {(selectedImage || attachedLink) && (
          <div className="mb-3 p-3 bg-[#21262d] border border-[#30363d] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#c9d1d9]">Attachments</span>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setAttachedLink('');
                  setIsVisionMode(false);
                  setShowLinkInput(false);
                }}
                className="p-1 hover:bg-[#30363d] rounded transition-colors"
              >
                <X className="w-4 h-4 text-[#8b949e]" />
              </button>
            </div>
            <div className="space-y-2">
              {selectedImage && (
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-[#1f6feb]" />
                  <span className="text-sm text-[#8b949e]">Image uploaded</span>
                </div>
              )}
              {attachedLink && (
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-[#1f6feb]" />
                  <span className="text-sm text-[#8b949e] truncate">{attachedLink}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link Input */}
        {showLinkInput && (
          <div className="mb-3 p-3 bg-[#21262d] border border-[#30363d] rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={attachedLink}
                onChange={(e) => setAttachedLink(e.target.value)}
                placeholder="Enter GitHub repository URL or link..."
                className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-white focus:outline-none focus:border-[#1f6feb]"
              />
              <button
                onClick={() => setShowLinkInput(false)}
                className="p-2 hover:bg-[#30363d] rounded transition-colors"
              >
                <X className="w-4 h-4 text-[#8b949e]" />
              </button>
            </div>
          </div>
        )}

        {/* Main Input */}
        <div className="relative">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
                             <textarea
                 value={inputValue}
                 onChange={handleTextareaChange}
                 onKeyPress={handleKeyPress}
                 placeholder="Message AI Assistant..."
                 className="w-full px-4 py-3 pr-12 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-[#1f6feb] resize-none"
                 rows={1}
                 disabled={chat.isLoading}
                 style={{ minHeight: '44px', maxHeight: '120px' }}
               />
              
              {/* Attachment Buttons */}
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="p-1.5 hover:bg-[#30363d] rounded transition-colors"
                    title="Attach image"
                  >
                    <Image className="w-4 h-4 text-[#8b949e] hover:text-[#1f6feb]" />
                  </button>
                </label>
                
                <button
                  onClick={() => setShowLinkInput(true)}
                  className="p-1.5 hover:bg-[#30363d] rounded transition-colors"
                  title="Attach link"
                >
                  <Link className="w-4 h-4 text-[#8b949e] hover:text-[#1f6feb]" />
                </button>
                
                <button
                  onClick={() => setShowLinkInput(true)}
                  className="p-1.5 hover:bg-[#30363d] rounded transition-colors"
                  title="Attach Git repository"
                >
                  <GitBranch className="w-4 h-4 text-[#8b949e] hover:text-[#1f6feb]" />
                </button>
              </div>
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chat.isLoading}
              className={`p-3 rounded-lg transition-colors ${
                inputValue.trim() && !chat.isLoading
                  ? 'bg-[#1f6feb] hover:bg-[#388bfd] text-white'
                  : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-[#8b949e]">
          Press Enter to send, Shift+Enter for new line • Use attachments for images, links, or Git repos
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;