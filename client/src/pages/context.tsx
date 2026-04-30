import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/sections/Navbar";
import { Link as LinkIcon, Download, User, Activity, Loader2, Upload } from "lucide-react";

type MessagePair = {
  user_query: string;
  agent_response: string;
};

type MemoryOperation = {
  content?: string;
};

export default function ContextImporter() {
  const { toast } = useToast();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("link");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [stats, setStats] = useState<{
    messagePairs: number;
    initialTokens: number;
    tokensAfter: number;
    savedTokens: number;
    savingsPercent: number;
  } | null>(null);
  const [liveStats, setLiveStats] = useState({ initialTokens: 0, tokensAfter: 0 });
  const [memories, setMemories] = useState<string[]>([]);
  const [foundPairs, setFoundPairs] = useState(0);
  const [formedPairs, setFormedPairs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const estimateTokens = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.ceil(words * 1.3);
  };
  const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

  const authJsonHeaders = (accessToken: string): HeadersInit => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const handleProcess = async () => {
    if (!token || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to import context.",
        variant: "destructive",
      });
      return;
    }

    const userId = user.username ?? user.id;

    if (activeTab === "link" && !url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid chat share link.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "file" && !file) {
      toast({
        title: "File Required",
        description: "Please select a transcript file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setIsComplete(false);
      setProgress(10);
      setStats(null);
      setMemories([]);
      setFoundPairs(0);
      setFormedPairs(0);

      let pairs: MessagePair[] = [];

      if (activeTab === "link") {
        setCurrentStep("Scraping chat link...");
        const scrapeRes = await fetch(`${API_URL}/v1/memory/scrape`, {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({ url }),
        });

        if (!scrapeRes.ok) {
          throw new Error("Failed to parse the chat link.");
        }

        const scrapeData = await scrapeRes.json();
        pairs = scrapeData.data?.pairs || [];
      } else {
        setCurrentStep("Parsing transcript file...");
        const formData = new FormData();
        formData.append("file", file!);

        const parseRes = await fetch(`${API_URL}/v1/memory/parse_transcript`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!parseRes.ok) {
          const errorData = await parseRes.json();
          throw new Error(errorData.error || "Failed to parse the transcript file.");
        }

        const parseData = await parseRes.json();
        pairs = parseData.data?.pairs || [];
      }

      if (pairs.length === 0) {
        throw new Error("No messages found in the provided source.");
      }

      setFoundPairs(pairs.length);
      setCurrentStep(`Found ${pairs.length} message ${pairs.length === 1 ? "pair" : "pairs"}. Forming context...`);
      setProgress(20);

      let totalInitialTokens = 0;
      let totalMemoriesTokens = 0;
      const allMemories: string[] = [];

      setLiveStats({ initialTokens: 0, tokensAfter: 0 });

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        setFormedPairs(i);
        setCurrentStep(`Forming context ${i + 1} of ${pairs.length}...`);

        totalInitialTokens += estimateTokens(pair.user_query) + estimateTokens(pair.agent_response);

        const ingestRes = await fetch(`${API_URL}/v1/memory/ingest`, {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            user_query: pair.user_query,
            agent_response: pair.agent_response,
            user_id: userId,
            effort_level: "low",
          }),
        });

        if (!ingestRes.ok) {
          throw new Error(`Memory ingest failed while forming context ${i + 1} of ${pairs.length}.`);
        }

        const ingestData = await ingestRes.json();

        for (const domain of ["profile", "temporal", "summary"] as const) {
          const domainResult = ingestData.data?.[domain];
          if (!domainResult) continue;

          const ops = domainResult.operations || [];
          ops.forEach((op: { type?: string; content?: string }) => {
            if (op.content && op.type !== "noop" && op.type !== "delete") {
              allMemories.push(op.content);
              totalMemoriesTokens += estimateTokens(op.content);
            }
          });
        }

        setLiveStats({ initialTokens: totalInitialTokens, tokensAfter: totalMemoriesTokens });
        setFormedPairs(i + 1);
        setProgress(10 + Math.floor(((i + 1) / pairs.length) * 90));
      }

      const savedTokens = Math.max(totalInitialTokens - totalMemoriesTokens, 0);
      const savingsPercent = totalInitialTokens > 0
        ? Math.round((savedTokens / totalInitialTokens) * 100)
        : 0;

      setMemories(allMemories);
      setStats({
        messagePairs: pairs.length,
        initialTokens: totalInitialTokens,
        tokensAfter: totalMemoriesTokens,
        savedTokens,
        savingsPercent,
      });
      setIsComplete(true);
      setCurrentStep(`Context formed from ${pairs.length} message ${pairs.length === 1 ? "pair" : "pairs"}.`);
      setProgress(100);

      toast({
        title: "Success",
        description: "Memories synced successfully!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred while processing the context.";
      toast({
        title: "Processing Failed",
        description: message,
        variant: "destructive",
      });
      setCurrentStep("Processing failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (memories.length === 0) return;

    const textContent = memories.join("\n\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `xmem-context-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-black text-white flex items-center justify-center">
        <Navbar />
        <Loader2 className="h-10 w-10 animate-spin text-white" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen bg-black text-white selection:bg-primary/30">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-16 max-w-lg">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">Sign in required</CardTitle>
              <CardDescription className="text-white/60">
                Context import syncs memories to your XMem profile. Sign in to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/login">Go to login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Context Importer</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Convert long chat threads from ChatGPT, Claude, and Gemini into compressed, usable memories.
          </p>
          {user?.username && (
            <p className="text-sm text-white/40 mt-3 font-mono">@{user.username}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Import Context
                </CardTitle>
                <CardDescription className="text-white/60">
                  Paste a public share link or upload a transcript file to extract context and create memories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="link" className="data-[state=active]:bg-primary">
                      Share Link
                    </TabsTrigger>
                    <TabsTrigger value="file" className="data-[state=active]:bg-primary">
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="link" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Chat URL (Public Share Link)</label>
                      <Input
                        placeholder="https://chatgpt.com/share/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-black/50 border-white/20 focus:border-primary text-white"
                        disabled={isProcessing}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="file" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Transcript File (.txt, .md, .json)
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept=".txt,.md,.json,.jsonl"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="bg-black/50 border-white/20 focus:border-primary text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                          disabled={isProcessing}
                        />
                      </div>
                      {file && (
                        <p className="text-sm text-white/60">
                          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleProcess}
                  disabled={isProcessing || (activeTab === "link" ? !url : !file)}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {activeTab === "link" ? <User className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      Sync Memories
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {isProcessing || isComplete ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-white/80">{currentStep}</span>
                    <span className="text-sm font-mono text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                      <div className="text-white/50">Found</div>
                      <div className="font-mono text-white">{foundPairs.toLocaleString()} pairs</div>
                    </div>
                    <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                      <div className="text-white/50">Formed</div>
                      <div className="font-mono text-white">
                        {formedPairs.toLocaleString()} / {foundPairs.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-white/60 mb-1">Message Pairs</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {stats?.messagePairs.toLocaleString() || foundPairs.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Conversation Tokens</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {(stats?.initialTokens ?? liveStats.initialTokens).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Memory Tokens</div>
                  <div className="text-3xl font-mono font-bold text-primary">
                    {(stats?.tokensAfter ?? liveStats.tokensAfter).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Compression</div>
                  <div className="text-3xl font-mono font-bold text-emerald-400">
                    {(() => {
                      const initial = stats?.initialTokens ?? liveStats.initialTokens;
                      const after = stats?.tokensAfter ?? liveStats.tokensAfter;
                      if (after > 0 && initial > 0) {
                        return `${(initial / after).toFixed(1)}x`;
                      }
                      return isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                      ) : "-";
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Savings</div>
                  <div className="text-3xl font-mono font-bold text-emerald-400">
                    {stats ? `${stats.savingsPercent}%` : "-"}
                  </div>
                </div>

                {isComplete && memories.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Text
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
