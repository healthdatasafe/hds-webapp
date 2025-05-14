
import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '../common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Search, User, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatSidebar = () => {
  const { conversations, contacts, selectConversation, currentConversation } = useChat();
  const { currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'conversations' | 'contacts'>('conversations');
  const navigate = useNavigate();
  
  // Filter conversations based on search
  const filteredConversations = conversations
    .filter(conv => {
      // Find the other participant if it's a direct message
      if (conv.participants.length === 2) {
        const otherParticipantId = conv.participants.find(id => id !== currentUser?.id);
        const otherParticipant = contacts.find(contact => contact.id === otherParticipantId);
        
        // If no search query, show all. Otherwise, search in display name
        return !searchQuery || 
          otherParticipant?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      // For group chats, search in the conversation name
      return !searchQuery || 
        (conv.name && conv.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });

  const filteredContacts = contacts
    .filter(contact => 
      !searchQuery || contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const getConversationDisplayName = (conversation: typeof conversations[number]) => {
    // If it's a group chat with a name, use that
    if (conversation.name) {
      return conversation.name;
    }
    
    // If it's a direct message, get the other participant's name
    if (conversation.participants.length === 2) {
      const otherParticipantId = conversation.participants.find(id => id !== currentUser?.id);
      const otherParticipant = contacts.find(contact => contact.id === otherParticipantId);
      return otherParticipant?.displayName || 'Unknown Contact';
    }
    
    // Fallback
    return 'Conversation';
  };
  
  const getConversationAvatar = (conversation: typeof conversations[number]) => {
    // For direct messages, get the other participant's avatar
    if (conversation.participants.length === 2) {
      const otherParticipantId = conversation.participants.find(id => id !== currentUser?.id);
      const otherParticipant = contacts.find(contact => contact.id === otherParticipantId);
      
      return {
        name: otherParticipant?.displayName || 'Unknown',
        url: otherParticipant?.avatarUrl
      };
    }
    
    // For group chats
    return {
      name: conversation.name || 'Group',
      url: undefined
    };
  };
  
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    navigate('/chat');
  };
  
  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* Header with title and add button */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-bold">Connections</h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add Connection</span>
        </Button>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative bg-[#333333] rounded-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent border-0 text-white placeholder:text-gray-400 focus-visible:ring-0"
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {view === 'conversations' && (
          <div className="space-y-1">
            {filteredConversations.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">
                {searchQuery ? 'No connections found' : 'No connections'}
              </p>
            ) : (
              filteredConversations.map(conversation => {
                const displayName = getConversationDisplayName(conversation);
                const avatar = getConversationAvatar(conversation);
                const isActive = currentConversation?.id === conversation.id;
                const initials = avatar.name.split(' ').map(part => part[0]).join('').toUpperCase();
                
                return (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-4 py-3 rounded-none border-b border-gray-800 hover:bg-gray-800",
                      isActive && "bg-gray-800"
                    )}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex items-center w-full">
                      <div className="relative mr-3">
                        <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-full items-center justify-center bg-gray-700 text-white">
                          {avatar.url ? (
                            <Avatar 
                              name={avatar.name} 
                              src={avatar.url}
                            />
                          ) : (
                            <span className="text-lg font-medium">{initials}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-medium text-left">{displayName}</span>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-400 truncate max-w-[160px] text-left">
                            {conversation.lastMessage.content}
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
