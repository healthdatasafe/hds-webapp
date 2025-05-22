
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/TranslationContext';

const Index = () => {
  const { currentUser, isLoading } = useAuth();
  const { t } = useTranslation();

  // If already logged in, redirect to connections
  if (!isLoading && currentUser) {
    return <Navigate to="/connections" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">{t('app.name')}</h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t('app.tagline')}
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/login">{t('auth.login')}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link to="/register">{t('auth.register')}</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          {t('misc.secureHealth')}
        </p>
      </div>
    </div>
  );
};

export default Index;
