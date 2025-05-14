
import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If already logged in, redirect to chat
  if (currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Chat App</h1>
        <p className="text-muted-foreground">Secured by Pryv.io</p>
      </div>
      <RegisterForm />
    </div>
  );
};

export default Register;
