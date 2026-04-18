import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Navbar } from "@/sections/Navbar";
import { Terminal, Key, BookOpen, Layers, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(`Authorization: Bearer ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 md:py-40">
        
        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20">
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            XMem API Reference
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Integrate long-term memory, knowledge context, and semantic search directly into your agents and workflows.
          </p>
        </div>

        {/* Authentication Section (Replaces the box from Dashboard) */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Key className="w-6 h-6 text-white/70" />
            Authentication
          </h2>
          <div className="rounded-[24px] bg-white/[0.02] border border-white/10 p-6 md:p-8 backdrop-blur-sm">
            <p className="text-white/60 mb-6 leading-relaxed">
              All API requests must be authenticated via a Bearer token. 
              {isAuthenticated ? (
                " You are currently logged in, so you can use your token below."
              ) : (
                <span> You must <Link href="/login" className="text-cyan-400 hover:underline">log in</Link> to view and manage your API keys.</span>
              )}
            </p>
            
            <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-1 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between px-4 py-3 relative z-10">
                <code className="text-sm font-mono text-cyan-300 truncate max-w-[80%]">
                  Authorization: Bearer {isAuthenticated ? token?.substring(0, 24) + "..." : "<your-api-key>"}
                </code>
                
                {isAuthenticated && (
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-white/70 flex-shrink-0"
                    title="Copy full header"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Terminal className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            
            {isAuthenticated && user?.username && (
              <div className="mt-4 px-5 py-3 rounded-lg bg-white/5 border border-white/5 text-sm text-white/50 flex items-center justify-between">
                <span>Associated Username:</span>
                <span className="font-mono text-white/80">{user.username}</span>
              </div>
            )}
          </div>
        </section>

        {/* Quick Start / Core Concepts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-white/70" />
            Core Endpoints
          </h2>
          
          <div className="space-y-6">
            
            {/* Endpoint 1 */}
            <div className="rounded-[24px] bg-white/[0.02] border border-white/10 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-green-500/20 text-green-400 rounded-md">POST</span>
                <code className="text-lg font-mono text-white/90">/v1/memory/ingest</code>
              </div>
              <p className="text-white/60 mb-6">
                Ingest a new conversation turn or piece of context into your agent's long-term memory. The system automatically classifies and routes the data into profile, temporal, or summary domains.
              </p>
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono leading-relaxed">
{`{
  "user_query": "I prefer using React with TypeScript.",
  "agent_response": "Noted. I'll use React and TS going forward.",
  "session_datetime": "2026-04-18T10:00:00Z"
}`}
                </pre>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="rounded-[24px] bg-white/[0.02] border border-white/10 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-500/20 text-blue-400 rounded-md">POST</span>
                <code className="text-lg font-mono text-white/90">/v1/memory/retrieve</code>
              </div>
              <p className="text-white/60 mb-6">
                Retrieve context-aware answers grounded in the user's historical memory. The pipeline dynamically queries across multiple domains (profile, temporal, code) to assemble the best context.
              </p>
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono leading-relaxed">
{`{
  "query": "What frontend stack did I say I preferred?",
  "top_k": 5
}`}
                </pre>
              </div>
            </div>
            
            {/* Endpoint 3 */}
            <div className="rounded-[24px] bg-white/[0.02] border border-white/10 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-500/20 text-purple-400 rounded-md">POST</span>
                <code className="text-lg font-mono text-white/90">/v1/scanner/scan</code>
              </div>
              <p className="text-white/60 mb-6">
                Trigger a deep AST-level scan of a GitHub repository to build a highly structured, queryable knowledge graph of the codebase.
              </p>
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono leading-relaxed">
{`{
  "github_url": "https://github.com/organization/repo",
  "branch": "main"
}`}
                </pre>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}