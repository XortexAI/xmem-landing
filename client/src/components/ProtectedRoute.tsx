import React from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
  children?: React.ReactNode;
}

export function ProtectedRoute({ component: Component, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    const returnUrl = encodeURIComponent(location);
    return <Redirect to={`/login?returnUrl=${returnUrl}`} />;
  }

  // Render the protected component or children
  if (children) {
    return <>{children}</>;
  }

  return <Component />;
}

export function RequireUsername({ component: Component, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasUsername } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location);
    return <Redirect to={`/login?returnUrl=${returnUrl}`} />;
  }

  if (!hasUsername) {
    return <Redirect to="/set-username" />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Component />;
}
