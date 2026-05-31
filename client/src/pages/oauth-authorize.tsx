import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Brain,
  BookOpen,
  CheckCircle,
  Code2,
  Loader2,
  Shield,
  X,
  Zap,
} from 'lucide-react';
import { SiOpenai } from 'react-icons/si';
import { Navbar } from '@/sections/Navbar';
import { Footer } from '@/sections/Footer';

import type { ComponentType } from 'react';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

/** Map known OAuth client IDs / redirect URIs to branding info. */
function getClientInfo(
  clientId: string | null,
  redirectUri: string | null,
): { name: string; icon: ComponentType<{ className?: string }>; accent: string } {
  if (redirectUri?.includes('chatgpt.com') || clientId === 'xmem-mcp') {
    return { name: 'ChatGPT', icon: SiOpenai, accent: 'from-emerald-400 to-teal-300' };
  }
  return { name: clientId || 'External App', icon: Zap, accent: 'from-blue-400 to-purple-300' };
}

const permissions = [
  { icon: Brain, label: 'Read & search your memories', detail: 'Semantic search and recall' },
  { icon: BookOpen, label: 'Save new memories', detail: 'Ingest conversations and context' },
  { icon: Code2, label: 'Access code indexes', detail: 'Query scanned repositories' },
];

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

  const clientInfo = getClientInfo(clientId, redirectUri);
  const ClientIcon = clientInfo.icon;

  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      setLocation(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  // Missing required params
  if (!clientId || !redirectUri) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="mx-4 max-w-md rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center backdrop-blur-xl">
          <X className="mx-auto mb-4 h-10 w-10 text-red-400" />
          <h2 className="text-xl font-semibold text-red-300">Invalid Request</h2>
          <p className="mt-2 text-sm text-red-200/70">
            Missing required <code className="text-red-300">client_id</code> or{' '}
            <code className="text-red-300">redirect_uri</code> parameters.
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/oauth/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate authorization code');
      }

      const data = await response.json();

      // Redirect back to the requesting app with the code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append('code', data.code);
      if (state) {
        redirectUrl.searchParams.append('state', state);
      }

      window.location.href = redirectUrl.toString();
    } catch (err) {
      console.error(err);
      setError('Authorization failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      {/* ── Subtle background glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        <div className="absolute left-1/3 top-2/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-md">
          {/* ── Connection visual ── */}
          <div className="mb-8 flex items-center justify-center gap-6">
            {/* Requesting app */}
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${clientInfo.accent} shadow-lg shadow-emerald-500/10`}
            >
              <ClientIcon className="h-8 w-8 text-black" />
            </div>

            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/60"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>

            {/* XMem */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg">
              <img src="/logo.png" alt="XMem" className="h-8 w-8 invert" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            Authorize {clientInfo.name}
          </h1>
          <p className="mb-8 text-center text-sm text-gray-400">
            {clientInfo.name} wants to connect to your XMem account
          </p>

          {/* ── Main card ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {/* Signed-in user */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border border-white/10"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Permission list */}
            <div className="mb-6 space-y-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Permissions requested
              </p>
              {permissions.map((perm) => {
                const PermIcon = perm.icon;
                return (
                  <div
                    key={perm.label}
                    className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <PermIcon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{perm.label}</p>
                      <p className="text-xs text-gray-500">{perm.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setLocation('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing&hellip;
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Trust footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5" />
            <span>You can revoke access at any time from your dashboard</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
