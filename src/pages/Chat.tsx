import React, { useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Avatar from '@/components/common/Avatar';

const Chat = () => {
  const { currentUser } = useAuth();
  const { currentConversation, contacts, conversations, messages } = useChat();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // If we already have a conversation, we can stop loading
    if (currentConversation) {
      console.log("Current conversation found:", currentConversation.id);
      setIsLoading(false);
    } else if (conversations.length > 0) {
      // If no conversation is selected but we have conversations, redirect to connections
      console.log("No conversation selected, redirecting to connections");
      // navigate('/connections');
    } else {
      setIsLoading(false);
    }
  }, [currentUser, currentConversation, conversations, navigate]);
  
  // Find the other participant in a direct message
  const getOtherParticipant = () => {
    if (!currentConversation || !currentUser) return null;
    
    const otherParticipantId = currentConversation.participants.find(
      id => id !== currentUser.id
    );
    
    return contacts.find(contact => contact.id === otherParticipantId);
  };
  
  const otherParticipant = getOtherParticipant();
  const conversationName = currentConversation?.name || otherParticipant?.displayName || 'Unknown';
  
  // Show loading state during initialization
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#222]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }
  
  // If not loading but no conversation is found
  if (!currentConversation) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#222]">
        <div className="text-center p-4">
          <h3 className="text-xl font-medium mb-2 text-white">No conversation selected</h3>
          <p className="text-muted-foreground mb-4">
            Please select a conversation from your connections.
          </p>
          <Link 
            to="/connections" 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md"
          >
            Go to Connections
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#222]">
      {/* Header with back button and contact name */}
      <div className="sticky top-0 z-10 bg-[#222] border-b border-gray-800 p-4 flex items-center">
        <Link to="/connections" className="mr-3 text-white hover:text-gray-300">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <Avatar 
          name={conversationName}
          src={otherParticipant?.avatarUrl}
          className="h-10 w-10 mr-3" 
        />
        <h2 className="text-lg font-semibold text-white">
          {conversationName}
        </h2>
      </div>
      
      {messages && messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <MessageList hideHeader />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
            <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
            <p className="text-gray-300">
              Say hello to {otherParticipant?.displayName || 'your contact'} and start chatting!
            </p>
          </div>
        </div>
      )}
      
      <MessageInput />
    </div>
  );
};

export default Chat;
