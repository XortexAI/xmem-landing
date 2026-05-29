import { useEffect, useState, useCallback, Suspense, lazy } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Cable,
  Check,
  Copy,
  Edit2,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { useMemoryGraph, type MemoryNode } from "@/hooks/useMemoryGraph";
import { MemoryDetails } from "@/components/MemoryDetails";
import { connectors, getConnectorStatus } from "@/lib/connectors";
import {
  loadRazorpayCheckout,
  type RazorpayOrder,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay";

const MemoryBrain = lazy(() =>
  import("@/components/three-d/MemoryBrain").then((mod) => ({ default: mod.MemoryBrain })),
);

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

interface APIKey {
  id: string;
  key_prefix: string;
  name: string;
  scopes?: string[];
  expires_at?: string | null;
  org_id?: string | null;
  project_id?: string | null;
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

interface NewKeyData {
  key: string;
  key_id: string;
  name: string;
  scopes?: string[];
  expires_at?: string | null;
  org_id?: string | null;
  project_id?: string | null;
  created_at: string;
}

interface UsageSnapshot {
  memories_written: number;
  retrievals: number;
  graph_queries: number;
  credits_used: number;
  credits_limit: number;
}

interface BillingSummary {
  plan_name: string;
  account_status: "active" | "trial" | "paused" | "past_due";
  currency: string;
  credit_balance: number;
  prepaid_balance_paise: number;
  current_month: UsageSnapshot;
  next_invoice_paise: number;
  last_payment_at?: string;
  invoices: Invoice[];
}

interface Invoice {
  id: string;
  date: string;
  amount_paise: number;
  status: "paid" | "pending" | "failed";
  credits: number;
  receipt_url?: string;
}

interface CreditPackage {
  id: string;
  label: string;
  description: string;
  credits: number;
  amountInPaise: number;
  currency?: string;
  badge?: string;
}

const defaultKeyScopes = ["*"];

const apiScopeOptions = [
  { value: "*", label: "Full access", description: "All current XMem APIs" },
  { value: "memory:read", label: "Memory read", description: "Retrieve and search memories" },
  { value: "memory:write", label: "Memory write", description: "Create and update memories" },
  { value: "scanner:write", label: "Scanner", description: "Repository scanner actions" },
  { value: "code:read", label: "Code context", description: "Code retrieval and context APIs" },
  { value: "mcp:access", label: "MCP", description: "Model Context Protocol access" },
  { value: "sdk:access", label: "SDK", description: "Python and TypeScript SDK usage" },
  { value: "chrome_ext:access", label: "Chrome extension", description: "Browser extension access" },
];

const creditPackages: CreditPackage[] = [
  {
    id: "free",
    label: "Free",
    description: "30 days free with access to the core platform, Chrome extension, MCP, and SDKs.",
    credits: 0,
    amountInPaise: 0,
    badge: "Current",
  },
  {
    id: "pro",
    label: "Pro",
    description: "Full access for production apps, priority support, and pay-as-you-go usage.",
    credits: 0,
    amountInPaise: 100,
    currency: "USD",
    badge: "Recommended",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description: "Dedicated onboarding, custom limits, security reviews, and team support.",
    credits: 0,
    amountInPaise: 0,
  },
];

const fallbackBillingSummary: BillingSummary = {
  plan_name: "Free trial",
  account_status: "trial",
  currency: "INR",
  credit_balance: 5000,
  prepaid_balance_paise: 0,
  current_month: {
    memories_written: 0,
    retrievals: 0,
    graph_queries: 0,
    credits_used: 0,
    credits_limit: 5000,
  },
  next_invoice_paise: 0,
  invoices: [],
};

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(defaultKeyScopes);
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<NewKeyData | null>(null);

  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [billingWarning, setBillingWarning] = useState<string | null>(null);
  const [billingPackageId, setBillingPackageId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");

  const {
    data: memoryData,
    isLoading: isLoadingMemories,
    error: memoryError,
    refetch: refetchMemories,
  } = useMemoryGraph(token);
  const [selectedMemory, setSelectedMemory] = useState<MemoryNode | null>(null);

  const handleAuthFailure = useCallback(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);

  const fetchApiKeys = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Failed to fetch API keys");
      }

      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError("Failed to load API keys. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, handleAuthFailure]);

  const fetchBillingSummary = useCallback(async () => {
    if (!token) return;

    try {
      setIsBillingLoading(true);
      setBillingWarning(null);

      const response = await fetch(`${API_URL}/api/billing/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Billing API is not available");
      }

      const data = await response.json();
      setBillingSummary(data.summary || data);
    } catch (err) {
      console.error("Error fetching billing summary:", err);
      setBillingSummary(fallbackBillingSummary);
      setBillingWarning(null);
    } finally {
      setIsBillingLoading(false);
    }
  }, [token, handleAuthFailure]);

  useEffect(() => {
    fetchApiKeys();
    fetchBillingSummary();
  }, [fetchApiKeys, fetchBillingSummary]);

  const handleCreateKey = async () => {
    if (!token || !newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName.trim(), scopes: newKeyScopes.length ? newKeyScopes : defaultKeyScopes }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Failed to create API key");
      }

      const data: NewKeyData = await response.json();
      setNewKey(data);
      setNewKeyName("");
      setNewKeyScopes(defaultKeyScopes);
      await fetchApiKeys();

      toast({
        title: "API key created",
        description: "Your new API key has been generated.",
      });
    } catch (err) {
      console.error("Error creating API key:", err);
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!token || !keyToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/keys/${keyToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Failed to delete API key");
      }

      setApiKeys((prev) => prev.filter((k) => k.id !== keyToDelete));
      toast({
        title: "API key revoked",
        description: "The API key has been revoked.",
      });
    } catch (err) {
      console.error("Error deleting API key:", err);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setKeyToDelete(null);
    }
  };

  const handleEditKey = async () => {
    if (!token || !editingKey || !editName.trim()) return;

    setIsEditing(true);
    try {
      const response = await fetch(`${API_URL}/api/keys/${editingKey.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Failed to update API key");
      }

      await fetchApiKeys();
      toast({
        title: "API key updated",
        description: "The API key name has been updated.",
      });
    } catch (err) {
      console.error("Error updating API key:", err);
      toast({
        title: "Error",
        description: "Failed to update API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
      setEditingKey(null);
      setEditName("");
    }
  };

  const verifyRazorpayPayment = async (
    payment: RazorpaySuccessResponse,
    selectedPackage: CreditPackage,
    order: RazorpayOrder,
  ) => {
    if (!token) return;

    try {
      setBillingPackageId(selectedPackage.id);
      const response = await fetch(`${API_URL}/api/billing/razorpay/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payment,
          package_id: selectedPackage.id,
          credits: selectedPackage.credits,
          amount: order.amount || selectedPackage.amountInPaise,
          currency: order.currency || "INR",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Payment verification failed");
      }

      toast({
        title: "Payment verified",
        description: `${selectedPackage.label} access has been activated for your account.`,
      });
      await fetchBillingSummary();
    } catch (err) {
      console.error("Error verifying Razorpay payment:", err);
      toast({
        title: "Payment needs verification",
        description: "Payment completed, but verification failed. Check the billing backend logs.",
        variant: "destructive",
      });
    } finally {
      setBillingPackageId(null);
    }
  };

  const handleBuyCredits = async (selectedPackage: CreditPackage) => {
    if (!token) return;

    setBillingPackageId(selectedPackage.id);
    try {
      const orderResponse = await fetch(`${API_URL}/api/billing/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          credits: selectedPackage.credits,
          amount: selectedPackage.amountInPaise,
          currency: selectedPackage.currency || "INR",
        }),
      });

      if (!orderResponse.ok) {
        if (orderResponse.status === 401) {
          handleAuthFailure();
          return;
        }
        throw new Error("Failed to create Razorpay order");
      }

      const order: RazorpayOrder = await orderResponse.json();
      const orderId = order.id || order.order_id;
      const publicKey = order.key_id || RAZORPAY_KEY_ID;

      if (!orderId) {
        throw new Error("Razorpay order ID was missing");
      }

      if (!publicKey) {
        throw new Error("VITE_RAZORPAY_KEY_ID is not configured");
      }

      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout did not initialize");
      }

      const checkout = new window.Razorpay({
        key: publicKey,
        amount: order.amount || selectedPackage.amountInPaise,
        currency: order.currency || selectedPackage.currency || "INR",
        name: "XMem",
        description: `${selectedPackage.label} plan`,
        order_id: orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        notes: {
          package_id: selectedPackage.id,
          credits: String(selectedPackage.credits),
        },
        theme: {
          color: "#0f172a",
        },
        handler: (payment) => {
          void verifyRazorpayPayment(payment, selectedPackage, order);
        },
        modal: {
          ondismiss: () => setBillingPackageId(null),
        },
      });

      checkout.open();
    } catch (err) {
      console.error("Error starting Razorpay checkout:", err);
      setBillingPackageId(null);
      toast({
        title: "Checkout unavailable",
        description:
          err instanceof Error ? err.message : "Unable to start Razorpay checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amountInPaise: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amountInPaise / 100);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const toggleNewKeyScope = (scope: string) => {
    setNewKeyScopes((currentScopes) => {
      if (scope === "*") {
        return ["*"];
      }

      const scopedWithoutWildcard = currentScopes.filter((item) => item !== "*");

      if (scopedWithoutWildcard.includes(scope)) {
        const nextScopes = scopedWithoutWildcard.filter((item) => item !== scope);
        return nextScopes.length ? nextScopes : ["*"];
      }

      return [...scopedWithoutWildcard, scope];
    });
  };

  const activeApiKeys = apiKeys.filter((key) => key.is_active).length;
  const currentUsage = billingSummary?.current_month || fallbackBillingSummary.current_month;
  const usagePercent =
    currentUsage.credits_limit > 0
      ? Math.min(100, Math.round((currentUsage.credits_used / currentUsage.credits_limit) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <main className="px-3 pb-12 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
            <DashboardSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              activeApiKeys={activeApiKeys}
              memoryCount={memoryData?.total_memories || 0}
              creditBalance={billingSummary?.credit_balance || 0}
              formatNumber={formatNumber}
            />

            <section className="min-w-0">
              <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-normal text-gray-500">Account</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                    {dashboardNavItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                    {activeSection === "overview" && "Review your account, usage, and current XMem activity."}
                    {activeSection === "api-keys" && "Create and manage credentials for your applications."}
                    {activeSection === "connectors" && "Connect XMem to agents, MCP clients, browsers, and custom tools."}
                    {activeSection === "memories" && "Inspect the memories and context stored in your account."}
                    {activeSection === "billing" && "Choose a plan and manage payment access."}
                  </p>
                </div>
                {activeSection === "overview" && (
                  <Button
                    variant="outline"
                    className="h-9 w-full border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.06] hover:text-white sm:w-auto"
                    onClick={() => {
                      refetchMemories();
                      void fetchApiKeys();
                      void fetchBillingSummary();
                    }}
                  >
                    Refresh
                  </Button>
                )}
                {activeSection === "api-keys" && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="h-9 w-full bg-white text-black hover:bg-gray-200 sm:w-auto"
                  >
                    New API key
                  </Button>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 border-red-900/60 bg-red-950/30 text-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {activeSection === "overview" && (
                <div className="space-y-6">
                  <section className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Credit balance"
                      value={isBillingLoading ? "Loading" : formatNumber(billingSummary?.credit_balance || 0)}
                      detail={billingSummary?.plan_name || "Free trial"}
                    />
                    <MetricCard
                      label="Active keys"
                      value={isLoading ? "Loading" : String(activeApiKeys)}
                      detail={`${apiKeys.length} total keys`}
                    />
                    <MetricCard
                      label="Memories"
                      value={isLoadingMemories ? "Loading" : formatNumber(memoryData?.total_memories || 0)}
                      detail={memoryData?.domains?.length ? memoryData.domains.join(", ") : "No domains yet"}
                    />
                    <MetricCard
                      label="Monthly usage"
                      value={`${usagePercent}%`}
                      detail={`${formatNumber(currentUsage.credits_used)} credits used`}
                    />
                  </section>

                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
                    <ProfilePanel user={user} onLogout={logout} formatDate={formatDate} />
                    <Card className="border-white/10 bg-[#0d0d0d]">
                      <CardHeader>
                        <CardTitle className="text-white">Usage this month</CardTitle>
                        <CardDescription className="text-gray-400">
                          Current consumption across memory writes and reads.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-400">Credits used</span>
                            <span className="font-mono text-gray-100">
                              {formatNumber(currentUsage.credits_used)} / {formatNumber(currentUsage.credits_limit)}
                            </span>
                          </div>
                          <Progress value={usagePercent} className="h-2 bg-white/10" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <UsageItem label="Memories written" value={currentUsage.memories_written} />
                          <UsageItem label="Retrievals" value={currentUsage.retrievals} />
                          <UsageItem label="Graph queries" value={currentUsage.graph_queries} />
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-sm font-medium text-white">Current plan</p>
                          <p className="mt-1 text-sm leading-6 text-gray-400">
                            {billingSummary?.plan_name || "Free trial"} access is active for this account.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === "connectors" && (
                <ConnectorsPanel apiKeys={apiKeys} isLoading={isLoading} />
              )}

              {activeSection === "api-keys" && (
                <ApiKeysPanel
                  apiKeys={apiKeys}
                  isLoading={isLoading}
                  formatDate={formatDate}
                  onCreate={() => setIsCreateDialogOpen(true)}
                  onEdit={(key) => {
                    setEditingKey(key);
                    setEditName(key.name);
                  }}
                  onDelete={(keyId) => setKeyToDelete(keyId)}
                />
              )}

              {activeSection === "memories" && (
                <MemoriesPanel
                  memoryData={memoryData}
                  isLoadingMemories={isLoadingMemories}
                  memoryError={memoryError}
                  selectedMemory={selectedMemory}
                  setSelectedMemory={setSelectedMemory}
                  refetchMemories={refetchMemories}
                />
              )}

              {activeSection === "billing" && (
                <BillingPanel
                  billingSummary={billingSummary || fallbackBillingSummary}
                  billingWarning={billingWarning}
                  billingPackageId={billingPackageId}
                  formatCurrency={formatCurrency}
                  formatNumber={formatNumber}
                  formatDate={formatDate}
                  onBuyCredits={handleBuyCredits}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setNewKeyName("");
            setNewKeyScopes(defaultKeyScopes);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#111] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Give your API key a name to help identify it later.
            </DialogDescription>
          </DialogHeader>

          {!newKey ? (
            <>
              <div className="space-y-5 py-4">
                <Input
                  placeholder="Production, Development, Testing"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="border-white/10 bg-[#0a0a0a] text-white placeholder:text-gray-500"
                />
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-white">Scopes</p>
                    <p className="text-xs text-gray-500">
                      {newKeyScopes.includes("*") ? "Full access" : `${newKeyScopes.length} selected`}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {apiScopeOptions.map((scope) => {
                      const selected = newKeyScopes.includes(scope.value);

                      return (
                        <button
                          key={scope.value}
                          type="button"
                          onClick={() => toggleNewKeyScope(scope.value)}
                          className={`rounded-lg border p-3 text-left transition-colors ${
                            selected
                              ? "border-white/25 bg-white/[0.08] text-white"
                              : "border-white/10 bg-[#0a0a0a] text-gray-300 hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="block text-sm font-medium">{scope.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-gray-500">{scope.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isCreating}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is the only time this API key will be shown.
                  </AlertDescription>
                </Alert>
                <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all font-mono text-sm text-gray-200">
                      {newKey.key}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Copy API key"
                      className="text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(newKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setNewKey(null);
                    setNewKeyName("");
                    setNewKeyScopes(defaultKeyScopes);
                    setIsCreateDialogOpen(false);
                  }}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#111] text-white">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the name of your API key.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="API key name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border-white/10 bg-[#0a0a0a] text-white placeholder:text-gray-500"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingKey(null)}
              className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditKey}
              disabled={!editName.trim() || isEditing}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent className="border-white/10 bg-[#111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-red-600 text-white hover:bg-red-700">
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 bg-[#0d0d0d] p-4 sm:p-5">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold tracking-normal text-white">{value}</p>
      <p className="mt-1 truncate text-sm text-gray-500">{detail}</p>
    </div>
  );
}

type DashboardSection = "overview" | "api-keys" | "connectors" | "memories" | "billing";

const dashboardNavItems: Array<{
  id: DashboardSection;
  label: string;
  description: string;
}> = [
  { id: "overview", label: "Overview", description: "Account and usage" },
  { id: "api-keys", label: "API keys", description: "Access credentials" },
  { id: "connectors", label: "Connectors", description: "Apps and agents" },
  { id: "memories", label: "Memories", description: "Stored context" },
  { id: "billing", label: "Billing", description: "Credits and payments" },
];

function DashboardSidebar({
  activeSection,
  onSectionChange,
  activeApiKeys,
  memoryCount,
  creditBalance,
  formatNumber,
}: {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  activeApiKeys: number;
  memoryCount: number;
  creditBalance: number;
  formatNumber: (value: number) => string;
}) {
  const metaBySection: Record<DashboardSection, string> = {
    overview: "Live",
    "api-keys": `${activeApiKeys} active`,
    connectors: `${connectors.length} available`,
    memories: formatNumber(memoryCount),
    billing: `${formatNumber(creditBalance)} credits`,
  };

  return (
    <aside className="lg:self-start">
      <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-2">
        <nav className="grid grid-cols-2 gap-1 lg:flex lg:flex-col">
          {dashboardNavItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`rounded-md border px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "border-white/10 bg-white/[0.08] text-white"
                    : "border-transparent text-gray-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="block text-sm font-medium">{item.label}</span>
                <span className={`mt-1 block text-xs ${isActive ? "text-gray-400" : "text-gray-600"}`}>
                  {item.description}
                </span>
                <span className={`mt-2 block truncate font-mono text-xs sm:mt-3 ${isActive ? "text-gray-300" : "text-gray-500"}`}>
                  {metaBySection[item.id]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function ProfilePanel({
  user,
  onLogout,
  formatDate,
}: {
  user: ReturnType<typeof useAuth>["user"];
  onLogout: () => void;
  formatDate: (dateString: string) => string;
}) {
  return (
    <Card className="border-white/10 bg-[#0d0d0d]">
      <CardHeader>
        <CardTitle className="text-white">Profile</CardTitle>
        <CardDescription className="text-gray-400">Account identity and access state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="h-12 w-12 rounded-full border border-white/10" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-base font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">{user?.name}</h3>
            <p className="truncate text-sm text-gray-400">{user?.email}</p>
            {user?.username && <p className="mt-1 font-mono text-xs text-gray-400">@{user.username}</p>}
          </div>
        </div>

        <div className="space-y-3 border-t border-white/10 pt-4">
          <InfoRow label="Username" value={user?.username ? `@${user.username}` : "Not set"} />
          <InfoRow label="Member since" value={user?.created_at ? formatDate(user.created_at) : "Unknown"} />
          <InfoRow label="Last login" value={user?.last_login ? formatDate(user.last_login) : "Unknown"} />
        </div>

        <Button
          variant="outline"
          className="w-full border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.06] hover:text-white"
          onClick={onLogout}
        >
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="truncate text-right font-mono text-gray-100">{value}</span>
    </div>
  );
}

function UsageItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{new Intl.NumberFormat("en-IN").format(value)}</p>
    </div>
  );
}

function ConnectorsPanel({ apiKeys, isLoading }: { apiKeys: APIKey[]; isLoading: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0d0d0d] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-400">
            <Cable className="h-3.5 w-3.5" />
            Connector status
          </div>
          <h2 className="text-xl font-semibold text-white">Connect XMem everywhere</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            See which agents and clients are connected, then open the right setup flow or docs.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-9 w-full border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.06] hover:text-white sm:w-auto"
          onClick={() => {
            window.location.href = "/docs#connectors";
          }}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Docs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connectors.map((connector) => {
          const status = getConnectorStatus(connector, apiKeys);
          const ConnectorIcon = connector.icon;

          return (
            <Card key={connector.id} className="border-white/10 bg-[#0d0d0d]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${connector.accent} text-black`}>
                      <ConnectorIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-white">{connector.name}</h3>
                        <Badge className="border-white/10 bg-white/[0.05] text-gray-400">{connector.category}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">{connector.description}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      status.connected
                        ? "border-green-800 bg-green-900/30 text-green-300"
                        : "border-yellow-800 bg-yellow-900/30 text-yellow-200"
                    }
                  >
                    {isLoading ? "Checking" : status.label}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className="min-w-0 truncate text-xs text-gray-500">{isLoading ? "Loading API keys" : status.detail}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        window.location.href = `/docs#connector-${connector.id}`;
                      }}
                    >
                      Docs
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-200"
                      onClick={() => {
                        window.location.href = connector.connectPath;
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ApiKeysPanel({
  apiKeys,
  isLoading,
  formatDate,
  onCreate,
  onEdit,
  onDelete,
}: {
  apiKeys: APIKey[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  onCreate: () => void;
  onEdit: (key: APIKey) => void;
  onDelete: (keyId: string) => void;
}) {
  return (
    <Card className="border-white/10 bg-[#0d0d0d]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-white">API keys</CardTitle>
          <CardDescription className="text-gray-400">Create, rename, and revoke XMem API credentials.</CardDescription>
        </div>
        <Button onClick={onCreate} className="h-9 w-full bg-white text-black hover:bg-gray-200 sm:w-auto">
          New API key
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 py-12 text-center">
            <h3 className="text-lg font-medium text-white">No API keys</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
              Create your first key to start sending requests to XMem services.
            </p>
            <Button onClick={onCreate} variant="outline" className="mt-5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white">
              Create API key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0a0a0a] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-white">{key.name}</span>
                    <Badge
                      variant={key.is_active ? "default" : "secondary"}
                      className={
                        key.is_active
                          ? "border-white/10 bg-white/[0.06] text-gray-200"
                          : "border-white/10 bg-white/10 text-gray-400"
                      }
                    >
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {(key.scopes?.length ? key.scopes : ["*"]).map((scope) => (
                      <span
                        key={scope}
                        className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-gray-400"
                      >
                        {scope === "*" ? "full-access" : scope}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <code className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-gray-300">
                      {key.key_prefix}********
                    </code>
                    <span>Created {formatDate(key.created_at)}</span>
                    {key.last_used && <span>Last used {formatDate(key.last_used)}</span>}
                    {key.expires_at && <span>Expires {formatDate(key.expires_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Rename API key"
                    className="text-gray-400 hover:text-white"
                    onClick={() => onEdit(key)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Revoke API key"
                    className="text-red-400 hover:bg-red-950/30 hover:text-red-300"
                    onClick={() => onDelete(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MemoriesPanel({
  memoryData,
  isLoadingMemories,
  memoryError,
  selectedMemory,
  setSelectedMemory,
  refetchMemories,
}: {
  memoryData: ReturnType<typeof useMemoryGraph>["data"];
  isLoadingMemories: boolean;
  memoryError: string | null;
  selectedMemory: MemoryNode | null;
  setSelectedMemory: (node: MemoryNode | null) => void;
  refetchMemories: () => Promise<void>;
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-[#0d0d0d]">
        <CardHeader>
          <div>
            <CardTitle className="text-white">Your memories</CardTitle>
            <CardDescription className="text-gray-400">
              Visualize stored memories as an interconnected graph.
            </CardDescription>
          </div>
      </CardHeader>
      <CardContent>
        {isLoadingMemories ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : memoryError ? (
          <div className="rounded-lg border border-dashed border-white/15 py-12 text-center">
            <h3 className="text-lg font-medium text-white">Failed to load memories</h3>
            <p className="mt-2 text-sm text-gray-400">{memoryError}</p>
            <Button
              onClick={() => void refetchMemories()}
              variant="outline"
              className="mt-5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : !memoryData || memoryData.total_memories === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 py-12 text-center">
            <h3 className="text-lg font-medium text-white">No memories yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
              Stored memories will appear here as an interactive graph.
            </p>
            <a href="/docs" className="mt-5 inline-flex items-center text-sm text-gray-300 hover:text-white">
              Open docs
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="h-[320px] overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] sm:h-[420px] lg:col-span-3">
                <Suspense
                  fallback={
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                    </div>
                  }
                >
                  <MemoryBrain nodes={memoryData.nodes} edges={memoryData.edges} onNodeClick={setSelectedMemory} />
                </Suspense>
              </div>

              <div className="min-h-[260px] sm:h-[420px] lg:col-span-1">
                <MemoryDetails node={selectedMemory} onClose={() => setSelectedMemory(null)} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
              <span className="text-xs uppercase text-gray-500">Memory types</span>
              {memoryData.domains.includes("temporal") && <LegendItem label="Events" />}
              {memoryData.domains.includes("profile") && <LegendItem label="Profile" />}
              {memoryData.domains.includes("summary") && <LegendItem label="Summaries" />}
              <span className="ml-auto text-xs text-gray-600">Click nodes to inspect details.</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LegendItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 w-2 rounded-full bg-gray-500" />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function PlanCard({
  plan,
  price,
  caption,
  features,
  actionLabel,
  highlighted,
  disabled,
  loading,
  onAction,
}: {
  plan: CreditPackage;
  price: string;
  caption: string;
  features: string[];
  actionLabel: string;
  highlighted?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onAction?: () => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-5 sm:min-h-[420px] sm:p-6 ${
        highlighted ? "border-white/25 bg-white/[0.06]" : "border-white/10 bg-[#0a0a0a]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{plan.label}</p>
          <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">{plan.description}</p>
        </div>
        {plan.badge && (
          <Badge className="border-white/10 bg-white/[0.08] text-gray-300">{plan.badge}</Badge>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-normal text-white">{price}</span>
          <span className="text-sm text-gray-500">{caption}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3 sm:mt-8">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm text-gray-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`mt-auto h-10 w-full ${
          highlighted ? "bg-white text-black hover:bg-gray-200" : "border border-white/10 bg-transparent text-gray-200 hover:bg-white/[0.06] hover:text-white"
        }`}
        variant={highlighted ? "default" : "outline"}
        disabled={disabled}
        onClick={onAction}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {actionLabel}
      </Button>
    </div>
  );
}

function BillingPanel({
  billingSummary,
  billingWarning,
  billingPackageId,
  formatCurrency,
  formatNumber,
  formatDate,
  onBuyCredits,
}: {
  billingSummary: BillingSummary;
  billingWarning: string | null;
  billingPackageId: string | null;
  formatCurrency: (amountInPaise: number, currency?: string) => string;
  formatNumber: (value: number) => string;
  formatDate: (dateString: string) => string;
  onBuyCredits: (selectedPackage: CreditPackage) => void;
}) {
  const freePlan = creditPackages.find((pack) => pack.id === "free")!;
  const proPlan = creditPackages.find((pack) => pack.id === "pro")!;
  const enterprisePlan = creditPackages.find((pack) => pack.id === "enterprise")!;

  return (
    <div className="space-y-6">
      {billingWarning && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{billingWarning}</AlertDescription>
        </Alert>
      )}

      <Card className="border-white/10 bg-[#0d0d0d]">
        <CardHeader>
          <div>
            <CardTitle className="text-white">Plans</CardTitle>
            <CardDescription className="max-w-2xl text-gray-400">
              Start free, upgrade to Pro for production access, or talk to us for enterprise requirements.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            <PlanCard
              plan={freePlan}
              price="$0"
              caption="30 days"
              features={[
                "Full XMem dashboard access",
                "Chrome extension included",
                "MCP server access included",
                "Python and TypeScript SDKs included",
                "No credit card required",
              ]}
              actionLabel="Current plan"
              disabled
            />

            <PlanCard
              plan={proPlan}
              price="$1"
              caption="then pay as you go"
              features={[
                "Everything in Free",
                "Production-ready API access",
                "Pay-as-you-go usage for higher volume",
                "24/7 customer support",
                "Access to exclusive features coming soon",
              ]}
              actionLabel={billingPackageId === proPlan.id ? "Processing" : "Start Pro"}
              loading={billingPackageId === proPlan.id}
              disabled={!!billingPackageId}
              highlighted
              onAction={() => onBuyCredits(proPlan)}
            />

            <PlanCard
              plan={enterprisePlan}
              price="Custom"
              caption="for teams"
              features={[
                "Everything in Pro",
                "Custom usage limits",
                "Security and procurement support",
                "Dedicated onboarding",
              ]}
              actionLabel="Contact us"
              onAction={() => {
                window.location.href = "mailto:hello@xmem.in?subject=XMem Enterprise Plan";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Current plan</p>
          <p className="mt-2 text-lg font-semibold text-white">{billingSummary.plan_name}</p>
          <p className="mt-1 text-sm capitalize text-gray-500">{billingSummary.account_status.replace("_", " ")}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Credit balance</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatNumber(billingSummary.credit_balance)}</p>
          <p className="mt-1 text-sm text-gray-500">
            {formatCurrency(billingSummary.prepaid_balance_paise, billingSummary.currency)} balance value
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Next invoice</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatCurrency(billingSummary.next_invoice_paise, billingSummary.currency)}
          </p>
          <p className="mt-1 text-sm text-gray-500">Usage charges after plan access</p>
        </div>
      </section>

      <Card className="border-white/10 bg-[#0d0d0d]">
        <CardHeader>
          <CardTitle className="text-white">Payments</CardTitle>
          <CardDescription className="text-gray-400">Recent Razorpay payments and invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {billingSummary.invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 py-10 text-center">
              <p className="text-sm font-medium text-white">No payments yet</p>
              <p className="mt-1 text-sm text-gray-500">Completed Razorpay payments will appear here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/10">
              {billingSummary.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid gap-3 border-b border-white/10 bg-[#0a0a0a] p-4 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-mono text-sm text-white">{invoice.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.date)}</p>
                  </div>
                  <p className="text-sm text-gray-300">{formatNumber(invoice.credits)} credits</p>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">{formatCurrency(invoice.amount_paise, billingSummary.currency)}</p>
                    <Badge className="border-white/10 bg-white/[0.06] capitalize text-gray-300">{invoice.status}</Badge>
                  </div>
                  {invoice.receipt_url && (
                    <a
                      href={invoice.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                    >
                      Receipt
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
