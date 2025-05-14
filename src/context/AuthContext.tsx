
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app with Pryv.io, we would verify authentication here
        const savedUser = localStorage.getItem('chatUser');
        
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, we would make a real API call to Pryv.io here
      // This is a mock implementation
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        email,
        avatarUrl: undefined
      };
      
      localStorage.setItem('chatUser', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      toast.success("Logged in successfully!");
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, we would make a real API call to Pryv.io here
      // This is a mock implementation
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        username,
        displayName: username,
        email,
      };
      
      localStorage.setItem('chatUser', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      toast.success("Account created successfully!");
      navigate('/chat');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('chatUser');
    setCurrentUser(null);
    toast.info("You've been logged out");
    navigate('/login');
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
