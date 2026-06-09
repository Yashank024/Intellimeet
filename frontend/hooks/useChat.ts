"use client";

import { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { chatService } from '../services/chatService';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'system',
      content: 'Welcome to the IntelliMeet RAG Assistant. Ask me questions about meeting history (e.g., "Which meetings discussed the Vendor API?") or operational records (e.g., "Show unresolved escalations").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(content);
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'system',
        content: 'Welcome to the IntelliMeet RAG Assistant. Ask me questions about meeting history (e.g., "Which meetings discussed the Vendor API?") or operational records (e.g., "Show unresolved escalations").',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return { messages, loading, error, sendMessage, clearChat };
}
