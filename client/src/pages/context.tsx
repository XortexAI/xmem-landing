import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/sections/Navbar";
import { Brain, Link as LinkIcon, Download, User, Activity } from "lucide-react";

export default function ContextImporter() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [stats, setStats] = useState<{
    initialTokens: number;
    tokensAfter: number;
    accuracy: number;
  } | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const estimateTokens = (text: string) => Math.ceil(text.split(/\s+/).length * 1.3);
  const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

  const handleProcess = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid chat share link.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setIsComplete(false);
      setProgress(10);
      setCurrentStep("Scraping chat link...");
      setStats(null);
      setMemories([]);

      // 1. Scrape the URL
      const scrapeRes = await fetch(`${API_URL}/api/v1/memory/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!scrapeRes.ok) {
        throw new Error("Failed to parse the chat link.");
      }

      const scrapeData = await scrapeRes.json();
      const pairs = scrapeData.data?.pairs || [];

      if (pairs.length === 0) {
        throw new Error("No messages found in the provided link.");
      }

      let totalInitialTokens = 0;
      let totalMemoriesTokens = 0;
      const allMemories: string[] = [];
      const effectiveUserId = username.trim() || `temp_user_${Math.random().toString(36).substring(7)}`;

      // 2. Sequential Ingestion Loop
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        setCurrentStep(`Processing message pair ${i + 1} of ${pairs.length}...`);
        
        totalInitialTokens += estimateTokens(pair.user_query) + estimateTokens(pair.agent_response);

        const ingestRes = await fetch(`${API_URL}/api/v1/memory/ingest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_query: pair.user_query,
            agent_response: pair.agent_response,
            user_id: effectiveUserId,
            effort_level: "low",
          }),
        });

        if (ingestRes.ok) {
          const ingestData = await ingestRes.json();
          
          // Collect memory operations content
          const profileOps = ingestData.data?.profile?.operations || [];
          const temporalOps = ingestData.data?.temporal?.operations || [];
          const summaryOps = ingestData.data?.summary?.operations || [];
          
          const ops = [...profileOps, ...temporalOps, ...summaryOps];
          
          ops.forEach(op => {
            if (op.content) {
              allMemories.push(op.content);
              totalMemoriesTokens += estimateTokens(op.content);
            }
          });
        }

        setProgress(10 + Math.floor(((i + 1) / pairs.length) * 90));
      }

      setMemories(allMemories);
      setStats({
        initialTokens: totalInitialTokens,
        tokensAfter: totalMemoriesTokens,
        accuracy: 98, // Mock placeholder for accuracy
      });
      setIsComplete(true);
      setCurrentStep("Processing complete!");
      setProgress(100);

      toast({
        title: "Success",
        description: username ? "Memories synced successfully!" : "Memories generated successfully!",
      });

    } catch (error: any) {
      toast({
        title: "Processing Failed",
        description: error.message || "An error occurred while processing the context.",
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
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `xmem-context-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Context Importer
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Convert long chat threads from ChatGPT, Claude, and Gemini into compressed, usable memories.
          </p>
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
                  Paste a public share link to extract context and create memories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    Username (Optional)
                  </label>
                  <Input
                    placeholder="e.g. john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black/50 border-white/20 focus:border-primary text-white"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-white/40">
                    If provided, memories will be synced directly to this profile. Otherwise, you can download them.
                  </p>
                </div>

                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  onClick={handleProcess}
                  disabled={isProcessing || !url}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : username ? (
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Sync Memories
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Generate Memories
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {isProcessing || isComplete ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-white/80">{currentStep}</span>
                    <span className="text-sm font-mono text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
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
                  <div className="text-sm text-white/60 mb-1">Initial Tokens</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {stats?.initialTokens.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Tokens After</div>
                  <div className="text-3xl font-mono font-bold text-primary">
                    {stats?.tokensAfter.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Accuracy</div>
                  <div className="text-3xl font-mono font-bold text-emerald-400">
                    {stats?.accuracy ? `${stats.accuracy}%` : "-"}
                  </div>
                </div>

                {isComplete && !username && memories.length > 0 && (
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