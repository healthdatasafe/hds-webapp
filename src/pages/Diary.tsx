
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/navigation/BottomNav';
import { useAuth } from '@/context/AuthContext';
import PryvService from '@/services/pryvService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistance } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Interface for Pryv events
interface PryvEvent {
  id: string;
  streamId: string;
  type: string;
  content: any;
  time: number;
  created: number;
  modified?: number;
  tags?: string[];
  description?: string;
}

const Diary = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<PryvEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pryvServiceRef = useRef<PryvService | null>(null);
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
  
  useEffect(() => {
    const loadEvents = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const pryvService = new PryvService({
          serviceInfoUrl: 'https://demo.datasafe.dev/reg/service/info',
          appId: 'health-data-safe',
          language: 'en',
        });
        
        // Store the pryvService reference for later use
        pryvServiceRef.current = pryvService;
        
        // Authenticate with the stored endpoint
        await pryvService.authenticateWithEndpoint(currentUser.personalApiEndpoint);
        
        // Set up interval to check for updates
        const updateEvents = () => {
          if (pryvServiceRef.current) {
            // Sort events by time in ascending order (oldest to newest)
            const sortedEvents = [...pryvServiceRef.current.events].sort((a, b) => a.time - b.time);
            
            // If we have new events and should auto-scroll
            if (sortedEvents.length > prevEventsLengthRef.current && shouldAutoScroll) {
              // Set timeout to allow React to render new events before scrolling
              setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
            
            // Update previous length reference
            prevEventsLengthRef.current = sortedEvents.length;
            setEvents(sortedEvents);
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
  
  const renderEventContent = (event: PryvEvent) => {
    const { type, content } = event;
    
    // Handle different content types
    if (typeof content === 'string') {
      return <p className="text-gray-200">{content}</p>;
    }
    
    if (typeof content === 'object') {
      return (
        <div className="space-y-1">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-400 w-24">{key}:</span>
              <span className="text-gray-200">{value?.toString()}</span>
            </div>
          ))}
        </div>
      );
    }

    // Handle different content types
    if (content != null) {
      return <p className="text-gray-200">{content}</p>;
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
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="bg-[#222] border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-md text-white">
                        {event.streamId || 'Unknown stream'}
                      </CardTitle>
                      <CardDescription>
                        {event.type} • {getTimeAgo(event.time)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                  )}
                  {renderEventContent(event)}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {formatEventTime(event.created)}
                  </p>
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
