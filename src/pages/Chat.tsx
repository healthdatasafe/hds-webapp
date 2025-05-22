import React, { useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Avatar from '@/components/common/Avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const Chat = () => {
  const { currentUser } = useAuth();
  const { currentConversation, contacts, conversations, messages } = useChat();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [showContactDetails, setShowContactDetails] = useState(false);
  
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

  const textDescription = otherParticipant?.accessInfo.clientData?.['app-web-auth:description']?.content;

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
  
  // Helper function to render the permissions section
  const renderPermissions = () => {
    if (!otherParticipant || !otherParticipant.accessInfo?.permissions) {
      console.log(otherParticipant);
      return (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>No permissions available</span>
          </div>
        </div>
      );
    }

    return (
      <>
        {otherParticipant.accessInfo.permissions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-3">Permissions</h3>
            {otherParticipant.accessInfo.permissions.map((permission, index) => (
              <div key={`comm-${index}`} className="flex justify-between">
                <span>{permission.streamId}</span>
                <div className="space-x-3">
                  <span key={`level-${index}`} className="text-primary">
                    {permission.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };
  
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
        <h2 
          className="text-lg font-semibold text-white cursor-pointer"
          onClick={() => setShowContactDetails(true)}
        >
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
      
      {/* Contact Details Dialog */}
      <Dialog open={showContactDetails} onOpenChange={setShowContactDetails}>
        <DialogContent className="bg-[#222] text-white border-gray-800 sm:max-w-md">
          <DialogTitle className="sr-only">Contact Details</DialogTitle>
          <div className="flex flex-col items-center mb-4">
            <Avatar 
              name={conversationName}
              src={otherParticipant?.avatarUrl}
              className="h-24 w-24 mb-4" 
            />
            <h2 className="text-xl font-bold">{conversationName}</h2>
            
            
            {otherParticipant?.accessInfo.type && (
              <p className="text-muted-foreground mt-1">
                Type: {otherParticipant.accessInfo.type}
              </p>
            )}

            {textDescription && (
              <p className="text-white mt-1">
                {textDescription}
              </p>
            )}
          </div>
          
          <Separator className="my-4 bg-gray-800" />
          
          {renderPermissions()}
          
          <div className="mt-6 flex justify-end">
            <button className="flex items-center text-red-500 hover:text-red-400">
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Connection
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
