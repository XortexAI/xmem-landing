import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Terminal } from 'lucide-react';
import { Navbar } from '@/sections/Navbar';
import { Footer } from '@/sections/Footer';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

export default function OAuthAuthorize() {
  const { isAuthenticated, user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const state = params.get('state');

  useEffect(() => {
    // If not authenticated, redirect to login and come back here
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      setLocation(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  if (!clientId || !redirectUri) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <Card className="bg-[#111] border-red-900/50 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-400">Invalid Request</CardTitle>
            <CardDescription>Missing client_id or redirect_uri parameters.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Ask backend to generate an authorization code
      const response = await fetch(`${API_URL}/auth/oauth/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate authorization code');
      }

      const data = await response.json();
      
      // 2. Redirect back to ChatGPT with the code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append('code', data.code);
      if (state) {
        redirectUrl.searchParams.append('state', state);
      }
      
      window.location.href = redirectUrl.toString();
      
    } catch (err) {
      console.error(err);
      setError('An error occurred during authorization. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
              <Terminal className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Authorize Connection
            </h1>
          </div>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-white">Connect AI Assistant</CardTitle>
              <CardDescription className="text-gray-400">
                An external application (Client ID: {clientId}) is requesting access to your XMem account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  By clicking approve, you allow this application to read and write to your memory and codebase indexes as <span className="font-semibold text-white">{user?.email}</span>.
                </p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-200 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-700 hover:bg-gray-800"
                  onClick={() => setLocation('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Authorizing...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2" /> Approve</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
