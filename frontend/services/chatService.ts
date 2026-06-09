import { ChatMessage } from '../types/chat';
import { API_BASE_URL } from './api';

export const chatService = {
  async sendMessage(query: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          id: Math.random().toString(),
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: result.response,
          sqlQuery: result.sqlQuery || undefined,
          citations: result.citations?.length ? result.citations : undefined,
          intent: result.intent || undefined,
          confidence: result.confidence ?? undefined,
          sources: result.sources?.length ? result.sources : undefined,
        };
      }

      const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || `Chat API responded with status ${response.status}`);
    } catch (e: any) {
      console.error('[chatService] Chat request failed:', e);
      return {
        id: Math.random().toString(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `⚠️ **Unable to connect to IntelliMeet backend.**\n\nPlease ensure the FastAPI server is running on \`http://localhost:8000\`.\n\n_Error: ${e.message}_`,
      };
    }
  },
};
