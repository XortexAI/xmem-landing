import { useEffect, useState, useCallback, useMemo, Suspense, lazy, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
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
import { connectors, getConnectorStatus, type Connector } from "@/lib/connectors";
import { useLocation } from "wouter";
import {
  loadRazorpayCheckout,
  type RazorpayOrder,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay";
import {
  DEFAULT_PRO_PRICES,
  PRO_MONTHLY_CREDITS,
  detectBillingRegion,
  formatMinorUnitPrice,
  getRegionalPriceAmount,
  type BillingPlanPrice,
  type BillingRegion,
} from "@/lib/billing";

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
  billing_account_id?: string;
  owner_type?: string;
  owner_id?: string;
  plan_id?: string;
  plan_name: string;
  account_status?: "active" | "trial" | "paused" | "past_due";
  status?: string;
  currency: string;
  credit_balance?: number;
  available_credits?: number;
  reserved_credits?: number;
  prepaid_balance_paise?: number;
  current_month?: UsageSnapshot;
  next_invoice_paise?: number;
  current_period_start?: string | null;
  current_period_end?: string | null;
  credit_lots?: CreditLot[];
  last_payment_at?: string;
  invoices?: Invoice[];
}

interface Invoice {
  id: string;
  date: string;
  amount_minor_units: number;
  currency?: string;
  status: "paid" | "pending" | "failed";
  credits: number;
  receipt_url?: string;
}

interface ApiInvoice extends Omit<Invoice, "amount_minor_units"> {
  amount_minor_units?: number;
  amount_paise?: number;
}

interface ApiBillingSummary extends Omit<BillingSummary, "invoices"> {
  invoices?: ApiInvoice[];
}

interface CreditLot {
  id: string;
  source: string;
  remaining_credits: number;
  expires_at?: string | null;
}

interface BillingPlan {
  id: string;
  name: string;
  amount?: number;
  price_paise?: number;
  currency?: string;
  monthly_credits?: number;
  trial_credits?: number;
  trial_days?: number;
  regional_prices?: Partial<Record<BillingRegion, BillingPlanPrice>>;
}

interface CreditPackage {
  id: string;
  label: string;
  description: string;
  credits: number;
  amountInMinorUnits: number;
  currency?: string;
  badge?: string;
  region?: BillingRegion;
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

const baseCreditPackages: CreditPackage[] = [
  {
    id: "free",
    label: "Free",
    description: "30 days free with access to the core platform, Chrome extension, MCP, and SDKs.",
    credits: 0,
    amountInMinorUnits: 0,
    badge: "Current",
  },
  {
    id: "pro",
    label: "Pro",
    description: "Full access for production apps, priority support, and pay-as-you-go usage.",
    credits: PRO_MONTHLY_CREDITS,
    amountInMinorUnits: DEFAULT_PRO_PRICES.IN.amountInMinorUnits,
    currency: DEFAULT_PRO_PRICES.IN.currency,
    badge: "Recommended",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description: "Dedicated onboarding, custom limits, security reviews, and team support.",
    credits: 0,
    amountInMinorUnits: 0,
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

function getPlanAmount(plan: BillingPlan | undefined, fallbackAmount: number, expectedCurrency: string) {
  if (plan?.currency && plan.currency !== expectedCurrency) {
    return fallbackAmount;
  }

  return Number(plan?.price_paise ?? plan?.amount ?? fallbackAmount);
}

function getRegionalCreditPackages(region: BillingRegion, plans: BillingPlan[]): CreditPackage[] {
  const backendProPlan = plans.find((plan) => plan.id === "pro");
  const backendProCredits = Number(backendProPlan?.monthly_credits || 0);
  const backendRegionalPrice = backendProPlan?.regional_prices?.[region];
  const defaultProPrice = DEFAULT_PRO_PRICES[region];

  return baseCreditPackages.map((pack) => {
    if (pack.id !== "pro") {
      return pack;
    }

    if (region === "IN") {
      return {
        ...pack,
        credits: backendProCredits || pack.credits,
        amountInMinorUnits: getRegionalPriceAmount(
          backendRegionalPrice,
          getPlanAmount(backendProPlan, defaultProPrice.amountInMinorUnits, defaultProPrice.currency),
        ),
        currency: backendRegionalPrice?.currency || defaultProPrice.currency,
        region,
      };
    }

    return {
      ...pack,
      credits: backendProCredits || pack.credits,
      amountInMinorUnits: getRegionalPriceAmount(backendRegionalPrice, defaultProPrice.amountInMinorUnits),
      currency: backendRegionalPrice?.currency || defaultProPrice.currency,
      region,
    };
  });
}

function formatPackagePrice(pack: CreditPackage) {
  if (pack.id === "enterprise") {
    return "Custom";
  }

  return formatMinorUnitPrice(pack.amountInMinorUnits, pack.currency || "USD");
}

function getCreditBalance(summary: BillingSummary) {
  return Number(summary.available_credits ?? summary.credit_balance ?? 0);
}

function getAccountStatus(summary: BillingSummary) {
  return String(summary.status || summary.account_status || "trial").replace(/_/g, " ");
}

function getCurrentUsage(summary: BillingSummary | null) {
  return summary?.current_month || fallbackBillingSummary.current_month!;
}

function getRazorpayDisplayConfig(currency: string) {
  if (currency !== "INR") {
    return undefined;
  }

  return {
    display: {
      blocks: {
        upi: {
          name: "Pay using UPI",
          instruments: [
            {
              method: "upi",
            },
          ],
        },
      },
      sequence: ["block.upi"],
      preferences: {
        show_default_blocks: true,
      },
    },
  };
}

function normalizeBillingSummary(summary: ApiBillingSummary): BillingSummary {
  return {
    ...summary,
    invoices: (summary.invoices || []).map((invoice) => ({
      ...invoice,
      amount_minor_units:
        invoice.amount_minor_units ?? invoice.amount_paise ?? 0,
    })),
  };
}

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
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [billingWarning, setBillingWarning] = useState<string | null>(null);
  const [billingPackageId, setBillingPackageId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSection>(() => getDashboardSectionFromUrl());
  const billingRegion = useMemo(() => detectBillingRegion(), []);

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

  const handleSectionChange = useCallback((section: DashboardSection) => {
    setActiveSection(section);
    const nextPath = section === "overview" ? "/dashboard" : `/dashboard?section=${section}`;
    window.history.pushState(null, "", nextPath);
  }, []);

  useEffect(() => {
    const syncSectionFromUrl = () => {
      setActiveSection(getDashboardSectionFromUrl());
    };

    window.addEventListener("popstate", syncSectionFromUrl);
    window.addEventListener("hashchange", syncSectionFromUrl);
    return () => {
      window.removeEventListener("popstate", syncSectionFromUrl);
      window.removeEventListener("hashchange", syncSectionFromUrl);
    };
  }, []);

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
      setBillingSummary(normalizeBillingSummary(data.summary || data));
      setBillingPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (err) {
      console.error("Error fetching billing summary:", err);
      setBillingSummary(fallbackBillingSummary);
      setBillingPlans([]);
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
          amount: order.amount || selectedPackage.amountInMinorUnits,
          currency: order.currency || "INR",
          billing_region: selectedPackage.region || billingRegion,
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
          amount: selectedPackage.amountInMinorUnits,
          currency: selectedPackage.currency || "INR",
          billing_region: selectedPackage.region || billingRegion,
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
      const subscriptionId = order.subscription_id;
      const orderId = order.order_id || (subscriptionId ? undefined : order.id);
      const publicKey = order.key_id || RAZORPAY_KEY_ID;

      if (!orderId && !subscriptionId) {
        throw new Error("Razorpay checkout ID was missing");
      }

      if (!publicKey) {
        throw new Error("VITE_RAZORPAY_KEY_ID is not configured");
      }

      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout did not initialize");
      }

      const checkoutCurrency = order.currency || selectedPackage.currency || "INR";
      const checkoutAmount = order.amount || selectedPackage.amountInMinorUnits;
      const checkout = new window.Razorpay({
        key: publicKey,
        amount: checkoutAmount,
        currency: checkoutCurrency,
        name: "XMem",
        description: `${selectedPackage.label} plan`,
        ...(orderId ? { order_id: orderId } : {}),
        ...(subscriptionId ? { subscription_id: subscriptionId } : {}),
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        notes: {
          package_id: selectedPackage.id,
          credits: String(selectedPackage.credits),
          billing_region: selectedPackage.region || billingRegion,
        },
        theme: {
          color: "#0f172a",
        },
        config: getRazorpayDisplayConfig(checkoutCurrency),
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

  const formatCurrency = (amountInMinorUnits: number, currency = "INR") => {
    const normalizedCurrency = currency.toUpperCase();
    const locale = normalizedCurrency === "USD" ? "en-US" : "en-IN";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(amountInMinorUnits / 100);
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
  const currentUsage = getCurrentUsage(billingSummary);
  const usagePercent =
    currentUsage.credits_limit > 0
      ? Math.min(100, Math.round((currentUsage.credits_used / currentUsage.credits_limit) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="relative overflow-hidden px-3 pb-14 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="absolute inset-0 xmem-grid opacity-20" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(184,255,101,0.16),transparent_58%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(circle_at_20%_100%,rgba(245,241,232,0.08),transparent_54%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
            <DashboardSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              activeApiKeys={activeApiKeys}
              memoryCount={memoryData?.total_memories || 0}
              creditBalance={billingSummary ? getCreditBalance(billingSummary) : 0}
              formatNumber={formatNumber}
            />

            <section className="min-w-0">
              <div className="mb-6 flex flex-col gap-4 rounded-md border border-white/10 bg-[#090a09]/88 p-5 shadow-2xl shadow-black/30 backdrop-blur-md sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                <div>
                  <p className="mb-2 inline-flex rounded-sm border border-[#b8ff65]/20 bg-[#b8ff65]/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#dfffaa]">
                    Dashboard
                  </p>
                  <h1 className="font-display text-3xl font-semibold tracking-normal text-white sm:text-4xl">
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
                    className="h-10 w-full border-white/10 bg-transparent text-gray-300 hover:border-[#b8ff65]/30 hover:bg-[#b8ff65]/10 hover:text-white sm:w-auto"
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
                    className="h-10 w-full bg-[#b8ff65] text-black hover:bg-[#d9ff9b] sm:w-auto"
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
                      value={isBillingLoading ? "Loading" : formatNumber(billingSummary ? getCreditBalance(billingSummary) : 0)}
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
                    <Card className="border-white/10 bg-[#090a09]/90 shadow-xl shadow-black/20">
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
                          <Progress value={usagePercent} className="h-2 bg-white/10 [&>div]:bg-[#b8ff65]" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <UsageItem label="Memories written" value={currentUsage.memories_written} />
                          <UsageItem label="Retrievals" value={currentUsage.retrievals} />
                          <UsageItem label="Graph queries" value={currentUsage.graph_queries} />
                        </div>

                        <div className="rounded-md border border-[#b8ff65]/20 bg-[#b8ff65]/[0.055] p-4">
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
                  billingPlans={billingPlans}
                  billingRegion={billingRegion}
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
                  className="border-white/10 bg-[#050505] text-white placeholder:text-gray-500 focus-visible:ring-[#b8ff65]/50"
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
                              ? "border-[#b8ff65]/35 bg-[#b8ff65]/10 text-white"
                              : "border-white/10 bg-[#050505] text-gray-300 hover:bg-white/[0.04]"
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
                  className="bg-[#b8ff65] text-black hover:bg-[#d9ff9b]"
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
                <div className="rounded-md border border-white/10 bg-[#050505] p-4">
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
                  className="bg-[#b8ff65] text-black hover:bg-[#d9ff9b]"
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
              className="border-white/10 bg-[#050505] text-white placeholder:text-gray-500 focus-visible:ring-[#b8ff65]/50"
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
              className="bg-[#b8ff65] text-black hover:bg-[#d9ff9b]"
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
    <div className="min-w-0 bg-[#090a09] p-4 transition-colors hover:bg-[#0d100b] sm:p-5">
      <p className="text-xs font-medium uppercase text-white/42">{label}</p>
      <p className="mt-3 break-words font-display text-3xl font-semibold tracking-normal text-[#b8ff65]">{value}</p>
      <p className="mt-1 truncate text-sm text-white/45">{detail}</p>
    </div>
  );
}

type DashboardSection = "overview" | "api-keys" | "connectors" | "memories" | "billing";

const dashboardSectionIds: DashboardSection[] = ["overview", "api-keys", "connectors", "memories", "billing"];

function isDashboardSection(section: string | null): section is DashboardSection {
  return !!section && dashboardSectionIds.includes(section as DashboardSection);
}

function getDashboardSectionFromUrl(): DashboardSection {
  if (typeof window === "undefined") {
    return "overview";
  }

  const querySection = new URLSearchParams(window.location.search).get("section");
  const hashSection = window.location.hash.replace(/^#/, "");
  if (isDashboardSection(querySection)) return querySection;
  if (isDashboardSection(hashSection)) return hashSection;
  return "overview";
}

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
      <div className="rounded-md border border-white/10 bg-[#090a09]/88 p-2 shadow-2xl shadow-black/30 backdrop-blur-md">
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
                    ? "border-[#b8ff65]/35 bg-[#b8ff65]/[0.085] text-white shadow-[inset_2px_0_0_#b8ff65]"
                    : "border-transparent text-gray-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="block text-sm font-medium">{item.label}</span>
                <span className={`mt-1 block text-xs ${isActive ? "text-white/55" : "text-gray-600"}`}>
                  {item.description}
                </span>
                <span className={`mt-2 block truncate font-mono text-xs sm:mt-3 ${isActive ? "text-[#b8ff65]" : "text-gray-500"}`}>
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
    <Card className="border-white/10 bg-[#090a09]/90 shadow-xl shadow-black/20">
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
          className="w-full border-white/10 bg-transparent text-gray-300 hover:border-[#b8ff65]/30 hover:bg-[#b8ff65]/10 hover:text-white"
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
    <div className="rounded-md border border-white/10 bg-[#050505] p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{new Intl.NumberFormat("en-IN").format(value)}</p>
    </div>
  );
}

function ConnectorRow({
  title,
  connectorsList,
  apiKeys,
  isLoading,
  logoErrors,
  setLogoErrors,
  setLocation,
}: {
  title: string;
  connectorsList: Connector[];
  apiKeys: APIKey[];
  isLoading: boolean;
  logoErrors: Record<string, boolean>;
  setLogoErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setLocation: (path: string) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300; // width of a card (280) + gap (16)
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (connectorsList.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Row Title */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-1">
        {title}
      </h3>

      {/* Marketplace Swiper */}
      <div className="relative group/carousel">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 backdrop-blur-md text-gray-400 hover:bg-black/90 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 opacity-0 group-hover/carousel:opacity-100 duration-300 md:flex hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Horizontal scroll grid */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth py-2 px-1 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {connectorsList.map((connector) => {
            const status = getConnectorStatus(connector, apiKeys);
            const ConnectorIcon = connector.icon;

            return (
              <div
                key={connector.id}
                className="group relative flex w-[280px] shrink-0 flex-col justify-between rounded-md border border-white/10 bg-[#090a09]/88 p-5 transition-all duration-300 hover:border-[#b8ff65]/35 hover:bg-[#0d100b] hover:shadow-[0_0_25px_rgba(184,255,101,0.08)]"
              >
                <div className="space-y-4">
                  {/* Logo & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[#050505] transition-all duration-300 group-hover:border-[#b8ff65]/30">
                      {connector.logo && !logoErrors[connector.id] ? (
                        <img
                          src={`/connector_logos/${connector.logo}`}
                          alt={connector.name}
                          className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={() => setLogoErrors(prev => ({ ...prev, [connector.id]: true }))}
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${connector.accent} text-black`}>
                          <ConnectorIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <Badge
                      className={`text-[10px] font-semibold tracking-wide py-0.5 border ${
                        status.connected
                          ? "border-[#b8ff65]/30 bg-[#b8ff65]/10 text-[#b8ff65]"
                          : status.label === "Ready"
                          ? "border-[#f5f1e8]/20 bg-[#f5f1e8]/10 text-[#f5f1e8]"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
                      }`}
                    >
                      {isLoading ? "Checking" : status.label}
                    </Badge>
                  </div>

                  {/* Title & Category info */}
                  <div>
                    <h3 className="truncate text-base font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-[#b8ff65]">
                      {connector.name}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5 block">
                      {connector.category}
                    </span>
                  </div>
                </div>

                {/* Docs / Connect Actions */}
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/5 bg-white/[0.02] text-gray-300 hover:bg-white/[0.08] hover:text-white text-xs h-8"
                    onClick={() => {
                      window.location.href = `/docs#connector-${connector.id}`;
                    }}
                  >
                    Docs
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 flex-1 bg-[#b8ff65] text-xs font-semibold text-black hover:bg-[#d9ff9b]"
                    onClick={() => {
                      setLocation(connector.connectPath);
                    }}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 backdrop-blur-md text-gray-400 hover:bg-black/90 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 opacity-0 group-hover/carousel:opacity-100 duration-300 md:flex hidden"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function ConnectorsPanel({ apiKeys, isLoading }: { apiKeys: APIKey[]; isLoading: boolean }) {
  const [, setLocation] = useLocation();
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const codingPlugins = connectors.filter(c => c.group === "Plugins");
  const mcpClients = connectors.filter(c => c.group === "MCP");
  const knowledgeBases = connectors.filter(c => c.group === "Knowledge bases");
  const apisAndExtensions = connectors.filter(
    (c) => c.group === "Developer" || c.group === "Apps & extensions"
  );

  return (
    <div className="space-y-10">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />

      <ConnectorRow
        title="Coding Plugins"
        connectorsList={codingPlugins}
        apiKeys={apiKeys}
        isLoading={isLoading}
        logoErrors={logoErrors}
        setLogoErrors={setLogoErrors}
        setLocation={setLocation}
      />

      <ConnectorRow
        title="MCP Clients"
        connectorsList={mcpClients}
        apiKeys={apiKeys}
        isLoading={isLoading}
        logoErrors={logoErrors}
        setLogoErrors={setLogoErrors}
        setLocation={setLocation}
      />

      <ConnectorRow
        title="Knowledge Bases"
        connectorsList={knowledgeBases}
        apiKeys={apiKeys}
        isLoading={isLoading}
        logoErrors={logoErrors}
        setLogoErrors={setLogoErrors}
        setLocation={setLocation}
      />

      <ConnectorRow
        title="APIs & Extensions"
        connectorsList={apisAndExtensions}
        apiKeys={apiKeys}
        isLoading={isLoading}
        logoErrors={logoErrors}
        setLogoErrors={setLogoErrors}
        setLocation={setLocation}
      />
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
    <Card className="border-white/10 bg-[#090a09]/90 shadow-xl shadow-black/20">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-white">API keys</CardTitle>
          <CardDescription className="text-gray-400">Create, rename, and revoke XMem API credentials.</CardDescription>
        </div>
        <Button onClick={onCreate} className="h-9 w-full bg-[#b8ff65] text-black hover:bg-[#d9ff9b] sm:w-auto">
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
            <Button onClick={onCreate} variant="outline" className="mt-5 border-white/10 text-gray-200 hover:border-[#b8ff65]/30 hover:bg-[#b8ff65]/10 hover:text-white">
              Create API key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-4 rounded-md border border-white/10 bg-[#050505] p-4 md:flex-row md:items-center md:justify-between"
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
    <Card className="overflow-hidden border-white/10 bg-[#090a09]/90 shadow-xl shadow-black/20">
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
              className="mt-5 border-white/10 text-gray-200 hover:border-[#b8ff65]/30 hover:bg-[#b8ff65]/10 hover:text-white"
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
              <div className="h-[320px] overflow-hidden rounded-md border border-white/10 bg-[#050505] sm:h-[420px] lg:col-span-3">
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
      <div className="h-2 w-2 rounded-full bg-[#b8ff65]" />
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
      className={`flex flex-col rounded-md border p-5 sm:min-h-[420px] sm:p-6 ${
        highlighted ? "border-[#b8ff65]/40 bg-[#b8ff65]/[0.065] shadow-[inset_0_2px_0_#b8ff65]" : "border-white/10 bg-[#050505]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold text-white">{plan.label}</p>
          <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">{plan.description}</p>
        </div>
        {plan.badge && (
          <Badge className="border-[#b8ff65]/20 bg-[#b8ff65]/10 text-[#dfffaa]">{plan.badge}</Badge>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-5xl font-semibold tracking-normal text-white">{price}</span>
          <span className="text-sm text-gray-500">{caption}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3 sm:mt-8">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm text-gray-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-[#b8ff65]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`mt-auto h-10 w-full ${
          highlighted ? "bg-[#b8ff65] text-black hover:bg-[#d9ff9b]" : "border border-white/10 bg-transparent text-gray-200 hover:border-[#b8ff65]/30 hover:bg-[#b8ff65]/10 hover:text-white"
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
  billingPlans,
  billingRegion,
  billingWarning,
  billingPackageId,
  formatCurrency,
  formatNumber,
  formatDate,
  onBuyCredits,
}: {
  billingSummary: BillingSummary;
  billingPlans: BillingPlan[];
  billingRegion: BillingRegion;
  billingWarning: string | null;
  billingPackageId: string | null;
  formatCurrency: (amountInMinorUnits: number, currency?: string) => string;
  formatNumber: (value: number) => string;
  formatDate: (dateString: string) => string;
  onBuyCredits: (selectedPackage: CreditPackage) => void;
}) {
  const creditPackages = getRegionalCreditPackages(billingRegion, billingPlans);
  const freePlan = creditPackages.find((pack) => pack.id === "free")!;
  const proPlan = creditPackages.find((pack) => pack.id === "pro")!;
  const enterprisePlan = creditPackages.find((pack) => pack.id === "enterprise")!;
  const isPro = billingSummary.plan_id === "pro" || billingSummary.plan_name === "Pro";
  const invoices = billingSummary.invoices || [];
  const prepaidBalance = billingSummary.prepaid_balance_paise || 0;
  const nextInvoice = billingSummary.next_invoice_paise || 0;

  return (
    <div className="space-y-6">
      {billingWarning && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{billingWarning}</AlertDescription>
        </Alert>
      )}

      <Card className="border-white/10 bg-[#090a09]/90 shadow-xl shadow-black/20">
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
              actionLabel={billingSummary.plan_name === "Free" || billingSummary.plan_name === "Free trial" ? "Current plan" : "Free Plan"}
              disabled={true}
            />

            <PlanCard
              plan={proPlan}
              price={formatPackagePrice(proPlan)}
              caption={`per month in ${billingRegion === "IN" ? "India" : "global regions"}`}
              features={[
                "Everything in Free",
                `${formatNumber(proPlan.credits)} monthly Pro credits included`,
                "Production-ready API access",
                "Pay-as-you-go usage for higher volume",
                "24/7 customer support",
                "Access to exclusive features coming soon",
              ]}
              actionLabel={
                isPro
                  ? "Current plan"
                  : billingPackageId === proPlan.id
                  ? "Processing"
                  : "Start Pro"
              }
              loading={billingPackageId === proPlan.id}
              disabled={!!billingPackageId || isPro}
              highlighted={!isPro}
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
        <div className="rounded-md border border-white/10 bg-[#090a09]/90 p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Current plan</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">{billingSummary.plan_name}</p>
          <p className="mt-1 text-sm capitalize text-gray-500">{getAccountStatus(billingSummary)}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-[#090a09]/90 p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Credit balance</p>
          <p className="mt-2 font-display text-2xl font-semibold text-[#b8ff65]">{formatNumber(getCreditBalance(billingSummary))}</p>
          <p className="mt-1 text-sm text-gray-500">
            {formatCurrency(prepaidBalance, billingSummary.currency)} balance value
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-[#090a09]/90 p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Next invoice</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">
            {formatCurrency(nextInvoice, billingSummary.currency)}
          </p>
          <p className="mt-1 text-sm text-gray-500">Usage charges after plan access</p>
        </div>
      </section>

      <Card className="border-white/10 bg-[#090a09]/90 shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="text-white">Payments</CardTitle>
          <CardDescription className="text-gray-400">Recent Razorpay payments and invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 py-10 text-center">
              <p className="text-sm font-medium text-white">No payments yet</p>
              <p className="mt-1 text-sm text-gray-500">Completed Razorpay payments will appear here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/10">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid gap-3 border-b border-white/10 bg-[#050505] p-4 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-mono text-sm text-white">{invoice.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.date)}</p>
                  </div>
                  <p className="text-sm text-gray-300">{formatNumber(invoice.credits)} credits</p>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">
                      {formatCurrency(
                        invoice.amount_minor_units,
                        invoice.currency || billingSummary.currency,
                      )}
                    </p>
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
