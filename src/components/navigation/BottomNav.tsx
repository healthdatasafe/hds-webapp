
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, ListTodo, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);
  const isChatRoute = location.pathname === '/chat';

  // Hide the bottom navigation on the chat page
  if (isChatRoute) {
    return null;
  }

  const navItems = [
    {
      name: 'Diary',
      path: '/diary',
      icon: Book,
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: ListTodo,
    },
    {
      name: 'Connections',
      path: '/connections',
      icon: Users,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center py-3 px-4 text-xs",
              isActive(item.path) ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
