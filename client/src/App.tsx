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
import Enterprise from "@/pages/enterprise";
import AuthMcp from "@/pages/auth-mcp";

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
      <Route path="/auth/mcp" component={AuthMcp} />
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
