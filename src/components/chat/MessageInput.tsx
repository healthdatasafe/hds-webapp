
import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/context/ChatContext';
import { ArrowUp } from 'lucide-react';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendMessage, currentConversation } = useChat();
  
  const handleSubmit = async () => {
    if (!message.trim() || isSending || !currentConversation) return;
    
    setIsSending(true);
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!currentConversation || isSending}
          className="min-h-[60px] resize-none border-muted"
          maxRows={5}
        />
        <Button 
          size="icon" 
          onClick={handleSubmit} 
          disabled={!message.trim() || isSending || !currentConversation}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
