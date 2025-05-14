
import React, { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/navigation/BottomNav';

const Chat = () => {
  const { currentUser } = useAuth();
  const { currentConversation } = useChat();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block w-80 h-full lg:w-96">
        <ChatSidebar />
      </div>
      
      {/* Mobile version - full screen */}
      <div className="flex flex-col flex-1 h-full bg-[#222]">
        {currentConversation ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageList />
            </div>
            <MessageInput />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full pb-16">
            <div className="p-8 max-w-md text-center">
              <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Choose a connection from the sidebar or add a new one.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Chat;
