
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/navigation/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 p-4 pb-16">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-muted-foreground mb-4">
          Manage your account and application preferences.
        </p>
        <div className="space-y-4">
          <Button onClick={logout} variant="destructive" className="w-full">
            Sign out
          </Button>
          <Button onClick={() => navigate('/chat')} className="w-full">
            Go to Connections
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
