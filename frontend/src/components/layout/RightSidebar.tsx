/**
 * Right Sidebar Component
 * 
 * AI Assistant Chat Interface
 * Styled as chat bubbles with inline code blocks and copy buttons
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Copy, Check, Sparkles, Code, Bug, TestTube, Zap,
  Search, MessageSquare, Settings, ChevronDown, ChevronUp, X
} from 'lucide-react';

interface RightSidebarProps {
  aiModel: string;
  isAiRunning: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: string[];
  codeBlocks?: CodeBlock[];
}

interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filePath?: string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  aiModel,
  isAiRunning
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m Winky A1, your AI development assistant. I can help you with code generation, debugging, testing, and more. What would you like to work on today?',
      timestamp: new Date(),
      codeBlocks: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [showContextInspector, setShowContextInspector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiQuickActions = [
    { id: 'explain', name: 'Explain Code', icon: Code, color: 'text-blue-400' },
    { id: 'debug', name: 'Debug Issues', icon: Bug, color: 'text-red-400' },
    { id: 'test', name: 'Generate Tests', icon: TestTube, color: 'text-purple-400' },
    { id: 'optimize', name: 'Optimize Code', icon: Zap, color: 'text-yellow-400' }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        sources: ['src/components/App.tsx', 'src/components/Header.tsx'],
        codeBlocks: generateCodeBlocks(inputValue)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "I'll help you with that! Here's what I can suggest based on your codebase:",
      "Great question! Let me analyze your code and provide a solution:",
      "I've reviewed your code and here's my recommendation:",
      "Based on the context, here's how we can improve this:"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateCodeBlocks = (userInput: string): CodeBlock[] => {
    if (userInput.toLowerCase().includes('component')) {
      return [
        {
          id: '1',
          language: 'typescript',
          code: `import React from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </motion.div>
  );
};

export default MyComponent;`,
          filePath: 'src/components/MyComponent.tsx'
        }
      ];
    }
    return [];
  };

  const copyCodeBlock = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlock(blockId);
      setTimeout(() => setCopiedBlock(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleQuickAction = (actionId: string) => {
    const actionPrompts = {
      explain: 'Can you explain the current code structure and how it works?',
      debug: 'I\'m having some issues with the code. Can you help me debug it?',
      test: 'Can you generate some tests for the current functionality?',
      optimize: 'How can I optimize this code for better performance?'
    };

    setInputValue(actionPrompts[actionId as keyof typeof actionPrompts] || '');
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-gray-400">{aiModel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContextInspector(!showContextInspector)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Context Inspector"
            >
              <Search className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* AI Status */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAiRunning ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-400">
            {isAiRunning ? 'AI Agent Running' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Context Inspector */}
      <AnimatePresence>
        {showContextInspector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-800 bg-gray-950"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">Context Usage</h4>
                <button
                  onClick={() => setShowContextInspector(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Full chunks:</span>
                  <span className="text-gray-300">298,000 tokens</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Summaries:</span>
                  <span className="text-gray-300">27,420 tokens</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="text-xs text-gray-400 text-center">
                  325,420 / 500,000 tokens used
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-800">
        <div className="grid grid-cols-2 gap-2">
          {aiQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action.id)}
                className="flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-xs text-gray-300">{action.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-blue-500 to-violet-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Code Blocks */}
                  {message.codeBlocks && message.codeBlocks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.codeBlocks.map((block) => (
                        <div key={block.id} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">{block.language}</span>
                            <button
                              onClick={() => copyCodeBlock(block.code, block.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                            >
                              {copiedBlock === block.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-gray-900 rounded-lg p-3 text-xs overflow-x-auto">
                            <code className="text-gray-100">{block.code}</code>
                          </pre>
                          {block.filePath && (
                            <div className="mt-1 text-xs text-gray-400">
                              📁 {block.filePath}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Sources:</div>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about your code..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        
        <div className="mt-2 text-xs text-gray-400 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;