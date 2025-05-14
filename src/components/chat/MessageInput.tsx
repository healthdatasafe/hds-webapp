
import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/context/ChatContext';
import { ArrowUp, Plus, Mic } from 'lucide-react';

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
    <div className="p-4 border-t border-gray-800 bg-[#222] fixed bottom-0 left-0 right-0 pb-safe">
      <div className="flex items-center gap-2 bg-[#333] rounded-full px-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Textarea
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!currentConversation || isSending}
          className="min-h-[48px] resize-none border-0 bg-transparent focus-visible:ring-0 text-white py-3"
          // Removing maxRows which was causing the error
        />
        {message.trim() ? (
          <Button 
            size="icon" 
            onClick={handleSubmit} 
            disabled={!message.trim() || isSending || !currentConversation}
            className="bg-red-600 hover:bg-red-700 rounded-full h-10 w-10"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-white"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
