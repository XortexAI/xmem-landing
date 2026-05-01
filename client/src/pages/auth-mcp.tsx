import { useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Copy, CheckCircle, ArrowLeft, Terminal } from 'lucide-react';
import { Navbar } from '@/sections/Navbar';
import { Footer } from '@/sections/Footer';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

interface TempTokenResponse {
  temp_token: string;
  expires_in: number;
  expires_at: string;
}

function AuthMcpContent() {
  const { isAuthenticated, user, token } = useAuth();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to={`/login?returnUrl=${encodeURIComponent('/auth/mcp')}`} />;
  }

  const generateToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/mcp-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to generate token');
      }

      const data: TempTokenResponse = await response.json();
      setTempToken(data.temp_token);
      setExpiresAt(new Date(data.expires_at));
    } catch (err) {
      console.error('Token generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!tempToken) return;

    navigator.clipboard.writeText(tempToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCommand = () => {
    if (!tempToken) return;

    const command = `authenticate(token="${tempToken}")`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format time remaining
  const getTimeRemaining = () => {
    if (!expiresAt) return '';

    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
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
              Connect to AI Assistant
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Generate a temporary token to connect XMem to Claude Desktop, ChatGPT, or other MCP-compatible clients
            </p>
          </div>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-white">MCP Authentication</CardTitle>
              <CardDescription className="text-gray-400">
                Logged in as {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!tempToken ? (
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3 text-sm text-gray-400">
                    <p className="font-medium text-white">How it works:</p>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Click the button below to generate a temporary token</li>
                      <li>Copy the token (valid for 10 minutes)</li>
                      <li>In your AI chat, paste: <code className="text-blue-400">authenticate(token="xm-temp-xxxxx")</code></li>
                      <li>The MCP server will exchange it for a permanent API key</li>
                    </ol>
                  </div>

                  <Button
                    onClick={generateToken}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Connection Token'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-medium">Token Generated!</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Expires in: <span className="text-white font-mono">{getTimeRemaining()}</span>
                    </p>

                    <div className="bg-black/50 rounded-lg p-3 font-mono text-sm break-all text-white border border-gray-800">
                      {tempToken}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex-1 border-gray-700 hover:bg-gray-800"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Token
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                    <p className="font-medium text-white text-sm">Next steps:</p>
                    <p className="text-sm text-gray-400">
                      In your AI chat (Claude, ChatGPT, etc.), paste this command:
                    </p>
                    <div className="bg-black/50 rounded-lg p-3 font-mono text-sm text-blue-400 border border-gray-800">
                      authenticate(token="{tempToken}")
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCommand}
                      className="w-full border-gray-700 hover:bg-gray-800"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Full Command
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempToken(null);
                      setExpiresAt(null);
                    }}
                    className="w-full text-gray-500 hover:text-white"
                  >
                    Generate New Token
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
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              This token can only be used once and expires in 10 minutes.
              The MCP server will exchange it for a permanent API key.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AuthMcp() {
  return <AuthMcpContent />;
}
