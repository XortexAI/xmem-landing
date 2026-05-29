import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, RequireUsername } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Scanner from "@/pages/scanner";
import ContextImporter from "@/pages/context";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import SetUsername from "@/pages/set-username";
import DocsPage from "@/pages/docs";
import BlogsPage from "@/pages/blogs";
import Enterprise from "@/pages/enterprise";
import AuthMcp from "@/pages/auth-mcp";
import AuthConnect from "@/pages/auth-connect";
import OAuthAuthorize from "@/pages/oauth-authorize";
import Privacy from "@/pages/privacy";

import SeoPage from "@/pages/seo-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/set-username">
        <ProtectedRoute component={SetUsername} />
      </Route>
      <Route path="/dashboard">
        <RequireUsername component={Dashboard} />
      </Route>
      <Route path="/scanner">
        <RequireUsername component={Scanner} />
      </Route>
      <Route path="/context">
        <RequireUsername component={ContextImporter} />
      </Route>
      <Route path="/enterprise">
        <RequireUsername component={Enterprise} />
      </Route>
      <Route path="/docs" component={DocsPage} />
      <Route path="/docs/:slug" component={DocsPage} />
      <Route path="/blogs" component={BlogsPage} />
      <Route path="/blogs/:slug" component={BlogsPage} />
      <Route path="/blog" component={BlogsPage} />
      <Route path="/blog/:slug" component={BlogsPage} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/auth/mcp" component={AuthMcp} />
      <Route path="/auth/connect" component={AuthConnect} />
      <Route path="/oauth/authorize" component={OAuthAuthorize} />
      <Route path="/memory-layer-for-ai-agents">
        <SeoPage title="Memory Layer for AI Agents" description="Learn how XMem acts as a persistent memory layer for AI agents, enabling long-term context and recall." />
      </Route>
      <Route path="/open-source-ai-memory">
        <SeoPage title="Open Source AI Memory Layer" description="XMem is the leading open-source alternative for long-term AI memory infrastructure." />
      </Route>
      <Route path="/ai-agent-long-term-memory">
        <SeoPage title="Long Term Memory for AI Agents" description="Give your AI agents the ability to remember user preferences and context across sessions." />
      </Route>
      <Route path="/chatgpt-claude-shared-memory">
        <SeoPage title="Shared Memory across ChatGPT and Claude" description="Use XMem to share context and memory between different LLM providers like OpenAI and Anthropic." />
      </Route>
      <Route path="/mcp-memory-server">
        <SeoPage title="MCP Memory Server" description="Build a Model Context Protocol (MCP) memory server to give your agents persistent, queryable memory." />
      </Route>
      <Route path="/benchmarks">
        <SeoPage title="AI Memory Benchmarks" description="Explore benchmarks for AI memory systems like LongMemEval and LoCoMo, and see how XMem performs." />
      </Route>
      <Route path="/compare/mem0">
        <SeoPage title="XMem vs Mem0" description="Compare XMem and Mem0 for your AI agent memory needs. Discover why XMem's architecture is better for developers." />
      </Route>
      <Route path="/compare/zep">
        <SeoPage title="XMem vs Zep" description="A detailed comparison between XMem and Zep for long-term memory in LLM applications." />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
