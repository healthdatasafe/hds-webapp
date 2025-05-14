
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { currentUser, isLoading } = useAuth();

  // If already logged in, redirect to chat
  if (!isLoading && currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Chat App</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Welcome to our real-time chat application powered by Pryv.io
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Secure chat with end-to-end encryption and data privacy.
        </p>
      </div>
    </div>
  );
};

export default Index;
