
// Chat related type definitions

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  read: boolean;
  hasForm?: boolean;
  formCompleted?: boolean;
  formType?: 'symptomReport' | 'medicationReport' | 'feedbackForm';
}

export interface Conversation {
  id: string;
  participants: string[];
  name?: string; // For group chats
  lastMessage?: Message;
  unreadCount: number;
}

export interface Permission {
  name: string;
  category: 'communication' | 'data' | 'other';
  actions: string[];
}

export interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
  phone?: string;
  organization?: string;
  permissions?: Permission[];
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  contacts: Contact[];
  isLoadingMessages: boolean;
  sendMessage: (content: string) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  startNewConversation: (contactId: string) => void;
  completeMessageForm: (messageId: string) => void;
}
