
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { 
  ChatContextType, 
  Conversation, 
  Contact, 
  Message 
} from '@/types/chat';
import { generateMockMessages } from '@/data/mockChatData';

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get auth context inside the component function, not at the module level
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Initialize App service when user is authenticated
  useEffect(() => {
    // do something
  }, [currentUser]);

  // Fetch real contacts when appService is available
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser?.appService) {
        try {
          const realContacts = await currentUser?.appService.getContacts();
          setContacts(realContacts);
          
          // Generate conversations based on real contacts
          const newConversations = realContacts.map((contact, index) => ({
            id: `conversation_${index + 1}`,
            participants: [currentUser.id, contact.id],
            unreadCount: Math.floor(Math.random() * 5)
          }));
          
          setConversations(newConversations);
        } catch (error) {
          console.error('Failed to fetch contacts:', error);
          toast.error('Failed to load your contacts');
        }
      } else if (!currentUser?.appService) {
        // If service isn't ready yet, we'll wait for it
        console.log('Waiting for App service to initialize...');
      } else {
        // Reset state when user logs out
        setContacts([]);
        setConversations([]);
        setCurrentConversation(null);
        setMessages([]);
      }
    };

    fetchContacts();
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
        
        // Add some messages with forms (for demo purposes)
        const enhancedMessages = mockMessages.map((msg, index) => {
          // Add a form to some messages from contacts (not from current user)
          if (index % 5 === 0 && msg.senderId !== currentUser?.id) {
            // Fix: Use proper type for formType instead of dynamic string
            const formType = index % 15 === 0 ? 'symptomReport' : 
                          index % 10 === 0 ? 'medicationReport' : 
                          'feedbackForm';
                          
            return {
              ...msg,
              hasForm: true,
              formCompleted: false,
              formType: formType as 'symptomReport' | 'medicationReport' | 'feedbackForm'
            };
          }
          return msg;
        });
        
        setMessages(enhancedMessages as Message[]);
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
  }, [currentConversation, currentUser]);

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
          const isFormRequest = Math.random() > 0.5;
          // Fix: Use typed formType directly instead of string
          const formType: 'symptomReport' | 'medicationReport' | 'feedbackForm' = 
              Math.random() > 0.6 ? 'symptomReport' : 
              Math.random() > 0.3 ? 'medicationReport' : 
              'feedbackForm';
          
          const responseMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            senderId: currentConversation.participants.find(p => p !== currentUser.id) || '',
            content: isFormRequest 
              ? `Could you please fill out this ${formType.replace('Report', '')} form?` 
              : `This is an automated response to your message: "${content}"`,
            timestamp: Date.now(),
            read: false,
            hasForm: isFormRequest,
            formCompleted: false,
            formType: isFormRequest ? formType : undefined
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

  const completeMessageForm = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, formCompleted: true } 
          : msg
      )
    );
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    contacts,
    isLoadingMessages,
    sendMessage,
    selectConversation,
    startNewConversation,
    completeMessageForm
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
