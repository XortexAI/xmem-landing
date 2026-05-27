import { useEffect, useMemo, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Code2 } from 'lucide-react';
import { Navbar } from '@/sections/Navbar';
import { Footer } from '@/sections/Footer';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

interface APIKeyCreateResponse {
  key: string;
  key_id: string;
  name: string;
}

function isLocalhostCallback(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:') return false;
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function AuthConnectContent() {
  const { isAuthenticated, user, token, hasUsername } = useAuth();
  const [, setLocation] = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const callback = params.get('callback') || '';
  const client = params.get('client') || '';
  const returnUrl = `/auth/connect?${params.toString()}`;

  const validationError = useMemo(() => {
    if (!callback) return 'Missing callback parameter.';
    if (client !== 'opencode') return 'Unsupported client. Only OpenCode is supported.';
    if (!isLocalhostCallback(callback)) return 'Invalid callback URL. Only localhost callbacks are allowed.';
    return null;
  }, [callback, client]);

  const connectOpenCode = async () => {
    if (validationError) return;

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `OpenCode Client - ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
          scopes: ['*'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to create API key');
      }

      const data: APIKeyCreateResponse = await response.json();
      const redirectUrl = new URL(callback);
      redirectUrl.searchParams.set('apikey', data.key);
      redirectUrl.searchParams.set('username', user?.username || '');
      redirectUrl.searchParams.set('apiurl', API_URL);

      setConnected(true);
      window.location.href = redirectUrl.toString();
    } catch (err) {
      console.error('OpenCode connect error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect. Please try again.');
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !hasUsername || validationError || connected || isConnecting) return;
    void connectOpenCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasUsername, validationError]);

  if (!isAuthenticated) {
    return <Redirect to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} />;
  }

  if (!hasUsername) {
    return <Redirect to={`/set-username?returnUrl=${encodeURIComponent(returnUrl)}`} />;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 mb-4">
              <Code2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Connect OpenCode
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Authorize XMem to work with your OpenCode coding agent
            </p>
          </div>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-white">OpenCode Authentication</CardTitle>
              <CardDescription className="text-gray-400">
                Logged in as {user?.email}
                {user?.username ? ` (@${user.username})` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(error || validationError) && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || validationError}</AlertDescription>
                </Alert>
              )}

              {connected ? (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Connected! Redirecting...</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    You can close this window if it doesn't redirect automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3 text-sm text-gray-400">
                    <p className="font-medium text-white">What happens next:</p>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>XMem creates a dedicated API key for OpenCode</li>
                      <li>Your credentials are sent to the local OpenCode plugin</li>
                      <li>The plugin stores them securely on your machine</li>
                    </ol>
                  </div>

                  <Button
                    onClick={connectOpenCode}
                    disabled={isConnecting || !!validationError}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect OpenCode'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-white"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              API keys created here appear in your dashboard and can be revoked at any time.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AuthConnect() {
  return <AuthConnectContent />;
}
