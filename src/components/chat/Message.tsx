
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import Avatar from '../common/Avatar';

interface MessageProps {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  showAvatar?: boolean;
}

const Message = ({ id, senderId, content, timestamp, showAvatar = true }: MessageProps) => {
  const { currentUser } = useAuth();
  const { contacts } = useChat();
  
  const isCurrentUser = currentUser?.id === senderId;
  const sender = contacts.find(contact => contact.id === senderId) || {
    displayName: isCurrentUser ? currentUser?.displayName || 'You' : 'Unknown',
    avatarUrl: undefined
  };
  
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={cn(
      "flex items-end gap-2 mb-2",
      isCurrentUser && "flex-row-reverse"
    )}>
      {showAvatar && !isCurrentUser ? (
        <Avatar name={sender.displayName} src={sender.avatarUrl} className="h-8 w-8" />
      ) : showAvatar && isCurrentUser ? (
        <div className="w-8" /> // Spacer for alignment
      ) : null}
      
      <div className="flex flex-col max-w-[80%]">
        {!isCurrentUser && showAvatar && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">
            {sender.displayName}
          </span>
        )}
        
        <div className={cn(
          isCurrentUser ? "chat-bubble-sent" : "chat-bubble-received"
        )}>
          {content}
        </div>
        
        <span className={cn(
          "text-[10px] text-muted-foreground mt-1",
          isCurrentUser ? "text-right mr-1" : "ml-1"
        )}>
          {time}
        </span>
      </div>
    </div>
  );
};

export default Message;
