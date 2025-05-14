
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import Message from './Message';
import { Skeleton } from '@/components/ui/skeleton';

const MessageList = () => {
  const { messages, isLoadingMessages, currentConversation, contacts } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Group messages by sender for avatar display
  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
    
    acc.push({
      ...message,
      showAvatar
    });
    
    return acc;
  }, [] as Array<typeof messages[number] & { showAvatar: boolean }>);
  
  if (isLoadingMessages) {
    return (
      <div className="flex flex-col p-4 space-y-4">
        <MessageSkeleton align="left" />
        <MessageSkeleton align="right" />
        <MessageSkeleton align="left" />
      </div>
    );
  }
  
  // Find the other participant
  const otherParticipantId = currentConversation?.participants.find(
    id => id !== contacts.find(c => c.id === id)?.id
  );
  const otherParticipant = contacts.find(contact => contact.id === otherParticipantId);
  
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col p-4 overflow-y-auto messages-container bg-[#222] pb-20">
      {currentConversation && (
        <div className="sticky top-0 z-10 bg-[#222] border-b border-gray-800 pb-2 mb-4 flex items-center">
          <Avatar 
            name={otherParticipant?.displayName || "Contact"}
            src={otherParticipant?.avatarUrl}
            className="h-12 w-12 mr-3"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-white">
              {otherParticipant?.displayName || "Contact"}
            </h3>
          </div>
        </div>
      )}
      
      {groupedMessages.map((message) => (
        <Message 
          key={message.id} 
          id={message.id} 
          senderId={message.senderId} 
          content={message.content} 
          timestamp={message.timestamp}
          showAvatar={message.showAvatar} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Loading skeleton for messages
const MessageSkeleton = ({ align }: { align: 'left' | 'right' }) => {
  return (
    <div className={`flex items-end gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      {align === 'left' && <Skeleton className="h-10 w-10 rounded-full" />}
      <div className="flex flex-col">
        {align === 'left' && <Skeleton className="h-3 w-20 mb-1" />}
        <Skeleton className={`h-12 w-[200px] rounded-2xl`} />
        <Skeleton className={`h-2 w-12 mt-1 ${align === 'right' ? 'ml-auto' : ''}`} />
      </div>
    </div>
  );
};

export default MessageList;
