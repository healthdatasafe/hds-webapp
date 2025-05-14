
import { Contact, Conversation, Message } from '@/types/chat';

// Mock data generation functions
export const generateMockContacts = (currentUserId: string): Contact[] => {
  return [
    {
      id: 'contact_1',
      username: 'sarah_parker',
      displayName: 'Sarah Parker',
      status: 'online',
      phone: '+1 (555) 123-4567',
      organization: 'General Hospital'
    },
    {
      id: 'contact_2',
      username: 'mike_johnson',
      displayName: 'Mike Johnson',
      status: 'away',
      phone: '+1 (555) 987-6543',
      organization: 'City Medical Center'
    },
    {
      id: 'contact_3',
      username: 'emma_williams',
      displayName: 'Emma Williams',
      status: 'offline',
      phone: '+1 (555) 456-7890',
      organization: 'Private Practice'
    }
  ];
};

export const generateMockConversations = (currentUserId: string, contacts: Contact[]): Conversation[] => {
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

export const generateMockMessages = (conversationId: string, participants: string[]): Message[] => {
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
