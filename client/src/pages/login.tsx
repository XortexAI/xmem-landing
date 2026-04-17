import { useEffect, useState } from 'react';
import { useLocation, useSearch, Redirect } from 'wouter';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/sections/Navbar';
import { Footer } from '@/sections/Footer';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Debug logging (remove in production)
console.log("[Login] VITE_GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "Set (hidden)" : "NOT SET");
console.log("[Login] All env vars:", import.meta.env);

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    created_at?: string;
    last_login?: string;
  };
}

function LoginContent() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse return URL from query params
  const params = new URLSearchParams(search);
  const returnUrl = params.get('returnUrl') || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Redirect to={decodeURIComponent(returnUrl)} />;
  }

  const handleGoogleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Authentication failed');
      }

      const data: TokenResponse = await response.json();

      // Store auth data
      login(data.access_token, data.user);

      // Redirect to the return URL or dashboard
      setLocation(decodeURIComponent(returnUrl));
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400">
              Sign in to access your XMem dashboard and API keys
            </p>
          </div>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-white">Sign In</CardTitle>
              <CardDescription className="text-gray-400">
                Continue with your Google account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center gap-4">
                {isLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-gray-400">Signing in...</span>
                  </div>
                ) : (
                  <div className="w-full flex justify-center">
                    {GOOGLE_CLIENT_ID ? (
                      <div className="w-full flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                          useOneTap={false}
                          theme="filled_black"
                          size="large"
                          text="signin_with"
                          shape="rectangular"
                          width="300"
                        />
                      </div>
                    ) : (
                      <Alert className="bg-yellow-900/20 border-yellow-800 text-yellow-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                          <p><strong>Google Client ID not configured.</strong></p>
                          <p className="text-sm">
                            1. Create <code className="bg-yellow-900/40 px-1 rounded">.env</code> file in project root with:
                          </p>
                          <code className="block bg-yellow-900/40 px-2 py-1 rounded text-xs break-all">
                            VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
                          </code>
                          <p className="text-sm">
                            2. <strong>Restart the dev server</strong> (Vite needs this to load env vars)
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-yellow-700 text-yellow-200 hover:bg-yellow-900/40"
                            onClick={() => window.location.reload()}
                          >
                            Reload Page
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <p className="text-xs text-center text-gray-500 max-w-sm">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                  Your data is secure and never shared with third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <span className="text-gray-300">
                Sign in with Google to create one instantly
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  // Only wrap with GoogleOAuthProvider if we have a client ID
  if (!GOOGLE_CLIENT_ID) {
    return <LoginContent />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
