import React, { useState, useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { ModelSelector } from './components/ModelSelector';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Message, Model, ChatState } from './types';
import { MessageSquare } from 'lucide-react';
import { streamCompletion, APIError } from './api';

const initialModel: Model = {
  id: 'DeepSeek-R1:8b',
  name: 'DeepSeek R1 8B',
  description: 'Efficient and powerful 8B parameter model',
  contextLength: 8192,
};

function App() {
  const [state, setState] = useState<ChatState>(() => {
    const saved = localStorage.getItem('chatState');
    return saved ? JSON.parse(saved) : {
      messages: [],
      selectedModel: initialModel,
      loading: false,
      theme: 'light',
    };
  });

  useEffect(() => {
    localStorage.setItem('chatState', JSON.stringify(state));
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
      pending: true,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
      loading: true,
    }));

    try {
      let fullContent = '';
      for await (const chunk of streamCompletion(content, state.selectedModel)) {
        fullContent += chunk.content;
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: fullContent, pending: !chunk.done }
              : msg
          ),
        }));
      }

      setState(prev => ({
        ...prev,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        messages: prev.messages.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                error:
                  error instanceof APIError
                    ? error.message
                    : 'An unexpected error occurred',
                pending: false,
              }
            : msg
        ),
      }));
    }
  };

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const clearHistory = () => {
    setState(prev => ({
      ...prev,
      messages: [],
    }));
  };

  return (
    <div className="h-screen flex dark:bg-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-80 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            AI Chat
          </h1>
          <ThemeToggle theme={state.theme} onToggle={toggleTheme} />
        </div>
        <ModelSelector
          selectedModel={state.selectedModel}
          onSelectModel={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
        />
        <div className="p-4 mt-auto">
          <button
            onClick={clearHistory}
            className="w-full p-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Current Model: <span className="font-medium">{state.selectedModel.name}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {state.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Start a conversation by typing a message below
            </div>
          ) : (
            state.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>

        <ChatInput onSendMessage={handleSendMessage} loading={state.loading} />
      </div>
    </div>
  );
}

export default App;