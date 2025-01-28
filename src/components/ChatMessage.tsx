import React from 'react';
import { Message } from '../types';
import { Copy, Check, Bot, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{message.error}</span>
      </div>
    );
  }

  return (
    <div
      className={`p-4 flex gap-4 ${
        message.role === 'assistant'
          ? 'bg-gray-50 dark:bg-gray-800'
          : 'bg-white dark:bg-gray-900'
      } ${message.pending ? 'opacity-70' : ''}`}
    >
      <div className="flex-shrink-0">
        {message.role === 'assistant' ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-grow space-y-2">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto" {...props} />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props} />
                ) : (
                  <code {...props} />
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <span>·</span>
          <time>{new Date(message.timestamp).toLocaleTimeString()}</time>
        </div>
      </div>
    </div>
  );
}