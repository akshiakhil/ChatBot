import { Model, StreamChunk } from './types';

const API_URL = 'http://127.0.0.1:11434';

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export async function* streamCompletion(
  prompt: string,
  model: Model
): AsyncGenerator<StreamChunk, void, unknown> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new APIError('Failed to generate response', response.status);
    }

    if (!response.body) {
      throw new APIError('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk = JSON.parse(line);
            yield {
              id: Date.now().toString(),
              content: chunk.response || '',
              role: 'assistant',
              done: chunk.done,
            };
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}