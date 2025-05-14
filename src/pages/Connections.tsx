
import React from 'react';
import { useChat } from '@/hooks/useChat';
import ChatSidebar from '@/components/chat/ChatSidebar';

const Connections = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background pb-16">
      <div className="w-full">
        <ChatSidebar />
      </div>
    </div>
  );
};

export default Connections;
