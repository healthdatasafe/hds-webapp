
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/navigation/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistance } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {pryv as Pryv} from 'hds-lib-js';
import ChatItem from '@/model/ChatItem';


const Diary = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const prevEventsLengthRef = useRef<number>(0);
  
  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Consider "near bottom" to be within 100px of the bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  function accessNameForId (accesId: string) {
    if (!currentUser?.appService) return null;
    return currentUser.appService.accessForId(accesId)?.name; 
  }
  
  useEffect(() => {
    const loadEvents = async () => {
      
      if (!currentUser) return;
     
      try {
        setLoading(true);

        
        // Set up interval to check for updates
        const updateEvents = () => {
          if (currentUser.appService) {
            // Sort events by time in ascending order (oldest to newest)
            const sortedEvents = [...currentUser.appService.events].sort((a, b) => a.time - b.time);
            const newChatItems = [];
            for (const event of sortedEvents) {
              const chatItem = ChatItem.fromEvent(event);
              if (chatItem) newChatItems.push(chatItem);
            }

            // If we have new events and should auto-scroll
            if (newChatItems.length > prevEventsLengthRef.current && shouldAutoScroll) {
              // Set timeout to allow React to render new events before scrolling
              setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
            
            // Update previous length reference
            prevEventsLengthRef.current = newChatItems.length;
            setChatItems(newChatItems);
          }
        };
        
        // Initial load
        updateEvents();
        setLoading(false);
        
        // Initial scroll to bottom
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Set up polling for updates
        const intervalId = setInterval(updateEvents, 1000);
        
        // Clean up function
        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error('Failed to load events:', error);
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [currentUser]);
  
  const formatEventTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert Pryv timestamp to JS Date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getTimeAgo = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return formatDistance(date, new Date(), { addSuffix: true });
  };
  
  const renderChatItem = (chatItem: ChatItem) => {
    const { type, content } = chatItem;
    
    // Handle different content types
    if (type === 'string') {
      return <p className="text-gray-200">{content}</p>;
    }
    
    if (type === 'keyValue') {
      return (
        <div className="space-y-1">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-400 w-24">{key}:</span>
              <span className="text-gray-200">{value}</span>
            </div>
          ))}
        </div>
      );
    }

    // Handle different content types
    if (content != null) {
      return <p className="text-gray-200">{JSON.stringify(content)}</p>;
    }
    
    return <p className="text-gray-400">No content available</p>;
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <div 
        className="flex-1 p-4 pb-16 overflow-auto" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        <h1 className="text-2xl font-bold mb-4">Diary</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-red-500 rounded-full"></div>
          </div>
        ) : chatItems.length > 0 ? (
          <div className="space-y-4">
            {chatItems.map((chatItem) => (
              <Card key={chatItem.id} className="bg-[#222] border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-md text-white">
                        {chatItem.title || 'Unknown stream'}
                      </CardTitle>
                      <CardDescription>
                        {chatItem.description} • {getTimeAgo(chatItem.time)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderChatItem(chatItem)}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {formatEventTime(chatItem.event.created)} by {accessNameForId(chatItem.event.createdBy)}
                  </p>
                  {(chatItem.event.created != chatItem.event.modified) && (
                    <p className="text-xs text-gray-400 mt-2">
                    Modified: {formatEventTime(chatItem.event.modified)} by {accessNameForId(chatItem.event.modifiedBy)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            <div ref={bottomRef} className="h-2" /> {/* Bottom reference element */}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-700 rounded-lg">
            <p className="text-muted-foreground mb-4">No events found in your diary.</p>
            <Button onClick={() => navigate('/chat')}>
              Go to Connections
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Diary;
