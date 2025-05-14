
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PryvService from '@/services/pryvService';

interface User {
  id: string;
  personalApiEndpoint: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize our custom PryvService wrapper
  const pryvService = new PryvService({
    serviceInfoUrl: 'https://demo.datasafe.dev/reg/service/info',
    appId: 'health-data-safe',
    language: 'en',
  });

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a stored auth in localStorage
        const savedUser = localStorage.getItem('chatUser');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Verify the session with HDS
          try {
            // Use our custom service to authenticate
            await pryvService.authenticateWithEndpoint(parsedUser.personalApiEndpoint);
            setCurrentUser(parsedUser);
          } catch (error) {
            // If verification fails, clear localStorage
            localStorage.removeItem('chatUser');
            console.error('Session verification failed:', error);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      // Determine if identifier is an email or username
      const isEmail = identifier.includes('@');
      
      // Extract username from email for HDS or use the identifier as username
      const username = isEmail ? identifier.split('@')[0] : identifier;
      const email = isEmail ? identifier : `${identifier}@example.com`;
      
      // Authenticate with HDS using our service
      const personalConnection = await pryvService.authenticate(username, password);
      
      // Create user object from successful login
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        personalApiEndpoint: personalConnection.apiEndpoint,
        username,
        displayName: username,
        email,
        avatarUrl: undefined
      };
      
      localStorage.setItem('chatUser', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      toast.success("Logged in successfully!");
      navigate('/connections');
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
      // Register with HDS using our service wrapper
      await pryvService.authenticate();
      
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
      navigate('/connections');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Just clear local data since we're using a custom service
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
