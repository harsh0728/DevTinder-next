export interface ChatMessage {
  _id: string;
  text: string;
  senderId: {
    firstName: string;
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
  edited: boolean;
}

export interface ChatResponse {
  success: boolean;
  data: ChatMessage[];
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
  };
}

export interface Message {
  _id: string;
  userId: string;
  firstName: string;
  message: string;
  timestamp: string;
  edited: boolean;
  tempId?: string; // For optimistic updates
}