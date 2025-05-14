
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
import { Search, User, Users } from 'lucide-react';

const ChatSidebar = () => {
  const { conversations, contacts, selectConversation, currentConversation } = useChat();
  const { currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'conversations' | 'contacts'>('conversations');
  
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
  
  return (
    <div className="flex flex-col h-full border-r bg-sidebar">
      {/* Header with user info and actions */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar 
            name={currentUser?.displayName || 'User'} 
            src={currentUser?.avatarUrl}
            className="h-8 w-8"
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{currentUser?.displayName || 'User'}</span>
            <span className="text-xs text-muted-foreground">@{currentUser?.username}</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M3 7.5C3 8.32843 2.32843 9 1.5 9C0.671573 9 0 8.32843 0 7.5C0 6.67157 0.671573 6 1.5 6C2.32843 6 3 6.67157 3 7.5ZM9 7.5C9 8.32843 8.32843 9 7.5 9C6.67157 9 6 8.32843 6 7.5C6 6.67157 6.67157 6 7.5 6C8.32843 6 9 6.67157 9 7.5ZM15 7.5C15 8.32843 14.3284 9 13.5 9C12.6716 9 12 8.32843 12 7.5C12 6.67157 12.6716 6 13.5 6C14.3284 6 15 6.67157 15 7.5Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={logout}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* View toggle */}
      <div className="flex border-b">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-none",
            view === 'conversations' && "bg-accent text-accent-foreground"
          )}
          onClick={() => setView('conversations')}
        >
          <Users className="h-4 w-4 mr-2" />
          Chats
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-none",
            view === 'contacts' && "bg-accent text-accent-foreground"
          )}
          onClick={() => setView('contacts')}
        >
          <User className="h-4 w-4 mr-2" />
          Contacts
        </Button>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {view === 'conversations' ? (
          <>
            <h3 className="text-sm font-medium text-muted-foreground px-4 py-2">Recent chats</h3>
            <div className="space-y-1 px-2">
              {filteredConversations.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  {searchQuery ? 'No conversations found' : 'No recent conversations'}
                </p>
              ) : (
                filteredConversations.map(conversation => {
                  const displayName = getConversationDisplayName(conversation);
                  const avatar = getConversationAvatar(conversation);
                  const isActive = currentConversation?.id === conversation.id;
                  
                  return (
                    <Button
                      key={conversation.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-2 py-6",
                        isActive && "bg-accent"
                      )}
                      onClick={() => selectConversation(conversation.id)}
                    >
                      <div className="relative">
                        <Avatar 
                          name={avatar.name} 
                          src={avatar.url}
                          className="h-10 w-10 mr-3"
                        />
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-medium">{displayName}</span>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {conversation.lastMessage.content}
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-muted-foreground px-4 py-2">Contacts</h3>
            <div className="space-y-1 px-2">
              {filteredContacts.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  {searchQuery ? 'No contacts found' : 'No contacts'}
                </p>
              ) : (
                filteredContacts.map(contact => (
                  <Button
                    key={contact.id}
                    variant="ghost"
                    className="w-full justify-start px-2 py-6"
                    onClick={() => {
                      selectConversation(
                        conversations.find(conv => 
                          conv.participants.length === 2 && 
                          conv.participants.includes(contact.id) && 
                          conv.participants.includes(currentUser?.id || '')
                        )?.id || ''
                      );
                      setView('conversations');
                    }}
                  >
                    <div className="relative">
                      <Avatar 
                        name={contact.displayName} 
                        src={contact.avatarUrl}
                        className="h-10 w-10 mr-3"
                      />
                      {contact.status === 'online' && (
                        <span className="absolute bottom-0 right-2 bg-green-500 rounded-full w-3 h-3 border-2 border-background"></span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{contact.displayName}</span>
                      <span className="text-xs text-muted-foreground">@{contact.username}</span>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
