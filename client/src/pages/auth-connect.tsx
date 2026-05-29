import { useEffect, useMemo, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/sections/Footer";
import { Navbar } from "@/sections/Navbar";
import { connectors, getConnector } from "@/lib/connectors";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

interface TempTokenResponse {
  temp_token: string;
  expires_at: string;
}

interface NewKeyData {
  key: string;
  key_id: string;
  name: string;
}

function getConnectorIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const queryClient = params.get("client");
  if (queryClient) return queryClient;

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "auth" && pathParts[1] === "connect") return pathParts[2] || "opencode";
  return "opencode";
}

function getCallbackUrl() {
  return new URLSearchParams(window.location.search).get("callback");
}

function isSafeLocalCallback(callback: string) {
  try {
    const url = new URL(callback);
    return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

function appendConnectionParams(callback: string, params: Record<string, string>) {
  const url = new URL(callback);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export default function AuthConnect() {
  const { isAuthenticated, user, token, hasUsername } = useAuth();
  const [location, setLocation] = useLocation();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [newKey, setNewKey] = useState<NewKeyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoConnecting, setAutoConnecting] = useState(false);
  const [autoConnectFailed, setAutoConnectFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const connector = useMemo(() => getConnector(getConnectorIdFromUrl()), [location]);
  const callbackUrl = useMemo(() => getCallbackUrl(), [location]);
  const returnUrl = `${window.location.pathname}${window.location.search}`;
  const hasCallback = Boolean(callbackUrl);
  const callbackIsSafe = !callbackUrl || isSafeLocalCallback(callbackUrl);
  const validationError =
    hasCallback && connector.id !== "opencode"
      ? "Callback authorization is currently supported for OpenCode only."
      : hasCallback && !callbackIsSafe
        ? "Invalid callback URL. Only local HTTP callbacks are allowed."
        : null;
  const Icon = connector.icon;

  const flashCopied = (value: string) => {
    setCopied(value);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyText = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(
      () => flashCopied(key),
      () => setError("Failed to copy to clipboard. Please copy manually."),
    );
  };

  const createConnectorKey = async (redirectToCallback: boolean) => {
    if (validationError) return;

    setIsLoading(true);
    if (redirectToCallback) {
      setAutoConnecting(true);
      setAutoConnectFailed(false);
    }
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${connector.name} connector - ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
          scopes: ["*"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to create API key");
      }

      const data: NewKeyData = await response.json();
      if (redirectToCallback && callbackUrl) {
        setConnected(true);
        window.location.href = appendConnectionParams(callbackUrl, {
          apikey: data.key,
          username: user?.username || "",
          apiurl: API_URL,
        });
        return;
      }

      setNewKey(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect. Please try again.");
      if (redirectToCallback) {
        setAutoConnectFailed(true);
        setAutoConnecting(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateTempToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/mcp-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to generate token");
      }

      const data: TempTokenResponse = await response.json();
      setTempToken(data.temp_token);
      setExpiresAt(new Date(data.expires_at));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !hasUsername || !hasCallback || validationError || connected || autoConnecting || autoConnectFailed) return;
    void createConnectorKey(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasUsername, hasCallback, validationError, connected, autoConnecting, autoConnectFailed]);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (!isAuthenticated) {
    return <Redirect to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} />;
  }

  if (hasCallback && !hasUsername) {
    return <Redirect to={`/set-username?returnUrl=${encodeURIComponent(returnUrl)}`} />;
  }

  const getTimeRemaining = () => {
    if (!expiresAt) return "";
    const diff = expiresAt.getTime() - now;
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const authCommand = tempToken ? `authenticate(token="${tempToken}")` : "";

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/65">
              <ShieldCheck className="h-3.5 w-3.5" />
              Connector authorization
            </div>
            <h1 className="text-3xl font-bold text-white md:text-5xl">Connect {connector.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
              {connector.description}
            </p>
          </div>
          <Button variant="ghost" className="w-fit text-gray-400 hover:text-white" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <Card className="border-gray-800 bg-[#111]">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${connector.accent} text-black`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">{connector.name}</h2>
                      <Badge className="border-gray-700 bg-gray-900 text-gray-300">{connector.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{connector.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-[#111]">
              <CardHeader>
                <CardTitle className="text-base text-white">Other connectors</CardTitle>
                <CardDescription className="text-gray-400">Pick a setup guide or auth flow.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {connectors.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = item.id === connector.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLocation(item.connectPath)}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                        isActive
                          ? "border-blue-500/40 bg-blue-500/10 text-white"
                          : "border-gray-800 bg-black/20 text-gray-400 hover:border-gray-700 hover:text-white"
                      }`}
                    >
                      <ItemIcon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 truncate text-sm">{item.name}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            {(error || validationError) && (
              <Alert variant="destructive" className="border-red-800 bg-red-900/20 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || validationError}</AlertDescription>
              </Alert>
            )}

            <Card className="border-gray-800 bg-[#111]">
              <CardHeader>
                <CardTitle className="text-lg text-white">{hasCallback ? "Approve connection" : "Setup"}</CardTitle>
                <CardDescription className="text-gray-400">
                  Logged in as {user?.email}
                  {user?.username ? ` (@${user.username})` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {connector.installCommand && (
                  <div className="rounded-md border border-gray-800 bg-black/40 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-gray-500">Install</div>
                    <div className="flex items-center gap-3">
                      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm text-cyan-200">
                        {connector.installCommand}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => copyText(connector.installCommand!, "install")} className="text-gray-400 hover:text-white">
                        {copied === "install" ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {connected ? (
                  <div className="rounded-lg border border-green-800 bg-green-900/20 p-4">
                    <div className="flex items-center gap-2 text-green-300">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Connected. Redirecting...</span>
                    </div>
                  </div>
                ) : connector.statusKind === "mcp-token" ? (
                  <McpTokenPanel
                    tempToken={tempToken}
                    authCommand={authCommand}
                    expiresLabel={getTimeRemaining()}
                    copied={copied}
                    isLoading={isLoading}
                    onGenerate={generateTempToken}
                    onCopy={copyText}
                  />
                ) : (
                  <ApiKeyPanel
                    connectorName={connector.name}
                    hasCallback={hasCallback}
                    isLoading={isLoading || autoConnecting}
                    callbackIsSafe={!validationError}
                    newKey={newKey}
                    copied={copied}
                    onCreate={() => createConnectorKey(hasCallback)}
                    onCopy={copyText}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-[#111]">
              <CardHeader>
                <CardTitle className="text-lg text-white">How to connect</CardTitle>
                <CardDescription className="text-gray-400">Follow these steps for {connector.name}.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="grid gap-3 md:grid-cols-2">
                  {connector.docs.map((step, index) => (
                    <li key={step} className="rounded-md border border-gray-800 bg-black/30 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-gray-500">Step {index + 1}</div>
                      <p className="text-sm leading-relaxed text-gray-300">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/docs#connectors" className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Connector docs
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Connector status
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function McpTokenPanel({
  tempToken,
  authCommand,
  expiresLabel,
  copied,
  isLoading,
  onGenerate,
  onCopy,
}: {
  tempToken: string | null;
  authCommand: string;
  expiresLabel: string;
  copied: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  onCopy: (value: string, key: string) => void;
}) {
  if (!tempToken) {
    return (
      <Button onClick={onGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Generate connection token
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-green-800 bg-green-900/20 p-4">
        <div className="mb-2 flex items-center gap-2 text-green-300">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Token generated</span>
        </div>
        <p className="mb-3 text-sm text-gray-400">
          Expires in <span className="font-mono text-white">{expiresLabel}</span>
        </p>
        <code className="block break-all rounded-md border border-gray-800 bg-black/50 p-3 text-sm text-white">{tempToken}</code>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => onCopy(tempToken, "token")} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            {copied === "token" ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
            Copy token
          </Button>
          <Button variant="outline" onClick={() => onCopy(authCommand, "command")} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            {copied === "command" ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
            Copy command
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-gray-800 bg-black/40 p-4">
        <div className="mb-2 text-sm font-medium text-white">Paste into the connector</div>
        <code className="block break-all rounded-md bg-black px-3 py-2 text-sm text-blue-300">{authCommand}</code>
      </div>
    </div>
  );
}

function ApiKeyPanel({
  connectorName,
  hasCallback,
  isLoading,
  callbackIsSafe,
  newKey,
  copied,
  onCreate,
  onCopy,
}: {
  connectorName: string;
  hasCallback: boolean;
  isLoading: boolean;
  callbackIsSafe: boolean;
  newKey: NewKeyData | null;
  copied: string | null;
  onCreate: () => void;
  onCopy: (value: string, key: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Button onClick={onCreate} disabled={isLoading || !callbackIsSafe} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
        {hasCallback ? `Authorize ${connectorName}` : "Create connector key"}
      </Button>

      {newKey && (
        <div className="rounded-md border border-yellow-800 bg-yellow-900/20 p-4">
          <div className="mb-2 text-sm font-medium text-yellow-100">Copy this key now</div>
          <p className="mb-3 text-sm text-yellow-100/70">XMem only shows new API keys once.</p>
          <div className="flex items-center gap-2 rounded-md border border-gray-800 bg-black/50 p-3">
            <code className="min-w-0 flex-1 break-all text-sm text-green-300">{newKey.key}</code>
            <Button variant="ghost" size="sm" onClick={() => onCopy(newKey.key, "key")} className="text-gray-400 hover:text-white">
              {copied === "key" ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
