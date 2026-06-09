export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  sqlQuery?: string;
  intent?: string;
  confidence?: number;
  sources?: string[];
  citations?: {
    meetingId: number;
    meetingTitle: string;
    textExcerpt: string;
  }[];
}
