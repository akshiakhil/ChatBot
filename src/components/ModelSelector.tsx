import React from 'react';
import { Model } from '../types';
import { Brain } from 'lucide-react';

const models: Model[] = [
  {
    id: 'DeepSeek-R1:8b',
    name: 'DeepSeek R1 8B',
    description: 'Efficient and powerful 8B parameter model',
    contextLength: 8192,
  },
  // {
  //   id: 'llama2',
  //   name: 'Llama 2',
  //   description: 'Meta\'s open source large language model',
  //   contextLength: 4096,
  // },
  // {
  //   id: 'mistral',
  //   name: 'Mistral',
  //   description: 'High-performance 7B parameter model',
  //   contextLength: 8192,
  // },
];

interface ModelSelectorProps {
  selectedModel: Model;
  onSelectModel: (model: Model) => void;
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  return (
    <div className="p-4 border-b dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Models
      </h2>
      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onSelectModel(model)}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              selectedModel.id === model.id
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {model.description}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Context: {model.contextLength.toLocaleString()} tokens
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}