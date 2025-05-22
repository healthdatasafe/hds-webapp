
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/TranslationContext';
import LanguageSelector from '@/components/settings/LanguageSelector';
import BottomNav from '@/components/navigation/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 p-4 pb-16">
        <h1 className="text-2xl font-bold mb-4">{t('settings.title')}</h1>
        <p className="text-muted-foreground mb-4">
          {t('settings.subtitle')}
        </p>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">Preferences</h2>
            <LanguageSelector />
          </div>
          
          <div className="space-y-4 pt-4">
            <Button onClick={logout} variant="destructive" className="w-full">
              {t('auth.logout')}
            </Button>
            <Button onClick={() => navigate('/chat')} className="w-full">
              {t('nav.chat')}
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
