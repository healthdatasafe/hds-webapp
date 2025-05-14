
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/navigation/BottomNav';

const Diary = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 p-4 pb-16">
        <h1 className="text-2xl font-bold mb-4">Diary</h1>
        <p className="text-muted-foreground mb-4">
          This page is under construction.
        </p>
        <Button onClick={() => navigate('/chat')}>
          Go to Connections
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Diary;
