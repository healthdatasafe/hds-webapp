import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  name?: string; // For group chats
  lastMessage?: Message;
  unreadCount: number;
}

interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  contacts: Contact[];
  isLoadingMessages: boolean;
  sendMessage: (content: string) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  startNewConversation: (contactId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock data generation functions
const generateMockContacts = (currentUserId: string): Contact[] => {
  return [
    {
      id: 'contact_1',
      username: 'sarah_parker',
      displayName: 'Sarah Parker',
      status: 'online'
    },
    {
      id: 'contact_2',
      username: 'mike_johnson',
      displayName: 'Mike Johnson',
      status: 'away'
    },
    {
      id: 'contact_3',
      username: 'emma_williams',
      displayName: 'Emma Williams',
      status: 'offline'
    }
  ];
};

const generateMockConversations = (currentUserId: string, contacts: Contact[]): Conversation[] => {
  const conversations: Conversation[] = contacts.map((contact, index) => ({
    id: `conversation_${index + 1}`,
    participants: [currentUserId, contact.id],
    unreadCount: Math.floor(Math.random() * 5)
  }));
  
  // Add a group conversation
  conversations.push({
    id: 'conversation_group_1',
    participants: [currentUserId, ...contacts.map(c => c.id)],
    name: 'Project Team',
    unreadCount: 2
  });
  
  return conversations;
};

const generateMockMessages = (conversationId: string, participants: string[]): Message[] => {
  const messages: Message[] = [];
  const messageCount = 15 + Math.floor(Math.random() * 10);
  
  for (let i = 0; i < messageCount; i++) {
    const senderId = participants[i % participants.length];
    const timestamp = Date.now() - (messageCount - i) * 1000 * 60 * 5; // 5 minutes apart
    
    messages.push({
      id: `msg_${conversationId}_${i}`,
      senderId,
      content: `This is message ${i + 1} in conversation ${conversationId}`,
      timestamp,
      read: true
    });
  }
  
  return messages;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Initialize with mock data when user is authenticated
  useEffect(() => {
    if (currentUser) {
      const mockContacts = generateMockContacts(currentUser.id);
      setContacts(mockContacts);
      
      const mockConversations = generateMockConversations(currentUser.id, mockContacts);
      setConversations(mockConversations);
    } else {
      setContacts([]);
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [currentUser]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setIsLoadingMessages(true);
      
      // Simulate API delay
      setTimeout(() => {
        const mockMessages = generateMockMessages(
          currentConversation.id, 
          currentConversation.participants
        );
        setMessages(mockMessages);
        setIsLoadingMessages(false);
        
        // Mark conversation as read
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === currentConversation.id
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }, 500);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const selectConversation = (conversationId: string) => {
    console.log("ChatContext: selecting conversation", conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      console.log("ChatContext: found conversation", conversation.id);
      setCurrentConversation(conversation);
    } else {
      console.log("ChatContext: conversation not found", conversationId);
      // If conversation not found, we should not navigate to chat
      setCurrentConversation(null);
    }
  };

  const startNewConversation = (contactId: string) => {
    if (!currentUser) return;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(c => 
      c.participants.length === 2 && 
      c.participants.includes(currentUser.id) && 
      c.participants.includes(contactId)
    );
    
    if (existingConversation) {
      setCurrentConversation(existingConversation);
      return;
    }
    
    // Create new conversation
    const newConversation: Conversation = {
      id: `conversation_new_${Date.now()}`,
      participants: [currentUser.id, contactId],
      unreadCount: 0
    };
    
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation);
    toast.success("Started new conversation");
  };

  const sendMessage = async (content: string) => {
    if (!currentUser || !currentConversation || !content.trim()) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: Date.now(),
      read: false
    };
    
    // Add message optimistically
    setMessages(prev => [...prev, newMessage]);
    
    try {
      // In a real app, we would send to Pryv.io here
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update conversation with last message
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, lastMessage: newMessage }
            : conv
        )
      );
      
      // Simulate response after a delay (for demo purposes)
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const responseMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            senderId: currentConversation.participants.find(p => p !== currentUser.id) || '',
            content: `This is an automated response to your message: "${content}"`,
            timestamp: Date.now(),
            read: false
          };
          
          setMessages(prev => [...prev, responseMessage]);
          
          setConversations(prevConversations =>
            prevConversations.map(conv =>
              conv.id === currentConversation.id
                ? { ...conv, lastMessage: responseMessage }
                : conv
            )
          );
        }, 2000 + Math.random() * 3000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    contacts,
    isLoadingMessages,
    sendMessage,
    selectConversation,
    startNewConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
