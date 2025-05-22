
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, BookOpen, CheckSquare, Settings } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  // If the user is not logged in, don't show the navigation
  if (!currentUser) {
    return null;
  }
  
  // Only show on app routes, not on auth routes
  if (location.pathname === '/' || 
      location.pathname === '/login' || 
      location.pathname === '/register') {
    return null;
  }

  const navItems = [
    {
      name: t('nav.chat'),
      icon: MessageSquare,
      path: '/chat',
    },
    {
      name: t('nav.connections'),
      icon: Users,
      path: '/connections',
    },
    {
      name: t('nav.diary'),
      icon: BookOpen,
      path: '/diary',
    },
    {
      name: t('nav.tasks'),
      icon: CheckSquare,
      path: '/tasks',
    },
    {
      name: t('nav.settings'),
      icon: Settings,
      path: '/settings',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#111] border-t border-gray-800 text-white flex justify-around pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center h-full',
              isActive ? 'text-red-500' : 'text-gray-400'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-0.5">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
