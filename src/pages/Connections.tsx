
import React from 'react';
import { useChat } from '@/context/ChatContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import BottomNav from '@/components/navigation/BottomNav';

const Connections = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-full">
        <ChatSidebar />
      </div>
      <BottomNav />
    </div>
  );
};

export default Connections;
