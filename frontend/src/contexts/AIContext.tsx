/**
 * AI Context Provider
 * 
 * Manages AI interactions, model selection, and chat history
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AIMessage {
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

interface AIState {
  messages: AIMessage[];
  isTyping: boolean;
  selectedModel: string;
  contextUsage: {
    tokensUsed: number;
    tokenBudget: number;
    chunksUsed: string[];
    summariesUsed: string[];
  };
}

interface AIContextType {
  state: AIState;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setModel: (model: string) => void;
  addMessage: (message: AIMessage) => void;
  updateContextUsage: (usage: Partial<AIState['contextUsage']>) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIContextProvider');
  }
  return context;
};

interface AIContextProviderProps {
  children: React.ReactNode;
}

export const AIContextProvider: React.FC<AIContextProviderProps> = ({ children }) => {
  const [state, setState] = useState<AIState>({
    messages: [
      {
        id: '1',
        type: 'ai',
        content: 'Hello! I\'m Winky A1, your AI development assistant. I can help you with code generation, debugging, testing, and more. What would you like to work on today?',
        timestamp: new Date(),
        sources: [],
        codeBlocks: []
      }
    ],
    isTyping: false,
    selectedModel: 'gpt-4',
    contextUsage: {
      tokensUsed: 0,
      tokenBudget: 500000,
      chunksUsed: [],
      summariesUsed: []
    }
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(content),
        timestamp: new Date(),
        sources: ['src/components/App.tsx', 'src/components/Header.tsx'],
        codeBlocks: generateCodeBlocks(content)
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        isTyping: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isTyping: false
      }));
    }
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [
        {
          id: Date.now().toString(),
          type: 'ai',
          content: 'Hello! I\'m Winky A1, your AI development assistant. I can help you with code generation, debugging, testing, and more. What would you like to work on today?',
          timestamp: new Date(),
          sources: [],
          codeBlocks: []
        }
      ]
    }));
  }, []);

  const setModel = useCallback((model: string) => {
    setState(prev => ({
      ...prev,
      selectedModel: model
    }));
  }, []);

  const addMessage = useCallback((message: AIMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const updateContextUsage = useCallback((usage: Partial<AIState['contextUsage']>) => {
    setState(prev => ({
      ...prev,
      contextUsage: { ...prev.contextUsage, ...usage }
    }));
  }, []);

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

  const value: AIContextType = {
    state,
    sendMessage,
    clearChat,
    setModel,
    addMessage,
    updateContextUsage
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};