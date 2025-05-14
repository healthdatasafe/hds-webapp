
import React, { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex h-screen overflow-hidden">
      <div className="w-80 h-full lg:w-96">
        <ChatSidebar />
      </div>
      
      <div className="flex flex-col flex-1 h-full">
        {currentConversation ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageList />
            </div>
            <MessageInput />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="p-8 max-w-md text-center">
              <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar or start a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
