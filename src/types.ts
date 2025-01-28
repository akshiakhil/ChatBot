export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  error?: string;
  pending?: boolean;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  contextLength: number;
}

export interface ChatState {
  messages: Message[];
  selectedModel: Model;
  loading: boolean;
  theme: 'light' | 'dark';
}

export interface StreamChunk {
  id: string;
  content: string;
  role: 'assistant';
  done: boolean;
}