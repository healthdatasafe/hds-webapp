
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
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (!currentConversation) {
      // If no conversation is selected, redirect to connections page
      navigate('/connections');
    }
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
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#222]">
      {currentConversation ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center h-full pb-16">
          <div className="p-8 max-w-md text-center">
            <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
            <p className="text-muted-foreground">
              Choose a connection from the connections page.
            </p>
            <Link 
              to="/connections" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary rounded-md text-white"
            >
              Go to Connections
            </Link>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Chat;
