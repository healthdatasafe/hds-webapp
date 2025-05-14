
import React, { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import BottomNav from '@/components/navigation/BottomNav';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Avatar from '@/components/common/Avatar';

const Chat = () => {
  const { currentUser } = useAuth();
  const { currentConversation, contacts } = useChat();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Modified to add a delay and only redirect if still no conversation after the delay
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Add a small delay to ensure context has time to update
    const timer = setTimeout(() => {
      if (!currentConversation) {
        // Only redirect if there's still no conversation after the delay
        navigate('/connections');
      }
    }, 300);
    
    return () => clearTimeout(timer); // Clean up the timer
  }, [currentUser, currentConversation, navigate]);
  
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
  
  // Add loading state during the delay
  if (!currentConversation) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#222]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Loading conversation...</p>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#222]">
      {currentConversation && (
        <>
          {/* Header with back button and contact name */}
          <div className="sticky top-0 z-10 bg-[#222] border-b border-gray-800 p-4 flex items-center">
            {isMobile && (
              <Link to="/connections" className="mr-3">
                <ChevronLeft className="h-6 w-6 text-white" />
              </Link>
            )}
            <Avatar 
              name={conversationName}
              src={otherParticipant?.avatarUrl}
              className="h-10 w-10 mr-3" 
            />
            <h2 className="text-lg font-semibold text-white">
              {conversationName}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <MessageList hideHeader />
          </div>
          
          <MessageInput />
        </>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Chat;
